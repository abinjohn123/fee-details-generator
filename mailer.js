'use strict';

require('dotenv').config();
// const { Client } = require('@microsoft/microsoft-graph-client');
// const msal = require('@azure/msal-node');

// const nodemailer = require('nodemailer');

// (async () => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.office365.com',
//     port: 587,
//     auth: {
//       user: process.env.OFFICE365_USERNAME,
//       pass: process.env.OFFICE365_PASSWORD,
//     },
//   });

//   //send email
//   const sendMessage = await transporter.sendMail({
//     from: 'abinjohn@hophead.in',
//     to: 'abinjohnanto@gmail.com',
//     subject: 'Test Email Subject',
//     html: '<h1>Example HTML Message Body</h1>',
//   });
// })();

// (async () => {
//   const msalConfig = {
//     auth: {
//       clientId: process.env.AD_CLIENT_ID,
//       clientSecret: process.env.AD_CLIENT_SECRET,
//       authority: `https://login.microsoftonline.com/${process.env.AD_TENANT_ID}`,
//     },
//   };
//   const cca = new msal.ConfidentialClientApplication(msalConfig);

//   const tokenRequest = { account: process.env.AD_TENANT_ID };

//   const authResponse = await cca.acquireTokenByClientCredential(tokenRequest);

//   console.log('Got an auth token! ', authResponse.accessToken);

//   //Given the token,you can now set it to the header of any Axios calls made to Microsoft Graph API
//   const authHeader = (token) => {
//     return {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };
//   };
// })();

require('isomorphic-fetch'); // or import the fetch polyfill you installed
const { Client } = require('@microsoft/microsoft-graph-client');
const {
  TokenCredentialAuthenticationProvider,
} = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { DeviceCodeCredential } = require('@azure/identity');
const { AuthorizationCodeCredential } = require('@azure/identity');

const clientId = process.env.AD_CLIENT_ID;
const tenantId = process.env.AD_TENANT_ID;
const clientSecret = process.env.AD_CLIENT_SECRET;

const credential = new DeviceCodeCredential(tenantId, clientId, clientSecret);

// const credential = new AuthorizationCodeCredential(
//   `${tenantId}`,
//   `${clientId}`
// );
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['user.read', 'mail.send'],
});

const client = Client.initWithMiddleware({
  debugLogging: true,
  authProvider,
});

const options = { authProvider };
// const client = Client.init(options);

// (async () => {
//   let user = await client.api('/me').get();
// })();

const sendMail = {
  message: {
    subject: 'Test',
    body: {
      contentType: 'Text',
      content: 'lorem ipsum dolor se ti emit',
    },
    toRecipients: [
      {
        emailAddress: {
          address: 'abinjohnanto@gmail.com',
        },
      },
    ],
    saveToSentItems: true,
  },
};

(async () => {
  await client.api('/me/sendMail').post(sendMail);
})();
