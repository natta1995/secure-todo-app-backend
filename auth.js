const jwt = require('jsonwebtoken');
const crypto = require('crypto');

require('dotenv').config();


const secretKey = process.env.SECRET_KEY;


// Generera ett slumpmässigt token med 32 tecken
function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return token;
}

// Skapa JWT-token för användaren
function generateJWT(email) {
  const token = jwt.sign({ email }, secretKey, { expiresIn: '2h' });
  return token;
}

module.exports = {
  generatePasswordResetToken,
  generateJWT,
};



















// Secret key for signing the JWT
//const secretKey = 'hemligt'; 

// Function to generate a JWT token for a user
/*function generateJWT(email) {
  const token = jwt.sign({ email }, secretKey, { expiresIn: '2h' }); 
  return token;
}

module.exports = {
  generateJWT,
};*/
