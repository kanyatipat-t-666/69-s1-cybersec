module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'mailpit'),
        port: env.int('SMTP_PORT', 1025),
        secure: env.bool('SMTP_SECURE', false),
        ignoreTLS: env.bool('SMTP_IGNORE_TLS', true),
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        logger: true,
        debug: true,
        auth: env('SMTP_USER') && env('SMTP_PASS')
          ? {
              user: env('SMTP_USER'),
              pass: env('SMTP_PASS'),
            }
          : undefined,
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'strapi@localhost'),
        defaultReplyTo: env('SMTP_FROM', 'strapi@localhost'),
      },
    },
  },
});