"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/useApi";

export default function WatchlistPanel() {
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
