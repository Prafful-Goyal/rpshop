const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
