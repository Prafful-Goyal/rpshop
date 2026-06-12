const trackForm = document.getElementById("trackForm");
const trackMessage = document.getElementById("trackMessage");
const trackResult = document.getElementById("trackResult");

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTimeline(timeline = []) {
  return `
    <div class="track-timeline">
      ${timeline.map((step) => `
        <div class="track-step ${step.done ? "is-done" : ""}">
          <span></span>
          <div>
            <strong>${escapeHtml(step.label)}</strong>
            <small>${step.done ? "Completed" : "Upcoming"}</small>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTracking(order) {
  return `
    <div class="tracking-card">
      <div class="tracking-head">
        <div>
          <span class="eyebrow">Current status</span>
          <h3>${escapeHtml(order.status)}</h3>
          <p class="muted">Order ID: ${escapeHtml(order.orderId)}</p>
        </div>
        <span class="badge">${escapeHtml(order.paymentStatus)}</span>
      </div>
      ${renderTimeline(order.timeline)}
      <div class="tracking-grid">
        <div><span class="muted">Tracking number</span><strong>${escapeHtml(order.trackingNumber || "Pending")}</strong></div>
        <div><span class="muted">Courier</span><strong>${escapeHtml(order.courierName || "Pending")}</strong></div>
        <div><span class="muted">Delivery agent number</span><strong>${escapeHtml(order.courierPhone || "Pending")}</strong></div>
        <div><span class="muted">ETA</span><strong>${escapeHtml(formatDate(order.estimatedDeliveryDate))}</strong></div>
      </div>
      <div class="tracking-grid">
        <div><span class="muted">Delivery notes</span><strong>${escapeHtml(order.deliveryNotes || "None")}</strong></div>
        <div><span class="muted">Tracking URL</span><strong>${order.trackingUrl ? `<a href="${escapeHtml(order.trackingUrl)}" target="_blank" rel="noreferrer">Open tracking</a>` : "Pending"}</strong></div>
      </div>
    </div>
  `;
}

async function fetchJson(url) {
  const response = await fetch(url, { credentials: "include" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Unable to load tracking details");
  }
  return data;
}

async function loadTracking(orderId, email) {
  trackMessage.textContent = "Loading tracking details...";
  const data = await fetchJson(`/api/store/orders/${encodeURIComponent(orderId)}/track?email=${encodeURIComponent(email)}`);
  trackResult.innerHTML = renderTracking(data.order);
  trackMessage.textContent = "Tracking loaded successfully.";
}

if (trackForm) {
  const params = new URLSearchParams(window.location.search);
  const orderIdInput = trackForm.querySelector('[name="orderId"]');
  const emailInput = trackForm.querySelector('[name="email"]');

  if (params.get("order")) {
    orderIdInput.value = params.get("order");
  }

  if (params.get("email")) {
    emailInput.value = params.get("email");
  }

  trackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(trackForm);
    try {
      await loadTracking(formData.get("orderId"), formData.get("email"));
    } catch (error) {
      trackMessage.textContent = error.message;
      trackResult.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  });

  if (orderIdInput.value && emailInput.value) {
    loadTracking(orderIdInput.value, emailInput.value).catch((error) => {
      trackMessage.textContent = error.message;
    });
  }
}
