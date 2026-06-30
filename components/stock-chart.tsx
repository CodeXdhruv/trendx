"use client";

import { useEffect, useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui";
type Timeframe = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y";

const timeframes: Record<Timeframe, { interval: string; days: number }> = {
  "1D": { interval: "5m", days: 1 },
  "5D": { interval: "15m", days: 5 },
  "1M": { interval: "1d", days: 30 },
  "3M": { interval: "1d", days: 90 },
  "6M": { interval: "1d", days: 180 },
  "1Y": { interval: "1d", days: 365 },
  "2Y": { interval: "1wk", days: 730 },
  "5Y": { interval: "1wk", days: 1825 },
};

export function StockChart({ ticker, currentPrice, change, changePercent, volume = 0 }: { ticker: string, currentPrice: number, change: number, changePercent: number, volume?: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("2Y");

  useEffect(() => {
    setLoading(true);
    const tf = timeframes[activeTimeframe];
    const period1 = new Date(Date.now() - tf.days * 24 * 60 * 60 * 1000).toISOString();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';
    fetch(`${BACKEND_URL}/company/${ticker}/chart?interval=${tf.interval}&period1=${period1}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data && res.data.quotes) {
          const formatted = res.data.quotes.map((q: any) => {
            const date = new Date(q.date);
            return {
              rawDate: q.date,
              time: tf.days <= 5 ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
              fullDate: date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
              price: q.close
            };
          }).filter((q: any) => q.price !== null);
          setData(formatted);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ticker, activeTimeframe]);

  const isPositive = changePercent >= 0;
  const color = isPositive ? "var(--success)" : "var(--destructive)";
  const Icon = isPositive ? TrendingUp : TrendingDown;

  const min = data.length > 0 ? Math.min(...data.map(d => d.price)) : 0;
  const max = data.length > 0 ? Math.max(...data.map(d => d.price)) : 0;
  const buffer = (max - min) * 0.1;
  const startPrice = data.length > 0 ? data[0].price : currentPrice;

  return (
    <div className="w-full h-full flex flex-col relative rounded-2xl bg-[#EBEBEB] dark:bg-[#1A1A24] overflow-hidden p-6 border border-border shadow-md">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.4) 100%)' }}>
         {/* Simulate the light streaks in the background */}
         <div className="absolute top-0 left-1/4 w-1 h-64 bg-white blur-xl transform rotate-12"></div>
         <div className="absolute top-0 right-1/4 w-1 h-64 bg-white blur-xl transform -rotate-12"></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
             {ticker} <span className="font-mono text-xs font-normal text-muted-foreground normal-case">Live Market Tracker</span>
             {(() => {
               const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hourCycle: 'h23', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date());
               const day = parts.find(p => p.type === 'weekday')?.value;
               const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
               const min = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
               const t = hour * 60 + min;
               return (day === 'Sat' || day === 'Sun' || t < 570 || t >= 960) && <Badge variant="secondary" className="text-[10px] bg-muted-foreground/20">Market Closed</Badge>;
             })()}
           </h2>
           <div className="flex items-center gap-3 mt-1">
             <span className="text-4xl font-bold font-mono text-foreground">${currentPrice.toFixed(2)}</span>
             <span className={`text-sm font-bold flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
               <Icon className="w-4 h-4" /> {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
             </span>
           </div>
           <div className="text-xs font-mono text-muted-foreground mt-2 font-medium">
             Volume: {volume ? volume.toLocaleString() : '177,757,849'}
           </div>
        </div>
        
        <div className="flex items-center bg-background/50 backdrop-blur border border-border rounded-lg p-1">
           {(Object.keys(timeframes) as Timeframe[]).map((tf) => (
             <button
               key={tf}
               onClick={() => setActiveTimeframe(tf)}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTimeframe === tf ? 'bg-background shadow-sm text-foreground border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
             >
               {tf}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px] relative z-10">
        {loading && data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm animate-pulse">Loading chart data...</div>
        ) : data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No chart data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={true} horizontal={true} stroke="var(--border)" opacity={0.4} />
              <XAxis 
                dataKey="time" 
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                minTickGap={40}
                tickMargin={10}
              />
              <YAxis 
                domain={[min - buffer, max + buffer]} 
                orientation="right"
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                tickMargin={10}
                tickFormatter={(val) => val.toFixed(4)}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    const pctFromStart = ((p.price - startPrice) / startPrice) * 100;
                    const isPctPositive = pctFromStart >= 0;
                    return (
                      <div className="bg-background border border-border shadow-lg rounded-lg p-3">
                        <div className="text-xs text-muted-foreground font-medium mb-1">{p.fullDate} {p.time.includes(':') ? p.time : ''}</div>
                        <div className="text-lg font-bold font-mono">${p.price.toFixed(2)}</div>
                        <div className={`text-xs font-bold mt-1 ${isPctPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPctPositive ? '+' : ''}{pctFromStart.toFixed(2)}% from start
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                activeDot={{ r: 4, fill: "var(--background)", stroke: color, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
