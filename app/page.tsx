"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Search, ChevronRight, Activity, Zap, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { motion } from "framer-motion";
import { AnimatedResearchCard } from "@/components/AnimatedResearchCard";

export default function Home() {
  const [popularTickers, setPopularTickers] = useState<string[]>(["NVDA", "AAPL", "MSFT", "AMZN", "TSLA"]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { getTrendingStocks, getDashboardData, getMarketMood } = useApi();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [moodData, setMoodData] = useState<any>(null);

  useEffect(() => {
    getTrendingStocks()
      .then((res) => {
        if (res?.data?.trending && res.data.trending.length > 0) {
          setPopularTickers(res.data.trending.slice(0, 5));
        }
      })
      .catch((err) => console.error("Failed to load trending stocks", err));
      
    getDashboardData('Overview')
      .then((res) => {
        if (res?.data) {
          setDashboardData(res.data);
        }
      })
      .catch((err) => console.error("Failed to load dashboard data", err));
      
    getMarketMood()
      .then((res) => {
        if (res?.data?.mood) {
          setMoodData(res.data.mood);
        }
      })
      .catch((err) => console.error("Failed to load market mood data", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stock/${searchQuery.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <div className="text-primary font-semibold text-sm tracking-wider uppercase">
            AI-POWERED INVESTMENT
          </div>
          <h1 className="text-[48px] lg:text-[56px] font-bold leading-tight tracking-tight text-foreground">
            Smarter research.<br/>
            Better <span className="text-primary">investments.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            All agents analyze market data, news, sentiment and fundamentals to deliver actionable insights you can trust.
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2 mt-4 relative">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search any company or ticker..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-xl border-border bg-card shadow-sm text-base"
            />
            <Button type="submit" size="icon" className="absolute right-2 h-10 w-10 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg">
              <Search className="w-5 h-5" />
            </Button>
          </form>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm font-medium text-muted-foreground">Trending:</span>
            <div className="flex gap-2 flex-wrap">
              {popularTickers.map((ticker) => (
                <Badge 
                  key={ticker} 
                  variant="secondary" 
                  onClick={() => router.push(`/stock/${ticker}`)}
                  className="hover:bg-muted cursor-pointer transition-colors px-3 py-1 text-xs"
                >
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
          className="relative h-full flex items-center justify-center"
        >
           <AnimatedResearchCard />
        </motion.div>
      </div>

      {/* Live Market Pulse Section */}
      <div className="mt-16">
        <h3 className="text-xl font-bold text-foreground">Live Market Pulse</h3>
        <p className="text-sm text-muted-foreground mb-6">Markets update in real-time</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { 
              id: "S&P 500", data: dashboardData?.marketPulse?.sp500,
              path: "M0,25 Q20,22 40,15 T80,5 L100,0",
              fillPath: "M0,30 L0,25 Q20,22 40,15 T80,5 L100,0 L100,30 Z"
            },
            { 
              id: "NASDAQ", data: dashboardData?.marketPulse?.nasdaq,
              path: "M0,20 L10,25 L20,10 L30,20 L40,5 L50,15 L60,0 L70,10 L80,5 L90,15 L100,0",
              fillPath: "M0,30 L0,20 L10,25 L20,10 L30,20 L40,5 L50,15 L60,0 L70,10 L80,5 L90,15 L100,0 L100,30 Z"
            },
            { 
              id: "DOW JONES", data: dashboardData?.marketPulse?.dow,
              path: "M0,15 L20,18 L40,14 L60,16 L80,13 L100,15",
              fillPath: "M0,30 L0,15 L20,18 L40,14 L60,16 L80,13 L100,15 L100,30 Z"
            },
            { 
              id: "VIX", data: dashboardData?.marketPulse?.vix,
              path: "M0,25 L15,25 L25,5 L35,25 L50,25 L60,10 L70,25 L85,25 L100,20",
              fillPath: "M0,30 L0,25 L15,25 L25,5 L35,25 L50,25 L60,10 L70,25 L85,25 L100,20 L100,30 Z"
            },
          ].map((item, idx) => {
             const open = item.data?.price ? (item.data.price - item.data.change) : 0;
             const high = item.data?.price ? Math.max(open, item.data.price) * 1.001 : 0;
             const low = item.data?.price ? Math.min(open, item.data.price) * 0.999 : 0;
             
             return (
            <div key={idx} className="w-full bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-semibold text-muted-foreground">{item.id}</div>
                <div className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-sm border border-border/50">Live</div>
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
              <div className="h-10 mt-4 -mx-1">
                 <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                   <path d={item.fillPath} fill={item.data?.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} opacity="0.15" />
                   <path d={item.path} fill="none" stroke={item.data?.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                 </svg>
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
          <div className="w-full bg-card border border-border rounded-xl p-5 flex flex-col justify-between items-center relative overflow-hidden">
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


      {/* Feature Strip */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 pt-12 border-t border-border"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Multi-Agent Analysis</h4>
            <p className="text-sm text-muted-foreground">AI agents working for you</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Real-time Data</h4>
            <p className="text-sm text-muted-foreground">Live market & news scanning</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Actionable Insights</h4>
            <p className="text-sm text-muted-foreground">Clear takeaways in plain English</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Proven Accuracy</h4>
            <p className="text-sm text-muted-foreground">Backtested models you can trust</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
