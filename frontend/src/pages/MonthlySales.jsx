import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  ArrowLeft,
  Download,
  Search,
  RefreshCw,
  Calendar,
  Layers,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";

// FIXED: Using listSales from salesApi as your primary data source
import { listSales } from "../api/salesApi.js";

export default function MonthlySales() {
  const navigate = useNavigate();
  const today = new Date();
  const CURRENT_YEAR = today.getFullYear();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState("all");

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const res = await listSales();
        const salesData = res.data || res;
        const salesList = Array.isArray(salesData.data)
          ? salesData.data
          : Array.isArray(salesData)
          ? salesData
          : [];
        setSales(salesList);
      } catch (err) {
        console.error("Failed to fetch sales logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const date = new Date(s.transactionDate || s.createdAt);
      const matchYear = date.getFullYear() === year;
      const matchMonth = month === "all" ? true : date.getMonth() === month;
      const matchSearch =
        s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchYear && matchMonth && matchSearch;
    });
  }, [sales, year, month, searchTerm]);

  const totalRevenue = filteredSales.reduce(
    (sum, s) => sum + (Number(s.totalAmount) || 0),
    0
  );
  const unitsSold = filteredSales.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0),
    0
  );
  const transactionCount = filteredSales.length;

  /* ================= FIXED: barSeries DEFINITION ================= */
  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    sales.forEach((sale) => {
      const date = new Date(sale.transactionDate || sale.createdAt);
      if (date.getFullYear() === year) {
        totals[date.getMonth()] += Number(sale.totalAmount) || 0;
      }
    });
    return totals;
  }, [sales, year]);

  const barSeries = [{ name: "Revenue", data: monthlyTotals }];

  const barOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "35%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: { style: { colors: "#94a3b8", fontWeight: 600 } },
    },
    yaxis: { labels: { formatter: (val) => `₱${val.toLocaleString()}` } },
    colors: ["#4F46E5"],
    tooltip: { y: { formatter: (val) => `₱${val.toLocaleString()}` } },
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/reports")}
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Monthly Sales Log
            </h1>
            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-0.5">
              <span>Reports</span>
              <ChevronRight size={12} />
              <span className="text-indigo-600">Sales History</span>
            </nav>
          </div>
        </div>

        <button 
  onClick={() => window.print()}
  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 print:hidden"
>
  <Download size={16} />
  Print Monthly Sales
</button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400 mb-1">
              Total Revenue
            </p>
            <h2 className="text-3xl font-black text-slate-800">
              ₱{totalRevenue.toLocaleString()}
            </h2>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <CreditCard size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400 mb-1">
              Units Sold
            </p>
            <h2 className="text-3xl font-black text-slate-800">{unitsSold}</h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Layers size={20} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400 mb-1">
              Transactions
            </p>
            <h2 className="text-3xl font-black text-slate-800">
              {transactionCount}
            </h2>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white border border-slate-100 shadow-sm p-8">
        <Chart
          options={barOptions}
          series={barSeries}
          type="bar"
          height={350}
        />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col xl:flex-row gap-6 items-center justify-between">
          <div className="relative w-full xl:w-96">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product or ID..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* THE NEW MONTH DROPDOWN */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 shadow-sm">
              <select
                value={month}
                onChange={(e) =>
                  setMonth(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="py-3 text-sm font-bold text-slate-700 outline-none cursor-pointer bg-transparent"
              >
                <option value="all">All Months</option>
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none"
            >
              {[2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y} 
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Reference</th>
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5 text-center">Qty</th>
                <th className="px-8 py-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id || sale.transactionId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">
                    {new Date(
                      sale.transactionDate || sale.createdAt
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-mono text-[11px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                      #{sale.transactionId?.slice(-8)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800 uppercase tracking-tight">
                    {sale.productName}
                  </td>
                  <td className="px-8 py-5 text-center font-bold text-slate-600">
                    {sale.quantity}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-800 text-sm">
                    ₱{Number(sale.totalAmount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
