"use client";
import { useState } from "react";
import { ArrowLeft, Star, Share, MoreHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NVIDIA_DATA } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScoreGauge from "@/components/ScoreGauge";
import FinancialSnapshot from "@/components/FinancialSnapshot";
import AIAnalystChat from "@/components/AIAnalystChat";
import MarketMood from "@/components/MarketMood";
import WatchlistPanel from "@/components/WatchlistPanel";
import { Progress } from "@/components/ui/progress";

export default function StockDetailPage({ params }: { params: { ticker: string } }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const data = NVIDIA_DATA; // Mock using NVDA data

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">NVDA</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{data.name}</h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium">{data.ticker}</span>
                <span className="text-xs text-muted-foreground">• {data.exchange}</span>
                <Badge variant="secondary" className="ml-2 font-normal text-xs">Technology</Badge>
                <Badge variant="secondary" className="font-normal text-xs">Semiconductors</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-14 md:ml-0">
          <div className="text-xs text-muted-foreground mr-2">Research Date: May 18, 2025</div>
          <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"><Star className="w-4 h-4" /></button>
          <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"><Share className="w-4 h-4" /></button>
          <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 space-x-6 overflow-x-auto">
              {['Overview', 'Financials', 'News & Sentiment', 'Valuation', 'Risks', 'Outlook', 'AI Debate'].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase()}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 py-3 font-semibold transition-colors"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-8 space-y-8">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32">
                  <div className="text-sm text-muted-foreground">AI Recommendation</div>
                  <div className="flex justify-between items-end">
                    <div className="text-xl font-bold text-primary">{data.aiRecommendation}</div>
                    <div className="w-12 transform scale-[0.6] origin-bottom-right mb-[-12px]">
                       <ScoreGauge score={data.aiScore} max={100} />
                    </div>
                  </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32">
                  <div className="text-sm text-muted-foreground">Price Target</div>
                  <div>
                    <div className="text-2xl font-bold font-mono">${data.priceTarget}</div>
                    <div className="text-success text-sm font-semibold">+24.6% Upside</div>
                  </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32">
                  <div className="text-sm text-muted-foreground">Fair Value</div>
                  <div>
                    <div className="text-2xl font-bold font-mono">${data.fairValue}</div>
                    <div className="text-success text-sm font-semibold">+17.3% Upside</div>
                  </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32">
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div>
                    <div className="text-xl font-bold mb-2">High</div>
                    <div className="flex items-center gap-2">
                       <Progress value={78} className="h-1.5 flex-1 bg-muted [&>div]:bg-primary" />
                       <span className="text-sm font-mono font-semibold">78%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Summary & Score Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold mb-4">AI Summary</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                      {data.summary}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg w-fit hover:bg-foreground/90 transition-colors text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    Ask AI Analyst
                  </button>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-semibold mb-6">Score Breakdown</h3>
                  <div className="flex items-center gap-8">
                    <div className="w-32 h-32 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" strokeWidth="12" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.82)} className="transition-all duration-1000" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--foreground)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.2)} strokeDasharray="50 200" className="opacity-20" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold font-mono">{data.aiScore}</span>
                         <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        { label: 'Fundamentals', score: 26, max: 30, color: 'bg-primary' },
                        { label: 'News & Sentiment', score: 18, max: 20, color: 'bg-muted-foreground' },
                        { label: 'Industry Outlook', score: 16, max: 20, color: 'bg-muted-foreground' },
                        { label: 'Valuation', score: 12, max: 20, color: 'bg-muted-foreground' },
                        { label: 'Risk Assessment', score: 10, max: 10, color: 'bg-foreground' },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-muted-foreground">{item.label}</span>
                          </div>
                          <span className="font-mono font-medium">{item.score}/{item.max}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="font-semibold mb-6">Financial Snapshot</h3>
                <FinancialSnapshot data={data.financials} />
              </div>

            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-80 space-y-6">
          <MarketMood />
          <WatchlistPanel />
        </div>
      </div>

      <AnimatePresence>
        {isChatOpen && <AIAnalystChat onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
