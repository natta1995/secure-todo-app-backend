// Antag att db är din databasanslutning
const db = require('../db');

function findUserById(userId, callback) {
  db.query('SELECT * FROM Users WHERE id = ?', [userId], function(err, results) {
    if (err) {
      return callback(err, null);
    }
    if (results.length > 0) {
      return callback(null, results[0]);
    } else {
      return callback(new Error('Ingen användare hittades'), null);
    }
  });
}

function checkCreaterRole(req, res, next) {
  const userId = req.params.id;

  findUserById(userId, (error, user) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (user && user.role === 'Creater') {
      return res.status(403).json({ error: 'Cannot modify or delete Creater role' });
    }

    next();
  });
}

module.exports = { checkCreaterRole };
