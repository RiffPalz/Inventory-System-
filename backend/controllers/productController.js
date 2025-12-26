import productService from "../services/productService.js";

export const createProductController = async (req, res) => {
  try {
    // build images array from uploaded files or body
    let images = null;
    if (req.files && Array.isArray(req.files) && req.files.length) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (req.file && req.file.filename) {
      images = [`/uploads/${req.file.filename}`];
    } else if (req.body?.images) {
      try {
        images = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images);
      } catch {
        images = [req.body.images];
      }
    }

    const payload = {
      name: req.body?.name,
      sku: req.body?.sku,
      category: req.body?.category,
      stock: req.body?.stock,
      // NOTE: inStock defaults to 0 in service, so it's not strictly needed here unless user provided it
      inStock: req.body?.inStock, 
      price: req.body?.price,
      images,
    };

    const product = await productService.createProduct(payload);
    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Create product failed" });
  }
};

export const getProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productService.getProductById(id);
    return res.status(200).json({ product });
  } catch (err) {
    return res.status(404).json({ message: err.message || "Product not found" });
  }
};

export const listProductsController = async (req, res) => {
  try {
    const opts = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      category: req.query.category,
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };
    const result = await productService.listProducts(opts);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message || "List products failed" });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const id = req.params.id;

    // images handling: support uploaded files, files array, or body images/addImages
    let addImages = null;
    if (req.files && Array.isArray(req.files) && req.files.length) {
      addImages = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (req.file && req.file.filename) {
      addImages = [`/uploads/${req.file.filename}`];
    } else if (req.body?.addImages) {
      try {
        addImages = Array.isArray(req.body.addImages) ? req.body.addImages : JSON.parse(req.body.addImages);
      } catch {
        addImages = [req.body.addImages];
      }
    }

    const updates = {
      name: req.body?.name,
      sku: req.body?.sku,
      category: req.body?.category,
      stock: req.body?.stock,
      // FIX: Ensure inStock is passed to the service
      inStock: req.body?.inStock, 
      price: req.body?.price,
      images: req.body?.images !== undefined ? (() => {
        try {
          return Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images);
        } catch {
          return req.body.images;
        }
      })() : undefined,
      addImages,
      removeImageIndexes: req.body?.removeImageIndexes ? (() => {
        try {
          return Array.isArray(req.body.removeImageIndexes)
            ? req.body.removeImageIndexes
            : JSON.parse(req.body.removeImageIndexes);
        } catch {
          return [Number(req.body.removeImageIndexes)];
        }
      })() : undefined,
    };

    const updated = await productService.updateProduct(id, updates);
    return res.status(200).json({ message: "Product updated", product: updated });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Update product failed" });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await productService.deleteProduct(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Delete product failed" });
  }
};