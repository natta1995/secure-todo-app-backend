// email.js
require('dotenv').config();
const nodemailer = require('nodemailer');
//const fs = require('fs');

// Skapa en transporter för att skicka e-post
function createTransporter() {
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.EMAIL_PASSWORD
    },
  });
}

function sendPasswordResetEmail(email, resetToken) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.MY_EMAIL,
    to: email,
    subject: 'Återställ ditt lösenord',
    text: `Klicka på länken för att återställa ditt lösenord: http://localhost:3000/newpassword/?resetToken=${resetToken}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Fel vid sändning av e-post:', error);
    } else {
      console.log('E-post skickad:', info.response);
    }
  });
}

module.exports = sendPasswordResetEmail;

