"use client";
import { WATCHLIST_DATA } from "@/lib/mock-data";
import Link from "next/link";

export default function WatchlistPanel() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">Watchlist</h3>
        <Link href="/watchlist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {WATCHLIST_DATA.map((item) => {
          const isPositive = item.trend === 'up';
          return (
            <div key={item.ticker} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center">
                  <span className="text-background text-[10px] font-bold">{item.ticker.substring(0, 1)}</span>
                </div>
                <div>
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">{item.ticker}</div>
                  <div className="text-xs text-muted-foreground">{item.name}</div>
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
                  <div className="font-mono text-sm font-semibold">${item.price.toFixed(2)}</div>
                  <div className={`text-xs ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
