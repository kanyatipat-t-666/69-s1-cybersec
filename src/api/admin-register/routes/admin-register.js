'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/admin/register',
      handler: 'admin-register.register',
      config: {
        auth: false,
      },
    },
  ],
};