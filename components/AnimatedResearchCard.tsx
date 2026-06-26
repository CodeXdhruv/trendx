"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Activity, Sparkles, Info } from "lucide-react";

export function AnimatedResearchCard() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return p + 0.3;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: "Fetching Financials", desc: "Crunching numbers from latest reports...", threshold: 15 },
    { title: "Reading SEC Filings", desc: "Extracting insights from 10-K, 10-Q...", threshold: 35 },
    { title: "Parsing Earnings", desc: "Analyzing transcripts and key metrics...", threshold: 55 },
    { title: "Reddit Sentiment", desc: "Scanning 50K+ comments & discussions...", threshold: 75 },
    { title: "Analyst Consensus", desc: "Aggregating 35 analyst opinions...", threshold: 90 },
    { title: "AI Synthesis", desc: "Generating comprehensive report...", threshold: 100 },
  ];


  return (
    <div className="w-full max-w-xl mx-auto bg-card border border-border shadow-2xl rounded-2xl p-6 relative flex flex-col z-10 min-h-[400px]">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
          <Activity className="w-4 h-4" />
          AI RESEARCH..
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-xs font-semibold uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 flex-1">
        {/* Left Side: Steps */}
        <div className="flex-1 flex flex-col justify-between gap-3">
          {steps.map((step, idx) => {
            const prevThreshold = idx === 0 ? 0 : steps[idx - 1].threshold;

            const isComplete = progress >= step.threshold;
            const isActive = progress >= prevThreshold && progress < step.threshold;

            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold leading-tight mb-0.5 ${isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Stock Card & Summary */}
        <div className="w-full sm:w-48 flex flex-col gap-4 justify-between shrink-0">
          <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-black border border-white/10 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">NVDA</span>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">NVIDIA</div>
                <div className="text-[10px] text-muted-foreground">NVDA • Nasdaq</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-xl font-bold font-mono text-foreground">$949.43</div>
              <div className="text-[11px] font-medium text-success mt-0.5">+27.65 (3.00%) Today</div>
            </div>
            <div className="h-12 w-full mt-2">
              <svg viewBox="0 0 100 40" className="w-full h-full preserve-aspect-ratio-none">
                <path d="M0,40 L0,35 C10,30 20,40 30,25 C40,10 50,20 60,15 C70,10 80,5 90,10 L100,0 L100,40 Z" fill="var(--primary)" opacity="0.15" />
                <path d="M0,35 C10,30 20,40 30,25 C40,10 50,20 60,15 C70,10 80,5 90,10 L100,0" fill="none" stroke="var(--primary)" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div className="bg-background/50 rounded-xl p-3 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-foreground">AI Confidence</div>
              <div className="relative flex items-center justify-center w-10 h-10">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--muted)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${Math.min(92, progress)}, 100`} />
                </svg>
                <div className="absolute text-[10px] font-bold text-foreground">
                  {Math.min(92, Math.floor(progress))}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-foreground">Overall Rating</div>
              <div className={`text-lg font-bold transition-colors ${progress > 90 ? 'text-success' : 'text-muted-foreground'}`}>
                {progress > 90 ? 'BUY' : '---'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center relative">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          <span className="hidden sm:inline">Analyzing thousands of data points...</span>
          <span className="sm:hidden">Analyzing...</span>
        </div>

        <div className="group relative flex items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors">
            <Info className="w-3 h-3" />
            Disclaimer
          </div>
          {/* Tooltip Popup */}
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-popover border border-border text-popover-foreground text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
            This is a simulated AI research process for demonstration purposes. Data is mocked and does not reflect live market conditions.
          </div>
        </div>
      </div>
    </div>
  );
}
