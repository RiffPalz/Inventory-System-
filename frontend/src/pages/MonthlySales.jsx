import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { Printer, Calendar, TrendingUp, Package, History } from "lucide-react";
import { getMonthlySalesSummary, getMonthlySalesList } from "../api/reports.js";

export default function MonthlySales() {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [summary, setSummary] = useState({
    totalSalesValue: 0,
    totalUnitsSold: 0,
    transactionCount: 0,
  });
  const [sales, setSales] = useState([]);

  // DYNAMIC YEAR LOGIC: Strictly 2025 to Current Year
  const years = useMemo(() => {
    const startYear = 2025;
    const arr = [];
    for (let y = currentYear; y >= startYear; y--) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summaryRes = await getMonthlySalesSummary(month, year);
        setSummary(summaryRes);

        const listRes = await getMonthlySalesList(month, year);

        // STRICT FILTER: Only show data exactly matching selected month and year
        const filteredList = (listRes || []).filter((s) => {
          const d = new Date(s.transactionDate);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        });

        setSales(filteredList);
      } catch (err) {
        console.error("Failed to load monthly sales:", err);
      }
    };
    fetchData();
  }, [month, year]);

  const chartOptions = {
    chart: { toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    colors: ["#5147e3"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    xaxis: {
      categories: sales.map((s) =>
        new Date(s.transactionDate).toLocaleDateString()
      ),
      labels: { style: { colors: "#94a3b8", fontSize: "10px" } },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₱${val.toLocaleString()}`,
        style: { colors: "#94a3b8", fontSize: "10px" },
      },
    },
    stroke: { curve: "smooth", width: 3 },
  };

  const chartSeries = [
    { name: "Revenue", data: sales.map((s) => Number(s.totalAmount)) },
  ];

  return (
    <main className="p-8 space-y-8">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="text-[#5147e3] w-5 h-5" /> Monthly Sales Log
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Viewing:{" "}
            {new Date(0, month - 1).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 shadow-sm">
            <Calendar size={14} className="text-slate-400 ml-2" />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent px-3 py-2 text-sm font-semibold outline-none text-slate-700 cursor-pointer"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <div className="h-4 w-px bg-gray-200 mx-1"></div>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent px-3 py-2 text-sm font-semibold outline-none text-slate-700 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-[#5147e3] text-white rounded-lg text-xs font-bold shadow-sm active:scale-[0.98] transition-all"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-[10px] font-bold text-[#5147e3] uppercase tracking-wider flex items-center gap-2 mb-2">
            <TrendingUp size={14} /> Total Revenue
          </div>
          <div className="text-2xl font-black text-slate-800">
            ₱{summary.totalSalesValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Package size={14} /> Units Sold
          </div>
          <div className="text-2xl font-black text-slate-800">
            {summary.totalUnitsSold.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2 mb-2">
            <History size={14} /> Transactions
          </div>
          <div className="text-2xl font-black text-slate-800">
            {summary.transactionCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* PERFORMANCE TREND */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-6 tracking-widest">
          Performance Trend
        </div>
        {sales.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={300}
          />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-300 italic text-sm border-2 border-dashed border-slate-50 rounded-lg">
            No trend data for{" "}
            {new Date(0, month - 1).toLocaleString("default", {
              month: "long",
            })}
          </div>
        )}
      </div>

      {/* TRANSACTION LIST */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Product</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-400 italic text-xs"
                >
                  No records found for this period.
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(s.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 uppercase">
                    {s.productName}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 font-medium">
                    {s.quantity}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    ₱{Number(s.totalAmount).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
