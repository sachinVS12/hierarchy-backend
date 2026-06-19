const jwt = require("jsonwebtoken");
const config = require("../config/env");

const generateToken = (userId, role, companyId = null) => {
  const payload = {
    id: userId,
    role,
    companyId,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken,
};
