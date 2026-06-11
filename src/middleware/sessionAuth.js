const Session = require("../models/Session");
const Account = require("../models/Account");

async function sessionAuth(req, res, next) {
  try {
    const token = req.header("x-session-token") || req.cookies?.sessionToken;
    if (!token) {
      return res.status(401).json({ message: "Please sign in to continue" });
    }

    const session = await Session.findOne({ token, expiresAt: { $gt: new Date() } });
    if (!session) {
      return res.status(401).json({ message: "Session expired. Please sign in again" });
    }

    const account = await Account.findById(session.accountId);
    if (!account) {
      return res.status(401).json({ message: "Account not found" });
    }

    req.account = account;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = sessionAuth;
