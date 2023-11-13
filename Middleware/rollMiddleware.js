

function checkAdminRole(req, res, next) {
    console.log("User in checkAdminRole:", req.user);
    if (req.user && req.user.role === 'admin' || req.user.role === 'Creater') {
      next(); 
    } else {
      res.status(403).json({ error: 'Åtkomst nekad. Endast administratörer har behörighet.' });
    }
    
  }
  
  module.exports = checkAdminRole;
  