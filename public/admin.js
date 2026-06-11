const authView = document.getElementById("authView");
const dashboardView = document.getElementById("dashboardView");
const signOutButton = document.getElementById("signOutButton");
const showAdminSignInButton = document.getElementById("showAdminSignIn");
const adminAuthPanel = document.getElementById("adminAuthPanel");
const loadAdminButton = document.getElementById("loadAdmin");
const adminStats = document.getElementById("adminStats");
const adminContent = document.getElementById("adminContent");
const tabButtons = Array.from(document.querySelectorAll("[data-view]"));

let sessionToken = sessionStorage.getItem("sessionToken") || "";
let activeView = "products";
let currentProducts = [];
let currentOrders = [];
let currentUsers = [];

const LOOKBOOK_THEMES = [
  { title: "Classic tee editorial", tag: "Campaign" },
  { title: "Streetwear drop", tag: "Street" },
  { title: "Minimal essentials", tag: "Essentials" },
  { title: "Graphic statement", tag: "Graphic" },
  { title: "Comfort fit", tag: "Relaxed" },
  { title: "Smart casual", tag: "Premium" },
  { title: "Urban fit", tag: "Urban" },
  { title: "Retail display", tag: "Store" },
  { title: "Model preview", tag: "Lookbook" },
  { title: "Neutral palette", tag: "Neutral" }
];

const LOOKBOOK_IMAGES = Array.from({ length: 120 }, (_, index) => {
  const theme = LOOKBOOK_THEMES[index % LOOKBOOK_THEMES.length];
  const num = String(index + 1).padStart(3, "0");
  return {
    src: `https://picsum.photos/seed/rpstore-gallery-${num}/800/1000`,
    title: `${theme.title}`,
    tag: theme.tag
  };
});

const TSHIRT_STYLES = [
  { title: "Oversized washed tee", tag: "Streetwear", color: "Slate" },
  { title: "Boxy fit graphic tee", tag: "Graphic", color: "Black" },
  { title: "Minimal logo tee", tag: "Essentials", color: "White" },
  { title: "Heavyweight cotton tee", tag: "Premium", color: "Stone" },
  { title: "Drop shoulder tee", tag: "Relaxed", color: "Olive" },
  { title: "Vintage print tee", tag: "Retro", color: "Cream" },
  { title: "Monochrome street tee", tag: "Urban", color: "Charcoal" },
  { title: "Crew neck staple", tag: "Core", color: "Sand" },
  { title: "Festival graphic tee", tag: "Drop", color: "Ash" },
  { title: "Everyday comfort tee", tag: "Daily", color: "Sky" },
  { title: "Relaxed fit polo tee", tag: "Smart", color: "Navy" },
  { title: "Textured loopback tee", tag: "Textured", color: "Moss" },
  { title: "Luxury blank tee", tag: "Luxury", color: "Off-white" },
  { title: "Washed black tee", tag: "Washed", color: "Black" },
  { title: "Heritage graphic tee", tag: "Heritage", color: "Burgundy" },
  { title: "Raw edge tee", tag: "Edge", color: "Graphite" },
  { title: "Contrast stitch tee", tag: "Detail", color: "Khaki" },
  { title: "Weekend essential tee", tag: "Weekend", color: "Clay" },
  { title: "Studio fit tee", tag: "Studio", color: "Pearl" },
  { title: "Soft touch tee", tag: "Soft", color: "Blue" },
  { title: "Signature logo tee", tag: "Signature", color: "Ivory" },
  { title: "Sport inspired tee", tag: "Sport", color: "Red" },
  { title: "Layering tee", tag: "Layer", color: "Smoke" },
  { title: "Relaxed heritage tee", tag: "Heritage", color: "Taupe" },
  { title: "Summer tee", tag: "Summer", color: "Mint" },
  { title: "Night mode tee", tag: "Night", color: "Midnight" },
  { title: "Weekend drop tee", tag: "Drop", color: "Teal" },
  { title: "Urban essential tee", tag: "Urban", color: "Graphite" },
  { title: "Statement print tee", tag: "Statement", color: "Plum" },
  { title: "Premium crew tee", tag: "Premium", color: "Ecru" }
];

const TSHIRT_IMAGES = TSHIRT_STYLES.map((style, index) => {
  const num = String(index + 1).padStart(2, "0");
  return {
    src: `https://picsum.photos/seed/rpstore-tee-${num}/900/1100`,
    title: style.title,
    tag: style.tag,
    color: style.color
  };
});

function headers(extraHeaders = {}) {
  return {
    "Content-Type": "application/json",
    ...(sessionToken ? { "x-session-token": sessionToken } : {}),
    ...extraHeaders
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...headers(options.headers || {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = String(item?.[key] || "Unknown");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function getTopCategory() {
  const byCategory = countBy(currentProducts, "category");
  const entries = Object.entries(byCategory);
  if (entries.length === 0) return "No products yet";
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function getDashboardInsights(kind) {
  const lowStockProducts = currentProducts.filter((product) => Number(product.stock || 0) <= 5);
  const pendingOrders = currentOrders.filter((order) => ["pending", "confirmed"].includes(order.status));
  const paidOrders = currentOrders.filter((order) => order.paymentStatus === "paid");
  const adminUsers = currentUsers.filter((user) => user.role === "admin");
  const customers = currentUsers.filter((user) => user.role !== "admin");
  const latestProduct = currentProducts[0];
  const latestCustomer = currentUsers[0];

  if (kind === "products") {
    return [
      { title: "Low stock alerts", value: `${lowStockProducts.length}`, copy: lowStockProducts.length ? `${lowStockProducts[0].title} needs attention.` : "All stocked up right now." },
      { title: "Top category", value: getTopCategory(), copy: "Most common category in your catalog." },
      { title: "Latest product", value: latestProduct ? latestProduct.title : "No products yet", copy: latestProduct ? formatMoney(latestProduct.price) : "Add a hero item to start." }
    ];
  }

  if (kind === "orders") {
    return [
      { title: "Pending orders", value: `${pendingOrders.length}`, copy: pendingOrders.length ? "A few orders need your review." : "No pending orders right now." },
      { title: "Paid orders", value: `${paidOrders.length}`, copy: "Completed orders ready for fulfillment." },
      { title: "Average vibe", value: currentOrders.length ? "Healthy" : "New store", copy: currentOrders.length ? "The store is moving steadily." : "Once orders arrive, this will light up." }
    ];
  }

  if (kind === "gallery") {
    return [
      { title: "Lookbook size", value: "100+ images", copy: "A merchandising wall for fashion inspiration." },
      { title: "T-shirt set", value: `${TSHIRT_IMAGES.length} tee shots`, copy: "Focused product visuals for the apparel showcase." },
      { title: "Source mix", value: `${LOOKBOOK_IMAGES.length} unique shots`, copy: "Curated visuals repeated across the wall." },
      { title: "Mood", value: "Premium", copy: "Soft, aspirational, and product-focused." }
    ];
  }

  return [
    { title: "Customers", value: `${customers.length}`, copy: customers.length ? "People who have signed up." : "No customers yet." },
    { title: "Admins", value: `${adminUsers.length}`, copy: "Accounts with dashboard access." },
    { title: "Latest user", value: latestCustomer ? latestCustomer.name : "No users yet", copy: latestCustomer ? latestCustomer.email : "Invite your first shopper." }
  ];
}

function renderViewIntro(kind, title, description) {
  const cards = getDashboardInsights(kind).map((item) => `
    <article class="overview-card">
      <span>${item.title}</span>
      <strong>${item.value}</strong>
      <small>${item.copy}</small>
    </article>
  `).join("");

  return `
    <section class="dashboard-overview">
      <div class="dashboard-overview-copy">
        <span class="eyebrow">Dashboard focus</span>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      <div class="overview-grid">
        ${cards}
      </div>
    </section>
  `;
}

function setActiveTab(view) {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function renderGallery() {
  const galleryItems = Array.from({ length: 108 }, (_, index) => {
    const asset = LOOKBOOK_IMAGES[index % LOOKBOOK_IMAGES.length];
    return {
      ...asset,
      index: index + 1
    };
  });

  adminContent.innerHTML = `
    ${renderViewIntro("gallery", "A 100+ image lookbook for merchandising and inspiration.", "This wall gives the dashboard a more genuine retail feel and makes the admin area feel like a real fashion workspace.")}
    <h3>T-shirt lineup</h3>
    <p class="muted admin-section-copy">A dedicated 30-image t-shirt board with sharper product-focused visuals for design review, merchandising, and catalog planning.</p>
    <div class="tee-grid">
      ${TSHIRT_IMAGES.map((item, index) => `
        <figure class="tee-card">
          <img src="${item.src}" alt="${item.title} ${index + 1}" loading="lazy" />
          <figcaption>
            <span>${item.tag}</span>
            <strong>${item.title}</strong>
            <small>${item.color} / Tee ${index + 1}</small>
          </figcaption>
        </figure>
      `).join("")}
    </div>
    <h3>Gallery</h3>
    <p class="muted admin-section-copy">A 100+ image merchandising wall to inspire product storytelling, social previews, and campaign planning.</p>
    <div class="gallery-toolbar">
      <span class="badge">30 tee shots</span>
      <span class="badge">108 images</span>
      <span class="badge">Fashion lookbook</span>
      <span class="badge">Curated visual wall</span>
    </div>
    <div class="image-wall">
      ${galleryItems.map((item) => `
        <figure class="image-tile">
          <img src="${item.src}" alt="${item.title} ${item.index}" loading="lazy" />
          <figcaption>
            <span>${item.tag}</span>
            <strong>${item.title}</strong>
            <small>Image ${item.index}</small>
          </figcaption>
        </figure>
      `).join("")}
    </div>
  `;
}

function renderAdminAuth() {
  adminAuthPanel.innerHTML = `
    <form class="stack auth-form" id="adminSigninForm">
      <div class="form-grid">
        <label>Email <input name="email" type="email" required /></label>
        <label>Password <input name="password" type="password" required /></label>
      </div>
      <button class="button primary" type="submit">Sign in</button>
      <p class="muted" id="adminAuthMessage"></p>
    </form>
  `;
  bindAdminAuthForm();
}

function showDashboard() {
  document.body.classList.add("admin-dashboard-mode");
  authView.style.display = "none";
  dashboardView.style.display = "grid";
  signOutButton.style.display = "inline-flex";
}

function showAuth() {
  document.body.classList.remove("admin-dashboard-mode");
  authView.style.display = "grid";
  dashboardView.style.display = "none";
  signOutButton.style.display = "none";
}

async function authRequest(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();
  const data = contentType.includes("application/json")
    ? JSON.parse(rawBody)
    : { message: rawBody.slice(0, 180) || "Authentication failed" };

  if (!response.ok) {
    throw new Error(data.message || "Authentication failed");
  }

  return data;
}

async function loadCurrentSession() {
  const response = await fetch("/api/auth/me", {
    credentials: "include"
  });

  const data = await response.json();
  if (!response.ok || data.account.role !== "admin") {
    throw new Error("Please sign in with an admin account");
  }

  return true;
}

function bindAdminAuthForm() {
  const adminAuthMessage = document.getElementById("adminAuthMessage");
  const adminSigninForm = document.getElementById("adminSigninForm");

  if (!adminSigninForm) {
    return;
  }

  adminSigninForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      adminAuthMessage.textContent = "Signing in...";
      const formData = new FormData(adminSigninForm);
      const data = await authRequest("/api/auth/signin", {
        email: formData.get("email"),
        password: formData.get("password")
      });
      sessionToken = data.token;
      sessionStorage.setItem("sessionToken", sessionToken);
      await loadDashboard();
    } catch (error) {
      adminAuthMessage.textContent = error.message;
    }
  });
}

async function loadDashboard() {
  try {
    document.body.classList.add("admin-loading");
    const allowed = await loadCurrentSession();
    if (!allowed) {
      showAuth();
      renderAdminAuth();
      document.body.classList.remove("admin-loading");
      return;
    }

    const summary = await fetchJson("/api/admin/summary");
    renderStats(summary.counts);

    const products = await fetchJson("/api/admin/products");
    currentProducts = products.products;

    const orders = await fetchJson("/api/admin/orders");
    currentOrders = orders.orders;

    const users = await fetchJson("/api/admin/users");
    currentUsers = users.users;

    showDashboard();
    setActiveTab(activeView);
    if (activeView === "products") renderProducts();
    if (activeView === "orders") renderOrders();
    if (activeView === "users") renderUsers();
    if (activeView === "gallery") renderGallery();
    document.body.classList.remove("admin-loading");
  } catch (error) {
    showAuth();
    renderAdminAuth();
    const adminAuthMessage = document.getElementById("adminAuthMessage");
    if (adminAuthMessage) {
      adminAuthMessage.textContent = error.message;
    }
    document.body.classList.remove("admin-loading");
  }
}

function renderStats(counts) {
  adminStats.innerHTML = `
    <div class="stat admin-stat"><strong>${counts.products}</strong><span class="muted">Products</span><small>Live catalog items</small></div>
    <div class="stat admin-stat"><strong>${counts.users}</strong><span class="muted">Users</span><small>Customer accounts</small></div>
    <div class="stat admin-stat"><strong>${counts.orders}</strong><span class="muted">Orders</span><small>All order records</small></div>
    <div class="stat admin-stat"><strong>${counts.paidOrders}</strong><span class="muted">Paid</span><small>Completed payments</small></div>
  `;
}

function renderProducts() {
  adminContent.innerHTML = `
    ${renderViewIntro("products", "Products that feel merchandised, not generic.", "Use the editor to keep the catalog premium: update pricing, stock, imagery, and product copy without breaking the storefront feel.")}
    <h3>Products</h3>
    <p class="muted admin-section-copy">Edit titles, prices, stock, images, and descriptions. These updates affect the live storefront immediately.</p>
    <form class="stack panel hero-copy admin-form-card" id="productForm">
      <div class="form-grid">
        <label>Title <input name="title" required /></label>
        <label>Slug <input name="slug" /></label>
        <label>Price <input name="price" type="number" required /></label>
        <label>Compare at price <input name="compareAtPrice" type="number" /></label>
        <label>Image URL <input name="image" /></label>
        <label>Stock <input name="stock" type="number" /></label>
      </div>
      <label>Description <textarea name="description"></textarea></label>
      <button class="button primary" type="submit">Save product</button>
      <input type="hidden" name="productId" />
    </form>
    <div style="overflow:auto; margin-top:18px;">
      <table class="admin-table" id="productsTable"></table>
    </div>
  `;

  bindProductForm();
  const table = document.getElementById("productsTable");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Product</th>
        <th>Price</th>
        <th>Stock</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${currentProducts.map((product) => `
        <tr>
          <td>
            <div class="table-product">
              <img class="table-thumb" src="${product.image || "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=600&q=80"}" alt="${product.title}" />
              <div>
                <strong>${product.title}</strong><br />
                <span class="muted">${product.slug}</span><br />
                <span class="badge">${product.category || "General"}</span>
              </div>
            </div>
          </td>
          <td>${formatMoney(product.price)}</td>
          <td><span class="badge">${product.stock}</span></td>
          <td>
            <div class="table-actions">
              <button class="button secondary" data-edit-product="${product._id}">Edit</button>
              <button class="button secondary" data-delete-product="${product._id}">Delete</button>
            </div>
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;

  table.querySelectorAll("[data-edit-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = currentProducts.find((item) => item._id === button.dataset.editProduct);
      if (!product) return;
      const form = document.getElementById("productForm");
      form.title.value = product.title;
      form.slug.value = product.slug;
      form.price.value = product.price;
      form.compareAtPrice.value = product.compareAtPrice || "";
      form.image.value = product.image || "";
      form.stock.value = product.stock || 0;
      form.description.value = product.description || "";
      form.productId.value = product._id;
    });
  });

  table.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", async () => {
      await fetchJson(`/api/admin/products/${button.dataset.deleteProduct}`, {
        method: "DELETE"
      });
      await loadDashboard();
    });
  });
}

function renderOrders() {
  adminContent.innerHTML = `
    ${renderViewIntro("orders", "Orders that are easy to scan at a glance.", "See what is pending, what is paid, and what is ready to ship. The focus is speed and clarity.")}
    <h3>Orders</h3>
    <p class="muted admin-section-copy">Track order progress and payment state. Keep the latest orders at the top for quick review.</p>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Total</th>
          <th>Delivery</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Update</th>
        </tr>
      </thead>
      <tbody>
        ${currentOrders.map((order) => `
          <tr>
            <td>
              <strong>${order.customerName}</strong><br />
              <span class="muted">${order.customerEmail}</span>
              <br />
              <span class="badge">${Array.isArray(order.items) ? `${order.items.length} item${order.items.length === 1 ? "" : "s"}` : "Order"}</span>
            </td>
            <td>${formatMoney(order.totalAmount)}</td>
            <td>
              <div class="user-edit-stack">
                <span class="badge">${order.deliveryMethod || "standard"}</span>
                <small class="muted">${order.courierName || "Courier not set"}</small>
                <small class="muted">${order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Tracking not set"}</small>
                <small class="muted">${order.estimatedDeliveryDate ? `ETA: ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}` : "ETA not set"}</small>
              </div>
            </td>
            <td><span class="badge">${order.status}</span></td>
            <td><span class="badge">${order.paymentStatus}</span></td>
            <td>
              <div class="user-edit-stack">
                <select data-order-status="${order._id}">
                  ${["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"].map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
                <select data-order-delivery="${order._id}">
                  ${["standard", "express", "priority"].map((method) => `<option value="${method}" ${method === (order.deliveryMethod || "standard") ? "selected" : ""}>${method}</option>`).join("")}
                </select>
                <input data-order-courier="${order._id}" placeholder="Courier name" value="${order.courierName || ""}" />
                <input data-order-tracking="${order._id}" placeholder="Tracking number" value="${order.trackingNumber || ""}" />
                <input data-order-trackurl="${order._id}" placeholder="Tracking URL" value="${order.trackingUrl || ""}" />
                <input data-order-eta="${order._id}" type="date" value="${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().slice(0, 10) : ""}" />
                <button class="button secondary" data-save-order="${order._id}">Save</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.querySelectorAll("[data-save-order]").forEach((button) => {
    button.addEventListener("click", async () => {
      const orderId = button.dataset.saveOrder;
      const statusSelect = document.querySelector(`[data-order-status="${orderId}"]`);
      const deliverySelect = document.querySelector(`[data-order-delivery="${orderId}"]`);
      const courierInput = document.querySelector(`[data-order-courier="${orderId}"]`);
      const trackingInput = document.querySelector(`[data-order-tracking="${orderId}"]`);
      const trackingUrlInput = document.querySelector(`[data-order-trackurl="${orderId}"]`);
      const etaInput = document.querySelector(`[data-order-eta="${orderId}"]`);
      await fetchJson(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusSelect.value,
          deliveryMethod: deliverySelect.value,
          courierName: courierInput.value,
          trackingNumber: trackingInput.value,
          trackingUrl: trackingUrlInput.value,
          estimatedDeliveryDate: etaInput.value
        })
      });
      await loadDashboard();
    });
  });
}

function renderUsers() {
  adminContent.innerHTML = `
    ${renderViewIntro("users", "People behind the store.", "Keep customer accounts, phone numbers, and admin roles organized from one polished view.")}
    <h3>Users</h3>
    <p class="muted admin-section-copy">Update roles and user details without leaving the dashboard.</p>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Update</th>
        </tr>
      </thead>
      <tbody>
        ${currentUsers.map((user) => `
          <tr>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${user.phone || "-"}</td>
            <td><span class="badge">${user.role}</span></td>
            <td>
              <div class="user-edit-stack">
                <input data-user-name="${user._id}" value="${user.name}" />
                <input data-user-phone="${user._id}" value="${user.phone || ""}" />
                <select data-user-role="${user._id}">
                ${["customer", "admin"].map((role) => `<option value="${role}" ${role === user.role ? "selected" : ""}>${role}</option>`).join("")}
                </select>
                <button class="button secondary" data-save-user="${user._id}">Save</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  document.querySelectorAll("[data-save-user]").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.saveUser;
      const name = document.querySelector(`[data-user-name="${userId}"]`).value;
      const phone = document.querySelector(`[data-user-phone="${userId}"]`).value;
      const role = document.querySelector(`[data-user-role="${userId}"]`).value;
      await fetchJson(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ name, phone, role })
      });
      await loadDashboard();
    });
  });
}

function bindProductForm() {
  const form = document.getElementById("productForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      compareAtPrice: Number(formData.get("compareAtPrice") || 0),
      image: formData.get("image"),
      stock: Number(formData.get("stock") || 0)
    };

    const productId = formData.get("productId");
    if (productId) {
      await fetchJson(`/api/admin/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await fetchJson("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    form.reset();
    await loadDashboard();
  });
}

showAdminSignInButton.addEventListener("click", () => {
  renderAdminAuth();
});

loadAdminButton.addEventListener("click", async () => {
  await loadDashboard();
});

signOutButton.addEventListener("click", async () => {
  await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  });

  sessionToken = "";
  sessionStorage.removeItem("sessionToken");
  showAuth();
  renderAdminAuth();
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    setActiveTab(activeView);
    if (activeView === "products") renderProducts();
    if (activeView === "orders") renderOrders();
    if (activeView === "users") renderUsers();
    if (activeView === "gallery") renderGallery();
  });
});

renderAdminAuth();
loadDashboard().catch(() => {
  showAuth();
  renderAdminAuth();
});
