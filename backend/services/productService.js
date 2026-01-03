import { Op } from "sequelize";
import Product from "../models/product.js";

const productSafe = (p) => {
  if (!p) return null;

  let images = [];
  try {
    images = p.images ? JSON.parse(p.images) : [];
    if (!Array.isArray(images)) images = [];
  } catch {
    images = [];
  }
  
  // Improvement: Extract the first image URL for the frontend ProductRow component
  const imageUrl = images.length > 0 ? images[0] : null;

  return {
    id: p.ID ?? p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    // warehouse stock
    stock: Number(p.stock),
    // store stock
    inStock: Number(p.inStock),
    price: Number(p.price),
    status: p.status,
    images,
    imageUrl, // Added for frontend consumption
    createdAt: p.createAt ?? p.createdAt,
    updatedAt: p.updateAt ?? p.updatedAt,
  };
};

export default {
  async createProduct(payload) {
    const {
      name,
      sku,
      category,
      stock = 0,
      inStock = 0,
      price = 0.0,
      images = null,
    } = payload || {};

    if (!name || !sku || !category) throw new Error("name, sku and category are required.");

    const exists = await Product.findOne({ where: { sku } });
    if (exists) throw new Error("SKU already exists.");

    let imagesArr = [];
    if (Array.isArray(images)) imagesArr = images;
    else if (typeof images === "string") imagesArr = [images];

    const product = await Product.create({
      name,
      sku,
      category,
      stock: Number(stock),
      inStock: Number(inStock),
      price: Number(price),
      images: imagesArr.length ? JSON.stringify(imagesArr) : null,
    });

    return productSafe(product);
  },


  async getProductById(id) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found.");
    return productSafe(product);
  },

  async listProducts(opts = {}) {
    const page = Math.max(1, parseInt(opts.page, 10) || 1);
    const limit = Math.min(200, parseInt(opts.limit, 10) || 20);
    const offset = (page - 1) * limit;

    const where = {};

    if (opts.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${opts.search}%` } },
        { sku: { [Op.like]: `%${opts.search}%` } },
      ];
    }

    if (opts.category) where.category = opts.category;
    if (opts.status) where.status = opts.status;

    if (opts.minPrice !== undefined || opts.maxPrice !== undefined) {
      where.price = {};
      if (opts.minPrice !== undefined) where.price[Op.gte] = Number(opts.minPrice);
      if (opts.maxPrice !== undefined) where.price[Op.lte] = Number(opts.maxPrice);
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      order: [["ID", "DESC"]],
      limit,
      offset,
    });

    return {
      meta: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit) || 1,
      },
      data: rows.map(productSafe),
    };
  },

  async updateProduct(id, updates = {}) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found.");

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.category !== undefined) product.category = updates.category;
    if (updates.stock !== undefined) product.stock = Number(updates.stock);
    if (updates.inStock !== undefined) product.inStock = Number(updates.inStock);
    if (updates.price !== undefined) product.price = Number(updates.price);

    if (updates.sku !== undefined && updates.sku !== product.sku) {
      const exists = await Product.findOne({ where: { sku: updates.sku } });
      if (exists && exists.ID !== product.ID) throw new Error("SKU already in use.");
      product.sku = updates.sku;
    }

    let imagesArr = [];
    try {
      imagesArr = product.images ? JSON.parse(product.images) : [];
      if (!Array.isArray(imagesArr)) imagesArr = [];
    } catch {
      imagesArr = [];
    }

    if (updates.images !== undefined && updates.images !== null) {
      if (Array.isArray(updates.images)) imagesArr = updates.images;
      else if (typeof updates.images === "string") {
        try {
          const parsed = JSON.parse(updates.images);
          imagesArr = Array.isArray(parsed) ? parsed : [updates.images];
        } catch {
          imagesArr = [updates.images];
        }
      }
    }

    if (Array.isArray(updates.addImages) && updates.addImages.length) {
      imagesArr = [...updates.addImages, ...imagesArr];
    }

    if (Array.isArray(updates.removeImageIndexes) && updates.removeImageIndexes.length) {
      const idxs = updates.removeImageIndexes.map(Number).filter((n) => !Number.isNaN(n));
      idxs.sort((a, b) => b - a);
      for (const idx of idxs) {
        if (idx >= 0 && idx < imagesArr.length) imagesArr.splice(idx, 1);
      }
    }

    product.images = imagesArr.length ? JSON.stringify(imagesArr) : null;

    await product.save();
    return productSafe(product);
  },

  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found.");
    await product.destroy();
    return { message: "Product deleted" };
  },
};