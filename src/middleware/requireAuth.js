const Account = require("../models/Account");
const { verifyJwt } = require("../utils/auth");

async function requireAuth(req, res, next) {
  try {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      return next();
    }

    const token = req.cookies?.authToken || req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ message: "Please sign in to continue" });
    }

    const decoded = verifyJwt(token);
    const account = await Account.findById(decoded.sub);
    if (!account) {
      return res.status(401).json({ message: "Account not found" });
    }

    req.user = account;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Please sign in to continue" });
  }
}

module.exports = requireAuth;
