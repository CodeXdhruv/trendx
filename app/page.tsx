"use client";
import { Search, ChevronRight, Activity, Zap, TrendingUp, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Home() {
  const popularTickers = ["NVDA", "AAPL", "MSFT", "AMZN", "TSLA"];

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
            AI-Powered Investment Research
          </div>
          <h1 className="text-[48px] lg:text-[56px] font-bold leading-tight tracking-tight text-foreground">
            Clear Insights.<br/>
            <span className="text-primary">Smarter Investments.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Quantix AI analyzes market data, news, sentiment, and fundamentals to deliver actionable investment insights you can trust.
          </p>

          <div className="flex w-full max-w-md items-center space-x-2 mt-4 relative">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search any company or ticker..." 
              className="pl-12 h-14 rounded-xl border-border bg-card shadow-sm text-base"
            />
            <Button size="icon" className="absolute right-2 h-10 w-10 bg-foreground hover:bg-foreground/90 text-background rounded-lg">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm font-medium text-muted-foreground">Popular:</span>
            <div className="flex gap-2 flex-wrap">
              {popularTickers.map((ticker) => (
                <Badge key={ticker} variant="secondary" className="hover:bg-muted cursor-pointer transition-colors px-3 py-1 text-xs">
                  {ticker}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Illustration & Mini Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative h-full min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-muted/50 to-muted/10 rounded-3xl p-8"
        >
           {/* Abstract illustration placeholder */}
           <div className="relative w-full max-w-sm aspect-square mb-8">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105" />
              <div className="absolute inset-0 bg-card border border-border shadow-Elevated rounded-3xl flex flex-col p-6 items-center justify-center">
                 <Activity className="w-24 h-24 text-primary opacity-80" />
                 <div className="mt-6 flex space-x-2">
                   <div className="w-8 h-2 bg-primary/20 rounded-full" />
                   <div className="w-12 h-2 bg-primary/40 rounded-full" />
                   <div className="w-16 h-2 bg-primary rounded-full" />
                 </div>
              </div>
           </div>

           {/* Compact Stock Card Overlay */}
           <motion.div 
             whileHover={{ y: -5 }}
             className="absolute -bottom-6 -left-6 md:left-4 bg-card p-5 rounded-2xl shadow-Elevated border border-border w-72"
           >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                     <span className="text-white font-bold text-xs">NVDA</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">NVIDIA</h4>
                    <p className="text-xs text-muted-foreground">NVDA • Nasdaq</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-2xl font-bold font-mono">$949.43</div>
                <div className="text-success text-sm font-medium flex items-center">
                  +27.65 (3.00%) <span className="text-muted-foreground ml-1 font-normal text-xs">Today</span>
                </div>
              </div>
              <div className="h-12 w-full bg-primary/10 rounded-lg flex items-end overflow-hidden">
                {/* SVG Sparkline Placeholder */}
                <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                  <path d="M0,30 L0,20 C10,15 20,25 30,10 C40,-5 50,20 60,15 C70,10 80,5 90,0 L100,0 L100,30 Z" fill="var(--primary)" opacity="0.2" />
                  <path d="M0,20 C10,15 20,25 30,10 C40,-5 50,20 60,15 C70,10 80,5 90,0" fill="none" stroke="var(--primary)" strokeWidth="2" />
                </svg>
              </div>
           </motion.div>
        </motion.div>
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
            <h4 className="font-semibold mb-1">Multi-Agent Research</h4>
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
