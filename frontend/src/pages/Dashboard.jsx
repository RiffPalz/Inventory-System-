import Sidebar from "../components/sidebar.jsx";
import { useState } from "react";
import Chart from "react-apexcharts";
import { Search, Bell } from "lucide-react";

// ======= DATA =========
const topCards = [
  { label: "Total Products", value: "$5312.00" },
  { label: "Total In Stock", value: "$1304.00" },
  { label: "Low Stock Alerts", value: "$314.00" },
  { label: "Monthly Sales", value: "$50.00" },
];

// Apex pie data
const pieSeries = [400, 300, 300, 200, 200];
const pieOptions = {
  chart: { type: "donut", toolbar: { show: false } },
  labels: ["Earphones", "Laptop", "Smartphone", "Camera", "Tablet"],
  legend: { position: "bottom" },
  stroke: { width: 0 },
  colors: ["#7b3fe4", "#ff63d6", "#6b2bbd", "#9336f0", "#ff6b78"],
  responsive: [
    {
      breakpoint: 480,
      options: { chart: { width: 300 }, legend: { position: "bottom" } },
    },
  ],
};

// Apex bar data
const barOptions = {
  chart: { type: "bar", toolbar: { show: false } },
  plotOptions: { bar: { horizontal: false, columnWidth: "45%" } },
  dataLabels: { enabled: false },
  xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yaxis: { title: { text: "$ (thousands)" } },
  legend: { position: "top", horizontalAlign: "right" },
};

const barSeries = [
  { name: "Sales", data: [40, 55, 60, 55, 65, 60, 70] },
  { name: "Purchase", data: [80, 90, 110, 100, 90, 110, 95] },
];

export default function Dashboard() {
  const [collapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-4 pr-10 py-2 border rounded-md w-80"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2" size={16} />
          </div>

          <div className="flex items-center gap-6">
            <Bell />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-black/70 flex items-center justify-center text-white">JD</div>
              <span>John Doe</span>
            </div>
          </div>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCards.map((card) => (
            <div key={card.label} className="bg-white p-6 rounded-md shadow">
              <div className="text-xs text-gray-500">{card.label}</div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PIE CHART */}
          <div className="bg-white rounded-md shadow p-6">
            <h3 className="font-semibold mb-4">Top Selling Products (2025)</h3>
            <div className="h-72">
              <Chart options={pieOptions} series={pieSeries} type="donut" height={300} />
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white rounded-md shadow p-6">
            <h3 className="font-semibold mb-4">This Week's Sales & Purchases</h3>
            <div className="h-72">
              <Chart options={barOptions} series={barSeries} type="bar" height={320} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
