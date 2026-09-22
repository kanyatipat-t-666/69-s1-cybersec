FROM prawee/strapi:latest

USER root
RUN mkdir -p /opt/add && cd /opt/add && \
    echo '{"name":"strapi-email-add","private":true}' > package.json && \
    yarn config set ignore-engines true && \
    yarn add strapi-provider-email-nodemailer --network-timeout 600000 --ignore-engines && \
    cp -r node_modules/* /opt/node_modules/ && \
    rm -rf /opt/add

COPY providers/strapi-provider-email-nodemailer.js /opt/node_modules/@strapi/provider-email-nodemailer/index.js
COPY config/plugins.js /opt/app/config/plugins.js
COPY src/api/admin-register /opt/app/src/api/admin-register
RUN chown -R node:node /opt/app /opt/node_modules

USER node
EXPOSE 1337
CMD ["yarn", "start"]