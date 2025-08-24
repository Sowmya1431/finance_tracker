const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); 

const TOKEN = process.env.TOKEN;


function verify(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
    req.user = decoded;
    next();
  });
}

module.exports = verify;
