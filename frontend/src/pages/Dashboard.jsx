import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";

// Use your existing API utilities to handle tokens and headers automatically
import { listProducts } from "../api/productsApi.js";
import { listSales } from "../api/salesApi.js";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    unitsSold: 0,
    lowStockCount: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const [prodRes, salesRes] = await Promise.all([
      listProducts({ limit: 1000 }),
      listSales(),
    ]);

    // Use empty arrays [] if data is missing or unauthorized
    const productList = Array.isArray(prodRes?.data) ? prodRes.data : [];
    const salesList = Array.isArray(salesRes) ? salesRes : (Array.isArray(salesRes?.data) ? salesRes.data : []);

    setStats({
      totalProducts: productList.length,
      totalSales: salesList.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0),
      unitsSold: salesList.length,
      lowStockCount: productList.filter(p => Number(p.inStock || 0) < 10).length,
    });
  } catch (err) {
    console.error("Fetch Error:", err);
  } finally {
    setLoading(false);
  }
};

  fetchDashboardData();
}, [navigate]);

  const cardConfig = [
    {
      title: "Total Product Items",
      value: stats.totalProducts,
      icon: <Package size={20} className="text-blue-500" />,
      path: "/products",
      color: "bg-blue-50",
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockCount,
      icon: <AlertTriangle size={20} className="text-red-500" />,
      path: "/stocks",
      color: "bg-red-50",
    },
    {
      title: "Total Sales (30 Days)",
      value: `₱${stats.totalSales.toLocaleString()}`,
      icon: <TrendingUp size={20} className="text-emerald-500" />,
      path: "/reports",
      color: "bg-emerald-50",
    },
    {
      title: "Units Sold (30 Days)",
      value: stats.unitsSold,
      icon: <ShoppingCart size={20} className="text-purple-500" />,
      path: "/sales",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">
          Welcome, Admin!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is what is happening with your inventory today.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.path)}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all flex justify-between items-center"
          >
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {card.title}
              </h3>
              <p className="text-2xl font-black text-slate-800">
                {loading ? "..." : card.value}
              </p>
            </div>
            <div className={`p-3 ${card.color} rounded-xl`}>{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CRITICAL INVENTORY */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-bold text-red-600 uppercase text-xs tracking-tight text-nowrap">
              Critical Inventory
            </h3>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-slate-400 text-[11px] italic text-nowrap">
                Checking stock levels...
              </p>
            ) : lowStockItems.length === 0 ? (
              <p className="text-slate-400 text-[11px] italic text-nowrap">
                No immediate low stock alerts. Inventory is healthy!
              </p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-slate-50 pb-2"
                  >
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      {item.name || "Product Item"}
                    </span>
                    <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      {item.inStock || item.stock || item.quantity} units left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT SALES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-tight text-nowrap">
                Recent Sales
              </h3>
            </div>
            <button
              onClick={() => navigate("/sales")}
              className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
            >
              View All
            </button>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-slate-400 text-[11px] italic text-nowrap">
                Loading transactions...
              </p>
            ) : recentSales.length === 0 ? (
              <p className="text-slate-400 text-[11px] italic text-nowrap">
                No recent sales recorded
              </p>
            ) : (
              <div className="space-y-6">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id || sale._id}
                    className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 uppercase">
                        {sale.productName || "Transaction"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {new Date(
                          sale.transactionDate || sale.createdAt
                        ).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      ₱
                      {(
                        Number(
                          sale.totalAmount || sale.price * sale.quantity
                        ) || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
