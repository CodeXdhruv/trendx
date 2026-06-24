"use client";
import { TrendingUp } from "lucide-react";
import ScoreGauge from "./ScoreGauge";

export default function MarketMood() {
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
