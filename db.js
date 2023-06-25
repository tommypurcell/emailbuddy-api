require("dotenv").config();

module.exports = {
  DB_URL: process.env.DB_URL,
  SESSION_SECRET: process.env.DB_PASSWORD,
};
