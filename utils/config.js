require("dotenv").config();

const PORT = process.env.PORT;

const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;

const ORIGIN = process.env.ORIGIN;

const SECRET = process.env.SECRET;
const COOKIE_SECRET = process.env.COOKIE_SECRET;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SERVICE = process.env.SMTP_SERVICE;
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

module.exports = {
  HOST,
  USER,
  PASSWORD,
  DATABASE,
  PORT,
  SECRET,
  VERIFICATION_SECRET,
  COOKIE_SECRET,
  COOKIE_DOMAIN,
  ORIGIN,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SERVICE,
  SMTP_EMAIL,
  SMTP_PASSWORD,
};
