import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, TrendingUp, Package, ArrowRight } from "lucide-react";

import { listSales } from "../api/salesApi.js";
import { listProducts } from "../api/productsApi.js";

export default function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [monthlyReport, setMonthlyReport] = useState({
    totalSalesValue: 0,
    totalUnitsSold: 0,
    transactionCount: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        /* ================= SALES (SYNCED WITH DASHBOARD) ================= */
        const salesRes = await listSales();
        const salesData = salesRes.data || salesRes;

        const salesList = Array.isArray(salesData.data)
          ? salesData.data
          : Array.isArray(salesData)
          ? salesData
          : [];

        setMonthlyReport({
          totalSalesValue: salesList.reduce(
            (sum, s) => sum + (Number(s.totalAmount) || 0),
            0
          ),
          totalUnitsSold: salesList.length,
          transactionCount: salesList.length,
        });

        /* ================= PRODUCTS ================= */
        const prodRes = await listProducts({ limit: 1000 });
        const prodData = prodRes.data || prodRes;

        const productList = Array.isArray(prodData.data)
          ? prodData.data
          : Array.isArray(prodData)
          ? prodData
          : [];

        /* ================= LOW / OUT OF STOCK ================= */
        const lowStock = productList.filter(
          (p) => Number(p.inStock || 0) <= 10 && Number(p.inStock || 0) > 0
        );

        const outOfStock = productList.filter(
          (p) => Number(p.inStock || 0) === 0
        );

        setLowStockItems(lowStock);
        setOutOfStockItems(outOfStock);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="p-10 space-y-10 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-black text-slate-800">
          Monthly Business Report
        </h1>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em]">
          Summary Overview
        </span>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MONTHLY SALES */}
        <div
          onClick={() => navigate("/reports/monthly-sales")}
          className="group bg-white rounded-2xl border border-slate-100 shadow-sm
          hover:shadow-md transition-all cursor-pointer"
        >
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <TrendingUp className="text-indigo-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Monthly Sales
                </p>
                <h2 className="text-4xl font-black text-slate-900 mt-2">
                  ₱{monthlyReport.totalSalesValue.toLocaleString()}
                </h2>
                <p className="text-xs text-slate-400 mt-2 italic">
                  Click to view detailed sales logs
                </p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>

        {/* MONTHLY SOLD */}
        <div
          onClick={() => navigate("/reports/monthly-sold")}
          className="group bg-white rounded-2xl border border-slate-100 shadow-sm
          hover:shadow-md transition-all cursor-pointer"
        >
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Package className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Monthly Sold
                </p>
                <h2 className="text-4xl font-black text-slate-900 mt-2">
                  {monthlyReport.totalUnitsSold.toLocaleString()}
                </h2>
                <p className="text-xs text-slate-400 mt-2 italic">
                  Click to view product trend analysis
                </p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* LOW + OUT OF STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LOW STOCK */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle size={16} />
              <span className="text-xs font-black uppercase tracking-widest">
                Low Stocks ({lowStockItems.length} items)
              </span>
            </div>
            <button
              onClick={() => navigate("/stocks")}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Manage Inventory →
            </button>
          </div>

          <div className="p-6 space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">
                All low stock items are handled.
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl
                  border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-black uppercase
                    bg-red-50 text-red-600"
                  >
                    {item.inStock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* OUT OF STOCK */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-2 text-slate-500">
            <Package size={16} />
            <span className="text-xs font-black uppercase tracking-widest">
              Out of Stock ({outOfStockItems.length} items)
            </span>
          </div>

          <div className="p-6 space-y-3">
            {outOfStockItems.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">
                No out-of-stock items 🎉
              </p>
            ) : (
              outOfStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl
                  border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-black uppercase
                    bg-slate-100 text-slate-600"
                  >
                    Out
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
