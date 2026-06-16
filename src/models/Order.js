const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: String,
    slug: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
    image: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    shippingAddress: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "India" }
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveryMethod: {
      type: String,
      enum: ["standard", "express", "priority"],
      default: "standard"
    },
    estimatedDeliveryDate: { type: Date, default: null },
    courierName: { type: String, default: "" },
    courierPhone: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    deliveryNotes: { type: String, default: "" },
    shiprocketStatus: { type: String, default: "not_created" },
    shiprocketOrderId: { type: String, default: "" },
    shiprocketShipmentId: { type: String, default: "" },
    shiprocketAwb: { type: String, default: "" },
    shiprocketCourierName: { type: String, default: "" },
    shiprocketSyncedAt: { type: Date, default: null },
    shiprocketError: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    paymentProvider: { type: String, default: "razorpay" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    emailStatus: { type: String, enum: ["not_sent", "sent", "failed"], default: "not_sent" },
    emailSentAt: { type: Date, default: null },
    emailLastError: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
