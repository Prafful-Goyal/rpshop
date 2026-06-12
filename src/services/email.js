const nodemailer = require("nodemailer");

function getEmailConfig() {
  const port = Number(process.env.SMTP_PORT || 587);
  return {
    enabled: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    host: process.env.SMTP_HOST || "",
    port: Number.isFinite(port) ? port : 587,
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "RPStore <no-reply@rpstore.in>",
    supportEmail: process.env.SUPPORT_EMAIL || "support@rpstore.in",
    publicSiteUrl: process.env.PUBLIC_SITE_URL || "https://rpshop.onrender.com"
  };
}

function isEmailEnabled() {
  const config = getEmailConfig();
  return config.enabled;
}

function createTransporter() {
  const config = getEmailConfig();
  if (!config.enabled) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(amount = 0) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount || 0));
}

function getTimeline(order) {
  const steps = [
    { key: "confirmed", label: "Order received" },
    { key: "packed", label: "Order ready" },
    { key: "shipped", label: "Dispatched" },
    { key: "delivered", label: "Delivered" }
  ];

  const currentIndex = steps.findIndex((step) => step.key === order.status);
  return steps.map((step, index) => ({
    ...step,
    done: currentIndex >= index
  }));
}

function renderTimeline(order) {
  return getTimeline(order).map((step) => `
    <tr>
      <td style="padding:10px 0;color:${step.done ? "#111827" : "#6b7280"};font-weight:${step.done ? "700" : "500"};">${escapeHtml(step.label)}</td>
      <td style="padding:10px 0;color:${step.done ? "#16a34a" : "#9ca3af"};text-align:right;">${step.done ? "Completed" : "Upcoming"}</td>
    </tr>
  `).join("");
}

function getTrackingLink(order) {
  const config = getEmailConfig();
  const id = encodeURIComponent(String(order._id));
  const email = encodeURIComponent(String(order.customerEmail || ""));
  return `${config.publicSiteUrl}/track-order?order=${id}&email=${email}`;
}

function renderOrderEmail({ order, title, intro, statusLabel, previousStatus }) {
  const config = getEmailConfig();
  const items = Array.isArray(order.items) ? order.items : [];
  const trackingLink = getTrackingLink(order);
  const shippedOn = order.shippedAt ? new Date(order.shippedAt).toLocaleString("en-IN") : "";
  const deliveredOn = order.deliveredAt ? new Date(order.deliveredAt).toLocaleString("en-IN") : "";
  const eta = order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN") : "To be updated";
  const deliveryAgentLine = order.courierName ? `${order.courierName}${order.courierPhone ? ` • ${order.courierPhone}` : ""}` : "Will be updated when dispatched";
  const trackingLine = order.trackingNumber ? order.trackingNumber : "Tracking number pending";

  return {
    subject: `RPStore - ${title}`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8f5ef;padding:24px;color:#111827;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid rgba(17,24,39,0.08);box-shadow:0 18px 48px rgba(17,24,39,0.08);">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#111827,#cf5b2e);color:#fff;">
            <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;opacity:.82;">RPStore</div>
            <h1 style="margin:10px 0 6px;font-size:30px;line-height:1.1;">${escapeHtml(title)}</h1>
            <p style="margin:0;font-size:16px;line-height:1.6;opacity:.95;">${escapeHtml(intro)}</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">Hi ${escapeHtml(order.customerName)},</p>
            <p style="font-size:16px;line-height:1.7;margin:0 0 24px;">${escapeHtml(statusLabel)}${previousStatus ? ` Your order moved from ${escapeHtml(previousStatus)} to ${escapeHtml(order.status)}.` : ""}</p>

            <div style="border:1px solid rgba(17,24,39,0.08);border-radius:18px;padding:18px 20px;margin-bottom:22px;background:#fbfaf7;">
              <div style="display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">Order ID</div>
                  <div style="font-weight:700;">${escapeHtml(order._id)}</div>
                </div>
                <div>
                  <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">Status</div>
                  <div style="font-weight:700;">${escapeHtml(order.status)}</div>
                </div>
                <div>
                  <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">ETA</div>
                  <div style="font-weight:700;">${escapeHtml(eta)}</div>
                </div>
              </div>
            </div>

            <table style="width:100%;border-collapse:collapse;margin:10px 0 24px;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Total</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(formatMoney(order.totalAmount))}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Tracking number</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(trackingLine)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Delivery agent</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(deliveryAgentLine)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;">Support</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(config.supportEmail)}</td>
              </tr>
            </table>

            <div style="border-top:1px solid rgba(17,24,39,0.08);padding-top:20px;">
              <h2 style="margin:0 0 14px;font-size:18px;">Delivery progress</h2>
              <table style="width:100%;border-collapse:collapse;">
                ${renderTimeline(order)}
              </table>
              <p style="margin:16px 0 0;color:#6b7280;line-height:1.6;">Shipped on: ${escapeHtml(shippedOn || "Not shipped yet")}<br />Delivered on: ${escapeHtml(deliveredOn || "Not delivered yet")}</p>
            </div>

            <div style="margin-top:26px;">
              <a href="${trackingLink}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#111827;color:#fff;text-decoration:none;font-weight:700;">Track your order</a>
            </div>

            <p style="margin:26px 0 0;color:#6b7280;line-height:1.6;font-size:14px;">If you need help, reply to this email or contact ${escapeHtml(config.supportEmail)}.</p>
          </div>
        </div>
      </div>
    `
  };
}

async function sendMail({ to, subject, html, text }) {
  const transporter = createTransporter();
  if (!transporter) {
    return { skipped: true };
  }

  await transporter.sendMail({
    from: getEmailConfig().from,
    to,
    subject,
    html,
    text
  });

  return { sent: true };
}

async function sendOrderReceivedEmail(order) {
  const content = renderOrderEmail({
    order,
    title: "Your order is received",
    intro: "Thanks for your purchase. We’ve received your order and it is now in processing.",
    statusLabel: "Your order has been received successfully."
  });

  return sendMail({
    to: order.customerEmail,
    subject: content.subject,
    html: content.html,
    text: `Your order ${order._id} has been received. Track it here: ${getTrackingLink(order)}`
  });
}

async function sendOrderStatusUpdateEmail(order, previousStatus = "") {
  const statusMap = {
    packed: {
      title: "Your order is ready",
      intro: "Good news. Your order has been packed and is ready for the next step.",
      statusLabel: "Your order is ready for dispatch."
    },
    shipped: {
      title: "Your order is dispatched",
      intro: "Your parcel has left our hands and is on the way to you.",
      statusLabel: "Your order is now dispatched."
    },
    delivered: {
      title: "Your order is delivered",
      intro: "Your order has been delivered. We hope you love it.",
      statusLabel: "Your order has been delivered."
    },
    confirmed: {
      title: "Your order is confirmed",
      intro: "We’ve confirmed the payment and your order is moving ahead in the queue.",
      statusLabel: "Your order is confirmed."
    }
  };

  const config = statusMap[order.status] || {
    title: "Order update",
    intro: "We have an update for your order.",
    statusLabel: `Your order status changed to ${order.status}.`
  };

  const content = renderOrderEmail({
    order,
    ...config,
    previousStatus
  });

  return sendMail({
    to: order.customerEmail,
    subject: content.subject,
    html: content.html,
    text: `${config.title}. Track it here: ${getTrackingLink(order)}`
  });
}

function buildTrackingSnapshot(order) {
  const steps = [
    { key: "confirmed", label: "Order received" },
    { key: "packed", label: "Order ready" },
    { key: "shipped", label: "Dispatched" },
    { key: "delivered", label: "Delivered" }
  ];
  const currentIndex = steps.findIndex((step) => step.key === order.status);

  return {
    orderId: order._id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber || order.shiprocketAwb || "",
    trackingUrl: order.trackingUrl || "",
    courierName: order.courierName || order.shiprocketCourierName || "",
    courierPhone: order.courierPhone || "",
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    deliveryNotes: order.deliveryNotes || "",
    items: order.items || [],
    timeline: steps.map((step, index) => ({
      ...step,
      done: currentIndex >= index
    }))
  };
}

module.exports = {
  isEmailEnabled,
  sendOrderReceivedEmail,
  sendOrderStatusUpdateEmail,
  buildTrackingSnapshot
};
