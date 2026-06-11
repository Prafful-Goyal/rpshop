const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function signJwt(account) {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "threadline-development-secret";
  return jwt.sign(
    {
      sub: String(account._id),
      email: account.email,
      role: account.role,
      name: account.name
    },
    secret,
    { expiresIn: "7d" }
  );
}

function verifyJwt(token) {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "threadline-development-secret";
  return jwt.verify(token, secret);
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSessionToken,
  signJwt,
  verifyJwt
};
