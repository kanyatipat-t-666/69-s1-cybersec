import { factories } from '@strapi/strapi';
import { revealRow, verifyRow } from '../utils/security';

const UID = 'api::reservation.reservation';

type DataRow = Record<string, any>;

type ActionContext = {
  params?: Record<string, string>;
  send: (body: unknown, status?: number) => unknown;
};

export default factories.createCoreController(UID, ({ strapi }) => {
  const findRow = async (documentId: string): Promise<DataRow | null> =>
    strapi.db.query(UID).findOne({ where: { documentId } as any });

  return {
    /**
     * GET /api/reservations/:documentId/integrity_hash
     * Recalculates the MD5 hash of the stored record and compares it with record_hash.
     */
    async integrityHash(ctx: ActionContext) {
      const row = await findRow(ctx.params?.documentId ?? '');

      if (!row) {
        return ctx.send({ status: 404, message: 'Reservation not found' }, 404);
      }

      return ctx.send(verifyRow(row));
    },

    /**
     * GET /api/integrity_hash/reservations
     * Overview of every record so tampered rows are visible at a glance.
     */
    async integrityHashAll(ctx: ActionContext) {
      const rows: DataRow[] = await strapi.db.query(UID).findMany({
        orderBy: { createdAt: 'desc' } as any,
      });

      const results = rows.map((row) => verifyRow(row));

      return ctx.send({
        algorithm: 'MD5',
        total: results.length,
        verified: results.filter((result) => result.verified).length,
        tampered: results.filter((result) => result.tamper_detected).length,
        results,
      });
    },

    /**
     * GET /api/reservations/:documentId/decrypted
     * Shows the AES-256-GCM ciphertext next to the decrypted value (protected route).
     */
    async decrypted(ctx: ActionContext) {
      const row = await findRow(ctx.params?.documentId ?? '');

      if (!row) {
        return ctx.send({ status: 404, message: 'Reservation not found' }, 404);
      }

      return ctx.send(revealRow(row));
    },
  };
});