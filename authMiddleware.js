require('dotenv').config();
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
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error: ", err);
    return res.status(401).json({ error: 'Ogiltig token' });
  }
}

module.exports = verifyToken















// authMiddleware
/*const jwt = require('jsonwebtoken');

// Middleware för att verifiera tokens
function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).json({ error: 'En token krävs för autentisering' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ error: 'Ogiltig token' });
  }

  return next();
}

module.exports = verifyToken;*/


