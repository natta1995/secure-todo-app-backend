const jwt = require('jsonwebtoken');
const crypto = require('crypto');

require('dotenv').config();


// Generera ett slumpmässigt token med 32 tecken
function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

// Skapa JWT-token för användaren
function generateJWT(email, role) {
  const token = jwt.sign({ email, role }, process.env.SECRET_KEY, { expiresIn: '2h' });
  return token;
}

module.exports = {
  generatePasswordResetToken,
  generateJWT,
};

