"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Search, ChevronRight, Activity, Zap, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import { Input, Button, Badge } from "@/components/ui";
import { TickerAutocomplete } from "@/components/ticker-autocomplete";
import { motion } from "framer-motion";
import { AnimatedResearchCard } from "@/components/AnimatedResearchCard";
import { MiniMarketChart } from "@/components/mini-market-chart";
import { getTickerIconUrl } from "@/lib/utils";

const TICKERS_FOR_RIBBON = ["AAPL", "NVDA", "MSFT", "AMZN", "TSLA", "META", "GOOGL", "NFLX", "AMD", "INTC", "BRK.B", "JPM", "V", "JNJ", "WMT", "PG", "MA"];

export default function Home() {
  const [popularTickers, setPopularTickers] = useState<string[]>(["NVDA", "AAPL", "MSFT", "AMZN", "TSLA"]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { getMarketOverview } = useApi();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [moodData, setMoodData] = useState<any>(null);
  const [isMarketOpen, setIsMarketOpen] = useState(true);

  useEffect(() => {
    // Market is always considered open for the demo to show live tags
    setIsMarketOpen(true);
    
    getMarketOverview('Overview')
      .then((res) => {
        if (res?.data) {
          if (res.data.trending && res.data.trending.length > 0) {
            const filtered = res.data.trending.filter((ticker: string) => {
              return !ticker.includes("-USD") && !ticker.startsWith("^");
            });
            const merged = Array.from(new Set([...filtered, "NVDA", "AAPL", "MSFT", "AMZN", "TSLA"])).slice(0, 5);
            setPopularTickers(merged);
          }
          if (res.data.dashboard) {
            setDashboardData(res.data.dashboard);
          }
          if (res.data.mood) {
            setMoodData(res.data.mood);
          }
        }
      })
      .catch((err) => console.error("Failed to load market overview", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stock/${searchQuery.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-16 pb-8 min-h-[calc(100vh-80px)] flex flex-col justify-between gap-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-6 lg:mt-10">
        {/* Left Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-6 items-center text-center lg:items-start lg:text-left"
        >
          <h1 className="text-[48px] lg:text-[56px] font-bold leading-tight tracking-tight text-foreground">
            Smarter research.<br/>
            Better <span className="text-primary">investments.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            All agents analyze market data, news, sentiment and fundamentals to deliver actionable insights you can trust.
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-md items-center mt-4 relative mx-auto lg:mx-0">
            <TickerAutocomplete
              value={searchQuery}
              onChange={(val: string) => setSearchQuery(val)}
              onSelect={(val: string) => router.push(`/stock/${val}`)}
              placeholder="Search any company or ticker..."
              className="w-full"
              errorClass="h-14 pr-14 rounded-xl border-border bg-card shadow-sm text-base w-full focus-visible:ring-1 focus-visible:ring-primary"
            >
              <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center transition-all z-20">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </TickerAutocomplete>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-4">
            <span className="text-sm font-medium text-muted-foreground">Trending:</span>
            <div className="flex gap-2 flex-wrap justify-center lg:justify-start">
              {popularTickers.map((ticker, index) => (
                <Badge 
                  key={ticker} 
                  variant="secondary" 
                  onClick={() => router.push(`/stock/${ticker}`)}
                  className={`hover:bg-muted cursor-pointer transition-colors px-2.5 py-1 text-xs items-center gap-1.5 ${index === 4 ? 'hidden sm:flex' : 'flex'}`}
                >
                  <img src={getTickerIconUrl(ticker)} alt="" className="w-4 h-4 rounded-sm bg-white shadow-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  {ticker}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Animated Research Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative h-full hidden lg:flex items-start justify-center lg:justify-end lg:pr-12 w-full lg:pt-2"
        >
          <div className="w-full max-w-lg lg:scale-105 origin-right">
            <AnimatedResearchCard />
          </div>
        </motion.div>
      </div>

      {/* Rotating Ribbon - Full Width */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 md:mt-16 overflow-hidden w-full relative border-y border-border/50 py-4 bg-muted/10"
      >
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee gap-16 items-center text-muted-foreground font-mono text-sm">
          {[...TICKERS_FOR_RIBBON, ...TICKERS_FOR_RIBBON, ...TICKERS_FOR_RIBBON].map((ticker, idx) => (
            <div key={`${ticker}-${idx}`} className="flex items-center gap-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
              <img src={getTickerIconUrl(ticker)} alt={`${ticker} logo`} className="w-7 h-7 rounded-md bg-white shadow-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <span className="font-bold text-foreground text-base tracking-wider">{ticker}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Live Market Pulse Section */}
      <div className="mt-32 lg:mt-[25vh]">
        <h3 className="text-xl font-bold text-foreground mb-1">Live Market Pulse</h3>
        <div className="flex items-center gap-3 mb-6">
          <p className="text-sm text-muted-foreground">Markets update in real-time</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { 
              id: "S&P 500", ticker: "^GSPC", data: dashboardData?.marketPulse?.sp500,
            },
            { 
              id: "NASDAQ", ticker: "^IXIC", data: dashboardData?.marketPulse?.nasdaq,
            },
            { 
              id: "DOW JONES", ticker: "^DJI", data: dashboardData?.marketPulse?.dow,
            },
            { 
              id: "VIX", ticker: "^VIX", data: dashboardData?.marketPulse?.vix,
            },
          ].map((item, idx) => {
             const open = item.data?.price ? (item.data.price - item.data.change) : 0;
             const high = item.data?.price ? Math.max(open, item.data.price) * 1.001 : 0;
             const low = item.data?.price ? Math.min(open, item.data.price) * 0.999 : 0;
             
             return (
            <div key={idx} className="w-full bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-semibold text-muted-foreground">{item.id}</div>
                <div className={`text-[10px] px-2 py-0.5 rounded-sm border ${isMarketOpen ? 'text-success bg-success/10 border-success/20' : 'text-muted-foreground bg-muted/30 border-border/50'}`}>
                  {isMarketOpen ? 'Live' : 'Closed'}
                </div>
              </div>
              {item.data ? (
                <>
                  <div className="text-xl font-bold font-mono">
                    {item.data.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-medium mt-1 flex items-center ${item.data.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                    {item.data.changePercent >= 0 ? '▲' : '▼'} {item.data.changePercent >= 0 ? '+' : ''}{item.data.changePercent?.toFixed(2)}%
                  </div>
                </>
              ) : (
                <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
              )}
              {/* Sparkline */}
              <div className="h-12 mt-4 -mx-1 w-[calc(100%+8px)]">
                 <MiniMarketChart ticker={item.ticker} color={item.data?.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} />
              </div>
              {/* Footer OHL */}
              {item.data && (
                <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                  <div>
                    <span className="block opacity-60 mb-0.5">Open</span>
                    <span className="font-mono">{open.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="text-center">
                    <span className="block opacity-60 mb-0.5">High</span>
                    <span className="font-mono">{high.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="text-right">
                    <span className="block opacity-60 mb-0.5">Low</span>
                    <span className="font-mono">{low.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              )}
            </div>
          )})}

          {/* Fear & Greed */}
          <div className="hidden md:flex w-full bg-card border border-border rounded-xl p-5 flex-col justify-between items-center relative overflow-hidden">
            <div className="text-xs font-semibold text-muted-foreground mb-2 w-full text-left">Fear & Greed Index</div>
            <div className="relative flex items-center justify-center w-20 h-20 mt-2">
               <svg viewBox="0 0 36 36" className="w-20 h-20 transform -rotate-90">
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--muted)" strokeWidth="3" />
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={dashboardData?.fearGreed?.value >= 50 ? 'var(--success)' : 'var(--danger)'} strokeWidth="3" strokeDasharray={`${dashboardData?.fearGreed?.value || 50}, 100`} />
               </svg>
               <div className="absolute flex items-center justify-center font-bold text-lg">
                 {dashboardData?.fearGreed?.value || 50}
               </div>
            </div>
            <div className={`text-xs font-medium mt-3 ${dashboardData?.fearGreed?.value >= 50 ? 'text-success' : 'text-danger'}`}>{dashboardData?.fearGreed?.status || 'Neutral'}</div>
          </div>
        </div>
      </div>



    </div>
  );
}
