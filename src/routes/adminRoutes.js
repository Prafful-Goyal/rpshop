const express = require("express");

const adminAuth = require("../middleware/adminAuth");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

const router = express.Router();

router.use(adminAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const [productCount, userCount, orderCount, paidOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" })
    ]);

    res.json({
      counts: {
        products: productCount,
        users: userCount,
        orders: orderCount,
        paidOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.patch("/orders/:id", async (req, res, next) => {
  try {
    const allowed = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];
    const update = {};

    if (req.body.status && allowed.includes(req.body.status)) {
      update.status = req.body.status;
    }

    if (req.body.paymentStatus && ["pending", "paid", "failed", "refunded"].includes(req.body.paymentStatus)) {
      update.paymentStatus = req.body.paymentStatus;
    }

    if (typeof req.body.courierName === "string") {
      update.courierName = req.body.courierName.trim();
    }

    if (typeof req.body.trackingNumber === "string") {
      update.trackingNumber = req.body.trackingNumber.trim();
    }

    if (typeof req.body.trackingUrl === "string") {
      update.trackingUrl = req.body.trackingUrl.trim();
    }

    if (typeof req.body.deliveryNotes === "string") {
      update.deliveryNotes = req.body.deliveryNotes.trim();
    }

    if (req.body.estimatedDeliveryDate) {
      const parsedDate = new Date(req.body.estimatedDeliveryDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        update.estimatedDeliveryDate = parsedDate;
      }
    }

    if (req.body.deliveryMethod && ["standard", "express", "priority"].includes(req.body.deliveryMethod)) {
      update.deliveryMethod = req.body.deliveryMethod;
    }

    if (req.body.status === "shipped" && !req.body.shippedAt) {
      update.shippedAt = new Date();
    } else if (req.body.shippedAt) {
      const shippedAt = new Date(req.body.shippedAt);
      if (!Number.isNaN(shippedAt.getTime())) {
        update.shippedAt = shippedAt;
      }
    }

    if (req.body.status === "delivered" && !req.body.deliveredAt) {
      update.deliveredAt = new Date();
    } else if (req.body.deliveredAt) {
      const deliveredAt = new Date(req.body.deliveredAt);
      if (!Number.isNaN(deliveredAt.getTime())) {
        update.deliveredAt = deliveredAt;
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id", async (req, res, next) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.phone) update.phone = req.body.phone;
    if (req.body.role && ["customer", "admin"].includes(req.body.role)) update.role = req.body.role;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
