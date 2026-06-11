const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false },
    googleId: { type: String, default: "", index: true },
    authProvider: { type: String, default: "local" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: { type: String, default: "" },
    lastSeenAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
