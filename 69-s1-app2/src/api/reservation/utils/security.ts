import crypto from 'node:crypto';
import { env } from '@strapi/utils';

/**
 * Confidentiality: AES-256-GCM
 * Integrity: MD5 record hash (required by the assignment, SHA-256 is recommended in production)
 */

export const SECRET_FIELDS = ['id_card', 'phone'] as const;

export type SecretField = (typeof SECRET_FIELDS)[number];

export type DataRow = Record<string, any>;

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

let cachedKey: Buffer | null = null;

const getKey = (): Buffer => {
  if (cachedKey) {
    return cachedKey;
  }

  const raw = env('AES_256_KEY') || env('ENCRYPTION_KEY');

  if (!raw) {
    throw new Error('Missing AES_256_KEY (or ENCRYPTION_KEY) environment variable');
  }

  const decoded = Buffer.from(raw, 'base64');
  cachedKey =
    decoded.length === KEY_LENGTH ? decoded : crypto.createHash('sha256').update(raw).digest();

  return cachedKey;
};

export const encryptAes256 = (plainText: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
};

export const decryptAes256 = (cipherText: string): string => {
  const payload = Buffer.from(cipherText, 'base64');

  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const data = payload.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
};

export const safeDecrypt = (cipherText?: string | null): string | null => {
  if (!cipherText) {
    return null;
  }

  try {
    return decryptAes256(cipherText);
  } catch {
    return null;
  }
};

export const md5 = (value: string): string =>
  crypto.createHash('md5').update(value, 'utf8').digest('hex');

const toCanonicalNumber = (value: unknown): number | '' =>
  value === null || value === undefined || value === '' ? '' : Number(value);

export const toCanonicalString = (record: DataRow): string =>
  JSON.stringify({
    room_no: record.room_no ?? '',
    building: record.building ?? '',
    tenant_name: record.tenant_name ?? '',
    id_card: record.id_card ?? '',
    phone: record.phone ?? '',
    monthly_rent: toCanonicalNumber(record.monthly_rent),
    start_date: record.start_date ? String(record.start_date) : '',
    end_date: record.end_date ? String(record.end_date) : '',
    status: record.status ?? '',
  });

export const computeIntegrityHash = (record: DataRow): string => md5(toCanonicalString(record));

/**
 * Encrypts the confidential fields and (re)calculates record_hash.
 * When `base` is given (update), secret fields that are not part of the update are
 * decrypted from the stored row so the hash always covers the whole record.
 */
export const sealData = (data: DataRow, base?: DataRow | null): DataRow => {
  const plain: Record<string, string> = {};

  for (const field of SECRET_FIELDS) {
    const provided = data[field];

    if (provided !== undefined && provided !== null && provided !== '') {
      const value = String(provided);
      plain[field] = value;
      data[field] = encryptAes256(value);
    } else if (base && base[field]) {
      plain[field] = safeDecrypt(base[field]) ?? '[unreadable]';
    }
  }

  data.record_hash = computeIntegrityHash({ ...base, ...data, ...plain });

  return data;
};

export type IntegrityReport = {
  documentId: string;
  room_no: string;
  tenant_name: string;
  status: string;
  algorithm: string;
  stored_hash: string;
  calculated_hash: string;
  verified: boolean;
  tamper_detected: boolean;
  decryption_failed_fields: string[];
  checked_at: string;
};

export const verifyRow = (row: DataRow): IntegrityReport => {
  const plain: Record<string, string> = {};
  const decryptionFailed: string[] = [];

  for (const field of SECRET_FIELDS) {
    if (row[field]) {
      const value = safeDecrypt(row[field]);

      if (value === null) {
        decryptionFailed.push(field);
      } else {
        plain[field] = value;
      }
    }
  }

  const calculatedHash = computeIntegrityHash({ ...row, ...plain });
  const storedHash = row.record_hash ?? '';
  const tampered = storedHash !== calculatedHash || decryptionFailed.length > 0;

  return {
    documentId: row.documentId,
    room_no: row.room_no,
    tenant_name: row.tenant_name,
    status: row.status,
    algorithm: 'MD5',
    stored_hash: storedHash,
    calculated_hash: calculatedHash,
    verified: !tampered,
    tamper_detected: tampered,
    decryption_failed_fields: decryptionFailed,
    checked_at: new Date().toISOString(),
  };
};

export const revealRow = (row: DataRow) => {
  const fields: Record<string, { cipher: string | null; plain: string | null }> = {};

  for (const field of SECRET_FIELDS) {
    fields[field] = {
      cipher: row[field] ?? null,
      plain: safeDecrypt(row[field]),
    };
  }

  return {
    documentId: row.documentId,
    room_no: row.room_no,
    building: row.building,
    tenant_name: row.tenant_name,
    encryption: 'AES-256-GCM (iv || authTag || ciphertext, base64)',
    fields,
  };
};
