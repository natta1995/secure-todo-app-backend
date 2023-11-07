// routes/users.js
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const db = require('./db');
const { generateJWT } = require('./auth');
const sendPasswordResetEmail = require('./email.js');
const bcrypt = require('bcrypt');

// Funktion för att hasha ett lösenord
function hashPassword(password) {
  const saltRounds = 10; // Antal hashningsrundor
  return bcrypt.hashSync(password, saltRounds);
}

// Använda funktionen för att hasha ett lösenord
const newPassword = 'nyttLosenord';
const hashedPassword = hashPassword(newPassword);
console.log(hashedPassword); // Det hashade lösenordet

// API-endpunkt för att hämta användare
router.get('/', (req, res) => {
  db.query('SELECT * FROM Users', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte hämta användare' });
    } else {
      res.json(results);
    }
  });
});

router.get('/users', (req, res) => {
  // Gör en databasfråga för att hämta alla användare med deras roller
  db.query('SELECT id, username, role FROM Users', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte hämta användare' });
    } else {
      res.json(results);
    }
  });
});

// API-endpunkt för att ändra användarroll
router.put('/change-role/:id', (req, res) => {
  const userId = req.params.id;
  const newRole = req.body.role; // Skicka den nya rollen i förfråganens kropp

  // Uppdatera användarrollen i databasen baserat på userId
  db.query('UPDATE Users SET role = ? WHERE id = ?', [newRole, userId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte uppdatera användarens roll' });
    } else {
      res.json({ message: 'Användarens roll har uppdaterats' });
    }
  });
});

// API-endpunkt för att ta bort en användare
router.delete('/:id', (req, res) => {
  const userId = req.params.id;

  // Utför borttagningen från databasen baserat på userId
  db.query('DELETE FROM Users WHERE id = ?', userId, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte ta bort användaren' });
    } else {
      res.json({ message: 'Användaren har tagits bort' });
    }
  });
});


router.get('/:id', (req, res) => {
  const user = req.user; // Antag att användarinformationen finns i req.user efter att ha verifierat JWT-token

  if (user) {
    // Returnera användarinformation som JSON
    res.json({
      username: user.username,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: 'Användaren hittades inte' });
  }
});
// todo create invare endpoint

// API-endpunkt för användarregistrering
router.post('/register', (req, res) => {
  const { email, username, password } = req.body;


  // Validera lösenordet
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||     // Innehåller minst en liten bokstav
    !/[A-Z]/.test(password) ||     // Innehåller minst en stor bokstav
    !/[0-9]/.test(password) ||        // Innehåller siffror
    !/[^a-zA-Z0-9]/.test(password)    // Innehåller specialtecken
  ) {
    res.status(400).json({ error: 'Ogiltigt lösenord' });
    return;
  }

  const role = 'user'; // Definiera standardrollen
  // Lägg till användaren i databasen
  const query = 'INSERT INTO Users (email, username, password, role) VALUES (?, ?, ?, ?)';
  db.query(query, [email, username, password, role], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte registrera användaren' });
    } else {
      res.json({ message: 'Användaren har registrerats' });
    }
  });
});


router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Kontrollera användaruppgifter mot databasen
  const query = 'SELECT * FROM Users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Ett fel uppstod vid inloggning' });
    } else {
      if (results.length > 0) {
        // Användaren hittades, logga in
        const token = generateJWT(email); // Skapa JWT

        // Hämta användaruppgifter från resultatet
        const userData = results[0];

        // Skicka JWT och användaruppgifter som svar
        res.json({ token, user: userData });
      } else {
        // Inloggningen misslyckades
        res.status(401).json({ error: 'Ogiltiga inloggningsuppgifter' });
      }
    }
  });
});




// Begär lösenordsåterställning
router.post('/reset-password-request', (req, res) => {
  const { email } = req.body;
  console.log("reset password endpoint")
  // Generera och spara återställningstoken i databasen
  //const resetToken = generatePasswordResetToken();
  const resetToken = generateJWT(email)
  //const resetTokenExpiration = Date.now() + 3600000; // Token gäller i 1 timme

  // Skicka e-postmeddelande med återställningslänk inklusive resetToken
  sendPasswordResetEmail(email, resetToken); // Använd sendPasswordResetEmail-funktionen

  res.json({ message: 'Ett e-postmeddelande med en återställningslänk har skickats.' });;
});


// Återställ lösenord
router.post('/reset-password', (req, res) => {
  const { newPassword } = req.body;
  const token = req.headers["x-access-token"]
  if (!token) {
    return res.status(403).send({
      message: "no token provided",
    });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }
    const email = decoded.email
    console.log(email)
    const hashedPassword = hashPassword(newPassword); // Implementera hashPassword-funktionen

    // Uppdatera användarens lösenord och ta bort återställningstoken
    db.query('UPDATE users SET password = ?, reset_token = NULL WHERE email = ?', [hashedPassword, email], (error) => {
      if (error) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Lösenordet har återställts.' });
    });
  })


});

module.exports = router;
