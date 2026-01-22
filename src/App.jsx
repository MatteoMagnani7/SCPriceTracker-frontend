import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EUR_USD_RATE = 0.92; // 1 USD = 0.92 EUR

export default function App() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [currency, setCurrency] = useState('USD'); // 'USD' o 'EUR'

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/prices');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) { setHistory([]); }
  };

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Polling automatico dalle 15:00 a 15:00:50 (ogni 5 secondi, 10 volte)
    const pollTimer = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Se siamo alle 15:00 e entro i 50 secondi
      if (hours === 15 && minutes === 0 && seconds <= 50) {
        fetchHistory();
      }
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

    // Se sono già passate le 15, il target è domani
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    setTimeLeft(`${h}h ${m}m ${s}s`);
  };

  const refreshPrice = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/scrape');
      const data = await res.json();
      setHistory(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const convertPrice = (priceStr) => {
    const numeric = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    return currency === 'EUR' ? (numeric * EUR_USD_RATE).toFixed(2) : numeric.toFixed(2);
  };

  const formatPrice = (priceStr) => {
    const converted = convertPrice(priceStr);
    return currency === 'EUR' ? `€${converted}` : `$${converted}`;
  };

  const chartData = [...history].reverse().map(item => ({
    ...item,
    numericPrice: parseFloat(convertPrice(item.price))
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-blue-900/30 bg-slate-900 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-xl font-black italic text-blue-500 uppercase tracking-tighter">SC Price Monitor</h1>
                <p className="text-[10px] text-slate-500 font-mono uppercase">Next Auto-Sync in: <span className="text-blue-400">{timeLeft}</span></p>
              </div>
              <button 
                onClick={refreshPrice}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2 rounded-full font-bold transition-all text-xs"
              >
                {loading ? 'SCRAPING...' : 'FORCE UPDATE'}
              </button>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} tickFormatter={(val) => currency === 'EUR' ? `€${val}` : `$${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ color: '#60a5fa' }} />
                  <Line type="monotone" dataKey="numericPrice" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl">
            <p className="text-blue-200 text-xs font-bold uppercase mb-2">Latest Price</p>
            <div className="text-5xl font-mono font-black text-white drop-shadow-md">
              {history[0] ? formatPrice(history[0].price) : '---'}
            </div>
            <div className="mt-6 w-full space-y-3">
              <div className="bg-black/20 rounded-lg py-2">
                <p className="text-[10px] uppercase text-blue-200 opacity-60">Scheduled Sync</p>
                <p className="text-sm font-bold text-white">Daily at 15:00</p>
              </div>
              <button
                onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}
                className="w-full bg-blue-500/30 hover:bg-blue-500/50 px-4 py-2 rounded-lg font-bold text-sm transition-colors text-blue-200"
              >
                {currency === 'EUR' ? '$ USD' : '€ EUR'}
              </button>
            </div>
          </div>
        </div>

        <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Price Logs</h3>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {history.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-slate-800/50 hover:border-blue-900/50 transition-colors">
                <span className="text-xs text-slate-500">{item.date}</span>
                <span className="font-mono text-blue-400 font-bold">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}