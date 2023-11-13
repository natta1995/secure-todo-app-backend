// routes/users.js
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const db = require('../db.js');
const { generateJWT } = require('../auth.js');
const {sendPasswordResetEmail, sendInvitationEmail }= require('../Email/email.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const verifyToken = require('../Middleware/authMiddleware.js');
const checkAdminRole = require('../Middleware/rollMiddleware.js')


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
router.get('/', verifyToken,  (req, res) => {
  db.query('SELECT * FROM Users', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte hämta användare' });
    } else {
      res.json(results);
    }
  });
});

router.get('/users', verifyToken, checkAdminRole, (req, res) => {
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
router.put('/change-role/:id', verifyToken, (req, res) => {
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
router.delete('/:id', verifyToken, checkAdminRole,(req, res) => {
  console.log("User in API route:", req.user);
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



router.get('/:id',verifyToken, (req, res) => {
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



// API-endpunkt för användarregistrering
router.post('/register', (req, res) => {
  const { email, username, password } = req.body;

  // Validera lösenordet
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||     // Innehåller minst en liten bokstav
    !/[A-Z]/.test(password) ||     // Innehåller minst en stor bokstav
    !/[0-9]/.test(password) ||     // Innehåller siffror
    !/[^a-zA-Z0-9]/.test(password)  // Innehåller specialtecken
  ) {
    res.status(400).json({ error: 'Ogiltigt lösenord' });
    return;
  }

  const role = process.env.USER_ROLL; 

  // Hasha lösenordet med bcrypt
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte registrera användaren' });
    } else {
      // Lägg till användaren i databasen med hashedPassword
      const query = 'INSERT INTO Users (email, username, password, role) VALUES (?, ?, ?, ?)';
      db.query(query, [email, username, hashedPassword, role], (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Kunde inte registrera användaren' });
        } else {
          res.json({ message: 'Användaren har registrerats' });
        }
      });
    }
  });
});




router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Hämta användaruppgifter från databasen baserat på e-postadressen
  const query = 'SELECT * FROM Users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Ett fel uppstod vid inloggning' });
    } else {
      if (results.length > 0) {
        // Användaren hittades i databasen
        const userData = results[0];

        // Jämför det hashade lösenordet i databasen med det angivna lösenordet
        bcrypt.compare(password, userData.password, (bcryptErr, isMatch) => {
          if (bcryptErr) {
            res.status(500).json({ error: 'Ett fel uppstod vid inloggning' });
          } else if (isMatch) {
            // Lösenordet är korrekt, logga in användaren
            const token = generateJWT(email, userData.role); // Skapa JWT

            // Skicka JWT och användaruppgifter som svar
            res.json({ token, user: userData });
          } else {
            // Inloggningen misslyckades
            res.status(401).json({ error: 'Ogiltiga inloggningsuppgifter' });
          }
        });
      } else {
        // Användaren hittades inte i databasen
        res.status(401).json({ error: 'Ogiltiga inloggningsuppgifter' });
      }
    }
  });
});

// Logout route
router.post('/logout', verifyToken, (req, res) => {
  const token = req.headers['authorization'].split(' ')[1]; // Extraherar token från authorization header

  // Lägg till token i token_blacklist-tabellen
  const query = 'INSERT INTO token_blacklist (token, user_id) VALUES (?, ?)';
  db.query(query, [token, req.user.id], (err, result) => {
    if (err) {
      console.error("Databasfel vid logout: ", err);
      return res.status(500).json({ error: 'Internt serverfel' });
    }

    res.json({ message: 'Utloggad och token svartlistad' });
  });
})


router.post('/invate-friend-request', verifyToken, checkAdminRole,  (req, res) => {
  const { email } = req.body;

  const resetToken = generateJWT(email)

  sendInvitationEmail(email, resetToken);

  res.json({ message: 'En e-postinbjudan har skickats' })
})


router.post('/invate-friend', (req, res) => {
  const { email, username, password } = req.body;

  // Validera lösenordet
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||     // Innehåller minst en liten bokstav
    !/[A-Z]/.test(password) ||     // Innehåller minst en stor bokstav
    !/[0-9]/.test(password) ||     // Innehåller siffror
    !/[^a-zA-Z0-9]/.test(password)  // Innehåller specialtecken
  ) {
    res.status(400).json({ error: 'Ogiltigt lösenord' });
    return;
  }

  const role = process.env.USER_ROLL;

  // Hasha lösenordet med bcrypt
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte registrera användaren' });
    } else {
      // Lägg till användaren i databasen med hashedPassword
      const query = 'INSERT INTO Users (email, username, password, role) VALUES (?, ?, ?, ?)';
      db.query(query, [email, username, hashedPassword, role], (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Kunde inte registrera användaren' });
        } else {
          res.json({ message: 'Användaren har registrerats' });
        }
      });
    }
  });
});



// Begär lösenordsåterställning
router.post('/reset-password-request',  (req, res) => {
  const { email } = req.body;

  const resetToken = generateJWT(email)

  sendPasswordResetEmail(email, resetToken);

  res.json({ message: 'Ett e-postmeddelande med en återställningslänk har skickats.' });;
});


// Återställ lösenord
router.put('/reset-password', (req, res) => {
  const { newPassword } = req.body;
  const token = req.headers["x-access-token"];
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
    const email = decoded.email;
    console.log(email);

    // Hasha det nya lösenordet
    const hashedPassword = hashPassword(newPassword); // Implementera hashPassword-funktionen
    console.log("Nytt lösenord:", newPassword); // Logga det nya lösenordet
    console.log("Hashat lösenord:", hashedPassword); // Logga det hashade lösenordet

    // Uppdatera användarens lösenord i databasen
    db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (error) => {
      if (error) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Lösenordet har ändrats.' });
    });
  });
});



module.exports = router;