const requireAuth = require("./requireAuth");

async function adminAuth(req, res, next) {
  try {
    await requireAuth(req, res, () => {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access denied" });
      }

      req.account = req.user;
      return next();
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = adminAuth;
