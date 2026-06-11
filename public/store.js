const productGrid = document.getElementById("productGrid");
const styleWall = document.getElementById("styleWall");
const checkoutMessage = document.getElementById("checkoutMessage");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutPreview = document.getElementById("checkoutPreview");
const deliveryMethodSelect = document.getElementById("deliveryMethod");
const deliveryNote = document.getElementById("deliveryNote");
const searchInput = document.getElementById("searchInput");
const clearFilters = document.getElementById("clearFilters");
const categoryFilters = document.getElementById("categoryFilters");
const cartPreview = document.getElementById("cartPreview");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const productCount = document.getElementById("productCount");
const pagination = document.getElementById("pagination");
const catalogMessage = document.getElementById("catalogMessage");
const signOutButton = document.getElementById("signOutButton");
const cartNavLink = document.getElementById("cartNavLink");
const checkoutNavLink = document.getElementById("checkoutNavLink");
const productModal = document.getElementById("productModal");
const productStage = document.getElementById("productStage");
const productStageTint = document.getElementById("productStageTint");
const productModalImage = document.getElementById("productModalImage");
const productModalBadge = document.getElementById("productModalBadge");
const productModalBrand = document.getElementById("productModalBrand");
const productModalTitle = document.getElementById("productModalTitle");
const productModalDescription = document.getElementById("productModalDescription");
const productModalPrice = document.getElementById("productModalPrice");
const productModalRating = document.getElementById("productModalRating");
const productModalCategory = document.getElementById("productModalCategory");
const productModalColorName = document.getElementById("productModalColorName");
const productModalSizeName = document.getElementById("productModalSizeName");
const productModalColors = document.getElementById("productModalColors");
const productModalSizes = document.getElementById("productModalSizes");
const productRotate = document.getElementById("productRotate");
const productZoomToggle = document.getElementById("productZoomToggle");
const productResetView = document.getElementById("productResetView");
const productPreviewStrip = document.getElementById("productPreviewStrip");
const modalAddToCart = document.getElementById("modalAddToCart");
const modalBuyNow = document.getElementById("modalBuyNow");

const COLOR_THEMES = {
  Black: { bg: "#151515", tint: "rgba(0,0,0,0.18)", hue: "0deg", saturation: "1.08", brightness: "0.92", label: "Black" },
  White: { bg: "#f4efe8", tint: "rgba(255,255,255,0.24)", hue: "0deg", saturation: "0.88", brightness: "1.12", label: "White" },
  Grey: { bg: "#b8bcc4", tint: "rgba(255,255,255,0.16)", hue: "0deg", saturation: "0.96", brightness: "1" , label: "Grey" },
  Navy: { bg: "#16233f", tint: "rgba(78,110,255,0.18)", hue: "200deg", saturation: "1.05", brightness: "0.92", label: "Navy" },
  Olive: { bg: "#5a6339", tint: "rgba(142,176,90,0.18)", hue: "56deg", saturation: "1.02", brightness: "0.98", label: "Olive" },
  Sand: { bg: "#d9c1a0", tint: "rgba(255,213,160,0.26)", hue: "26deg", saturation: "0.94", brightness: "1.05", label: "Sand" },
  Stone: { bg: "#b9b0a4", tint: "rgba(255,244,220,0.18)", hue: "18deg", saturation: "0.92", brightness: "1.02", label: "Stone" },
  Beige: { bg: "#d8c8b0", tint: "rgba(255,230,196,0.20)", hue: "30deg", saturation: "0.92", brightness: "1.04", label: "Beige" },
  Charcoal: { bg: "#37373d", tint: "rgba(255,255,255,0.12)", hue: "0deg", saturation: "0.98", brightness: "0.96", label: "Charcoal" },
  OffWhite: { bg: "#f3ede4", tint: "rgba(255,255,255,0.26)", hue: "0deg", saturation: "0.86", brightness: "1.08", label: "Off White" },
  Ecru: { bg: "#efe4cf", tint: "rgba(255,245,221,0.22)", hue: "22deg", saturation: "0.88", brightness: "1.05", label: "Ecru" },
  Rust: { bg: "#b65a33", tint: "rgba(255,173,110,0.18)", hue: "340deg", saturation: "1.02", brightness: "0.95", label: "Rust" },
  Indigo: { bg: "#36438b", tint: "rgba(120,142,255,0.20)", hue: "216deg", saturation: "1.08", brightness: "0.96", label: "Indigo" },
  Blue: { bg: "#4c6ddf", tint: "rgba(115,145,255,0.18)", hue: "202deg", saturation: "1.08", brightness: "1", label: "Blue" },
  Sky: { bg: "#7bb9ff", tint: "rgba(180,223,255,0.20)", hue: "190deg", saturation: "1.02", brightness: "1.05", label: "Sky" },
  Cream: { bg: "#f0e7d3", tint: "rgba(255,246,223,0.22)", hue: "18deg", saturation: "0.90", brightness: "1.08", label: "Cream" },
  Maroon: { bg: "#7f2434", tint: "rgba(190,84,103,0.18)", hue: "350deg", saturation: "1.04", brightness: "0.94", label: "Maroon" },
  BottleGreen: { bg: "#254b3c", tint: "rgba(97,163,132,0.18)", hue: "146deg", saturation: "1.02", brightness: "0.95", label: "Bottle Green" },
  "Bottle Green": { bg: "#254b3c", tint: "rgba(97,163,132,0.18)", hue: "146deg", saturation: "1.02", brightness: "0.95", label: "Bottle Green" },
  "Faded Black": { bg: "#2b2b2f", tint: "rgba(255,255,255,0.10)", hue: "0deg", saturation: "0.94", brightness: "0.88", label: "Faded Black" },
  Coal: { bg: "#202124", tint: "rgba(255,255,255,0.08)", hue: "0deg", saturation: "0.96", brightness: "0.9", label: "Coal" },
  FadedBlack: { bg: "#2b2b2f", tint: "rgba(255,255,255,0.10)", hue: "0deg", saturation: "0.94", brightness: "0.88", label: "Faded Black" },
  Stone: { bg: "#b9b0a4", tint: "rgba(255,244,220,0.18)", hue: "18deg", saturation: "0.92", brightness: "1.02", label: "Stone" },
  Sage: { bg: "#b2c3a1", tint: "rgba(208,229,189,0.2)", hue: "100deg", saturation: "0.96", brightness: "1.03", label: "Sage" },
  Ink: { bg: "#25304a", tint: "rgba(112,139,210,0.16)", hue: "222deg", saturation: "1.02", brightness: "0.92", label: "Ink" },
  OliveDrab: { bg: "#68753a", tint: "rgba(160,183,104,0.18)", hue: "68deg", saturation: "1.02", brightness: "1", label: "Olive Drab" }
};

let activeProduct = null;
let activeProductColor = "";
let activeProductSize = "";
let activeProductRotate = 0;
let activeProductZoom = false;
let activeProductDrag = null;

const VIEW_FRAMES = [
  { label: "Front", rotate: 0 },
  { label: "Left", rotate: -12 },
  { label: "Three-quarter", rotate: -6 },
  { label: "Right", rotate: 12 },
  { label: "Back", rotate: 18 }
];

const SHIPPING_OPTIONS = {
  standard: { label: "Standard delivery", days: "4 to 6 days", fee: 79 },
  express: { label: "Express delivery", days: "2 to 3 days", fee: 149 },
  priority: { label: "Priority delivery", days: "1 to 2 days", fee: 249 }
};

const DEMO_PRODUCTS = [
  {
    _id: "demo-classic-logo-tee",
    title: "Classic Logo Tee",
    brand: "Threadline",
    category: "Basics",
    rating: 4.6,
    badge: "Best Seller",
    description: "Soft cotton tee with a clean front logo.",
    price: 799,
    compareAtPrice: 999,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Black", "White", "Olive"]
  },
  {
    _id: "demo-oversized-street-tee",
    title: "Oversized Street Tee",
    brand: "StreetVault",
    category: "Streetwear",
    rating: 4.7,
    badge: "Trending",
    description: "Relaxed oversized fit for a bold streetwear look.",
    price: 999,
    compareAtPrice: 1299,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["M", "L", "XL", "XXL"],
    colorOptions: ["Charcoal", "Sand", "Stone"]
  },
  {
    _id: "demo-minimal-crew-neck",
    title: "Minimal Crew Neck",
    brand: "Urban Loom",
    category: "Essentials",
    rating: 4.5,
    badge: "Fresh Drop",
    description: "Clean premium tee made for everyday layering.",
    price: 699,
    compareAtPrice: 899,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["White", "Navy", "Grey"]
  },
  {
    _id: "demo-typography-statement-tee",
    title: "Typography Statement Tee",
    brand: "Bold Studio",
    category: "Graphic",
    rating: 4.8,
    badge: "Limited",
    description: "Heavy cotton tee with premium print detailing.",
    price: 1099,
    compareAtPrice: 1499,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Black", "Off White"]
  },
  {
    _id: "demo-weekend-comfort-tee",
    title: "Weekend Comfort Tee",
    brand: "Threadline",
    category: "Relaxed",
    rating: 4.2,
    badge: "Comfort Fit",
    description: "Easy drape and ultra-soft hand feel for weekends.",
    price: 749,
    compareAtPrice: 999,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Beige", "Black", "Olive"]
  },
  {
    _id: "demo-premium-polo-tee",
    title: "Premium Polo Tee",
    brand: "Monarch",
    category: "Smart Casual",
    rating: 4.6,
    badge: "Premium",
    description: "Polished polo tee with a sharper everyday fit.",
    price: 1299,
    compareAtPrice: 1699,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["M", "L", "XL", "XXL"],
    colorOptions: ["Navy", "Bottle Green", "White"]
  },
  {
    _id: "demo-vintage-print-tee",
    title: "Vintage Print Tee",
    brand: "Retro Lane",
    category: "Graphic",
    rating: 4.4,
    badge: "Retro",
    description: "Washed vintage graphic with a soft worn-in feel.",
    price: 849,
    compareAtPrice: 1099,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Faded Black", "Ecru", "Rust"]
  },
  {
    _id: "demo-slim-fit-signature-tee",
    title: "Slim Fit Signature Tee",
    brand: "Monarch",
    category: "Essentials",
    rating: 4.5,
    badge: "Signature",
    description: "Sharper silhouette with a premium everyday drape.",
    price: 899,
    compareAtPrice: 1199,
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["White", "Black", "Grey"]
  },
  {
    _id: "demo-textured-pocket-tee",
    title: "Textured Pocket Tee",
    brand: "Urban Loom",
    category: "Basics",
    rating: 4.3,
    badge: "New",
    description: "Subtle texture and pocket detail for a clean upgrade.",
    price: 779,
    compareAtPrice: 999,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Beige", "Olive", "Navy"]
  },
  {
    _id: "demo-summer-cotton-tee",
    title: "Summer Cotton Tee",
    brand: "Threadline",
    category: "Relaxed",
    rating: 4.2,
    badge: "Lightweight",
    description: "Breathable cotton for warm-weather comfort.",
    price: 699,
    compareAtPrice: 899,
    image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Sky", "White", "Sand"]
  },
  {
    _id: "demo-heritage-graphic-tee",
    title: "Heritage Graphic Tee",
    brand: "Retro Lane",
    category: "Graphic",
    rating: 4.7,
    badge: "Limited",
    description: "Soft tee with a heritage-inspired front graphic.",
    price: 999,
    compareAtPrice: 1299,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["M", "L", "XL", "XXL"],
    colorOptions: ["Black", "Cream", "Maroon"]
  },
  {
    _id: "demo-soft-touch-tee",
    title: "Soft Touch Tee",
    brand: "Urban Loom",
    category: "Essentials",
    rating: 4.6,
    badge: "Soft Feel",
    description: "Ultra-soft feel with a polished everyday finish.",
    price: 749,
    compareAtPrice: 949,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Ivory", "Black", "Stone"]
  },
  {
    _id: "demo-urban-blackout-tee",
    title: "Urban Blackout Tee",
    brand: "StreetVault",
    category: "Streetwear",
    rating: 4.8,
    badge: "Top Rated",
    description: "Heavyweight street tee with a deep black finish.",
    price: 1199,
    compareAtPrice: 1499,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["M", "L", "XL", "XXL"],
    colorOptions: ["Black", "Charcoal", "Coal"]
  },
  {
    _id: "demo-weekend-overshirt-tee",
    title: "Weekend Overshirt Tee",
    brand: "Monarch",
    category: "Smart Casual",
    rating: 4.4,
    badge: "Weekend",
    description: "Structured tee that feels polished but relaxed.",
    price: 1099,
    compareAtPrice: 1399,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["M", "L", "XL", "XXL"],
    colorOptions: ["Navy", "White", "Olive"]
  },
  {
    _id: "demo-core-cotton-tee",
    title: "Core Cotton Tee",
    brand: "Threadline",
    category: "Basics",
    rating: 4.3,
    badge: "Daily Wear",
    description: "A clean everyday tee with a dependable fit.",
    price: 649,
    compareAtPrice: 799,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["White", "Grey", "Black"]
  },
  {
    _id: "demo-urban-print-tee",
    title: "Urban Print Tee",
    brand: "StreetVault",
    category: "Graphic",
    rating: 4.5,
    badge: "Street",
    description: "Graphic front print with an urban inspired finish.",
    price: 1049,
    compareAtPrice: 1299,
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["M", "L", "XL", "XXL"],
    colorOptions: ["Black", "Grey", "Sand"]
  },
  {
    _id: "demo-cloud-soft-tee",
    title: "Cloud Soft Tee",
    brand: "Urban Loom",
    category: "Relaxed",
    rating: 4.1,
    badge: "Soft",
    description: "Lightweight and soft with an easy relaxed drape.",
    price: 729,
    compareAtPrice: 899,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Blue", "White", "Sage"]
  },
  {
    _id: "demo-archive-tee",
    title: "Archive Tee",
    brand: "Retro Lane",
    category: "Graphic",
    rating: 4.6,
    badge: "Archive",
    description: "Old-school inspired tee with a premium washed finish.",
    price: 949,
    compareAtPrice: 1199,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Faded Black", "Indigo", "Rust"]
  },
  {
    _id: "demo-premium-black-tee",
    title: "Premium Black Tee",
    brand: "Monarch",
    category: "Smart Casual",
    rating: 4.8,
    badge: "Premium",
    description: "Refined black tee with a sharper collar and drape.",
    price: 1399,
    compareAtPrice: 1799,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["M", "L", "XL", "XXL"],
    colorOptions: ["Black", "Charcoal", "Navy"]
  },
  {
    _id: "demo-summer-graphic-tee",
    title: "Summer Graphic Tee",
    brand: "Bold Studio",
    category: "Graphic",
    rating: 4.4,
    badge: "New Season",
    description: "Bright seasonal print with a breathable cotton hand-feel.",
    price: 899,
    compareAtPrice: 1099,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["White", "Black", "Blue"]
  },
  {
    _id: "demo-weekend-loopback-tee",
    title: "Weekend Loopback Tee",
    brand: "Threadline",
    category: "Relaxed",
    rating: 4.2,
    badge: "Weekend",
    description: "Loopback texture for a more elevated casual fit.",
    price: 819,
    compareAtPrice: 999,
    image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1200&q=80",
    sizeOptions: ["S", "M", "L", "XL"],
    colorOptions: ["Sand", "Olive", "Ink"]
  }
];

let products = [];
let filteredProducts = [];
let activeCategory = "All";
let searchTerm = "";
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let cart = JSON.parse(localStorage.getItem("threadlineCart") || "[]");
let isDemoMode = false;

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

function saveCart() {
  localStorage.setItem("threadlineCart", JSON.stringify(cart));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(text = "") {
  return String(text).toLowerCase();
}

function cartKey(item) {
  return [item.productId, item.size, item.color].join("|");
}

function getColorTheme(color = "") {
  const normalized = String(color).replace(/\s+/g, "");
  return COLOR_THEMES[color] || COLOR_THEMES[normalized] || COLOR_THEMES.Black;
}

function createVariantChipButton(type, value, isActive = false) {
  return `
    <button class="variant-chip ${isActive ? "active" : ""}" type="button" data-variant-type="${type}" data-variant-value="${escapeHtml(value)}">
      ${escapeHtml(value)}
    </button>
  `;
}

function findProduct(productId) {
  return products.find((item) => item._id === productId);
}

function getProductImageTransform() {
  const scale = activeProductZoom ? 1.18 : 1.02;
  const tilt = activeProductRotate;
  return { tilt, scale };
}

function applyProductImageTransform() {
  if (!productModalImage) {
    return;
  }
  const transform = getProductImageTransform();
  productModalImage.style.setProperty("--image-rotate", `${transform.tilt}deg`);
  productModalImage.style.setProperty("--image-scale", String(transform.scale));
}

function renderPreviewStrip() {
  if (!productPreviewStrip || !activeProduct) {
    return;
  }

  productPreviewStrip.innerHTML = VIEW_FRAMES.map((frame) => `
    <button class="preview-frame ${Math.round(activeProductRotate) === frame.rotate ? "active" : ""}" type="button" data-frame-rotate="${frame.rotate}">
      <img src="${escapeHtml(activeProduct.image)}" alt="${escapeHtml(activeProduct.title)} ${escapeHtml(frame.label)} preview" />
      <span>${escapeHtml(frame.label)}</span>
    </button>
  `).join("");

  productPreviewStrip.querySelectorAll("[data-frame-rotate]").forEach((button) => {
    button.addEventListener("click", () => {
      activeProductRotate = Number(button.dataset.frameRotate || 0);
      if (productRotate) {
        productRotate.value = String(activeProductRotate);
      }
      activeProductDrag = null;
      refreshProductModalPreview();
      renderPreviewStrip();
    });
  });
}

function openProductModal(productId) {
  const product = findProduct(productId);
  if (!product || !productModal) {
    return;
  }

  activeProduct = product;
  activeProductColor = product.colorOptions?.[0] || "Black";
  activeProductSize = product.sizeOptions?.[0] || "M";
  activeProductRotate = 0;
  activeProductZoom = false;
  activeProductDrag = null;

  const theme = getColorTheme(activeProductColor);

  if (productModalImage) {
    productModalImage.src = product.image;
    productModalImage.alt = product.title;
    productModalImage.style.filter = `hue-rotate(${theme.hue}) saturate(${theme.saturation}) brightness(${theme.brightness})`;
  }
  applyProductImageTransform();

  if (productStageTint) {
    productStageTint.style.background = `linear-gradient(180deg, ${theme.tint}, rgba(255,255,255,0.02))`;
  }

  if (productStage) {
    productStage.style.setProperty("--stage-bg", theme.bg);
    productStage.style.setProperty("--stage-shadow", theme.tint);
  }

  if (productModalBadge) {
    productModalBadge.textContent = product.badge || product.category || "Featured";
  }
  if (productModalBrand) {
    productModalBrand.textContent = product.brand || "Threadline";
  }
  if (productModalTitle) {
    productModalTitle.textContent = product.title;
  }
  if (productModalDescription) {
    productModalDescription.textContent = product.description || "";
  }
  if (productModalPrice) {
    productModalPrice.textContent = formatMoney(product.price);
  }
  if (productModalRating) {
    productModalRating.textContent = `★ ${Number(product.rating || 4.4).toFixed(1)}`;
  }
  if (productModalCategory) {
    productModalCategory.textContent = product.category || "Featured";
  }
  if (productModalColorName) {
    productModalColorName.textContent = activeProductColor;
  }
  if (productModalSizeName) {
    productModalSizeName.textContent = activeProductSize;
  }

  if (productModalColors) {
    const colorOptions = product.colorOptions && product.colorOptions.length > 0 ? product.colorOptions : ["Black", "White"];
    productModalColors.innerHTML = colorOptions.map((color) => createVariantChipButton("color", color, color === activeProductColor)).join("");
  }

  if (productModalSizes) {
    const sizeOptions = product.sizeOptions && product.sizeOptions.length > 0 ? product.sizeOptions : ["M", "L", "XL"];
    productModalSizes.innerHTML = sizeOptions.map((size) => createVariantChipButton("size", size, size === activeProductSize)).join("");
  }

  if (productRotate) {
    productRotate.value = String(activeProductRotate);
  }
  if (productZoomToggle) {
    productZoomToggle.textContent = "Zoom view";
    productZoomToggle.setAttribute("aria-pressed", "false");
  }
  if (productResetView) {
    productResetView.disabled = false;
  }

  if (modalAddToCart) {
    modalAddToCart.dataset.productId = product._id;
  }
  if (modalBuyNow) {
    modalBuyNow.dataset.productId = product._id;
  }

  productModal.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  renderPreviewStrip();
}

function closeProductModal() {
  if (!productModal) {
    return;
  }
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function refreshProductModalPreview() {
  if (!activeProduct || !productModalImage) {
    return;
  }

  const theme = getColorTheme(activeProductColor);
  if (productModalImage) {
    productModalImage.style.filter = `hue-rotate(${theme.hue}) saturate(${theme.saturation}) brightness(${theme.brightness})`;
  }
  applyProductImageTransform();
  if (productStageTint) {
    productStageTint.style.background = `linear-gradient(180deg, ${theme.tint}, rgba(255,255,255,0.02))`;
  }
  if (productStage) {
    productStage.style.setProperty("--stage-bg", theme.bg);
    productStage.style.setProperty("--stage-shadow", theme.tint);
  }
  if (productModalColorName) {
    productModalColorName.textContent = activeProductColor;
  }
  if (productModalSizeName) {
    productModalSizeName.textContent = activeProductSize;
  }
  if (productModalColors) {
    productModalColors.querySelectorAll("[data-variant-type='color']").forEach((button) => {
      button.classList.toggle("active", button.dataset.variantValue === activeProductColor);
    });
  }
  if (productModalSizes) {
    productModalSizes.querySelectorAll("[data-variant-type='size']").forEach((button) => {
      button.classList.toggle("active", button.dataset.variantValue === activeProductSize);
    });
  }
  renderPreviewStrip();
}

function getFilteredProducts() {
  return products.filter((product) => {
    const matchesSearch = !searchTerm ||
      [product.title, product.brand, product.category, product.description]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);
    const matchesCategory = activeCategory === "All" || normalize(product.category) === normalize(activeCategory);
    return matchesSearch && matchesCategory;
  });
}

function getPagedProducts() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => {
    const product = products.find((currentProduct) => currentProduct._id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartSummary() {
  const subtotal = getCartSubtotal();
  if (cartTotal) {
    cartTotal.textContent = formatMoney(subtotal);
  }
  const cartTotalSecondary = document.getElementById("cartTotalSecondary");
  if (cartTotalSecondary) {
    cartTotalSecondary.textContent = formatMoney(subtotal);
  }
  if (cartCount) {
    cartCount.textContent = `${cartItemCount()} items`;
  }
  if (cartNavLink) {
    cartNavLink.textContent = cartItemCount() ? `Cart (${cartItemCount()})` : "Cart";
  }
  if (checkoutNavLink) {
    checkoutNavLink.textContent = cartItemCount() ? `Checkout (${cartItemCount()})` : "Checkout";
  }
}

function updateDeliveryNote() {
  if (!deliveryMethodSelect || !deliveryNote) {
    return;
  }
  const option = SHIPPING_OPTIONS[deliveryMethodSelect.value] || SHIPPING_OPTIONS.standard;
  deliveryNote.textContent = `${option.label} selected. Estimated arrival in ${option.days}. Delivery fee: ${formatMoney(option.fee)}.`;
}

function getSelectedShippingOption() {
  if (!deliveryMethodSelect) {
    return SHIPPING_OPTIONS.standard;
  }
  return SHIPPING_OPTIONS[deliveryMethodSelect.value] || SHIPPING_OPTIONS.standard;
}

function renderCategoryFilters() {
  if (!categoryFilters) {
    return;
  }
  const categories = ["All", ...new Set(products.map((product) => product.category || "Other"))];
  categoryFilters.innerHTML = categories.map((category) => `
    <button class="chip ${activeCategory === category ? "active" : ""}" data-category="${escapeHtml(category)}" type="button">
      ${escapeHtml(category)}
    </button>
  `).join("");

  categoryFilters.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      filteredProducts = getFilteredProducts();
      renderCategoryFilters();
      renderProducts();
    });
  });
}

function renderStyleWall() {
  if (!styleWall) {
    return;
  }

  const wallItems = products.slice(0, 8);
  if (wallItems.length === 0) {
    styleWall.innerHTML = "";
    return;
  }

  styleWall.innerHTML = wallItems.map((product, index) => `
    <figure class="style-tile style-tile-${(index % 4) + 1}">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" />
      <figcaption>
        <span>${escapeHtml(product.badge || product.category || "Featured")}</span>
        <strong>${escapeHtml(product.title)}</strong>
      </figcaption>
    </figure>
  `).join("");
}

function renderProducts() {
  if (!productGrid) {
    return;
  }
  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state catalog-skeleton" style="grid-column: 1 / -1;">
        No products match your search right now. Try a different keyword or clear the filters.
      </div>
    `;
    productCount.textContent = "0";
    if (pagination) {
      pagination.innerHTML = "";
    }
    return;
  }

  const visibleProducts = getPagedProducts();
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  productGrid.innerHTML = visibleProducts.map((product) => {
    const sizeOptions = (product.sizeOptions && product.sizeOptions.length > 0 ? product.sizeOptions : ["M", "L", "XL"])
      .map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`)
      .join("");
    const colorOptions = (product.colorOptions && product.colorOptions.length > 0 ? product.colorOptions : ["Black", "White"])
      .map((color) => `<option value="${escapeHtml(color)}">${escapeHtml(color)}</option>`)
      .join("");

    return `
      <article class="product-card" data-product-card="${product._id}">
        <div class="product-media" data-open-product="${product._id}" role="button" tabindex="0" aria-label="Open ${escapeHtml(product.title)} details">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" />
          <span class="product-badge">${escapeHtml(product.badge || product.category || "Featured")}</span>
          <button class="wish-btn" type="button">♡</button>
          <button class="details-btn" type="button" data-open-product="${product._id}">View details</button>
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span class="brand-name">${escapeHtml(product.brand || "Threadline")}</span>
            <span class="rating">★ ${Number(product.rating || 4.4).toFixed(1)}</span>
          </div>
          <h4>${escapeHtml(product.title)}</h4>
          <p class="muted">${escapeHtml(product.description || "")}</p>
          <div class="price-row">
            <strong class="price">${formatMoney(product.price)}</strong>
            ${product.compareAtPrice ? `<span class="strike">${formatMoney(product.compareAtPrice)}</span>` : ""}
          </div>
          <div class="selectors">
            <label>
              Size
              <select data-size="${product._id}">${sizeOptions}</select>
            </label>
            <label>
              Color
              <select data-color="${product._id}">${colorOptions}</select>
            </label>
          </div>
          <div class="card-actions">
            <button class="button secondary full" data-add-to-cart="${product._id}" type="button">Add to cart</button>
            <button class="button primary full" data-buy-now="${product._id}" type="button">Buy now</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  productGrid.querySelectorAll("[data-open-product]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openProductModal(element.dataset.openProduct);
    });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProductModal(element.dataset.openProduct);
      }
    });
  });

  productGrid.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.addToCart);
    });
  });

  productGrid.querySelectorAll("[data-buy-now]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.buyNow);
      window.location.href = "/checkout";
    });
  });

  productCount.textContent = String(filteredProducts.length);
  renderPagination(totalPages);
}

function renderPagination(totalPages = 1) {
  if (!pagination) {
    return;
  }

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  pagination.innerHTML = `
    <button class="chip ${currentPage === 1 ? "active" : ""}" type="button" data-page="prev">Prev</button>
    ${pages.map((page) => `
      <button class="chip ${currentPage === page ? "active" : ""}" type="button" data-page="${page}">${page}</button>
    `).join("")}
    <button class="chip ${currentPage === totalPages ? "active" : ""}" type="button" data-page="next">Next</button>
  `;

  pagination.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextPage = button.dataset.page === "prev"
        ? Math.max(1, currentPage - 1)
        : button.dataset.page === "next"
          ? Math.min(totalPages, currentPage + 1)
          : Number(button.dataset.page);
      currentPage = nextPage;
      renderProducts();
      const catalog = document.getElementById("catalog");
      if (catalog) {
        catalog.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function renderCart() {
  const hasCartPreview = Boolean(cartPreview);
  const hasCheckoutPreview = Boolean(checkoutPreview);

  if (!hasCartPreview && !hasCheckoutPreview) {
    updateCartSummary();
    return;
  }

  if (cart.length === 0) {
    if (hasCartPreview) {
      cartPreview.innerHTML = `<div class="empty-state">Your cart is empty. Pick a tee to start building your fit.</div>`;
    }
    if (hasCheckoutPreview) {
      checkoutPreview.innerHTML = `<div class="empty-state">Add products to preview your order here.</div>`;
    }
    updateCartSummary();
    return;
  }

  const cartMarkup = cart.map((item) => {
    const product = products.find((currentProduct) => currentProduct._id === item.productId);
    if (!product) {
      return "";
    }

    return `
      <div class="cart-item">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" />
        <div class="cart-copy">
          <strong>${escapeHtml(product.title)}</strong>
          <span class="muted">${escapeHtml(item.size)} | ${escapeHtml(item.color)}</span>
          <div class="qty-row">
            <button class="qty-btn" data-decrease="${cartKey(item)}" type="button">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-increase="${cartKey(item)}" type="button">+</button>
            <button class="remove-link" data-remove="${cartKey(item)}" type="button">Remove</button>
          </div>
        </div>
        <strong>${formatMoney(product.price * item.quantity)}</strong>
      </div>
    `;
  }).join("");

  const checkoutMarkup = cart.map((item) => {
    const product = products.find((currentProduct) => currentProduct._id === item.productId);
    if (!product) {
      return "";
    }

    return `
      <div class="checkout-line">
        <div>
          <strong>${escapeHtml(product.title)}</strong>
          <div class="muted">${escapeHtml(item.size)} · ${escapeHtml(item.color)} · Qty ${item.quantity}</div>
        </div>
        <strong>${formatMoney(product.price * item.quantity)}</strong>
      </div>
    `;
  }).join("");

  const shippingOption = getSelectedShippingOption();
  const checkoutSummaryMarkup = `
    <div class="checkout-line">
      <div>
        <strong>Delivery</strong>
        <div class="muted">${escapeHtml(shippingOption.label)} · ${escapeHtml(shippingOption.days)}</div>
      </div>
      <strong>${formatMoney(shippingOption.fee)}</strong>
    </div>
    <div class="checkout-line">
      <div>
        <strong>Total</strong>
        <div class="muted">Includes delivery fee</div>
      </div>
      <strong>${formatMoney(getCartSubtotal() + shippingOption.fee)}</strong>
    </div>
  `;

  if (hasCartPreview) {
    cartPreview.innerHTML = cartMarkup;
    cartPreview.querySelectorAll("[data-increase]").forEach((button) => {
      button.addEventListener("click", () => adjustCartItem(button.dataset.increase, 1));
    });
    cartPreview.querySelectorAll("[data-decrease]").forEach((button) => {
      button.addEventListener("click", () => adjustCartItem(button.dataset.decrease, -1));
    });
    cartPreview.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => removeFromCart(button.dataset.remove));
    });
  }

  if (hasCheckoutPreview) {
    checkoutPreview.innerHTML = `${checkoutMarkup}${checkoutSummaryMarkup}`;
  }

  updateCartSummary();
  updateDeliveryNote();
}

function addToCart(productId, overrides = {}) {
  const product = products.find((item) => item._id === productId);
  if (!product) {
    return;
  }

  const sizeSelect = document.querySelector(`[data-size="${productId}"]`);
  const colorSelect = document.querySelector(`[data-color="${productId}"]`);
  const size = overrides.size || sizeSelect?.value || product.sizeOptions?.[0] || "M";
  const color = overrides.color || colorSelect?.value || product.colorOptions?.[0] || "Black";

  const newItem = {
    productId,
    quantity: 1,
    size,
    color
  };
  const existingItem = cart.find((item) => cartKey(item) === cartKey(newItem));
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(newItem);
  }

  saveCart();
  renderCart();
  if (checkoutMessage) {
    checkoutMessage.textContent = `${product.title} added to your cart.`;
  } else if (catalogMessage) {
    catalogMessage.textContent = `${product.title} added to your cart.`;
  }
}

function adjustCartItem(productKey, delta) {
  const item = cart.find((entry) => cartKey(entry) === productKey);
  if (!item) {
    return;
  }

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry !== item);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productKey) {
  cart = cart.filter((item) => cartKey(item) !== productKey);
  saveCart();
  renderCart();
}

function useDemoProducts(message) {
  isDemoMode = true;
  products = DEMO_PRODUCTS.map((product) => ({ ...product }));
  filteredProducts = getFilteredProducts();
  currentPage = 1;
  renderCategoryFilters();
  renderStyleWall();
  renderProducts();
  renderCart();
  if (catalogMessage) {
    catalogMessage.textContent = message;
  }
  if (checkoutMessage) {
    checkoutMessage.textContent = "Demo showcase is active. Connect the database to enable live orders and Razorpay checkout.";
  }
}

async function loadProducts() {
  try {
    const sessionResponse = await fetch("/api/auth/me", {
      credentials: "include"
    });
    if (!sessionResponse.ok) {
      window.location.href = "/";
      return;
    }

    const response = await fetch("/api/store/products");
    const data = await response.json();
    const liveProducts = Array.isArray(data.products) ? data.products : [];

    if (liveProducts.length === 0) {
      useDemoProducts("Showing demo products until your live catalog is ready.");
      return;
    }

    isDemoMode = false;
    products = liveProducts;
    filteredProducts = getFilteredProducts();
    currentPage = 1;
    renderCategoryFilters();
    renderStyleWall();
    renderProducts();
    renderCart();
    if (catalogMessage) {
      catalogMessage.textContent = "";
      catalogMessage.style.display = "none";
    }
  } catch (error) {
    useDemoProducts("Could not load the live catalog, so demo products are shown here.");
    if (catalogMessage) {
      catalogMessage.textContent = `Demo showcase active: ${error.message}`;
    }
  }
}

if (productModal) {
  productModal.addEventListener("click", (event) => {
    if (event.target && event.target.matches("[data-close-modal]")) {
      closeProductModal();
    }
  });
}

if (productRotate) {
  productRotate.addEventListener("input", () => {
    activeProductRotate = Number(productRotate.value || 0);
    activeProductDrag = null;
    refreshProductModalPreview();
  });
}

if (productZoomToggle) {
  productZoomToggle.addEventListener("click", () => {
    activeProductZoom = !activeProductZoom;
    productZoomToggle.textContent = activeProductZoom ? "Zoom out" : "Zoom view";
    productZoomToggle.setAttribute("aria-pressed", String(activeProductZoom));
    refreshProductModalPreview();
  });
}

if (productResetView) {
  productResetView.addEventListener("click", () => {
    activeProductRotate = 0;
    activeProductZoom = false;
    activeProductDrag = null;
    if (productRotate) {
      productRotate.value = "0";
    }
    if (productZoomToggle) {
      productZoomToggle.textContent = "Zoom view";
      productZoomToggle.setAttribute("aria-pressed", "false");
    }
    refreshProductModalPreview();
  });
}

if (productStage) {
  const endDrag = () => {
    if (!activeProductDrag) {
      return;
    }
    if (productRotate) {
      productRotate.value = String(activeProductRotate);
    }
    activeProductDrag = null;
    refreshProductModalPreview();
  };

  productStage.addEventListener("pointerdown", (event) => {
    if (!activeProduct) {
      return;
    }
    activeProductDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      rotate: activeProductRotate
    };
    productStage.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  productStage.addEventListener("pointermove", (event) => {
    if (!activeProductDrag || activeProductDrag.pointerId !== event.pointerId) {
      return;
    }
    const delta = event.clientX - activeProductDrag.startX;
    const rotate = Math.max(-25, Math.min(25, activeProductDrag.rotate + delta / 14));
    activeProductRotate = rotate;
    if (productRotate) {
      productRotate.value = String(Math.round(rotate));
    }
    applyProductImageTransform();
    refreshProductModalPreview();
  });

  productStage.addEventListener("pointerup", endDrag);
  productStage.addEventListener("pointercancel", endDrag);
  productStage.addEventListener("pointerleave", endDrag);
}

if (productModalColors) {
  productModalColors.addEventListener("click", (event) => {
    const button = event.target.closest("[data-variant-type='color']");
    if (!button) {
      return;
    }
    activeProductColor = button.dataset.variantValue;
    refreshProductModalPreview();
  });
}

if (productModalSizes) {
  productModalSizes.addEventListener("click", (event) => {
    const button = event.target.closest("[data-variant-type='size']");
    if (!button) {
      return;
    }
    activeProductSize = button.dataset.variantValue;
    refreshProductModalPreview();
  });
}

if (modalAddToCart) {
  modalAddToCart.addEventListener("click", () => {
    if (!modalAddToCart.dataset.productId) {
      return;
    }
    addToCart(modalAddToCart.dataset.productId, { size: activeProductSize, color: activeProductColor });
    closeProductModal();
    renderCart();
    if (catalogMessage) {
      catalogMessage.textContent = `${activeProduct?.title || "Product"} added to your cart.`;
    }
  });
}

if (modalBuyNow) {
  modalBuyNow.addEventListener("click", () => {
    if (!modalBuyNow.dataset.productId) {
      return;
    }
    addToCart(modalBuyNow.dataset.productId, { size: activeProductSize, color: activeProductColor });
    closeProductModal();
    window.location.href = "/checkout";
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    filteredProducts = getFilteredProducts();
    currentPage = 1;
    renderProducts();
  });
}

if (clearFilters) {
  clearFilters.addEventListener("click", () => {
    activeCategory = "All";
    searchTerm = "";
    if (searchInput) {
      searchInput.value = "";
    }
    filteredProducts = getFilteredProducts();
    currentPage = 1;
    renderCategoryFilters();
    renderStyleWall();
    renderProducts();
  });
}

if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      checkoutMessage.textContent = "Add at least one product to the cart first.";
      return;
    }

    if (isDemoMode) {
      checkoutMessage.textContent = "Demo mode is active. Add MongoDB and Razorpay keys to enable real checkout.";
      return;
    }

    checkoutMessage.textContent = "Creating order...";

    const formData = new FormData(checkoutForm);
    const shippingAddress = formData.get("shippingAddress")
      .split(",")
      .map((value) => value.trim());

    const [line1 = "", city = "", state = "", postalCode = "", country = "India"] = shippingAddress;

    const payload = {
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      customerPhone: formData.get("customerPhone"),
      deliveryMethod: formData.get("deliveryMethod") || "standard",
      shippingAddress: { line1, city, state, postalCode, country },
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))
    };

    const selectedProduct = products.find((item) => item._id === cart[0]?.productId);

    const response = await fetch("/api/store/create-order", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      checkoutMessage.textContent = data.message || "Unable to create order";
      return;
    }

    const orderId = data.order_id || data.razorpay?.orderId;
    if (!orderId) {
      checkoutMessage.textContent = "Order created, but Razorpay could not start.";
      return;
    }

    const options = {
      key: data.razorpay?.keyId || "",
      amount: data.amount || data.razorpay?.amount,
      currency: data.currency || data.razorpay?.currency || "INR",
      name: "Threadline",
      description: selectedProduct ? `${selectedProduct.title} and more` : "T-shirt order",
      order_id: orderId,
      modal: {
        ondismiss: function () {
          checkoutMessage.textContent = "Payment cancelled. You can continue when ready.";
        }
      },
      prefill: {
        name: payload.customerName,
        email: payload.customerEmail,
        contact: payload.customerPhone
      },
      theme: {
        color: "#cf5b2e"
      },
      handler: async function (responsePayload) {
        checkoutMessage.textContent = "Verifying payment...";
        const verifyResponse = await fetch("/api/store/verify-payment", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.internal_order_id || data.order?._id || "",
            ...responsePayload
          })
        });
        const verifyData = await verifyResponse.json().catch(() => ({}));
        checkoutMessage.textContent = verifyData.message || "Payment completed";
        if (verifyResponse.ok) {
          cart = [];
          saveCart();
          renderCart();
        }
      }
    };

    checkoutMessage.textContent = "Opening Razorpay payment window...";
    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", (response) => {
      checkoutMessage.textContent = response?.error?.description || "Payment failed. Please try again.";
    });
    razorpay.open();
  });
}

loadProducts();

if (signOutButton) {
  signOutButton.addEventListener("click", async () => {
    await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });
    window.location.href = "/";
  });
}

if (deliveryMethodSelect) {
  deliveryMethodSelect.addEventListener("change", updateDeliveryNote);
  updateDeliveryNote();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProductModal();
  }
});
