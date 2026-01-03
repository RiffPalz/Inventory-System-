import { useState, useEffect } from "react";
import { TrendingDown, History, Box, Lock, Printer } from "lucide-react";
import { listProducts } from "../api/productsApi.js";
import { createSale, listSales } from "../api/salesApi.js";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxAvailable, setMaxAvailable] = useState(0);
  const [salesHistory, setSalesHistory] = useState([]);
  const [showQtyWarning, setShowQtyWarning] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    unitPrice: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Updated to use defensive array checking
        const prodResult = await listProducts({ limit: 1000 });
        const rawProducts = Array.isArray(prodResult?.data) ? prodResult.data : [];
        
        setProducts(
          rawProducts.map((p) => ({
            ...p,
            id: p.id || p.ID || p._id, // Ensure consistent ID
            inStock: Number(p.inStock) || 0,
            price: Number(p.price) || 0,
          }))
        );

        const historyData = await listSales();
        // Check if historyData is an array or contains an array in .data
        const rawHistory = Array.isArray(historyData) ? historyData : (Array.isArray(historyData?.data) ? historyData.data : []);
        setSalesHistory(rawHistory);
        
      } catch (err) {
        console.error("Sales fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrint = () => window.print();

  const handleProductChange = (e) => {
    const productId = Number(e.target.value);
    const selected = products.find((p) => p.id === productId);

    if (!selected) {
      setFormData((s) => ({
        ...s,
        productId: "",
        quantity: "",
        unitPrice: "",
      }));
      setMaxAvailable(0);
      setShowQtyWarning(false);
      return;
    }

    setMaxAvailable(selected.inStock);
    setShowQtyWarning(false);
    setFormData((s) => ({
      ...s,
      productId,
      unitPrice: selected.price,
      quantity: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) {
      alert("All fields are required");
      return;
    }
    if (Number(formData.quantity) > maxAvailable) {
      setShowQtyWarning(true);
      return;
    }
    try {
      const payload = {
        invoiceNumber: `INV-${Date.now()}`,
        productId: Number(formData.productId),
        quantity: Number(formData.quantity),
        price: Number(formData.unitPrice),
        transactionDate: formData.transactionDate,
      };
      const result = await createSale(payload);
      setSalesHistory((prev) => [result, ...prev]);
      setFormData({
        productId: "",
        quantity: "",
        unitPrice: "",
        transactionDate: new Date().toISOString().split("T")[0],
      });
      setMaxAvailable(0);
      setShowQtyWarning(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record sale");
    }
  };

  const currentTotal =
    Number(formData.quantity || 0) * Number(formData.unitPrice || 0);

  return (
    <div className="p-8 space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start print:hidden">
        {/* RECORD SALE SECTION */}
        <div className="lg:col-span-5">
          <h1 className="flex items-center gap-2 text-[#1e293b] text-base font-semibold mb-4 tracking-tight">
            <TrendingDown className="text-red-500 w-4 h-4" /> Record New Sale
          </h1>
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </label>
                <select
                  value={formData.productId}
                  onChange={handleProductChange}
                  disabled={loading}
                  className="w-full mt-1.5 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm outline-none focus:border-blue-300"
                >
                  <option value="">Select a product</option>
                  {products
                    .filter((p) => p.inStock > 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col h-full justify-between">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    disabled={!formData.productId}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > maxAvailable) {
                        setFormData({ ...formData, quantity: maxAvailable });
                        setShowQtyWarning(true);
                      } else {
                        setFormData({ ...formData, quantity: e.target.value });
                        setShowQtyWarning(false);
                      }
                    }}
                    className="w-full mt-1.5 px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-300"
                  />
                  <div className="mt-1 ml-1 flex flex-col justify-start">
                    <p className="text-[10px] text-slate-400">
                      Available: {maxAvailable}
                    </p>
                    {showQtyWarning && (
                      <p className="text-[10px] text-red-500">
                        Max is {maxAvailable}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col h-full justify-start">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                    Price <Lock size={10} className="text-gray-300" />
                  </label>
                  <input
                    readOnly
                    value={
                      formData.unitPrice
                        ? `₱${Number(formData.unitPrice).toLocaleString()}`
                        : ""
                    }
                    className="w-full mt-1.5 px-3 py-2 border border-gray-100 rounded-md bg-gray-50/50 text-gray-600 font-medium text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionDate: e.target.value,
                    })
                  }
                  className="w-full mt-1.5 px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-300"
                />
              </div>

              <div className="pt-4 space-y-4 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Amount
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-800">₱</span>
                    <span className="text-xl font-bold text-slate-800">
                      {currentTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5147e3] hover:bg-[#3f36d1] active:bg-[#372eb8] text-white text-sm font-semibold rounded-md transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] focus:ring-2 focus:ring-[#5147e3]/50 focus:outline-none"
                >
                  Complete Sale
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* STOCK ITEMS SECTION */}
        <div className="lg:col-span-7">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#1e293b] mb-4 tracking-tight">
            <Box className="text-blue-500 w-4 h-4" /> Stock Items (
            {products.length})
          </h2>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3 text-left font-semibold">
                    Name / SKU
                  </th>
                  <th className="px-6 py-3 text-center font-semibold">
                    In Stock
                  </th>
                  <th className="px-6 py-3 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const isOutOfStock = p.inStock <= 0;
                  const isLowStock = p.inStock > 0 && p.inStock <= 10;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 text-[13px]">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          SKU: {p.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`font-bold text-[14px] ${
                            isOutOfStock
                              ? "text-red-500"
                              : isLowStock
                              ? "text-amber-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {p.inStock}
                        </div>
                        <div
                          className={`text-[9px] font-medium uppercase tracking-tight ${
                            isOutOfStock
                              ? "text-red-400"
                              : isLowStock
                              ? "text-amber-400"
                              : "text-slate-300"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : isLowStock
                            ? "Low Stock"
                            : "In Stock"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700 text-[13px]">
                        ₱{p.price.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SALES HISTORY SECTION */}
      <div className="pt-8 border-t border-gray-100 print:pt-0 print:border-none">
        <div className="flex justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#1e293b] tracking-tight">
            <History className="w-4 h-4 text-gray-500" /> Sales History
          </h2>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-[#5147e3] hover:bg-[#3f36d1] active:bg-[#372eb8] text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-[0.98] focus:ring-2 focus:ring-[#5147e3]/50 focus:outline-none print:hidden text-sm"
          >
            <Printer size={18} /> Print Sales Report
          </button>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] text-gray-400 uppercase border-b border-gray-100 tracking-wider">
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Item</th>
                <th className="px-6 py-3 text-center font-semibold">Qty</th>
                <th className="px-6 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {salesHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-400 text-xs italic"
                  >
                    No transactions recorded yet
                  </td>
                </tr>
              ) : (
                salesHistory.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 text-[12px]">
                      {new Date(s.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 text-[12px] uppercase">
                      {s.productName}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 text-[12px]">
                      {s.quantity}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800 text-[12px]">
                      ₱{Number(s.totalAmount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
