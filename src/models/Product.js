const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    brand: { type: String, default: "Threadline" },
    category: { type: String, default: "Casual" },
    rating: { type: Number, default: 4.4, min: 0, max: 5 },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    image: { type: String, default: "" },
    sizeOptions: [{ type: String }],
    colorOptions: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.pre("validate", function ensureSlug(next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
