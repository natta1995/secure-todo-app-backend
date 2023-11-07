// resetEmail.js

const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
require('dotenv').config();

const oauth2Client = new OAuth2Client({
  clientId: process.env.DIN_KLIENT_ID,
  clientSecret: process.env.DIN_KLIENT_SECRET,
  redirectUri: 'http://localhost:3001/changepassword',
});

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/gmail.compose',
});

console.log('Logga in på följande länk för att hämta autentiseringskod:');
console.log(authUrl);

// Efter användaren har loggat in och gett behörigheter, får du en autentiseringskod.
// Använd autentiseringskoden för att hämta åtkomst- och refresh-token:
const authCode = 'din-autentiseringskod';

oauth2Client.getToken(authCode, (err, token) => {
  if (err) {
    console.error('Fel vid autentisering:', err);
    return;
  }

  // Spara token.tokens till en fil eller en säker plats för senare användning.
  fs.writeFileSync('token.json', JSON.stringify(token.tokens));
  console.log('Token sparad.');
});

module.exports = oauth2Client;

















//resetEmail.js
/*
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');

const oauth2Client = new OAuth2Client({
  clientId: 'din-klient-id',
  clientSecret: 'din-klienthemlighet',
  redirectUri: 'http://localhost:3001/changepassword',
});

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/gmail.compose', // Ange rätt behörigheter
});

console.log('Logga in på följande länk för att hämta autentiseringskod:');
console.log(authUrl);

// Efter användaren har loggat in och gett behörigheter, får du en autentiseringskod.
// Använd autentiseringskoden för att hämta åtkomst- och refresh-token:

const authCode = 'din-autentiseringskod';

oauth2Client.getToken(authCode, (err, token) => {
  if (err) {
    console.error('Fel vid autentisering:', err);
    return;
  }

  // Spara token.tokens till en fil eller en säker plats för senare användning.
  fs.writeFileSync('token.json', JSON.stringify(token.tokens));
  console.log('Token sparad.');
});

module.exports = transporter;














/*const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Skapa en OAuth2-client
const oauth2Client = new OAuth2Client({
  clientId: '495009116943-qst5j4oagb7rm7krrc63d2laalc0steu.apps.googleusercontent.com',
  clientSecret: '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',
  redirectUri: 'http://localhost:3001/changepassword'
});

console.log('OAuth2Client created steg 1:', oauth2Client);

// Använd oauth2Client för att hämta ett åtkomsttoken (se tidigare kodexempel).
oauth2Client.getAccessToken((err, token) => {
  if (err) {
    console.error('Fel vid åtkomst av åtkomsttoken:', err);
    return;
  }

  // Skapa en nodemailer-transportör med OAuth 2.0-autentisering
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      type: 'OAuth2',
      user: 'nhallerdal@gmail.com',
      clientId: '495009116943-qst5j4oagb7rm7krrc63d2laalc0steu.apps.googleusercontent.com',
      clientSecret: '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',
      refreshToken: token.tokens.refresh_token,
      accessToken: token.tokens.access_token,
    },
  });

  console.log('Transporter created:', transporter);

  module.exports = transporter;
});






















/*const transporter = require('./email'); // Importera din tidigare konfigurerade transporter

function sendPasswordResetEmail(email, resetToken) {
  const mailOptions = {
    from: 'nhallerdal@gmail.com',
    to: email,
    subject: 'Återställ ditt lösenord',
    text: `Klicka på länken för att återställa ditt lösenord: http://localhost:3001/reset-password?token=${resetToken}`
  }; 

  console.log('MailOptions: steg två', mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Fel vid sändning av e-post:', error);
    } else {
      console.log('E-post skickad:', info.response);
    }
  });
}

module.exports = sendPasswordResetEmail;**/
