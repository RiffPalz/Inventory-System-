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
import { listProducts } from "../api/productsApi.js";

const CATEGORIES = [
  "PC Case",
  "HDD",
  "SSD",
  "Fan",
  "Cooler",
  "RAM",
  "Motherboard",
  "Processor",
  "Graphics Card",
  "Power Supply Unit",
];

export default function MonthlySold() {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [sales, setSales] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const startYear = 2025;
    return Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => currentYear - i
    );
  }, [currentYear]);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        listSales(),
        listProducts({ limit: 1000 }),
      ]);

      // ✅ SALES (array directly OR res.data)
      const salesList = Array.isArray(salesRes)
        ? salesRes
        : Array.isArray(salesRes?.data)
        ? salesRes.data
        : [];

      // ✅ PRODUCTS (FIXED PAGINATION)
      const productsList = Array.isArray(productsRes?.data?.data)
        ? productsRes.data.data
        : Array.isArray(productsRes?.data)
        ? productsRes.data
        : [];

      // ✅ productId → normalized category map
      const map = {};
      productsList.forEach((p) => {
        const key = String(p.ID ?? p.id ?? p._id);
        map[key] = p.category?.trim();
      });
      setProductsMap(map);

      // ✅ filter by month/year
      const filtered = salesList.filter((sale) => {
        const d = new Date(sale.transactionDate || sale.createdAt);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      setSales(filtered);
    } catch (err) {
      console.error("Failed to load monthly sold:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [month, year]);



 const categoryStats = useMemo(() => {
  // Normalize category keys
  const normalizedCategories = CATEGORIES.map((c) => c.trim().toLowerCase());

  const counts = Object.fromEntries(
    normalizedCategories.map((c) => [c, 0])
  );

  sales.forEach((sale) => {
    const qty = Number(sale.quantity) || 0;
    if (qty <= 0) return;

    const productKey = String(sale.productId ?? sale.productID);
    const rawCategory = productsMap[productKey];

    if (!rawCategory) return;

    const normalized = rawCategory.trim().toLowerCase();

    if (counts.hasOwnProperty(normalized)) {
      counts[normalized] += qty;
    }
  });

  // Map back to display labels
  const sorted = Object.entries(counts)
    .map(([key, value]) => [
      CATEGORIES.find((c) => c.toLowerCase() === key),
      value,
    ])
    .sort((a, b) => b[1] - a[1]);

  return {
    labels: sorted.map(([label]) => label),
    values: sorted.map(([, value]) => value),
  };
}, [sales, productsMap]);




  const chartOptions = {
    chart: {
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "35%", // Thinner bars to match the clean look in your image
        distributed: true,
        borderRadius: 4,
        dataLabels: {
          position: "top", // Labels at the end of the bar
        },
      },
    },
    colors: [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#3b82f6",
      "#94a3b8",
    ],
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 10, // Moves label slightly to the right of the bar end
      formatter: (v) => `${v} Units`,
      style: {
        fontSize: "11px",
        colors: ["#1e293b"], // Darker text for visibility outside/on top of bars
        fontWeight: 700,
      },
    },
    xaxis: {
      categories: categoryStats.labels,
      labels: {
        show: true,
        style: { colors: "#94a3b8", fontWeight: 600, fontSize: "10px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontWeight: 600, fontSize: "11px", colors: "#475569" },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      borderColor: "#f1f5f9",
      xaxis: { lines: { show: true } },
    },
    legend: { show: false }, // Hide legend to match clean UI
    tooltip: { theme: "light" },
  };

  return (
    <div className="p-10 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <BarChart3 className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Monthly Performance
            </h1>
            <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              <span>Inventory</span>
              <ChevronRight size={12} />
              <span className="text-indigo-600">
                {new Date(0, month - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </span>
            </nav>
          </div>
        </div>

        {/* DATE SELECTOR DROPDOWN */}
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
            <div className="px-3 text-slate-400">
              <Calendar size={14} />
            </div>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-transparent py-2 pr-4 text-sm font-black text-slate-700 outline-none cursor-pointer border-r border-slate-100"
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
              className="bg-transparent px-4 py-2 text-sm font-black text-slate-700 outline-none cursor-pointer"
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
            className="flex items-center gap-2 px-6 py-3 bg-[#5147e3] text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-lg font-black text-slate-800">
              Sales By Category
            </h3>
            <p className="text-sm text-slate-400 font-medium italic">
              Auto-sorted by quantity performance
            </p>
          </div>
          {loading && (
            <RefreshCw className="animate-spin text-indigo-600" size={20} />
          )}
        </div>

        {/* Always render the chart container. ApexCharts will handle 0 values.
            We use a larger height to accommodate all 10 categories comfortably.
        */}
        <div className="min-h-[550px] w-full">
          <Chart
            options={chartOptions}
            series={[{ name: "Units Sold", data: categoryStats.values }]}
            type="bar"
            height={550}
          />
        </div>
      </div>
    </div>
  );
}
