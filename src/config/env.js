const dotenv = require("dotenv");

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  apiVersion: process.env.API_VERSION || "v1",
};

// Validate required config
const required = ["mongoUri", "jwtSecret"];
for (const key of required) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = config;
