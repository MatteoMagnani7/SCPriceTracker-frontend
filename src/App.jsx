import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// as today 1 January 2026
const EUR_USD_RATE = 0.84;

export default function App() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [range, setRange] = useState("MAX");

  const fetchHistory = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(calculateTimeLeft, 1000);
    const pollTimer = setInterval(() => {
      const now = new Date();
      if (
        now.getHours() === 15 &&
        now.getMinutes() === 0 &&
        now.getSeconds() <= 50
      )
        fetchHistory();
    }, 5000);
    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, []);

  const calculateTimeLeft = () => {
    const now = new Date();
    let target = new Date();
    target.setHours(15, 0, 0, 0);
    if (now > target) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    setTimeLeft(`${h}h ${m}m ${s}s`);
  };

  const convertPrice = (priceStr) => {
    const numeric = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
    return currency === "EUR"
      ? (numeric * EUR_USD_RATE).toFixed(2)
      : numeric.toFixed(2);
  };

  const formatPrice = (priceStr) => {
    const converted = convertPrice(priceStr);
    return currency === "EUR" ? `€${converted}` : `$${converted}`;
  };

  const chartData = [...history]
    .map((item) => ({
      ...item,
      timestamp: Number(item.id),
      numericPrice: parseFloat(convertPrice(item.price)),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const latestPriceStr = history[0]?.price || "0.00";
  const allTimeLow =
    history.length > 0
      ? Math.min(
          ...history.map((h) => parseFloat(h.price.replace(/[^0-9.]/g, ""))),
        )
      : 0;

  const filteredChartData = chartData.filter((item) => {
    if (range === "MAX") return true;

    const now = Date.now();
    const diffDays = (now - item.timestamp) / (1000 * 60 * 60 * 24);

    if (range === "7D") return diffDays <= 7;
    if (range === "30D") return diffDays <= 30;
    if (range === "6M") return diffDays <= 180;
    if (range === "1Y") return diffDays <= 365;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white font-sans selection:bg-blue-500/30 relative">
      {/* BACKGROUND IMAGE CON SFUMATURA */}
      <div className="absolute top-0 left-0 w-full h-150 overflow-hidden z-0">
        <img
          src="background_image.jpg"
          className="w-full h-full object-cover opacity-50"
          alt="background"
        />
        {/* Maschera Gradiente: sfuma verso il basso e verso i lati */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a0c10]/60 to-[#0a0c10]"></div>
        <div className="absolute inset-0 bg-linear-to-r from-[#0a0c10] via-transparent to-[#0a0c10]"></div>
      </div>

      <div className="relative z-10 p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HERO SECTION (Svuotata del background solido per mostrare lo sfondo) */}
          <div className="relative overflow-hidden rounded-3xl bg-white/3 backdrop-blur-md border border-white/10 p-8 md:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest ">
                {loading ? "Updating..." : "Lowest price this month"}
              </span>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-lg mt-4 md:mt-0">
                  Citizen Starter Pack
                </h1>
                <p className="text-slate-300 text-sm font-medium">
                  Star Citizen • Roberts Space Industries • Game Package
                </p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() =>
                      setCurrency(currency === "USD" ? "EUR" : "USD")
                    }
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-bold transition-all border border-white/10"
                  >
                    View in {currency === "USD" ? "EUR" : "USD"}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                  Current Best Price
                </p>
                <div className="text-6xl md:text-8xl font-black text-[#2b65ff] tracking-tighter drop-shadow-[0_0_25px_rgba(43,101,255,0.5)]">
                  {formatPrice(latestPriceStr)}
                </div>
              </div>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#11141b]/80 backdrop-blur-sm border border-white/5 p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">
                  All-time Low
                </p>
                <p className="text-xl font-bold">
                  {currency === "EUR"
                    ? `€${(allTimeLow * EUR_USD_RATE).toFixed(2)}`
                    : `$${allTimeLow.toFixed(2)}`}
                </p>
              </div>
            </div>

            <div className="bg-[#11141b]/80 backdrop-blur-sm border border-white/5 p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">
                  Next Update In
                </p>
                <p className="text-xl font-bold font-mono tracking-tight">
                  {timeLeft}
                </p>
              </div>
            </div>

            <div className="bg-[#11141b]/80 backdrop-blur-sm border border-white/5 p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">
                  Status
                </p>
                <p className="text-xl font-bold text-green-400">
                  Monitoring Active
                </p>
              </div>
            </div>
          </div>

          {/* CHARTS & HISTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            <div className="lg:col-span-2 bg-[#11141b] border border-white/5 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold flex items-center gap-2 uppercase text-sm tracking-widest text-slate-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Price Trend
                </h3>

                <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                  {["7D", "30D", "6M", "1Y", "MAX"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        range === r
                          ? "bg-blue-600 text-white shadow-lg"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredChartData}>
                    <defs>
                      <linearGradient
                        id="colorPrice"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2b65ff"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2b65ff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ffffff"
                      opacity={0.05}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      hide
                    />

                    <YAxis
                      domain={["auto", "auto"]}
                      stroke="#475569"
                      fontSize={10}
                      tickFormatter={(v) =>
                        currency === "EUR" ? `€${v}` : `$${v}`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#11141b",
                        border: "1px solid #ffffff10",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ color: "#2b65ff" }}
                    />
                    <Area
                      key={range} // Questa chiave forza Recharts a ridisegnare quando il range cambia
                      type="monotone"
                      dataKey="numericPrice"
                      stroke="#2b65ff"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#11141b] border border-white/5 rounded-3xl p-8 overflow-hidden">
              <h3 className="font-bold uppercase text-sm tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Recent History
              </h3>
              <div className="space-y-4 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {history.slice(0, 50).map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5"
                  >
                    <div>
                      <p className="text-xs font-bold text-white uppercase">
                        {idx === 0 ? "Latest" : "Previous"}
                      </p>
                      <p className="text-[10px] text-slate-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-blue-400">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
