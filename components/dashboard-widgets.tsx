"use client";
import { TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FinancialSnapshot as TFinancialSnapshot } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui";
import { useApi } from "@/hooks/useApi";


export function FinancialSnapshot({ data }: { data: TFinancialSnapshot }) {
  const renderMetric = (key: string, metric: any) => {
    const isPositive = metric.trend === 'up';
    return (
      <div key={key} className="flex flex-col">
        <span className="text-xs text-muted-foreground mb-1">{metric.label}</span>
        <span className="text-xl font-bold font-mono mb-1">{metric.value}</span>
        <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? '+' : ''}{metric.changePercent}% YoY
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
      {Object.entries(data).map(([key, metric]) => renderMetric(key, metric))}
      
      <div className="md:col-span-4 flex justify-end mt-2">
        <button className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1">
          View All Financials <span className="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

export function MarketMood() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold mb-6">Market Mood</h3>
      
      <div className="space-y-8">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Overall Market Sentiment</div>
          <div className="flex justify-between items-start">
            <div className="text-xl font-bold text-primary">Bullish</div>
            <div className="w-16 h-16 relative flex items-center justify-center overflow-hidden">
               {/* Simplified Bull representation */}
               <TrendingUp className="w-12 h-12 text-foreground" />
            </div>
          </div>
          <div className="h-10 mt-2 w-full">
            <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
              <path d="M0,20 L10,15 L20,25 L30,10 L40,15 L50,5 L60,15 L70,10 L80,5 L90,10 L100,0" fill="none" stroke="var(--primary)" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Fear & Greed Index</div>
            <div className="font-semibold text-primary">Greed</div>
          </div>
          <div className="transform scale-75 origin-right">
            <ScoreGauge score={72} />
          </div>
        </div>
      </div>
    </div>
  );
}

const timePeriods = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

export function PriceChart({ data }: { data: any[] }) {
  const [activeTab, setActiveTab] = useState("1M");

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border shadow-Elevated rounded-lg p-2 text-sm">
                      <div className="font-mono font-bold">${Number(payload[0].value).toFixed(2)}</div>
                      <div className="text-muted-foreground text-xs">{payload[0].payload.date}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mt-6 bg-muted/30 p-1 rounded-xl w-full max-w-sm mx-auto">
        {timePeriods.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors z-10 ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {isActive && (
                <motion.div
                  layoutId="activeTimePeriod"
                  className="absolute inset-0 bg-card border border-border rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ScoreGauge({ score, max = 100 }: { score: number; max?: number }) {
  const percentage = (score / max) * 100;
  // Map percentage 0-100 to angle -90 to 90
  const rotation = -90 + (percentage / 100) * 180;
  
  // SVG arc calculation for semi-circle
  const radius = 40;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-24 flex flex-col items-center justify-end overflow-hidden">
      <svg className="absolute top-0 w-full h-32" viewBox="0 0 100 50" preserveAspectRatio="xMidYMax meet">
        {/* Background Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <motion.path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Needle Placeholder (Using simple lines or a path) */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 50, damping: 10, delay: 0.2 }}
          style={{ originX: "50%", originY: "100%" }}
        >
          <path d="M 48 50 L 50 15 L 52 50 Z" fill="var(--foreground)" />
          <circle cx="50" cy="50" r="4" fill="var(--foreground)" />
        </motion.g>
      </svg>
      <div className="absolute bottom-0 text-center pb-2">
        <div className="text-2xl font-bold font-mono">
          <AnimatedNumber value={score} format="number" />
          <span className="text-sm text-muted-foreground ml-1">/ {max}</span>
        </div>
      </div>
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  format?: "currency" | "percent" | "number";
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  format = "number",
  duration = 1200,
  prefix = "",
  suffix = ""
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  const display = useTransform(springValue, (current) => {
    let formatted = current.toFixed(format === "number" ? 0 : 2);
    if (format === "currency") {
      formatted = parseFloat(formatted).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (format === "percent" || format === "number") {
      formatted = parseFloat(formatted).toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
    return `${prefix}${formatted}${suffix}`;
  });

  return <motion.span>{display}</motion.span>;
}

export function WatchlistPanel() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getWatchlist } = useApi();

  useEffect(() => {
    getWatchlist()
      .then((data) => {
        // Handle if data is array or wrapped in an object
        setWatchlist(Array.isArray(data) ? data : data.watchlist || []);
      })
      .catch((err) => console.error("Failed to load watchlist", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">Watchlist</h3>
        <Link href="/watchlist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
        ) : watchlist.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No stocks in watchlist</div>
        ) : (
          watchlist.map((item) => {
            const isPositive = item.changePercent >= 0 || item.trend === 'up';
            return (
              <div key={item.ticker} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center">
                    <span className="text-background text-[10px] font-bold">{item.ticker?.substring(0, 1)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm group-hover:text-primary transition-colors">{item.ticker}</div>
                    <div className="text-xs text-muted-foreground">{item.name || "Company"}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-8 hidden sm:block">
                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                      <path 
                        d="M0,20 L20,25 L40,15 L60,20 L80,5 L100,10" 
                        fill="none" 
                        stroke={isPositive ? "var(--success)" : "var(--danger)"} 
                        strokeWidth="2" 
                      />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">${Number(item.price || 0).toFixed(2)}</div>
                    <div className={`text-xs ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {isPositive ? '+' : ''}{Number(item.changePercent || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

