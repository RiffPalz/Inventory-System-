import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Box,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  listProducts,
  deleteProduct,
  updateProduct,
} from "../api/productsApi.js";

export default function Stocks() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [inputError, setInputError] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  /**
   * FETCH STOCKS: Uses normalized ID mapping to match your SQL database and Products.jsx
   */
 const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProducts({ limit: 1000 });
      
      // Defensive check: Ensure res.data is an array
      const rawData = Array.isArray(res?.data) ? res.data : [];
      
      const normalized = rawData.map((p) => ({
        ...p,
        id: p.id || p.ID || p._id,
        stocks: Number(p.stock ?? 0),
        inStock: Number(p.inStock ?? 0),
      }));
      setProducts(normalized);
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
      // Specifically handle 401 error in UI
      if (err.response?.status === 401) {
        showToast("Session expired. Please login again.", "error");
      } else {
        showToast("Failed to fetch inventory data", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aLow = a.inStock <= 10;
      const bLow = b.inStock <= 10;
      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;
      return 0;
    });

  /**
   * UPDATE STOCK: Handles inventory adjustments using normalized ID
   */
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    const total = Number(editingProduct.stocks || 0);
    const currentInStock = Number(editingProduct.inStock || 0);
    const targetId = editingProduct.id || editingProduct.ID;

    try {
      // Map 'stocks' back to 'stock' for the backend SQL column name
      await updateProduct(targetId, {
        stock: total,
        inStock: currentInStock,
      });
      setIsEditModalOpen(false);
      fetchStocks();
      showToast("Inventory updated successfully!");
    } catch (err) {
      showToast(err.message || "Failed to update inventory", "error");
    }
  };

  /**
   * DELETE PRODUCT: Performs optimistic UI update so deletion reflects instantly
   */
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      // Remove from local state immediately to sync with the Products view
      setProducts((prev) => prev.filter((p) => (p.id || p.ID) !== id));
      setProductToDelete(null);
      showToast("Product deleted successfully!");
    } catch (err) {
      // Handles Foreign Key constraint errors if sales records exist
      showToast(err.message || "Error deleting product", "error");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Box className="text-blue-600 w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">
              Stocks Inventory
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {products.length} Items Listed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <RefreshCw
            className={`text-slate-300 cursor-pointer hover:text-blue-600 transition-all ${
              loading ? "animate-spin" : ""
            }`}
            size={20}
            onClick={fetchStocks}
          />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 w-80 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase text-slate-400 font-black tracking-[0.15em] border-b border-gray-100">
              <th className="px-8 py-5 text-left uppercase">SKU</th>
              <th className="px-8 py-5 text-left uppercase">Product</th>
              <th className="px-8 py-5 text-center uppercase">Stocks</th>
              <th className="px-8 py-5 text-center uppercase">In Stock</th>
              <th className="px-8 py-5 text-right uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((p) => {
              const isLow = p.inStock <= 10 && p.inStock > 0;
              const isOut = p.inStock <= 0;
              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-6 text-sm font-medium text-slate-400 uppercase">
                    {p.sku}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1E293B] text-[13px] uppercase tracking-wide">
                        {p.name}
                      </span>
                      {(isOut || isLow) && (
                        <span className="flex items-center gap-1 text-[9px] text-red-500 font-black mt-1 uppercase tracking-tighter">
                          <AlertCircle size={10} strokeWidth={3} /> Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-[#1E293B] text-sm">
                    {p.stocks}
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-sm">
                    <span
                      className={isOut ? "text-red-600" : "text-emerald-500"}
                    >
                      {p.inStock}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsEditModalOpen(true);
                          setInputError(false);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="text-red-500 hover:text-red-700"
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

      {/* TOAST SYSTEM */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-red-50 border-red-100 text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="text-sm font-bold uppercase">{toast.message}</span>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                  Inventory Adjustment
                </h2>
                <p className="text-[15px] text-blue-600 font-black uppercase tracking-widest mt-1">
                  {editingProduct.name}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Total Stocks
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stocks}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stocks: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Available In-Store
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={
                      editingProduct.inStock === 0 ? "" : editingProduct.inStock
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      const newInStore =
                        raw === "" ? 0 : Math.max(0, Number(raw));
                      setEditingProduct({
                        ...editingProduct,
                        inStock: newInStore,
                      });
                    }}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold text-slate-800 outline-none transition-all ${
                      inputError
                        ? "border-red-500 ring-2 ring-red-100"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1E5EFF] text-white rounded-xl font-bold uppercase text-xs tracking-widest"
                >
                  Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm shadow-2xl p-10 text-center border border-slate-100 rounded-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Delete Product
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              Are you sure you want to delete{" "}
              <span className="font-bold text-blue-600">
                "{productToDelete.name}"
              </span>
              ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleDelete(productToDelete.id || productToDelete.ID)
                }
                className="flex-1 py-4 bg-[#FF3B3B] text-white rounded-2xl font-bold uppercase shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
