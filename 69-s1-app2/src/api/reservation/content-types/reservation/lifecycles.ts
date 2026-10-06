import type { Core } from '@strapi/strapi';
import { sealData } from '../../utils/security';

declare const strapi: Core.Strapi;

const UID = 'api::reservation.reservation';

type DataRow = Record<string, any>;

export default {
  async beforeCreate(event: { params: { data: DataRow } }) {
    sealData(event.params.data);
  },

  async beforeUpdate(event: { params: { data: DataRow; where: Record<string, unknown> } }) {
    const existing: DataRow | null = await strapi.db
      .query(UID)
      .findOne({ where: event.params.where as any });

    sealData(event.params.data, existing);
  },
};
