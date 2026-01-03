import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, TrendingUp, Package, ArrowRight } from "lucide-react";
import { getMonthlySalesSummary, getRestockSummary } from "../api/reports.js";

export default function Reports() {
  const navigate = useNavigate();

  const [monthlyReport, setMonthlyReport] = useState({
    totalSalesValue: 0,
    totalUnitsSold: 0,
    transactionCount: 0,
  });

  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const summary = await getMonthlySalesSummary();
        setMonthlyReport(summary);

        const lowStock = await getRestockSummary();
        setLowStockItems(Array.isArray(lowStock) ? lowStock : []);
      } catch (err) {
        console.error("Failed to load reports:", err);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          Monthly Business Report
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Summary Overview
        </p>
      </div>

      {/* CLICKABLE TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* MONTHLY SALES VALUE -> Navigates to MonthlySales.jsx */}
        <div
          onClick={() => navigate("/reports/monthly-sales")}
          className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#5147e3]/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-[#5147e3] transition-colors">
                <TrendingUp className="text-[#5147e3] group-hover:text-white w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Monthly Sales
              </span>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-[#5147e3] transition-colors"
            />
          </div>
          <div className="text-4xl font-black text-slate-800">
            ₱{monthlyReport.totalSalesValue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium italic">
            Click to view detailed sales logs
          </p>
        </div>

        {/* MONTHLY SOLD UNITS -> Navigates to MonthlySold.jsx */}
        <div
          onClick={() => navigate("/reports/monthly-sold")}
          className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-emerald-500/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-500 transition-colors">
                <Package className="text-emerald-500 group-hover:text-white w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Monthly Sold
              </span>
            </div>
            <ArrowRight
              size={14}
              className="text-slate-300 group-hover:text-emerald-500 transition-colors"
            />
          </div>
          <div className="text-4xl font-black text-slate-800">
            {monthlyReport.totalUnitsSold.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium italic">
            Click to view product trend analysis
          </p>
        </div>
      </div>

      {/* LOW STOCKS SECTION */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500 w-5 h-5" />
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-tight">
              Low Stocks ({lowStockItems.length} Items)
            </h2>
          </div>
          <button
            onClick={() => navigate("/stocks")}
            className="text-[10px] font-bold text-[#5147e3] uppercase tracking-wider flex items-center gap-1 hover:underline"
          >
            Manage Inventory <ArrowRight size={12} />
          </button>
        </div>

        <div className="p-0">
          {lowStockItems.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-flex p-3 bg-emerald-50 rounded-full mb-3">
                <Package className="text-emerald-500 w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                All stock levels are healthy!
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 text-left font-bold">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-center font-bold">Category</th>
                  <th className="px-6 py-4 text-right font-bold">In-Store</th>
                  <th className="px-6 py-4 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStockItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-red-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-700 uppercase">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs font-medium">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-red-600">
                      {item.inStock}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-[9px] font-black uppercase rounded-md">
                        Needs Restock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
