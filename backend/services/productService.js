import Product from "../models/product.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const normalizeImages = (images) => {
  if (!images) return null;
  const imageArray = Array.isArray(images) ? images.map(String) : [String(images)];
  // Stringify the array for TEXT column storage
  return JSON.stringify(imageArray);
};

// Helper to parse images back to array for response
const parseImages = (product) => {
  if (product && product.images && typeof product.images === 'string') {
    try {
      product.images = JSON.parse(product.images);
    } catch (e) {
      console.error("Error parsing images JSON:", e);
      product.images = [];
    }
  } else if (product) {
      product.images = product.images || [];
  }
  return product;
};


export const createProduct = async (payload) => {
  const t = await sequelize.transaction();
  try {
    const { name, sku, category, stock = 0, price = 0.0, images = null } = payload ?? {};

    if (!name || !sku || !category) {
      await t.rollback();
      return { success: false, message: "name, sku and category are required." };
    }

    const existing = await Product.findOne({ where: { sku }, transaction: t });
    if (existing) {
      await t.rollback();
      return { success: false, message: "SKU already exists." };
    }

    const created = await Product.create(
      {
        name: String(name),
        sku: String(sku),
        category,
        stock: Number(stock),
        price: Number(price),
        images: normalizeImages(images),
      },
      { transaction: t }
    );

    await t.commit();
    return { success: true, message: "Product created.", data: { product: parseImages(created.toJSON()) } };
  } catch (error) {
    await t.rollback();
    // ⚠️ Check your server console for the actual error logged here!
    console.error("createProduct error:", error);
    return { success: false, message: "Server error creating product." };
  }
};

export const listProducts = async (opts = {}) => {
  try {
    const page = Math.max(Number(opts.page) || DEFAULT_PAGE, 1);
    const limit = Math.max(Number(opts.limit) || DEFAULT_LIMIT, 1);
    const offset = (page - 1) * limit;

    const where = {};
    const { search, category, status } = opts;

    if (search) {
      const s = `%${String(search).trim()}%`;
      // Use simple LIKE on name and sku — relies on DB collation for case-insensitivity.
      where[Op.or] = [
        { name: { [Op.like]: s } },
        { sku: { [Op.like]: s } },
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;

    let order = [["createdAt", "DESC"]];
    if (opts.sortBy) {
      const dir = String(opts.sortDir || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
      order = [[opts.sortBy, dir]];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    const productsWithParsedImages = rows.map(row => parseImages(row.toJSON()));

    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      message: "Products fetched.",
      data: { products: productsWithParsedImages, meta: { total: count, page, limit, totalPages } },
    };
  } catch (error) {
    // ⚠️ The actual error is logged here! Check your server console!
    console.error("listProducts error:", error);
    return { success: false, message: "Server error fetching products." };
  }
};

export const getProductById = async (id) => {
  try {
    if (!id) return { success: false, message: "Product id is required." };

    const product = await Product.findByPk(id);
    if (!product) return { success: false, message: "Product not found." };

    return { success: true, message: "Product found.", data: { product: parseImages(product.toJSON()) } };
  } catch (error) {
    console.error("getProductById error:", error);
    return { success: false, message: "Server error fetching product." };
  }
};

export const updateProduct = async (id, updates = {}) => {
  const t = await sequelize.transaction();
  try {
    if (!id) {
      await t.rollback();
      return { success: false, message: "Product id is required." };
    }

    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return { success: false, message: "Product not found." };
    }

    if (updates.sku && updates.sku !== product.sku) {
      const exists = await Product.findOne({ where: { sku: updates.sku }, transaction: t });
      if (exists) {
        await t.rollback();
        return { success: false, message: "SKU already exists." };
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, "images")) {
      // Use normalizeImages to prepare for saving
      product.images = normalizeImages(updates.images);
      delete updates.images;
    }

    const allowed = ["name", "sku", "category", "stock", "price", "status", "inStock"];
    for (const key of Object.keys(updates)) {
      if (allowed.includes(key)) product[key] = updates[key];
    }

    await product.save({ transaction: t });
    await t.commit();

    return { success: true, message: "Product updated.", data: { product: parseImages(product.toJSON()) } };
  } catch (error) {
    await t.rollback();
    console.error("updateProduct error:", error);
    return { success: false, message: "Server error updating product." };
  }
};

export const deleteProduct = async (id) => {
  const t = await sequelize.transaction();
  try {
    if (!id) {
      await t.rollback();
      return { success: false, message: "Product id is required." };
    }

    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return { success: false, message: "Product not found." };
    }

    await product.destroy({ transaction: t });
    await t.commit();

    return { success: true, message: "Product deleted." };
  } catch (error) {
    await t.rollback();
    console.error("deleteProduct error:", error);
    return { success: false, message: "Server error deleting product." };
  }
};

export default {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};