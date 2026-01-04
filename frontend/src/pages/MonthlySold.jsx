import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import {
  Printer,
  RefreshCw,
  BarChart3,
  ChevronRight,
  Calendar,
  Package,
} from "lucide-react";
import { listSales } from "../api/salesApi.js";

export default function MonthlySold() {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  // Year range (2025 → current)
  const years = useMemo(() => {
    const arr = [];
    for (let y = currentYear; y >= 2025; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  /**
   * FETCH SALES (BACKEND SOURCE OF TRUTH)
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await listSales();
        const raw = res?.data || res || [];
        const salesList = Array.isArray(raw.data) ? raw.data : raw;

        const filtered = salesList.filter((sale) => {
          const d = new Date(sale.transactionDate || sale.createdAt);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        });

        setSales(filtered);
      } catch (err) {
        console.error("Failed to load sales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  /**
   * CATEGORY AGGREGATION (NO FRONTEND GUESSING)
   */
  const categoryStats = useMemo(() => {
    const counts = {};

    sales.forEach((sale) => {
      const qty = Number(sale.quantity || 0);
      const category = sale.category?.trim();

      if (!category || qty <= 0) return;

      counts[category] = (counts[category] || 0) + qty;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return {
      labels: sorted.map(([label]) => label),
      values: sorted.map(([, value]) => value),
    };
  }, [sales]);

  /**
   * CHART OPTIONS
   */
  const chartOptions = {
    chart: {
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "70%",
        distributed: true,
        borderRadius: 10,
        dataLabels: { position: "center" },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: 800,
        colors: ["#ffffff"],
      },
      formatter: (val) => `${val} units`,
    },
    xaxis: {
      categories: categoryStats.labels,
      labels: {
        style: {
          colors: "#94a3b8",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 700,
          colors: "#1e293b",
        },
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "light",
    },
  };

  return (
    <div className="p-10 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl">
            <BarChart3 className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Monthly Performance
            </h1>
            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              <span>Inventory</span>
              <ChevronRight size={12} />
              <span className="text-indigo-600">Distribution</span>
            </nav>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5">
            <Calendar size={14} className="mx-3 text-slate-400" />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent py-2 pr-4 text-sm font-black outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-transparent px-4 py-2 text-sm font-black outline-none cursor-pointer"
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
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg active:scale-95"
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-lg font-black text-slate-800">
              Sales by Category
            </h3>
            <p className="text-sm text-slate-400 italic">
              Data sourced directly from sales records
            </p>
          </div>
          {loading && (
            <RefreshCw className="text-indigo-500 animate-spin" size={20} />
          )}
        </div>

        {categoryStats.values.length > 0 ? (
          <Chart
            options={chartOptions}
            series={[{ name: "Units Sold", data: categoryStats.values }]}
            type="bar"
            height={550}
          />
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
            <Package size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-bold uppercase tracking-widest">
              {loading ? "Loading data..." : "No sales data for this period"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
