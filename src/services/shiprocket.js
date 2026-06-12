const DEFAULT_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const DEFAULT_AUTH_ENDPOINT = "/auth/login";
const DEFAULT_ORDER_ENDPOINT = "/orders/create/adhoc";

let cachedToken = "";
let cachedTokenExpiresAt = 0;

function getConfig() {
  const baseUrl = (process.env.SHIPROCKET_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return {
    enabled: String(process.env.SHIPROCKET_ENABLED || "false").toLowerCase() !== "false",
    baseUrl,
    authEndpoint: process.env.SHIPROCKET_AUTH_ENDPOINT || DEFAULT_AUTH_ENDPOINT,
    orderEndpoint: process.env.SHIPROCKET_ORDER_ENDPOINT || DEFAULT_ORDER_ENDPOINT,
    email: process.env.SHIPROCKET_EMAIL || "",
    password: process.env.SHIPROCKET_PASSWORD || "",
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    packageLength: Number(process.env.SHIPROCKET_PACKAGE_LENGTH || 10),
    packageBreadth: Number(process.env.SHIPROCKET_PACKAGE_BREADTH || 10),
    packageHeight: Number(process.env.SHIPROCKET_PACKAGE_HEIGHT || 2),
    packageWeight: Number(process.env.SHIPROCKET_PACKAGE_WEIGHT || 0.3),
    fallbackPhone: process.env.SHIPROCKET_FALLBACK_PHONE || "9999999999"
  };
}

function isEnabled() {
  const config = getConfig();
  return config.enabled && Boolean(config.email) && Boolean(config.password);
}

function getMissingConfigFields() {
  const config = getConfig();
  const missing = [];
  if (!config.enabled) missing.push("SHIPROCKET_ENABLED");
  if (!config.email) missing.push("SHIPROCKET_EMAIL");
  if (!config.password) missing.push("SHIPROCKET_PASSWORD");
  return missing;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const error = new Error(data.message || data.msg || data.error || `Shiprocket request failed (${response.status})`);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function login() {
  const config = getConfig();
  if (!config.email || !config.password) {
    const error = new Error("Shiprocket credentials are not configured");
    error.status = 503;
    throw error;
  }

  const data = await requestJson(`${config.baseUrl}${config.authEndpoint}`, {
    method: "POST",
    body: JSON.stringify({
      email: config.email,
      password: config.password
    })
  });

  const token = data.token || data.data?.token || data.access_token || data.data?.access_token;
  if (!token) {
    const error = new Error("Shiprocket auth response did not include a token");
    error.status = 502;
    error.details = data;
    throw error;
  }

  cachedToken = token;
  cachedTokenExpiresAt = Date.now() + 50 * 60 * 1000;
  return token;
}

async function getAccessToken({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedToken && cachedTokenExpiresAt > Date.now()) {
    return cachedToken;
  }

  return login();
}

function pickAddressLine(order) {
  const address = order.shippingAddress || {};
  return [address.line1, address.line2].filter(Boolean).join(", ").trim() || order.customerName || "Address not provided";
}

function buildOrderItems(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  if (items.length === 0) {
    return [
      {
        name: order.customerName || "T-shirt order",
        sku: String(order._id),
        units: 1,
        selling_price: Math.max(1, Number(order.totalAmount || order.subtotal || 1)),
        discount: 0,
        tax: 0,
        hsn: "6109"
      }
    ];
  }

  return items.map((item, index) => ({
    name: item.title || `Item ${index + 1}`,
    sku: item.slug || String(item.productId || `item-${index + 1}`),
    units: Math.max(1, Number(item.quantity || 1)),
    selling_price: Math.max(1, Number(item.price || 1)),
    discount: 0,
    tax: 0,
    hsn: "6109"
  }));
}

function buildCreateOrderPayload(order) {
  const address = order.shippingAddress || {};
  const config = getConfig();
  const postalCode = String(address.postalCode || "").trim() || "000000";

  return {
    order_id: String(order._id),
    order_date: order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 19).replace("T", " ") : new Date().toISOString().slice(0, 19).replace("T", " "),
    pickup_location: config.pickupLocation,
    billing_customer_name: order.customerName || "Customer",
    billing_last_name: "",
    billing_address: pickAddressLine(order),
    billing_address_2: address.line2 || "",
    billing_city: address.city || "City",
    billing_pincode: postalCode,
    billing_state: address.state || "State",
    billing_country: address.country || "India",
    billing_email: order.customerEmail || "customer@example.com",
    billing_phone: order.customerPhone || config.fallbackPhone,
    shipping_is_billing: true,
    order_items: buildOrderItems(order),
    payment_method: "Prepaid",
    sub_total: Math.max(1, Number(order.subtotal || order.totalAmount || 1)),
    length: config.packageLength,
    breadth: config.packageBreadth,
    height: config.packageHeight,
    weight: config.packageWeight
  };
}

function normalizeShipmentResponse(response) {
  return {
    shiprocketOrderId: String(response.order_id || response.orderId || response.id || ""),
    shiprocketShipmentId: String(response.shipment_id || response.shipmentId || response.data?.shipment_id || response.data?.id || ""),
    shiprocketAwb: String(response.awb_code || response.awb || response.awb_number || response.data?.awb_code || ""),
    shiprocketCourierName: String(response.courier_name || response.data?.courier_name || response.courier_company_name || response.data?.courier_company_name || ""),
    shiprocketTrackingUrl: String(response.tracking_url || response.data?.tracking_url || ""),
    raw: response
  };
}

async function createShipmentForOrder(order) {
  if (!isEnabled()) {
    const error = new Error("Shiprocket is not configured yet");
    error.status = 503;
    throw error;
  }

  const config = getConfig();
  const token = await getAccessToken();
  const payload = buildCreateOrderPayload(order);
  const response = await requestJson(`${config.baseUrl}${config.orderEndpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return normalizeShipmentResponse(response);
}

async function syncShipmentToOrder(order, { throwOnError = false } = {}) {
  try {
    const shipment = await createShipmentForOrder(order);
    order.shiprocketStatus = "synced";
    order.shiprocketOrderId = shipment.shiprocketOrderId || order.shiprocketOrderId || "";
    order.shiprocketShipmentId = shipment.shiprocketShipmentId || order.shiprocketShipmentId || "";
    order.shiprocketAwb = shipment.shiprocketAwb || order.shiprocketAwb || "";
    order.shiprocketCourierName = shipment.shiprocketCourierName || order.shiprocketCourierName || "";
    order.shiprocketSyncedAt = new Date();
    order.shiprocketError = "";
    if (shipment.shiprocketAwb && !order.trackingNumber) {
      order.trackingNumber = shipment.shiprocketAwb;
    }
    if (shipment.shiprocketTrackingUrl && !order.trackingUrl) {
      order.trackingUrl = shipment.shiprocketTrackingUrl;
    }
    if (!order.courierName && shipment.shiprocketCourierName) {
      order.courierName = shipment.shiprocketCourierName;
    }
    if (!order.shippedAt && order.status === "shipped") {
      order.shippedAt = new Date();
    }
    await order.save();
    return { shipment, order };
  } catch (error) {
    if (throwOnError) {
      throw error;
    }

    order.shiprocketStatus = "failed";
    order.shiprocketError = error.message || "Shiprocket sync failed";
    order.shiprocketSyncedAt = new Date();
    await order.save().catch(() => {});
    return { error };
  }
}

async function testConnection() {
  if (!isEnabled()) {
    const missing = getMissingConfigFields();
    const error = new Error(
      missing.length
        ? `Shiprocket is not configured yet. Missing: ${missing.join(", ")}`
        : "Shiprocket is not configured yet"
    );
    error.status = 503;
    error.details = { missing };
    throw error;
  }

  const config = getConfig();
  await getAccessToken({ forceRefresh: true });

  return {
    enabled: true,
    email: config.email,
    pickupLocation: config.pickupLocation,
    baseUrl: config.baseUrl
  };
}

module.exports = {
  isEnabled,
  createShipmentForOrder,
  syncShipmentToOrder,
  testConnection
};
