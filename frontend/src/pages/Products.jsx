import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Plus,
  PencilLine,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// API Imports
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productsApi.js";

// Reusable Components
import { ConfirmModal, ModalWrapper } from "../components/modal.jsx";

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

const CATEGORY_COLORS = {
  RAM: "bg-blue-50 text-blue-600 border-blue-100",
  SSD: "bg-emerald-50 text-emerald-600 border-emerald-100",
  HDD: "bg-amber-50 text-amber-600 border-amber-100",
  "PC Case": "bg-slate-50 text-slate-600 border-slate-100",
  Fan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  Cooler: "bg-indigo-50 text-indigo-600 border-indigo-100",
  Motherboard: "bg-purple-50 text-purple-600 border-purple-100",
  Processor: "bg-rose-50 text-rose-600 border-rose-100",
  "Graphics Card": "bg-violet-50 text-violet-600 border-violet-100",
  "Power Supply Unit": "bg-orange-50 text-orange-600 border-orange-100",
};

const generateRandomSuffix = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length));
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

  // Confirmation States
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingSave, setPendingSave] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await listProducts();
      const apiData = res.data || res;
      const rows = Array.isArray(apiData.data)
        ? apiData.data
        : Array.isArray(apiData)
        ? apiData
        : [];
      const backendUrl = (
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
      ).replace(/\/$/, "");

      const normalized = rows.map((p) => {
        let img = p.imageUrl || (p.images && p.images[0]);
        if (
          img &&
          !img.startsWith("http") &&
          !img.startsWith("blob") &&
          !img.startsWith("data")
        ) {
          img = `${backendUrl}${img.startsWith("/") ? img : "/" + img}`;
        }
        return {
          id: p.id ?? p.ID ?? p._id,
          name: p.name || "Unnamed Product",
          sku: p.sku || "N/A",
          category: p.category || "Uncategorized",
          stock: Number(p.stock ?? 0),
          inStock: Number(p.inStock ?? 0),
          price: Number(p.price ?? 0),
          imageUrl: img,
        };
      });
      setProducts(normalized);
    } catch (err) {
      console.error("Load Error:", err);
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

  // Confirmation Logic
  const handleSaveAttempt = (payload, imageFile) =>
    setPendingSave({ payload, imageFile });

  const executeSave = async () => {
    const { payload, imageFile } = pendingSave;
    try {
      if (payload.id) {
        await updateProduct(payload.id, payload, imageFile);
        setToast({ type: "success", msg: "Product updated" });
      } else {
        await createProduct(payload, imageFile);
        setToast({ type: "success", msg: "Product created" });
      }
      setModalOpen(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      setToast({ type: "error", msg: "Action failed" });
    } finally {
      setPendingSave(null);
    }
  };

  const executeDelete = async () => {
    try {
      await deleteProduct(confirmDelete);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete));
      setToast({ type: "success", msg: "Item removed" });
    } catch (err) {
      setToast({ type: "error", msg: "Delete failed" });
    } finally {
      setConfirmDelete(null);
    }
  };

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
      {/* HEADER */}
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
              {products.length} Items
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Filter
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 outline-none appearance-none cursor-pointer"
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

          <div className="relative group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none w-64"
            />
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-5">Image</th>
                <th className="px-6 py-5">Product Name</th>
                <th className="px-6 py-5">SKU</th>
                <th className="px-6 py-5 text-center">Category</th>
                <th className="px-6 py-5 text-center">Total</th>
                <th className="px-6 py-5 text-center">In Stock</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.map((p) => {
                // 1. Define Stock Status Logic
                const isOut = p.inStock <= 0;
                const isLow = p.inStock > 0 && p.inStock <= 10;
                const isHealthy = p.inStock > 10;

                // 2. Define dynamic styles for the "In Stock" number
                let stockColorClass = "text-emerald-500"; // Healthy Green
                if (isOut) stockColorClass = "text-red-600";
                else if (isLow) stockColorClass = "text-amber-500"; // Warning Yellow

                return (
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
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">
                          {p.name}
                        </span>
                        {/* 3. Warning Labels under the name */}
                        {isOut && (
                          <span className="flex items-center gap-1 text-[9px] text-red-500 font-black mt-0.5 uppercase tracking-tighter">
                            <AlertCircle size={10} strokeWidth={3} /> Out of
                            Stock
                          </span>
                        )}
                        {isLow && (
                          <span className="flex items-center gap-1 text-[9px] text-amber-500 font-black mt-0.5 uppercase tracking-tighter">
                            <AlertCircle size={10} strokeWidth={3} /> Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono uppercase tracking-tighter">
                      {p.sku}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                          CATEGORY_COLORS[p.category] ||
                          "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-800">
                      {p.stock}
                    </td>
                    <td
                      className={`px-6 py-4 text-center font-bold ${stockColorClass}`}
                    >
                      {p.inStock}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800">
                      ₱
                      {p.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
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
                          onClick={() => setConfirmDelete(p.id)}
                          className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS SECTION */}
      {modalOpen && (
        <ProductModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveAttempt}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Product?"
          message="This action will permanently remove the item from your inventory list."
          confirmText="Delete Now"
          variant="red"
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {pendingSave && (
        <ConfirmModal
          title="Save Changes?"
          message="Are you sure you want to update the inventory with this information?"
          confirmText="Yes, Save"
          variant="blue"
          onConfirm={executeSave}
          onCancel={() => setPendingSave(null)}
        />
      )}

      {/* TOAST */}
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
   PRODUCT FORM MODAL
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
  const isEditing = !!initial;

  useEffect(() => {
    if (!initial) {
      const prefix = category.replace(/\s+/g, "").toUpperCase();
      setSku(`${prefix}-${generateRandomSuffix()}`);
    }
  }, [category, initial]);

  useEffect(() => {
    if (inStock > stock) setInStock(stock);
  }, [stock, inStock]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || stock <= 0 || price <= 0)
      return alert("Required fields missing");

    // Logic: Deduct inStock from Total only on new products
    const finalStock = isEditing ? stock : Math.max(0, stock - inStock);

    onSave(
      {
        id: initial?.id ?? null,
        name,
        sku,
        category,
        stock: finalStock,
        inStock,
        price,
      },
      image
    );
  };

  return (
    <ModalWrapper
      title={isEditing ? "Edit Product" : "New Product"}
      subtitle="Fields marked with * are required"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Thumbnail
            </label>
            <div className="relative group w-full h-52 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center overflow-hidden hover:border-blue-400 transition-all cursor-pointer">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Box className="mx-auto mb-3 text-gray-200" size={48} />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
                    Optional
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
            <div className="relative">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-semibold transition-all shadow-inner focus:ring-4 focus:ring-blue-500/5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

            </div>
            <div>
              <label className="text-xs font-black text-gray-300 uppercase tracking-widest ml-1">
                SKU (System Locked)
              </label>
              <input
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-mono text-gray-400 opacity-60 cursor-not-allowed"
                value={sku}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-bold text-gray-600"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              enabled={isEditing}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Total Stocks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              className={`w-full p-4 rounded-2xl outline-none font-bold shadow-inner ${
                isEditing ? "bg-gray-100 text-gray-400" : "bg-gray-50"
              }`}
              value={stock || ""}
              onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
              readOnly={isEditing}
            />

          </div>
          <div>
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              In Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              className={`w-full p-4 rounded-2xl outline-none font-bold shadow-inner ${
                isEditing ? "bg-gray-100 text-gray-400" : "bg-gray-50"
              }`}
              value={inStock || ""}
              onChange={(e) => setInStock(Math.max(0, Number(e.target.value)))}
              readOnly={isEditing}
            />
          </div>
        </div>

        <div className="pt-6 flex items-center justify-between border-t border-gray-50">
          <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest absolute -top-6 left-1">
              Unit Price <span className="text-red-500">*</span>
            </label>
            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-blue-300 text-lg">
              ₱
            </span>
            <input
              type="number"
              required
              className="pl-10 pr-6 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-black text-blue-600 w-52 text-xl"
              value={price || ""}
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95 shadow-blue-100"
            >
              {isEditing ? "Update Product" : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
