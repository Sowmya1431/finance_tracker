const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); 

const Vartoken = process.env.VERTOK; 

function verifyotp(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(401).send({ message: "Header missing" });
  }

  const token = auth.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: "Token is missing" });
  }

  jwt.verify(token, Vartoken, (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "Invalid token", error: err.message });
    }
    req.user = decode;
    next();
  });
}

module.exports = verifyotp;
