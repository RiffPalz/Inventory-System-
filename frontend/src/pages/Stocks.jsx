import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Box,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  EyeOff, // Fixed: Changed EyeSlash to EyeOff
} from "lucide-react";
import {
  listProducts,
  deleteProduct,
  updateProduct,
} from "../api/productsApi.js";
import adminApi from "../api/adminApi.js";

// Import reusable modals
import { ConfirmModal, ModalWrapper } from "../components/modal.jsx";

export default function Stocks() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Lock & Password States
  const [isTotalStockLocked, setIsTotalStockLocked] = useState(true);
  const [showPasswordVerify, setShowPasswordVerify] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showVerifyPass, setShowVerifyPass] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Thresholds
  const LOW_STOCK_THRESHOLD = 15;

  // Confirmation States
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProducts({ limit: 1000 });
      const apiData = res.data || res;
      const rawData = Array.isArray(apiData.data)
        ? apiData.data
        : Array.isArray(apiData)
        ? apiData
        : [];

      const normalized = rawData.map((p) => ({
        ...p,
        id: p.id || p.ID || p._id,
        stocks: Number(p.stock ?? 0),
        inStock: Number(p.inStock ?? 0),
      }));
      setProducts(normalized);
    } catch (err) {
      showToast("Failed to fetch inventory data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
  if (isEditModalOpen || showPasswordVerify) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [isEditModalOpen, showPasswordVerify]);


  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const profile = JSON.parse(localStorage.getItem("adminProfile") || "{}");
      const payload = {
        emailAddress: profile.email,
        password: verifyPassword,
      };

      const result = await adminApi.loginAdmin(payload);

      if (result?.accessToken || result?.token || result?.raw?.accessToken) {
        setIsTotalStockLocked(false);
        setShowPasswordVerify(false);
        setVerifyPassword("");
        showToast("Access Granted: Total Stocks unlocked");
      } else {
        showToast("Invalid credentials", "error");
        setVerifyPassword("");
      }
    } catch (err) {
      showToast("Verification failed", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      a.inStock <= LOW_STOCK_THRESHOLD && b.inStock > LOW_STOCK_THRESHOLD
        ? -1
        : 1
    );

  const handleUpdateAttempt = (e) => {
    e.preventDefault();
    setPendingUpdate(editingProduct);
  };

  const executeUpdate = async () => {
    try {
      await updateProduct(pendingUpdate.id, {
        stock: Number(pendingUpdate.stocks),
        inStock: Number(pendingUpdate.inStock),
      });
      setIsEditModalOpen(false);
      setIsTotalStockLocked(true);
      setPendingUpdate(null);
      fetchStocks();
      showToast("Inventory updated successfully!");
    } catch (err) {
      showToast(err.message || "Update failed", "error");
    }
  };

  const executeDelete = async () => {
    try {
      await deleteProduct(confirmDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setConfirmDelete(null);
      showToast("Product deleted successfully!");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };


  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
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
            className={`text-slate-300 cursor-pointer ${
              loading ? "animate-spin" : ""
            }`}
            size={20}
            onClick={fetchStocks}
          />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none w-80 shadow-sm focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase text-slate-400 font-black tracking-[0.15em] border-b border-gray-100">
              <th className="px-8 py-5 text-left">SKU</th>
              <th className="px-8 py-5 text-left">Product</th>
              <th className="px-8 py-5 text-center">Total Stocks</th>
              <th className="px-8 py-5 text-center">In Store</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((p) => {
              // RESTORED ORIGINAL COLORS
              const isOut = p.inStock <= 0;
              const isLow = p.inStock > 0 && p.inStock <= LOW_STOCK_THRESHOLD;

              let stockColorClass = "text-emerald-500";
              if (isOut) stockColorClass = "text-red-600";
              else if (isLow) stockColorClass = "text-amber-500";

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
                      <span className="font-bold text-[#1E293B] text-[13px] uppercase">
                        {p.name}
                      </span>
                      {isOut && (
                        <span className="flex items-center gap-1 text-[9px] text-red-500 font-black mt-1 uppercase tracking-tighter">
                          <AlertCircle size={10} strokeWidth={3} /> Out of Stock
                        </span>
                      )}
                      {isLow && (
                        <span className="flex items-center gap-1 text-[9px] text-amber-500 font-black mt-1 uppercase tracking-tighter">
                          <AlertCircle size={10} strokeWidth={3} /> Low Stock
                          Warning
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-[#1E293B] text-sm">
                    {p.stocks}
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-sm">
                    <span className={stockColorClass}>{p.inStock}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => {
                          const absolutePool =
                            Number(p.stocks) + Number(p.inStock);
                          setEditingProduct({
                            ...p,
                            absoluteTotal: absolutePool,
                          });
                          setIsTotalStockLocked(true);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p)}
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

      {/* EDIT MODAL */}
{isEditModalOpen && editingProduct && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 
  bg-slate-900/40 backdrop-blur-xl backdrop-saturate-150">
    <ModalWrapper 
      title="Inventory Adjustment" 
      onClose={() => setIsEditModalOpen(false)}
    >
      <form onSubmit={handleUpdateAttempt} className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total Stocks (Warehouse)
            </label>
            <div className="relative group">
              <input
                type="number"
                readOnly={isTotalStockLocked}
                value={editingProduct.stocks}
                onChange={(e) => {
                  const newStock = Number(e.target.value);
                  setEditingProduct({
                    ...editingProduct,
                    stocks: newStock,
                    absoluteTotal: newStock + Number(editingProduct.inStock),
                  });
                }}
                className={`w-full px-4 py-3 border rounded-xl font-bold transition-all outline-none ${
                  isTotalStockLocked
                    ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
                    : "bg-white text-slate-800 border-indigo-500 ring-4 ring-indigo-50 shadow-inner"
                }`}
              />
              <button
                type="button"
                onClick={() =>
                  isTotalStockLocked
                    ? setShowPasswordVerify(true)
                    : setIsTotalStockLocked(true)
                }
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all shadow-sm ${
                  isTotalStockLocked
                    ? "bg-white text-slate-400 hover:text-indigo-600 border border-slate-100"
                    : "bg-indigo-600 text-white shadow-lg"
                }`}
              >
                {isTotalStockLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
              Absolute Total Pool: {editingProduct.absoluteTotal}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Available In-Store *
            </label>
            <input
              type="number"
              required
              max={editingProduct.absoluteTotal}
              min="0"
              value={editingProduct.inStock === 0 ? "" : editingProduct.inStock}
              onChange={(e) => {
                const pool = Number(editingProduct.absoluteTotal);
                const newVal = Number(e.target.value);
                const limitedInStock = newVal > pool ? pool : newVal;
                setEditingProduct({
                  ...editingProduct,
                  inStock: limitedInStock,
                  stocks: pool - limitedInStock,
                });
              }}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase text-[10px] hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            Update Inventory
          </button>
        </div>
      </form>
    </ModalWrapper>
  </div>
)}

{/* VERIFICATION MODAL */}
{showPasswordVerify && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 
  bg-slate-900/30 backdrop-blur-xl backdrop-saturate-150">
    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 animate-in zoom-in-95 duration-200">
      <div className="text-center">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock size={24} />
        </div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
          Admin Verification
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          Enter password to unlock base stock editing
        </p>
      </div>
      <form onSubmit={handleVerifyPassword} className="space-y-4">
        <div className="relative">
          <input
            type={showVerifyPass ? "text" : "password"}
            autoFocus
            required
            placeholder="••••••••"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-center tracking-widest"
          />
          <button
            type="button"
            onClick={() => setShowVerifyPass(!showVerifyPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
          >
            {showVerifyPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPasswordVerify(false)}
            className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] hover:text-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isVerifying}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            {isVerifying ? "Verifying..." : "Verify Access"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* CONFIRM/TOAST */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete Product?"
          message={`Remove ${confirmDelete.name}?`}
          confirmText="Delete Now"
          variant="red"
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {pendingUpdate && (
        <ConfirmModal
          title="Save Changes?"
          message="Redistribute inventory counts?"
          confirmText="Yes, Update"
          variant="blue"
          onConfirm={executeUpdate}
          onCancel={() => setPendingUpdate(null)}
        />
      )}
      {toast.show && (
        <div className="fixed bottom-8 right-8 animate-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border bg-white ${
              toast.type === "success"
                ? "border-emerald-100 text-emerald-600"
                : "border-red-100 text-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="text-xs font-black uppercase tracking-tight">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
