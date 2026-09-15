'use strict';

const nodemailer = require('nodemailer');

module.exports = {
  provider: 'nodemailer',
  name: 'Nodemailer',
  init(providerOptions = {}, settings = {}) {
    const transporter = nodemailer.createTransport(providerOptions);
    return {
      send: async (options = {}) => {
        const { from, to, cc, bcc, replyTo, subject, text, html, ...rest } = options;
        const message = {
          from: from || settings.defaultFrom,
          to,
          cc,
          bcc,
          replyTo: replyTo || settings.defaultReplyTo,
          subject,
          text,
          html,
          ...rest,
        };
        return transporter.sendMail(message);
      },
    };
  },
};