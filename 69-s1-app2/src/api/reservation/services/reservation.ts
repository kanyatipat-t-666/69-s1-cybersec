import { factories } from '@strapi/strapi';
import { revealRow, sealData, verifyRow, type IntegrityReport } from '../utils/security';

const UID = 'api::reservation.reservation';

type DataRow = Record<string, any>;

export default factories.createCoreService(UID, ({ strapi }) => {
  const findByDocumentId = async (documentId: string): Promise<DataRow | null> =>
    strapi.db.query(UID).findOne({ where: { documentId } as any });

  return {
    seal(data: DataRow, base?: DataRow | null) {
      return sealData(data, base);
    },

    verifyRow,

    async verifyOne(documentId: string): Promise<IntegrityReport | null> {
      const row = await findByDocumentId(documentId);
      return row ? verifyRow(row) : null;
    },

    async verifyAll(): Promise<IntegrityReport[]> {
      const rows: DataRow[] = await strapi.db.query(UID).findMany({
        orderBy: { createdAt: 'desc' } as any,
      });

      return rows.map((row) => verifyRow(row));
    },

    async reveal(documentId: string) {
      const row = await findByDocumentId(documentId);
      return row ? revealRow(row) : null;
    },
  };
});
