import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { Printer, Package } from "lucide-react"; // Removed Calendar as it was unused
import { getMonthlySalesList } from "../api/reports.js"; // Removed summary import as it was unused

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

  const years = useMemo(() => {
    const startYear = 2025;
    const arr = [];
    for (let y = currentYear; y >= startYear; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listRes = await getMonthlySalesList(month, year);
        const filteredList = (listRes || []).filter((s) => {
          const d = new Date(s.transactionDate);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        });
        setSales(filteredList);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };
    fetchData();
  }, [month, year]);

  const sortedCategoryData = useMemo(() => {
    const counts = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {});

    sales.forEach((sale) => {
      let categoryMatch = CATEGORIES.find(
        (cat) =>
          (sale.category &&
            cat.toLowerCase() === sale.category.trim().toLowerCase()) ||
          (sale.productName &&
            sale.productName
              .toLowerCase()
              .includes(cat.toLowerCase().split(" ")[0]))
      );

      if (!categoryMatch && sale.productName?.toLowerCase().includes("case")) {
        categoryMatch = "PC Case";
      }

      if (categoryMatch) {
        counts[categoryMatch] += Number(sale.quantity);
      }
    });

    const sortedArray = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedArray.map((item) => item[0]),
      values: sortedArray.map((item) => item[1]),
    };
  }, [sales]);

  const chartOptions = {
    chart: { toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "75%",
        distributed: true,
        borderRadius: 4,
        dataLabels: { position: "center" },
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
      "#f43f5e",
      "#14b8a6",
      "#3b82f6",
    ],
    dataLabels: {
      enabled: true,
      textAnchor: "middle",
      style: {
        fontSize: "12px",
        fontWeight: 800,
        colors: ["#FFFFFF", "#000000"],
      },
      dropShadow: { enabled: false },
      formatter: (val) => (val > 0 ? `${val} units` : ""),
    },
    xaxis: {
      categories: sortedCategoryData.labels,
      labels: { style: { colors: "#94a3b8", fontSize: "10px" } },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px", fontWeight: 700, colors: "#1e293b" },
      },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    tooltip: { theme: "light" },
  };

  return (
    <main className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-emerald-500 w-5 h-5" /> Trending Categories
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Ranked performance for{" "}
            {new Date(0, month - 1).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 shadow-sm">
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

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-8 tracking-widest flex justify-between">
          <span>Best Selling Categories</span>
          <span className="text-emerald-500">Auto-Sorted by Quantity</span>
        </div>
        {sales.length > 0 ? (
          <Chart
            options={chartOptions}
            series={[{ name: "Units", data: sortedCategoryData.values }]}
            type="bar"
            height={550}
          />
        ) : (
          <div className="h-[400px] flex items-center justify-center text-slate-300 italic text-sm border-2 border-dashed border-slate-50 rounded-lg">
            No data for this period.
          </div>
        )}
      </div>
    </main>
  );
}
