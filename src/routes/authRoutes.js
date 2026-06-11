const express = require("express");
const passport = require("passport");

const Account = require("../models/Account");
const User = require("../models/User");
const { hashPassword, signJwt } = require("../utils/auth");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

function isGoogleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function getGoogleCallbackURL(req) {
  const host = req.get("host");
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  return `${protocol}://${host}/api/auth/google/callback`;
}

function publicAccount(account) {
  return {
    _id: account._id,
    name: account.name,
    email: account.email,
    role: account.role,
    phone: account.phone
  };
}

function sendAuthResponse(req, res, account, options = {}) {
  const { respondWithJson = true, redirectTo = null } = options;
  const token = signJwt(account);
  res.cookie("authToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  if (!respondWithJson && redirectTo) {
    res.redirect(redirectTo);
    return;
  }

  res.json({
    account: publicAccount(account),
    token
  });
}

async function syncUser(account) {
  await User.findOneAndUpdate(
    { email: account.email },
    {
      name: account.name,
      email: account.email,
      phone: account.phone,
      role: account.role,
      lastSeenAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingAccount = await Account.findOne({ email: email.toLowerCase() });
    if (existingAccount) {
      return res.status(409).json({ message: "Account already exists" });
    }

    const account = await Account.create({
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      phone: phone || "",
      role: role === "admin" ? "admin" : "customer"
    });

    await syncUser(account);

    return sendAuthResponse(req, res, account);
  } catch (error) {
    return next(error);
  }
});

router.post("/signin", (req, res, next) => {
  passport.authenticate("local", async (error, account, info) => {
    if (error) {
      return next(error);
    }

    if (!account) {
      return res.status(401).json({ message: info?.message || "Invalid credentials" });
    }

    try {
      await syncUser(account);
    } catch (syncError) {
      return next(syncError);
    }

    return sendAuthResponse(req, res, account);
  })(req, res, next);
});

router.get("/google", (req, res, next) => {
  if (!isGoogleAuthConfigured()) {
    return res.status(503).json({
      message: "Google sign-in is not configured yet"
    });
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    callbackURL: getGoogleCallbackURL(req)
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  if (!isGoogleAuthConfigured()) {
    return res.status(503).json({
      message: "Google sign-in is not configured yet"
    });
  }

  return passport.authenticate("google", {
    session: false,
    callbackURL: getGoogleCallbackURL(req)
  }, async (error, account, info) => {
    if (error) {
      return res.status(400).json({
        message: error.message || info?.message || "Google sign-in failed"
      });
    }

    if (!account) {
      return res.status(400).json({
        message: info?.message || "Google sign-in failed"
      });
    }

    try {
      await syncUser(account);
      sendAuthResponse(req, res, account, {
        respondWithJson: false,
        redirectTo: account.role === "admin" ? "/admin" : "/shop"
      });
    } catch (syncError) {
      return next(syncError);
    }
  })(req, res, next);
});

router.post("/signout", async (req, res, next) => {
  try {
    res.clearCookie("authToken");
    if (req.session) {
      req.session.destroy(() => {
        res.json({ message: "Signed out" });
      });
      return;
    }

    res.json({ message: "Signed out" });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  return res.json({ account: publicAccount(req.user) });
});

module.exports = router;
