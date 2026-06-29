"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis } from "recharts";

export function MiniMarketChart({ ticker, color }: { ticker: string; color: string }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';
    fetch(`${BACKEND_URL}/company/${encodeURIComponent(ticker)}/chart?interval=5m&range=1d`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data && res.data.quotes) {
          const formatted = res.data.quotes.map((q: any) => {
            const date = new Date(q.date);
            return {
              time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              price: q.close
            };
          }).filter((q: any) => q.price !== null);
          setData(formatted);
        }
      })
      .catch(console.error);
  }, [ticker]);

  if (data.length === 0) {
    return <div className="h-full w-full animate-pulse bg-muted/30 rounded-md" />;
  }

  const min = Math.min(...data.map(d => d.price));
  const max = Math.max(...data.map(d => d.price));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${ticker.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Tooltip
          cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const p = payload[0].payload;
              return (
                <div className="bg-background border border-border shadow-md rounded p-1.5 z-50">
                  <div className="text-[10px] text-muted-foreground font-medium">{p.time}</div>
                  <div className="text-xs font-bold font-mono">${p.price.toFixed(2)}</div>
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
          strokeWidth={1.5}
          fillOpacity={1}
          fill={`url(#gradient-${ticker.replace(/[^a-zA-Z0-9]/g, '')})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
