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

