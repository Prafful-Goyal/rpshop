const express = require("express");

const adminAuth = require("../middleware/adminAuth");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { syncShipmentToOrder, testConnection } = require("../services/shiprocket");
const { sendOrderStatusUpdateEmail } = require("../services/email");

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

router.post("/orders/:id/shiprocket", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Order must be paid before creating a shipment" });
    }

    const result = await syncShipmentToOrder(order, { throwOnError: true });
    res.json({
      message: "Shiprocket shipment created",
      order: result.order,
      shipment: result.shipment
    });
  } catch (error) {
    next(error);
  }
});

router.post("/shiprocket/test", async (req, res, next) => {
  try {
    const result = await testConnection();
    res.json({
      message: "Shiprocket connection successful",
      shiprocket: result
    });
  } catch (error) {
    next(error);
  }
});

router.post("/orders/:id/resend-email", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await sendOrderStatusUpdateEmail(order, "");
    await Order.findByIdAndUpdate(order._id, {
      emailStatus: "sent",
      emailSentAt: new Date(),
      emailLastError: ""
    });

    res.json({ message: "Order email sent", orderId: order._id });
  } catch (error) {
    await Order.findByIdAndUpdate(req.params.id, {
      emailStatus: "failed",
      emailLastError: error.message || "Email send failed"
    }).catch(() => {});
    next(error);
  }
});

router.patch("/orders/:id", async (req, res, next) => {
  try {
    const allowed = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];
    const update = {};
    const previousOrder = await Order.findById(req.params.id);
    if (!previousOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.body.status && allowed.includes(req.body.status)) {
      update.status = req.body.status;
    }

    if (req.body.paymentStatus && ["pending", "paid", "failed", "refunded"].includes(req.body.paymentStatus)) {
      update.paymentStatus = req.body.paymentStatus;
    }

    if (typeof req.body.courierName === "string") {
      update.courierName = req.body.courierName.trim();
    }

    if (typeof req.body.courierPhone === "string") {
      update.courierPhone = req.body.courierPhone.trim();
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

    const statusChanged = update.status && update.status !== previousOrder.status;
    const shippingChanged = update.trackingNumber || update.trackingUrl || update.courierName || update.courierPhone;
    if (statusChanged || shippingChanged) {
      sendOrderStatusUpdateEmail(order, previousOrder.status)
        .then(async () => {
          await Order.findByIdAndUpdate(order._id, {
            emailStatus: "sent",
            emailSentAt: new Date(),
            emailLastError: ""
          });
        })
        .catch(async (emailError) => {
          console.error("Order status email failed:", emailError.message);
          await Order.findByIdAndUpdate(order._id, {
            emailStatus: "failed",
            emailLastError: emailError.message || "Email send failed"
          });
        });
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
