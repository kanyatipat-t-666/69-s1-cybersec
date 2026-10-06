import type { Core } from '@strapi/strapi';

type DataRow = Record<string, any>;

const UID = 'api::reservation.reservation';
const USER_UID = 'plugin::users-permissions.user';
const ROLE_UID = 'plugin::users-permissions.role';

const SAMPLE_RESERVATIONS: DataRow[] = [
  {
    room_no: 'A101',
    building: 'อาคารพัฒนา',
    tenant_name: 'สมชาย ใจดี',
    id_card: '1103700123456',
    phone: '0812345678',
    monthly_rent: 4500,
    start_date: '2026-10-01',
    end_date: '2026-12-31',
    status: 'confirmed',
  },
  {
    room_no: 'B202',
    building: 'อาคารธัญญา',
    tenant_name: 'ธนิดา รักเรียน',
    id_card: '1103700654321',
    phone: '0897654321',
    monthly_rent: 5500,
    start_date: '2026-10-15',
    status: 'pending',
  },
  {
    room_no: 'C303',
    building: 'อาคารศรีสุข',
    tenant_name: 'วีระ คงมั่น',
    id_card: '3100801122334',
    phone: '0956781234',
    monthly_rent: 6000,
    start_date: '2026-11-01',
    end_date: '2027-01-31',
    status: 'confirmed',
  },
  {
    room_no: 'D404',
    building: 'อาคารพัฒนา',
    tenant_name: 'นภัสสร แก้วใส',
    id_card: '4100903456789',
    phone: '0987654321',
    monthly_rent: 4800,
    start_date: '2026-09-15',
    end_date: '2026-12-31',
    status: 'cancelled',
  },
  {
    room_no: 'E505',
    building: 'อาคารธัญญา',
    tenant_name: 'อนุชา วัฒนวงศ์',
    id_card: '1103702334455',
    phone: '0871122334',
    monthly_rent: 5200,
    start_date: '2026-10-20',
    status: 'pending',
  },
];

const SAMPLE_USERS: DataRow[] = [
  {
    username: 'somchai',
    email: 'somchai@dormdemo.local',
    password: 'Demo1234!',
    provider: 'local',
    confirmed: true,
    blocked: false,
  },
  {
    username: 'thanida',
    email: 'thanida@dormdemo.local',
    password: 'Demo1234!',
    provider: 'local',
    confirmed: true,
    blocked: false,
  },
  {
    username: 'weera',
    email: 'weera@dormdemo.local',
    password: 'Demo1234!',
    provider: 'local',
    confirmed: true,
    blocked: false,
  },
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Bootstraps the app. If the reservation/user tables are empty it inserts
   * sample dormitory reservations and demo users so the demo already has data.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const reservationCount = await strapi.db.query(UID).count({});

    if (reservationCount === 0) {
      for (const reservation of SAMPLE_RESERVATIONS) {
        await strapi.documents(UID).create({ data: reservation as any });
      }

      strapi.log.info(`[demo-seed] inserted ${SAMPLE_RESERVATIONS.length} sample reservations`);
    }

    const userCount = await strapi.db.query(USER_UID).count({});

    if (userCount === 0) {
      const publicRole = await strapi.db
        .query(ROLE_UID)
        .findOne({ where: { type: 'public' } as any });

      for (const user of SAMPLE_USERS) {
        await strapi.documents(USER_UID).create({
          data: { ...user, role: publicRole?.documentId } as any,
        });
      }

      strapi.log.info(`[demo-seed] inserted ${SAMPLE_USERS.length} sample users`);
    }
  },
};