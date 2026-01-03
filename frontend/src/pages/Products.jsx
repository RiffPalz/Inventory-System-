import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Plus,
  PencilLine,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  X,
  ChevronDown,
} from "lucide-react";

import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productsApi.js";

/* ===============================
   CONSTANTS & HELPERS
================================ */
const CATEGORIES = [
  "RAM",
  "SSD",
  "HDD",
  "PC Case",
  "Fan",
  "Cooler",
  "Motherboard",
  "Processor",
  "Graphics Card",
  "Power Supply Unit",
];

const generateRandomSuffix = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/* ===============================
   MAIN COMPONENT
================================ */
export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await listProducts();
      const rows = Array.isArray(res.data) ? res.data : [];
      const normalized = rows.map((p) => ({
        id: p.id ?? p.ID ?? p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        stock: Number(p.stock ?? 0),
        inStock: Number(p.inStock ?? 0),
        price: Number(p.price ?? 0),
        imageUrl: p.imageUrl ?? null,
      }));
      setProducts(normalized);
    } catch (err) {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSave = async (payload, imageFile) => {
    try {
      if (payload.id) {
        await updateProduct(payload.id, payload, imageFile);
        setToast({ type: "success", msg: "Product updated successfully" });
      } else {
        await createProduct(payload, imageFile);
        setToast({ type: "success", msg: "Product created successfully" });
      }
      setModalOpen(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      setToast({ type: "error", msg: "Operation failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setToast({ type: "success", msg: "Product deleted" });
    } catch (err) {
      setToast({ type: "error", msg: "Delete failed" });
    }
  };

  // The Search and Category Filter logic
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-inner">
            <Box size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
              Products Inventory
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {products.length} Items Listed
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="relative group">
            <Filter
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 appearance-none font-bold text-gray-600 transition-all cursor-pointer"
            >
              <option>All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search on this table"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 w-64 font-medium transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5">Image</th>
                <th className="px-6 py-5">Product Name</th>
                <th className="px-6 py-5">SKU</th>
                <th className="px-6 py-5 text-center">Category</th>
                <th className="px-6 py-5 text-center">Stocks</th>
                <th className="px-6 py-5 text-center">In Stock</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Box className="w-full h-full p-3 text-gray-200" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono uppercase tracking-tighter">
                      {p.sku}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-purple-50 text-purple-500 border border-purple-100">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-800">
                      {p.stock}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-500">
                      {p.inStock}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800">
                      ₱
                      {p.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3 opacity-100 lg:opacity-40 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditing(p);
                            setModalOpen(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                        >
                          <PencilLine size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <Search className="mx-auto mb-4 text-gray-100" size={48} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                      No items found matching your search
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-white shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          {toast.type === "success" ? (
            <CheckCircle2 className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <span className="font-bold text-gray-700 text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

/* ===============================
   MODAL COMPONENT
================================ */
function ProductModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [inStock, setInStock] = useState(initial?.inStock ?? 0);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(initial?.imageUrl ?? null);

  useEffect(() => {
    if (!initial) {
      const prefix = category.replace(/\s+/g, "").toUpperCase();
      setSku(`${prefix}-${generateRandomSuffix()}`);
    }
  }, [category, initial]);

  useEffect(() => {
    if (inStock > stock) {
      setInStock(stock);
    }
  }, [stock, inStock]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(
      { id: initial?.id ?? null, name, sku, category, stock, inStock, price },
      image
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfdfe]">
          <div>
            <h3 className="text-2xl font-black text-gray-800">
              {initial ? "Edit Product" : "New Product"}
            </h3>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-tighter">
              Inventory Control Panel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 text-center">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block text-left ml-1">
                Thumbnail
              </label>
              <div className="relative group w-full h-52 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center overflow-hidden hover:border-blue-400 transition-all cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center px-4">
                    <Box className="mx-auto mb-3 text-gray-200" size={48} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
                      Drop image here
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImage(e.target.files[0]);
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Product Name
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl focus:bg-white outline-none font-semibold transition-all shadow-inner focus:ring-4 focus:ring-blue-500/5"
                  placeholder="e.g. Samsung 980 Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  SKU (Read Only)
                </label>
                <input
                  className="w-full bg-gray-100 border border-gray-100 p-4 rounded-2xl outline-none font-mono text-gray-500 cursor-not-allowed opacity-70"
                  value={sku}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                Category
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-bold text-gray-600 cursor-pointer focus:ring-4 focus:ring-blue-500/5 transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                Total Stocks
              </label>
              <input
                type="number"
                min="0"
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-bold focus:bg-white transition-all shadow-inner"
                placeholder="0"
                value={stock === 0 ? "" : stock}
                onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                In Stock
              </label>
              <input
                type="number"
                min="0"
                max={stock}
                className={`w-full bg-gray-50 border p-4 rounded-2xl outline-none font-bold transition-all focus:bg-white shadow-inner ${
                  inStock >= stock && stock > 0
                    ? "border-orange-200"
                    : "border-gray-100"
                }`}
                placeholder="0"
                value={inStock === 0 ? "" : inStock}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInStock(val > stock ? stock : val);
                }}
              />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-gray-50">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-blue-300 text-lg">
                ₱
              </span>
              <input
                type="number"
                min="0"
                className="pl-10 pr-6 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-black text-blue-600 w-52 text-xl"
                placeholder="0.00"
                value={price === 0 ? "" : price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-2xl font-extrabold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                {initial ? "Update Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
