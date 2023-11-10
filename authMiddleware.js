require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('./db')


function verifyToken(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];


  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }


  if (!token) {
    return res.status(403).json({ error: 'En token krävs för autentisering' });
  }

  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if(err) {
        console.error("Token verification error: ", err);
      return res.status(401).json({ error: 'Ogiltig token' });
      }
 // Kolla om token finns i svartlistan
 const query = 'SELECT * FROM token_blacklist WHERE token = ?';
 db.query(query, [token], (dbErr, results) => {
   if (dbErr) {
     console.error("Databasfel vid tokenkontroll: ", dbErr);
     return res.status(500).json({ error: 'Internt serverfel' });
   }

   if (results.length > 0) {
     // Token finns i svartlistan
     return res.status(401).json({ error: 'Token är ogiltig' });
   }

   // Token är giltig och inte svartlistad
   req.user = decoded;
   next();
 });
});
}

module.exports = verifyToken;








/*require('dotenv').config();
const jwt = require('jsonwebtoken');


function verifyToken(req, res, next) {
  // Försök att få token från 'x-access-token' eller 'authorization'
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  // Om token finns i 'authorization' headern, ta bort 'Bearer' prefixet
  if (token && token.startsWith('Bearer ')) {
    
    token = token.slice(7, token.length);
  }
  console.log("Token received: ", token);
  if (!token) {
    return res.status(403).json({ error: 'En token krävs för autentisering' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("authMiddlware = Decoded user:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error: ", err);
    return res.status(401).json({ error: 'Ogiltig token' });
  }
}

module.exports = verifyToken

*/


