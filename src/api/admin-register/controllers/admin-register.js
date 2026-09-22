'use strict';

const { ValidationError } = require('@strapi/utils').errors;

module.exports = ({ strapi }) => ({
  async register(ctx) {
    const { email, password, firstname = '', lastname = '' } = ctx.request.body || {};

    if (!email || !password) {
      throw new ValidationError('E-mail and password are required.');
    }

    const exists = await strapi.admin.services.user.exists({ email: { $eqi: email } });
    if (exists) {
      throw new ValidationError('E-mail already taken.');
    }

    const superAdminRole = await strapi.query('admin::role').findOne({
      where: { code: 'strapi-super-admin' },
    });

    if (!superAdminRole) {
      throw new ValidationError('No super admin role found.');
    }

    const user = await strapi.admin.services.user.create({
      email,
      password,
      firstname,
      lastname,
      roles: [superAdminRole.id],
      isActive: true,
    });

    const token = strapi.admin.services.token.createJwtToken(user);

    ctx.body = {
      data: {
        token,
        user: strapi.admin.services.user.sanitizeUser(user),
      },
    };
  },
});