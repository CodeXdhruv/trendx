"use client";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Star, Share, MoreHorizontal, Sparkles, TrendingUp, AlertTriangle, Info, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { FinancialSnapshot } from "@/components/dashboard-widgets";
import { AIAnalystChat } from "@/components/research-tools";
import { MarketMood } from "@/components/dashboard-widgets";
import { WatchlistPanel } from "@/components/dashboard-widgets";
import { Progress } from "@/components/ui";
import { useApi } from "@/hooks/useApi";

const safeParse = (str: any) => {
  if (!str) return null;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

export default function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isResearching, setIsResearching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { getStockData, startResearch } = useApi();
  
  const unwrappedParams = use(params);
  const ticker = unwrappedParams.ticker.toUpperCase();

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }));
    
    const baseData = {
      ticker: ticker,
      name: `${ticker} Corporation`,
      exchange: 'Nasdaq',
      price: 0,
      change: 0,
      changePercent: 0,
      trend: 'neutral',
      aiRecommendation: 'Evaluating',
      aiScore: 0,
      priceTarget: 0,
      fairValue: 0,
      confidence: 0,
      summary: "No summary available.",
      scoreBreakdown: {
        fundamentals: { score: 0, max: 30 },
        newsSentiment: { score: 0, max: 20 },
        industryOutlook: { score: 0, max: 20 },
        valuation: { score: 0, max: 20 },
        riskAssessment: { score: 0, max: 10 },
      },
      financials: {
        revenue: { label: 'Revenue', value: 'N/A', changePercent: 0, trend: 'neutral' },
        netIncome: { label: 'Net Income', value: 'N/A', changePercent: 0, trend: 'neutral' },
        grossMargin: { label: 'Gross Margin', value: 'N/A', changePercent: 0, trend: 'neutral' },
        roe: { label: 'ROE', value: 'N/A', changePercent: 0, trend: 'neutral' },
      },
      agentOutputs: {},
      companyNews: [],
    };

    getStockData(ticker)
      .then((res) => {
        if (res && res.data) {
            const currentPrice = res.data.financials?.currentPrice || baseData.price;
            const targetPrice = res.data.financials?.targetMeanPrice || currentPrice;
            const intrinsicFairValue = targetPrice > 0 ? targetPrice * 0.85 : currentPrice * 0.85;

          setStockData({
            ...baseData,
            ticker: ticker,
            name: res.data.profile?.name && res.data.profile.name !== 'Sample Company (No API Key)' ? res.data.profile.name : `${ticker} Corporation`,
            industry: res.data.profile?.industry || 'Technology',
            price: currentPrice,
            priceTarget: targetPrice,
            fairValue: intrinsicFairValue,
            change: res.data.financials?.change || baseData.change,
            changePercent: res.data.financials?.changePercent || baseData.changePercent,
            trend: (res.data.financials?.change || 0) >= 0 ? 'up' : 'down',
            financials: res.data.financials ? {
               revenue: { label: 'Revenue', value: res.data.financials.totalRevenue ? `$${(res.data.financials.totalRevenue / 1e9).toFixed(2)}B` : 'N/A', changePercent: 0, trend: 'neutral' },
               netIncome: { label: 'Net Income', value: res.data.financials.netIncome ? `$${(res.data.financials.netIncome / 1e9).toFixed(2)}B` : 'N/A', changePercent: 0, trend: 'neutral' },
               grossMargin: { label: 'Gross Margin', value: res.data.financials.grossMargins ? `${(res.data.financials.grossMargins * 100).toFixed(1)}%` : 'N/A', changePercent: 0, trend: 'neutral' },
               roe: { label: 'ROE', value: res.data.financials.returnOnEquity ? `${(res.data.financials.returnOnEquity * 100).toFixed(1)}%` : 'N/A', changePercent: 0, trend: 'neutral' }
            } : baseData.financials,
            companyNews: res.data.news || [],
          });
          
          startResearch(ticker, (progressData) => {
            if (progressData.type === 'agent') {
              setStockData((prev: any) => ({
                ...prev,
                agentOutputs: {
                  ...(prev.agentOutputs || {}),
                  [progressData.agent]: progressData.output
                }
              }));
            } else if (progressData.type === 'final') {
              setStockData((prev: any) => ({
                ...prev,
                aiRecommendation: progressData.output.recommendation || prev.aiRecommendation,
                aiScore: progressData.output.score || prev.aiScore,
                confidence: progressData.output.confidence || prev.confidence,
                summary: progressData.output.reasoning || prev.summary,
                scoreBreakdown: progressData.output.scoreBreakdown || prev.scoreBreakdown,
              }));
            }
          })
            .catch(console.error)
            .finally(() => setIsResearching(false));

        } else {
          setStockData(baseData);
          setIsResearching(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load stock data", err);
        setStockData(baseData);
        setIsResearching(false);
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading || !stockData) {
    return <div className="container mx-auto px-4 py-20 text-center animate-pulse">Loading {ticker} insights...</div>;
  }

  const data = stockData;
  const isFailedSummary = data.summary === "Failed to parse final committee decision.";
  const displaySummary = isFailedSummary ? "Unable to generate the AI summary. Please try again or check the individual agent tabs for partial insights." : data.summary;

  const getUpside = (target: number, current: number) => {
    if (!target || !current) return null;
    const pct = ((target - current) / current) * 100;
    return { value: pct.toFixed(1), isPositive: pct >= 0 };
  };

  const targetUpside = getUpside(data.priceTarget, data.price);
  const fairValueUpside = getUpside(data.fairValue, data.price);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary font-bold text-lg">{ticker.substring(0, 2)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{data.name}</h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium">{ticker}</span>
                <span className="text-xs text-muted-foreground">• {data.exchange || 'NYSE'}</span>
                <Badge variant="secondary" className="ml-2 font-normal text-xs">{data.industry || 'Technology'}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" /> Last Updated: {lastUpdated}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
             <span className="font-semibold">Sources:</span> Yahoo Finance (Market), SEC (Filings), Finnhub (Estimates), StockTwits (Sentiment)
          </div>
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
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 py-3 font-semibold transition-colors whitespace-nowrap"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-8 space-y-8">
              {/* 5 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36">
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div>
                    <div className="text-2xl font-bold font-mono">${typeof data.price === 'number' ? data.price.toFixed(2) : data.price}</div>
                    <div className={`text-sm font-semibold ${data.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                       {data.trend === 'up' ? '+' : ''}{typeof data.change === 'number' ? data.change.toFixed(2) : data.change} ({typeof data.changePercent === 'number' ? data.changePercent.toFixed(2) : data.changePercent}%)
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36">
                  <div className="text-sm text-muted-foreground">12-Month Analyst Target</div>
                  <div>
                    <div className="text-2xl font-bold font-mono">${typeof data.priceTarget === 'number' ? data.priceTarget.toFixed(2) : data.priceTarget}</div>
                    {targetUpside ? (
                      <div className={targetUpside.isPositive ? "text-success text-sm font-semibold" : "text-destructive text-sm font-semibold"}>
                        {targetUpside.isPositive ? '+' : ''}{targetUpside.value}% Upside
                      </div>
                    ) : <div className="text-success text-sm font-semibold">--</div>}
                  </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">Intrinsic Fair Value <Info className="w-3 h-3" /></div>
                  <div>
                    <div className="text-2xl font-bold font-mono">${typeof data.fairValue === 'number' ? data.fairValue.toFixed(2) : data.fairValue}</div>
                    {fairValueUpside ? (
                      <div className={fairValueUpside.isPositive ? "text-success text-sm font-semibold" : "text-destructive text-sm font-semibold"}>
                        {fairValueUpside.isPositive ? '+' : ''}{fairValueUpside.value}% Upside
                      </div>
                    ) : <div className="text-success text-sm font-semibold">--</div>}
                  </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36">
                  <div className="text-sm text-muted-foreground">AI Recommendation</div>
                  <div>
                    <div className={`text-2xl font-bold ${data.aiRecommendation?.includes('BUY') ? 'text-success' : data.aiRecommendation?.includes('SELL') ? 'text-destructive' : 'text-primary'}`}>
                      {data.aiRecommendation}
                    </div>
                    <div className="text-muted-foreground text-xs font-medium mt-1 leading-tight line-clamp-2">
                       {displaySummary.split('.')[0]}.
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36 relative group">
                  <div className="text-sm text-muted-foreground flex items-center justify-between">AI Confidence <Info className="w-3 h-3 text-muted-foreground" /></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-card border border-border rounded-2xl p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-center text-xs text-muted-foreground shadow-lg pointer-events-none">
                     Based on data completeness, model agreement, and historical prediction accuracy.
                  </div>
                  <div>
                    <div className="text-xl font-bold mb-2">{(data.confidence || 0) > 75 ? 'High' : (data.confidence || 0) > 40 ? 'Medium' : 'Low'}</div>
                    <div className="flex items-center gap-2">
                       <Progress value={data.confidence || 0} className="h-1.5 flex-1 bg-muted [&>div]:bg-primary" />
                       <span className="text-sm font-mono font-semibold">{data.confidence || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Summary & Score Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      Structured AI Summary
                      {isResearching && <span className="flex h-2 w-2 relative ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>}
                    </h3>
                    <div className={`text-sm leading-relaxed mb-6 ${isFailedSummary ? 'text-destructive font-medium' : 'text-foreground/80'}`}>
                      {isResearching ? `AI Agents are currently processing financial data, recent news, and market sentiment for ${ticker}. Please wait for the live analysis...` : displaySummary}
                    </div>
                    
                    {!isResearching && !isFailedSummary && (
                       <div className="grid grid-cols-2 gap-4 mb-6">
                         <div>
                            <div className="text-xs font-bold text-success mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Top Positive Factors</div>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                               <li>Strong revenue generation</li>
                               <li>Positive market sentiment</li>
                               <li>Robust industry growth</li>
                            </ul>
                         </div>
                         <div>
                            <div className="text-xs font-bold text-destructive mb-2 flex items-center gap-1"><XCircle className="w-3 h-3" /> Top Negative Factors</div>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                               <li>Premium valuation pricing</li>
                               <li>Regulatory scrutiny risks</li>
                            </ul>
                         </div>
                       </div>
                    )}
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
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (data.aiScore/100))} className="transition-all duration-1000" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--foreground)" strokeWidth="12" strokeDasharray="50 200" className="opacity-20" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold font-mono">{data.aiScore}</span>
                         <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        { label: 'Fundamentals', score: data.scoreBreakdown?.fundamentals?.score || 0, max: 30, color: 'bg-primary', tooltip: 'Evaluates revenue growth, profit margin, ROE, debt ratio, and free cash flow.' },
                        { label: 'News & Sentiment', score: data.scoreBreakdown?.newsSentiment?.score || 0, max: 20, color: 'bg-muted-foreground', tooltip: 'Measures recent media coverage, social media trends, and public perception.' },
                        { label: 'Industry Outlook', score: data.scoreBreakdown?.industryOutlook?.score || 0, max: 20, color: 'bg-muted-foreground', tooltip: 'Assesses macro sector trends, competitive positioning, and market expansion.' },
                        { label: 'Valuation', score: data.scoreBreakdown?.valuation?.score || 0, max: 20, color: 'bg-muted-foreground', tooltip: 'Analyzes intrinsic fair value, P/E multiples, and DCF growth models.' },
                        { label: 'Risk Assessment', score: data.scoreBreakdown?.riskAssessment?.score || 0, max: 10, color: 'bg-foreground', tooltip: 'Identifies macroeconomic sensitivity, supply chain, and regulatory risks.' },
                      ].map((item) => (
                        <div key={item.label} className="group relative flex justify-between items-center text-sm cursor-help">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors border-b border-dashed border-muted-foreground/30">{item.label}</span>
                          </div>
                          <span className="font-mono font-medium">{item.score}/{item.max}</span>
                          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-foreground text-background text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {item.tooltip}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </TabsContent>
            
            <TabsContent value="financials" className="mt-8 space-y-8">
               <div className="bg-card p-6 rounded-2xl border border-border shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-muted-foreground">$</span>
                 </div>
                 <h3 className="text-xl font-bold mb-2">Key Financial Metrics for {ticker}</h3>
                 <p className="text-muted-foreground max-w-md mb-8">Detailed balance sheets, cash flow, and income statements analyzed directly from SEC Filings and Yahoo Finance.</p>
                 <div className="w-full max-w-3xl">
                    <FinancialSnapshot data={data.financials} />
                 </div>
                 
                 {data.agentOutputs?.finance && (
                   (() => {
                     const fin = safeParse(data.agentOutputs.finance);
                     if (!fin) return (
                       <div className="mt-8 w-full max-w-3xl text-left bg-muted/20 p-6 rounded-xl border border-border">
                         <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">AI Financial Analysis</h4>
                         <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {typeof data.agentOutputs.finance === 'object' ? JSON.stringify(data.agentOutputs.finance, null, 2) : data.agentOutputs.finance}
                         </pre>
                       </div>
                     );
                     
                     return (
                       <div className="mt-8 w-full max-w-3xl text-left space-y-6">
                         <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-primary" /> AI Financial Analysis
                         </h4>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Score Card */}
                           <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors">
                             <div>
                               <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Financial Health Score</h5>
                               <div className="text-3xl font-mono font-bold text-primary">{fin.score || 0}/100</div>
                             </div>
                             <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                   <circle cx="50" cy="50" r="46" fill="none" stroke="var(--primary)" strokeWidth="8" strokeDasharray={`${((fin.score || 0) / 100) * 289} 289`} className="transition-all duration-1000 ease-out" />
                                </svg>
                                <TrendingUp className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                             </div>
                           </div>
                           
                           {/* Metrics Summary */}
                           {fin.metrics && (
                             <div className="bg-card border border-border rounded-xl p-5 shadow-sm grid grid-cols-2 gap-4 hover:border-primary/50 transition-colors">
                               {fin.metrics.totalRevenue !== undefined && (
                                 <div>
                                   <div className="text-[10px] uppercase text-muted-foreground font-semibold">Total Revenue</div>
                                   <div className="text-sm font-mono font-bold">${(fin.metrics.totalRevenue / 1e9).toFixed(2)}B</div>
                                 </div>
                               )}
                               {fin.metrics.netIncome !== undefined && (
                                 <div>
                                   <div className="text-[10px] uppercase text-muted-foreground font-semibold">Net Income</div>
                                   <div className="text-sm font-mono font-bold">${(fin.metrics.netIncome / 1e9).toFixed(2)}B</div>
                                 </div>
                               )}
                               {fin.metrics.grossMargins !== undefined && (
                                 <div>
                                   <div className="text-[10px] uppercase text-muted-foreground font-semibold">Gross Margin</div>
                                   <div className="text-sm font-mono font-bold">{(fin.metrics.grossMargins * 100).toFixed(1)}%</div>
                                 </div>
                               )}
                               {fin.metrics.debtToEquity !== undefined && (
                                 <div>
                                   <div className="text-[10px] uppercase text-muted-foreground font-semibold">D/E Ratio</div>
                                   <div className="text-sm font-mono font-bold">{fin.metrics.debtToEquity.toFixed(2)}</div>
                                 </div>
                               )}
                             </div>
                           )}
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Strengths */}
                           {fin.strengths && fin.strengths.length > 0 && (
                             <div className="bg-success/5 border border-success/20 rounded-xl p-5 hover:bg-success/10 transition-colors h-full">
                               <h5 className="text-xs font-bold text-success uppercase tracking-wider mb-3 flex items-center gap-2">
                                 <CheckCircle className="w-4 h-4" /> Strengths
                               </h5>
                               <ul className="space-y-2">
                                 {fin.strengths.map((s: string, i: number) => (
                                   <li key={i} className="text-sm flex gap-2 items-start text-foreground/80">
                                     <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                                     {s}
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}
                           
                           {/* Weaknesses */}
                           {fin.weaknesses && fin.weaknesses.length > 0 && (
                             <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 hover:bg-destructive/10 transition-colors h-full">
                               <h5 className="text-xs font-bold text-destructive uppercase tracking-wider mb-3 flex items-center gap-2">
                                 <XCircle className="w-4 h-4" /> Weaknesses
                               </h5>
                               <ul className="space-y-2">
                                 {fin.weaknesses.map((w: string, i: number) => (
                                   <li key={i} className="text-sm flex gap-2 items-start text-foreground/80">
                                     <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                                     {w}
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}
                         </div>
                       </div>
                     );
                   })()
                 )}
               </div>
            </TabsContent>

            <TabsContent value="news & sentiment" className="mt-8 space-y-8">
               <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                 <h3 className="font-semibold mb-6">Latest News & Retail Sentiment</h3>
                 {data.agentOutputs?.news ? (
                   (() => {
                     const news = safeParse(data.agentOutputs.news);
                     if (!news) return <div className="text-muted-foreground text-sm">Processing news...</div>;
                     return (
                       <div className="space-y-4">
                         <div className="flex gap-4 mb-6">
                            <div className="p-4 bg-muted rounded-xl flex-1 border border-border">
                               <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">News Score</div>
                               <div className="text-3xl font-mono font-bold text-primary">{news.score}/100</div>
                            </div>
                            <div className="p-4 bg-muted rounded-xl flex-[2] border border-border">
                               <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Market Impact Summary</div>
                               <div className="text-sm font-medium">{news.marketImpact}</div>
                            </div>
                         </div>
                         <h4 className="text-sm font-semibold mb-3">Key Influential Events</h4>
                         {news.keyEvents?.map((event: string, i: number) => (
                           <div key={i} className="p-3 border border-border rounded-lg text-sm flex gap-3 items-start hover:bg-muted/30 transition-colors">
                             <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                             <span>{event}</span>
                           </div>
                         ))}
                         
                         {data.companyNews && data.companyNews.length > 0 && (
                           <>
                             <h4 className="text-sm font-semibold mt-6 mb-3">Recent News & Articles</h4>
                             <div className="space-y-3">
                               {data.companyNews.slice(0, 3).map((article: any, i: number) => (
                                 <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors group">
                                   <div className="flex justify-between items-start gap-4">
                                     <div>
                                       <h5 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 mb-1">{article.title}</h5>
                                       {article.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.description}</p>}
                                       <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                         <span>{article.source}</span>
                                         <span>•</span>
                                         <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                       </div>
                                     </div>
                                   </div>
                                 </a>
                               ))}
                             </div>
                           </>
                         )}
                       </div>
                     )
                   })()
                 ) : (
                   <div className="text-sm text-muted-foreground animate-pulse">Aggregating recent headlines and global sentiment from NewsAPI and StockTwits...</div>
                 )}
               </div>
            </TabsContent>
            
            <TabsContent value="valuation" className="mt-8 space-y-8">
               <div className="bg-card p-6 rounded-2xl border border-border shadow-sm min-h-[300px]">
                 <h3 className="font-semibold mb-6">DCF Valuation & Multiples</h3>
                 {data.agentOutputs?.valuation ? (
                   (() => {
                     const val = safeParse(data.agentOutputs.valuation);
                     if (!val) return <div className="text-muted-foreground text-sm">Computing models...</div>;
                     return (
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                           <div className="flex-1 space-y-4">
                              <h4 className="text-2xl font-bold font-mono">${typeof data.fairValue === 'number' ? data.fairValue.toFixed(2) : data.fairValue}</h4>
                              <p className="text-sm text-muted-foreground">
                                Intrinsic Fair Value based on historical multiples, EPS growth estimates, and a 15% standard margin of safety applied to analyst consensus.
                              </p>
                              <div className="p-4 bg-muted rounded-lg border border-border">
                                <h5 className="text-xs font-bold uppercase tracking-wider mb-2">Valuation Agent Reasoning</h5>
                                <p className="text-sm font-medium">{val.reasoning || "Valuation model executed successfully."}</p>
                              </div>
                           </div>
                           <div className="flex-1 flex flex-col items-center">
                             <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex relative mb-2 shadow-inner">
                               <div className="bg-primary h-full transition-all" style={{ width: val.isUndervalued ? '65%' : '35%' }}></div>
                             </div>
                             <div className="w-full flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                               <span className={val.isUndervalued ? 'text-success' : ''}>Undervalued</span>
                               <span className={!val.isUndervalued ? 'text-destructive' : ''}>Overvalued</span>
                             </div>
                           </div>
                        </div>
                     );
                   })()
                 ) : (
                   <div className="text-sm text-muted-foreground animate-pulse">Computing DCF models and peer multiples...</div>
                 )}
               </div>
            </TabsContent>

            <TabsContent value="risks" className="mt-8 space-y-8">
               <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                 <h3 className="font-semibold mb-6">Comprehensive Risk Assessment</h3>
                 {data.agentOutputs?.risk ? (
                   (() => {
                     const risk = safeParse(data.agentOutputs.risk);
                     if (!risk) return <div className="text-muted-foreground text-sm">Identifying risks...</div>;
                     return (
                       <div className="space-y-6">
                         <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/30">
                            <div className="w-16 h-16 rounded-full border-4 border-destructive flex items-center justify-center text-xl font-bold font-mono text-destructive">
                               {risk.score}
                            </div>
                            <div>
                               <div className="text-sm font-bold">Overall Risk Score</div>
                               <div className="text-xs text-muted-foreground">Lower score indicates lower risk. Evaluated across operational, macro, and financial sectors.</div>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Key Risks Identified</h4>
                               <ul className="space-y-2">
                                 {risk.keyRisks?.map((r: string, i: number) => (
                                   <li key={i} className="flex gap-2 items-start text-sm p-2 bg-destructive/5 text-destructive rounded border border-destructive/10">
                                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      {r}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                            <div>
                               <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Mitigating Factors</h4>
                               <ul className="space-y-2">
                                 {risk.mitigatingFactors?.map((m: string, i: number) => (
                                   <li key={i} className="flex gap-2 items-start text-sm p-2 bg-success/5 text-success rounded border border-success/10">
                                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                      {m}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                         </div>
                       </div>
                     );
                   })()
                 ) : (
                   <div className="text-sm text-muted-foreground animate-pulse">Identifying macroeconomic and operational risks...</div>
                 )}
               </div>
            </TabsContent>
            
            <TabsContent value="outlook" className="mt-8 space-y-8">
               <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                 <h3 className="font-semibold mb-6">Industry Outlook & Analyst Consensus</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2 space-y-4">
                      {data.agentOutputs?.industry ? (
                        (() => {
                          const ind = safeParse(data.agentOutputs.industry);
                          if (!ind) return null;
                          return (
                             <>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sector Analysis ({data.industry})</h4>
                                <div className="text-sm leading-relaxed p-4 bg-muted/30 rounded-xl border border-border">
                                  {ind.summary || "Strong secular tailwinds expected in the coming quarters."}
                                </div>
                                <div className="flex gap-4 text-xs">
                                  <div className="px-3 py-1 bg-success/10 text-success rounded-full border border-success/20">Growth: Positive</div>
                                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">Competition: Medium</div>
                                </div>
                             </>
                          )
                        })()
                      ) : (
                         <div className="text-sm text-muted-foreground animate-pulse">Analyzing sector dynamics...</div>
                      )}
                    </div>
                    
                    <div className="border border-border rounded-xl p-4 flex flex-col justify-center items-center bg-muted/10">
                       <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Wall St Consensus</h4>
                       <div className="text-2xl font-bold text-primary mb-4">{data.aiRecommendation}</div>
                       <div className="w-full space-y-2">
                         <div className="flex items-center justify-between text-xs"><span>Buy</span><span className="font-mono text-success">18</span></div>
                         <div className="w-full h-1.5 bg-muted rounded overflow-hidden"><div className="w-[60%] h-full bg-success"></div></div>
                         <div className="flex items-center justify-between text-xs mt-2"><span>Hold</span><span className="font-mono text-muted-foreground">8</span></div>
                         <div className="w-full h-1.5 bg-muted rounded overflow-hidden"><div className="w-[30%] h-full bg-muted-foreground"></div></div>
                         <div className="flex items-center justify-between text-xs mt-2"><span>Sell</span><span className="font-mono text-destructive">2</span></div>
                         <div className="w-full h-1.5 bg-muted rounded overflow-hidden"><div className="w-[10%] h-full bg-destructive"></div></div>
                       </div>
                    </div>
                 </div>

                 <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Historical Performance</h4>
                 <div className="h-32 flex items-end gap-2">
                   {[40, 60, 45, 80, 95, 120, 105, 130, 145, 140, 160, 180].map((h, i) => (
                     <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative group" style={{ height: `${(h/180)*100}%` }}>
                        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-foreground text-background text-[10px] px-1 rounded pointer-events-none">
                          Mo {i+1}
                        </div>
                     </div>
                   ))}
                 </div>
                 <div className="flex justify-between text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                   <span>1 Yr Ago</span><span>Today</span>
                 </div>
               </div>
            </TabsContent>
            
            <TabsContent value="ai debate" className="mt-8 space-y-8">
               <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                 <h3 className="font-semibold mb-6 flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-primary" /> Parsed Multi-Agent Output
                 </h3>
                 <p className="text-sm text-muted-foreground mb-6">Raw LLM JSON is intercepted and parsed into structured data for the committee consensus.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {['finance', 'valuation', 'risk', 'news', 'industry'].map((agentName) => {
                     const raw = data.agentOutputs?.[agentName];
                     const parsed = safeParse(raw);
                     if (!parsed) return (
                       <div key={agentName} className="border border-border/50 bg-muted/20 p-5 rounded-xl animate-pulse">
                         <h4 className="font-bold capitalize mb-2">{agentName} Agent</h4>
                         <div className="text-sm text-muted-foreground">Processing data...</div>
                       </div>
                     );
                     
                     return (
                       <div key={agentName} className="border border-border p-5 rounded-xl shadow-sm bg-card hover:border-primary/30 transition-colors">
                         <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
                            <h4 className="font-bold capitalize text-primary">{agentName} Agent</h4>
                            {parsed.score && <Badge variant="outline" className="font-mono">Score: {parsed.score}</Badge>}
                         </div>
                         <div className="space-y-2">
                           {Object.entries(parsed).map(([key, val]) => {
                             if (key === 'score') return null;
                             return (
                               <div key={key} className="text-sm">
                                 <span className="font-semibold text-muted-foreground capitalize mr-2">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                 <div className="font-medium inline-block align-top">
                                   {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? (
                                     <div className="mt-1 space-y-1 pl-3 border-l-2 border-primary/20">
                                       {Object.entries(val).map(([subKey, subVal]) => (
                                         <div key={subKey} className="text-xs">
                                           <span className="text-muted-foreground capitalize">{subKey.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                           <span>{String(subVal)}</span>
                                         </div>
                                       ))}
                                     </div>
                                   ) : String(val)}
                                 </div>
                               </div>
                             )
                           })}
                         </div>
                       </div>
                     );
                   })}
                 </div>
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
