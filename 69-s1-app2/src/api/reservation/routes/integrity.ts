/**
 * Security demo routes:
 * - GET /api/reservations/:documentId/integrity_hash -> MD5 verify for one record
 * - GET /api/integrity_hash/reservations              -> MD5 verify for every record
 * - GET /api/reservations/:documentId/decrypted       -> AES-256-GCM ciphertext vs plaintext
 */

const routes = [
  {
    method: 'GET',
    path: '/reservations/:documentId/integrity_hash',
    handler: 'reservation.integrityHash',
    config: {
      auth: false,
      description: 'Recalculate and verify the MD5 integrity hash of one reservation',
    },
  },
  {
    method: 'GET',
    path: '/integrity_hash/reservations',
    handler: 'reservation.integrityHashAll',
    config: {
      auth: false,
      description: 'Verify the MD5 integrity hash of every reservation',
    },
  },
  {
    method: 'GET',
    path: '/reservations/:documentId/decrypted',
    handler: 'reservation.decrypted',
    config: {
      description: 'Show the AES-256-GCM ciphertext next to the decrypted value',
    },
  },
];

export default { routes };