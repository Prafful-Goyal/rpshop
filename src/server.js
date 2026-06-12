const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

const { connectDatabase } = require("./config/database");
const configurePassport = require("./config/passport");
const storeRoutes = require("./routes/storeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const { isEnabled: isShiprocketEnabled } = require("./services/shiprocket");

dotenv.config();

const requiredEnvKeys = ["MONGODB_URI", "JWT_SECRET"];

function validateEnvironment() {
  const missing = requiredEnvKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function createServer() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet({
    contentSecurityPolicy: false
  }));
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }));

  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/app-config", (req, res) => {
    res.json({
      shippingMode: String(process.env.SHIPPING_MODE || "manual").toLowerCase(),
      shiprocketEnabled: isShiprocketEnabled()
    });
  });

  app.use("/api/store", storeRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/auth", authRoutes);

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  });

  app.get("/shop", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "shop.html"));
  });

  app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "cart.html"));
  });

  app.get("/checkout", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "checkout.html"));
  });

  app.get("/track-order", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "track-order.html"));
  });

  app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "admin-products.html"));
  });

  app.get("/admin/products", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "admin-products.html"));
  });

  app.get("/admin/orders", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "admin-orders.html"));
  });

  app.get("/admin/users", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "admin-users.html"));
  });

  app.get("/admin/gallery", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "admin-gallery.html"));
  });

  app.use((error, req, res, next) => {
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || "Something went wrong"
    });
  });

  return app;
}

async function startServer() {
  const app = createServer();
  const port = process.env.PORT || 3000;

  validateEnvironment();
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = {
  createServer,
  startServer
};
