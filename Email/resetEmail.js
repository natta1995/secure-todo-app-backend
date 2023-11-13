
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

const authCode = 'din-autentiseringskod';

oauth2Client.getToken(authCode, (err, token) => {
  if (err) {
    console.error('Fel vid autentisering:', err);
    return;
  }
  fs.writeFileSync('token.json', JSON.stringify(token.tokens));
});

module.exports = oauth2Client;

