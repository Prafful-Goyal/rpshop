const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const requireAuth = require("../middleware/requireAuth");
const { calculateOrderTotals, getShippingOption } = require("../utils/orderTotals");
const { sendOrderReceivedEmail, buildTrackingSnapshot } = require("../services/email");

const router = express.Router();

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
}

function normalizeCurrency(currency = "INR") {
  return String(currency || "INR").trim().toUpperCase() || "INR";
}

function validateAmount(amount) {
  const normalized = Math.round(Number(amount || 0));
  return Number.isFinite(normalized) && normalized >= 100 ? normalized : null;
}

async function createRazorpayOrder({ amount, currency = "INR", receipt, notes = {} }) {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    const error = new Error("Razorpay keys are not configured yet");
    error.status = 503;
    throw error;
  }

  const normalizedAmount = validateAmount(amount);
  if (!normalizedAmount) {
    const error = new Error("Amount must be at least 100 paise");
    error.status = 400;
    throw error;
  }

  return razorpay.orders.create({
    amount: normalizedAmount,
    currency: normalizeCurrency(currency),
    receipt: receipt || `receipt_${Date.now()}`,
    notes
  });
}

async function buildCheckoutData({ user, customerName, customerEmail, customerPhone, shippingAddress, deliveryMethod, items }) {
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const sanitizedItems = items.map((item) => {
    const product = productMap.get(String(item.productId));
    if (!product) {
      throw new Error(`Product not found for cart item ${item.productId}`);
    }

    const quantity = Math.max(1, Number(item.quantity || 1));
    return {
      productId: product._id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      quantity,
      size: item.size || "",
      color: item.color || "",
      image: product.image
    };
  });

  const shippingOption = getShippingOption(deliveryMethod);
  const { subtotal, shippingFee, totalAmount } = calculateOrderTotals(sanitizedItems, shippingOption.shippingFee);
  const estimatedDeliveryDate = new Date(Date.now() + shippingOption.maxDays * 24 * 60 * 60 * 1000);
  const upsertedUser = await User.findOneAndUpdate(
    { email: customerEmail.toLowerCase() },
    {
      name: customerName,
      email: customerEmail.toLowerCase(),
      phone: customerPhone || "",
      lastSeenAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const order = await Order.create({
    userId: upsertedUser._id,
    customerName,
    customerEmail: customerEmail.toLowerCase(),
    customerPhone: customerPhone || "",
    shippingAddress: shippingAddress || {},
    items: sanitizedItems,
    subtotal,
    shippingFee,
    totalAmount,
    deliveryMethod: shippingOption.deliveryMethod,
    estimatedDeliveryDate
  });

  return {
    order,
    shippingOption,
    subtotal,
    shippingFee,
    totalAmount
  };
}

async function verifyRazorpayPayment({ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error("Missing payment verification details");
    error.status = 400;
    throw error;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    const error = new Error("Invalid payment signature");
    error.status = 400;
    throw error;
  }

  let order = null;
  if (orderId) {
    order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("Order not found");
      error.status = 404;
      throw error;
    }

    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    if (!order.estimatedDeliveryDate) {
      const shippingOption = getShippingOption(order.deliveryMethod);
      order.estimatedDeliveryDate = new Date(Date.now() + shippingOption.maxDays * 24 * 60 * 60 * 1000);
    }
    await order.save();

    sendOrderReceivedEmail(order).catch((emailError) => {
      console.error("Order receipt email failed:", emailError.message);
    });
  }

  return { order };
}

async function seedProductsIfNeeded() {
  const count = await Product.countDocuments();
  if (count > 0) {
    return;
  }

  await Product.insertMany([
    {
      title: "Classic Logo Tee",
      slug: "classic-logo-tee",
      brand: "Threadline",
      category: "Basics",
      rating: 4.6,
      badge: "Best Seller",
      description: "Soft cotton tee with a clean front logo.",
      price: 799,
      compareAtPrice: 999,
      image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["S", "M", "L", "XL"],
      colorOptions: ["Black", "White", "Olive"],
      stock: 25
    },
    {
      title: "Oversized Street Tee",
      slug: "oversized-street-tee",
      brand: "StreetVault",
      category: "Streetwear",
      rating: 4.7,
      badge: "Trending",
      description: "Relaxed oversized fit for a bold streetwear look.",
      price: 999,
      compareAtPrice: 1299,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["M", "L", "XL", "XXL"],
      colorOptions: ["Charcoal", "Sand", "Stone"],
      stock: 18
    },
    {
      title: "Minimal Crew Neck",
      slug: "minimal-crew-neck",
      brand: "Urban Loom",
      category: "Essentials",
      rating: 4.5,
      badge: "Fresh Drop",
      description: "Clean premium tee made for everyday layering.",
      price: 699,
      compareAtPrice: 899,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["S", "M", "L", "XL"],
      colorOptions: ["White", "Navy", "Grey"],
      stock: 30
    },
    {
      title: "Typography Statement Tee",
      slug: "typography-statement-tee",
      brand: "Bold Studio",
      category: "Graphic",
      rating: 4.8,
      badge: "Limited",
      description: "Heavy cotton tee with premium print detailing.",
      price: 1099,
      compareAtPrice: 1499,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["S", "M", "L", "XL"],
      colorOptions: ["Black", "Off White"],
      stock: 12
    },
    {
      title: "Vintage Pocket Tee",
      slug: "vintage-pocket-tee",
      brand: "North Lane",
      category: "Casual",
      rating: 4.3,
      badge: "New",
      description: "Soft washed tee with a subtle pocket detail.",
      price: 849,
      compareAtPrice: 1099,
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["S", "M", "L", "XL"],
      colorOptions: ["Dusty Blue", "Moss", "Cream"],
      stock: 22
    },
    {
      title: "Sport Performance Tee",
      slug: "sport-performance-tee",
      brand: "Move",
      category: "Active",
      rating: 4.4,
      badge: "Lightweight",
      description: "Breathable performance tee for everyday training.",
      price: 949,
      compareAtPrice: 1199,
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["S", "M", "L", "XL"],
      colorOptions: ["Red", "Blue", "Black"],
      stock: 20
    },
    {
      title: "Premium Polo Tee",
      slug: "premium-polo-tee",
      brand: "Monarch",
      category: "Smart Casual",
      rating: 4.6,
      badge: "Premium",
      description: "Polished polo tee with a sharper everyday fit.",
      price: 1299,
      compareAtPrice: 1699,
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["M", "L", "XL", "XXL"],
      colorOptions: ["Navy", "Bottle Green", "White"],
      stock: 14
    },
    {
      title: "Weekend Comfort Tee",
      slug: "weekend-comfort-tee",
      brand: "Threadline",
      category: "Relaxed",
      rating: 4.2,
      badge: "Comfort Fit",
      description: "Easy drape and ultra-soft hand feel for weekends.",
      price: 749,
      compareAtPrice: 999,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
      sizeOptions: ["S", "M", "L", "XL"],
      colorOptions: ["Beige", "Black", "Olive"],
      stock: 28
    }
  ]);
}

router.get("/products", async (req, res, next) => {
  try {
    await seedProductsIfNeeded();
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.get("/products/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.post("/create-order", requireAuth, async (req, res, next) => {
  try {
    const {
      shippingAddress,
      deliveryMethod = "standard",
      amount,
      currency = "INR",
      receipt,
      items
    } = req.body;

    const customerName = req.user.name;
    const customerEmail = req.user.email;
    const customerPhone = req.user.phone || "";

    if (Array.isArray(items) && items.length > 0) {
      const { order, totalAmount } = await buildCheckoutData({
        user: req.user,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        deliveryMethod,
        items
      });

      const razorpayOrder = await createRazorpayOrder({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `order_${order._id}`,
        notes: {
          orderId: String(order._id),
          customerEmail: customerEmail.toLowerCase()
        }
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.json({
        order,
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        internal_order_id: String(order._id),
        razorpay: {
          enabled: true,
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency
        }
      });
    }

    const normalizedAmount = validateAmount(amount);
    if (!normalizedAmount) {
      return res.status(400).json({ message: "Amount must be at least 100 paise" });
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: normalizedAmount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        customerEmail: customerEmail.toLowerCase()
      }
    });

    return res.json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpay: {
        enabled: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/checkout", requireAuth, async (req, res, next) => {
  try {
    const { shippingAddress, deliveryMethod = "standard", items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Customer details and items are required" });
    }

    const customerName = req.user.name;
    const customerEmail = req.user.email;
    const customerPhone = req.user.phone || "";

    const { order, totalAmount } = await buildCheckoutData({
      user: req.user,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryMethod,
      items
    });

    const razorpayOrder = await createRazorpayOrder({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: {
        orderId: String(order._id),
        customerEmail: customerEmail.toLowerCase()
      }
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      order,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      internal_order_id: String(order._id),
      razorpay: {
        enabled: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/verify-payment", requireAuth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, internal_order_id } = req.body;
    const verified = await verifyRazorpayPayment({
      orderId: orderId || internal_order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    res.json({ message: "Payment verified", order: verified.order });
  } catch (error) {
    next(error);
  }
});

router.post("/payment/verify", requireAuth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, internal_order_id } = req.body;
    const verified = await verifyRazorpayPayment({
      orderId: orderId || internal_order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    res.json({ message: "Payment verified", order: verified.order });
  } catch (error) {
    next(error);
  }
});

router.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.get("/orders/:id/track", async (req, res, next) => {
  try {
    const { email = "" } = req.query;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!email || String(email).trim().toLowerCase() !== String(order.customerEmail || "").toLowerCase()) {
      return res.status(403).json({ message: "Order lookup failed" });
    }

    res.json({
      order: buildTrackingSnapshot(order)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
