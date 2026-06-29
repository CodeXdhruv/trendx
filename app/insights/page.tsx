"use client";

import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  TrendingUp, TrendingDown, Activity, BarChart3, Newspaper, Building2, 
  Calendar, Globe, Flame, Bitcoin, Landmark, Search, RefreshCw, AlertCircle, ExternalLink
} from 'lucide-react';
import { useApi } from "@/hooks/useApi";
import { getTickerIconUrl } from "@/lib/utils";
import { 
  ResponsiveContainer, AreaChart, LineChart, Area, Line, YAxis 
} from 'recharts';
import { toast } from 'sonner';

import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Button, Input, Separator, Skeleton } from '@/components/ui';
import { AuthGate } from '@/components/auth-gate';

const ScrollArea = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);
const ScrollBar = ({ orientation, className }: { orientation?: string, className?: string }) => null;

const Avatar = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarFallback = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>{children}</div>
);
const AvatarImage = ({ src, alt, className }: { src?: string, alt?: string, className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={`aspect-square h-full w-full ${className}`} />
);

const Progress = ({ value, className }: { value?: number, className?: string }) => (
  <div className={`relative w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </div>
);

// Create a client
const queryClient = new QueryClient();

// ==========================================
// API Fetcher
// ==========================================
const fetchDashboard = async (refresh: boolean = false, category: string = 'Overview') => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';
  const res = await fetch(`${BACKEND_URL}/market/dashboard?category=${encodeURIComponent(category)}${refresh ? '&refresh=true' : ''}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

// ==========================================
// Helper Components
// ==========================================
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);
const generateSparkline = (price: number) => Array.from({ length: 10 }).map((_, i) => ({ value: price * (1 + (Math.random() * 0.04 - 0.02)) }));

const SectionHeader = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-5 h-5 text-primary" />
    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-2xl border border-border border-dashed h-full">
    <AlertCircle className="w-8 h-8 text-muted-foreground mb-3" />
    <p className="text-sm font-medium text-foreground mb-1">Unable to load data</p>
    <p className="text-xs text-muted-foreground mb-4">There was a problem fetching this widget.</p>
    <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-2xl border border-border border-dashed h-full">
    <Activity className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
    <p className="text-sm font-medium text-muted-foreground">No data available</p>
  </div>
);

// ==========================================
// Widgets
// ==========================================
function Header({ onRefresh, isFetching }: { onRefresh: () => void, isFetching: boolean }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Market Intelligence</h1>
        <p className="text-muted-foreground">Real-time market insights and sector performance</p>
      </div>

    </div>
  );
}

function CategoryTabs({ active, setActive }: { active: string, setActive: (t: string) => void }) {
  const tabs = ["Overview", "Technology", "AI", "Semiconductors", "Healthcare", "Energy", "Finance", "Crypto", "EV", "ETFs", "Macro"];
  return (
    <ScrollArea className="w-full whitespace-nowrap mb-8 pb-2">
      <div className="flex w-max space-x-1 p-1 bg-muted/50 rounded-full">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${active === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {active === tab && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-background rounded-full shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
}

function MarketPulse({ data }: { data: any }) {
  if (!data) return <Skeleton className="h-32 w-full rounded-2xl" />;
  
  const indices = [
    { key: 'sp500', ...data.marketPulse.sp500 },
    { key: 'nasdaq', ...data.marketPulse.nasdaq },
    { key: 'dow', ...data.marketPulse.dow },
    { key: 'vix', ...data.marketPulse.vix },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {indices.map((idx, i) => (
        <Card key={idx.key} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{idx.company || idx.symbol}</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold">
                <CountUp end={idx.price} decimals={2} duration={1} separator="," prefix={idx.key === 'vix' ? '' : '$'} />
              </span>
            </div>
            <div className={`flex items-center text-xs font-medium ${idx.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
              {idx.changePercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
            </div>
            <div className="h-10 mt-3 -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateSparkline(idx.price)}>
                  <Line type="monotone" dataKey="value" stroke={idx.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} dot={false} isAnimationActive={true} />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="overflow-hidden border-border/50 shadow-sm bg-gradient-to-br from-muted/30 to-background flex flex-col justify-center items-center p-5 text-center col-span-2 lg:col-span-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fear & Greed</p>
        <span className="text-3xl font-bold mb-1"><CountUp end={data.fearGreed.value} duration={1.5} /></span>
        <Badge variant={data.fearGreed.value > 50 ? "default" : "destructive"} className="text-xs">
          {data.fearGreed.status}
        </Badge>
      </Card>
    </div>
  );
}

function TopSectors({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Top Sectors" icon={PieChartIcon} />
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((sector: any) => {
          const isPos = sector.changePercent >= 0;
          return (
            <div key={sector.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{sector.name}</span>
                <span className={`font-semibold ${isPos ? 'text-success' : 'text-danger'}`}>
                  {isPos ? '+' : ''}{sector.changePercent.toFixed(2)}%
                </span>
              </div>
              <Progress value={Math.min(Math.abs(sector.changePercent) * 20, 100)} className={`h-1.5 ${isPos ? '[&>div]:bg-success' : '[&>div]:bg-danger'}`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SectorHeatmap({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Sector Heatmap" icon={GridIcon} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.map((sector: any) => {
            const isPos = sector.changePercent >= 0;
            // Scale intensity based on magnitude
            const intensity = Math.min(Math.abs(sector.changePercent) * 15, 100);
            const bgClass = isPos ? 'bg-success' : 'bg-danger';
            return (
              <motion.div 
                whileHover={{ scale: 1.02, zIndex: 10 }}
                key={sector.name} 
                className={`${bgClass} rounded-xl p-3 text-white shadow-sm relative overflow-hidden flex flex-col justify-between aspect-video`}
                style={{ opacity: 0.7 + (intensity / 300) }}
              >
                <span className="text-xs font-medium leading-tight truncate drop-shadow-md">{sector.name}</span>
                <span className="text-sm font-bold drop-shadow-md">{isPos ? '+' : ''}{sector.changePercent.toFixed(2)}%</span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function MarketNews({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Market News" icon={Newspaper} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {data.map((news: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group relative flex flex-col gap-1 pb-4 border-b border-border/40 last:border-0 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">{news.source}</Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(news.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <a href={news.url} target="_blank" rel="noreferrer" className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {news.title}
                </a>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{news.summary}</p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TopMovers({ data }: { data: any }) {
  if (!data) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Top Movers" icon={Activity} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 bg-muted/50">
            <TabsTrigger value="active" className="text-xs">Most Active</TabsTrigger>
            <TabsTrigger value="gainers" className="text-xs">Gainers</TabsTrigger>
            <TabsTrigger value="losers" className="text-xs">Losers</TabsTrigger>
          </TabsList>
          {['active', 'gainers', 'losers'].map(tab => {
            const list = tab === 'active' ? data.mostActive : tab === 'gainers' ? data.gainers : data.losers;
            return (
              <TabsContent key={tab} value={tab} className="space-y-3 outline-none">
                {list && list.length > 0 ? list.map((mover: any, i: number) => (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="flex items-center justify-between p-2 hover:bg-muted/40 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-border shadow-sm">
                        <AvatarImage src={getTickerIconUrl(mover.symbol)} alt={mover.symbol} />
                        <AvatarFallback className="text-xs font-bold bg-foreground text-background">{mover.symbol.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm">{mover.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate w-24 sm:w-32">{mover.company}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">${mover.price?.toFixed(2)}</div>
                      <div className={`text-xs font-bold ${mover.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                        {mover.changePercent >= 0 ? '+' : ''}{mover.changePercent?.toFixed(2)}%
                      </div>
                    </div>
                  </motion.div>
                )) : <div className="text-xs text-muted-foreground text-center py-4">No data</div>}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TrendingStocks({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Trending Stocks" icon={Flame} />
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((stock: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-5 text-center text-xs font-bold text-muted-foreground">{i + 1}</div>
              <Badge variant="secondary" className="font-mono bg-background border-border">{stock.symbol}</Badge>
            </div>
            <Activity className="w-4 h-4 text-muted-foreground opacity-50" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SocialBuzz({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Social Buzz" icon={Globe} />
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((buzz: any, i: number) => (
          <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-border/50 hover:border-border transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono font-bold">{buzz.symbol}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircleIcon className="w-3 h-3"/> {formatNumber(buzz.mentionCount)}</span>
              </div>
              {buzz.trendDirection === 'up' ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-danger" />}
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-muted">
              <div className="bg-success" style={{ width: `${buzz.bullishPercent}%` }} />
              <div className="bg-danger" style={{ width: `${buzz.bearishPercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>{buzz.bullishPercent}% Bullish</span>
              <span>{buzz.bearishPercent}% Bearish</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function UpcomingEarnings({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Upcoming Earnings" icon={Calendar} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-1 pr-4">
            {data.map((earn: any, i: number) => {
              const date = new Date(earn.date);
              const today = new Date();
              const diffTime = Math.abs(date.getTime() - today.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-muted/50 border border-border/50">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <img src={getTickerIconUrl(earn.ticker)} alt="" className="w-3.5 h-3.5 rounded-sm bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <div className="font-bold text-sm">{earn.ticker}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex gap-2">
                        <span>EPS Est: {earn.expectedEPS ? `$${earn.expectedEPS}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={diffDays <= 3 ? "default" : "secondary"} className="text-[10px]">
                    {diffDays === 0 ? 'Today' : `in ${diffDays}d`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ETFPerformance({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="ETF Performance" icon={Landmark} />
      </CardHeader>
      <CardContent className="grid gap-3">
        {data.map((etf: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/20 transition-colors">
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                {etf.symbol}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${etf.changePercent >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{etf.company}</div>
            </div>
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateSparkline(etf.price)}>
                  <defs>
                    <linearGradient id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={etf.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={etf.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke={etf.changePercent >= 0 ? 'var(--success)' : 'var(--danger)'} fillOpacity={1} fill={`url(#color${i})`} />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function IPOCalendar({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="IPO Calendar" icon={Building2} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-2 pr-4">
            {data.map((ipo: any, i: number) => (
              <div key={i} className="flex flex-col gap-1 p-2 border-b border-border/40 last:border-0 hover:bg-muted/20 rounded-lg">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-primary">{ipo.symbol || 'TBA'}</span>
                  <Badge variant="outline" className="text-[10px]">{ipo.date}</Badge>
                </div>
                <span className="text-xs font-medium line-clamp-1">{ipo.company}</span>
                <span className="text-[10px] text-muted-foreground">{ipo.exchange}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function EconomicCalendar({ data }: { data: any }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Economic Calendar" icon={Globe} />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-3 pr-4">
            {data.map((eco: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-2 hover:bg-muted/20 rounded-lg transition-colors border-l-2 border-primary/40">
                <div className="text-xs font-bold text-muted-foreground whitespace-nowrap pt-0.5">{eco.date.split(' ')[0].slice(5)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm line-clamp-2 leading-tight mb-1">{eco.event}</div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span className="bg-muted px-1.5 py-0.5 rounded-sm">{eco.country}</span>
                    {eco.actual && <span>Act: {eco.actual}</span>}
                    {eco.estimate && <span>Est: {eco.estimate}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function MarketStatistics({ data }: { data: any }) {
  if (!data) return null;
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2">
        <SectionHeader title="Market Statistics" icon={BarChart3} />
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/20 rounded-xl border border-border/50">
          <div className="text-xs text-muted-foreground font-medium mb-1">Advancing</div>
          <div className="text-lg font-bold text-success">{formatNumber(data.advancingStocks)}</div>
        </div>
        <div className="p-3 bg-muted/20 rounded-xl border border-border/50">
          <div className="text-xs text-muted-foreground font-medium mb-1">Declining</div>
          <div className="text-lg font-bold text-danger">{formatNumber(data.decliningStocks)}</div>
        </div>
        <div className="p-3 bg-muted/20 rounded-xl border border-border/50">
          <div className="text-xs text-muted-foreground font-medium mb-1">New Highs</div>
          <div className="text-lg font-bold">{data.newHighs}</div>
        </div>
        <div className="p-3 bg-muted/20 rounded-xl border border-border/50">
          <div className="text-xs text-muted-foreground font-medium mb-1">New Lows</div>
          <div className="text-lg font-bold">{data.newLows}</div>
        </div>
        <div className="col-span-2 p-3 bg-muted/20 rounded-xl border border-border/50 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Put/Call Ratio</span>
          <span className="text-lg font-bold">{data.putCallRatio.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom icons since some are not directly in lucide-react standard exports or named differently
function PieChartIcon(props: any) { return <BarChart3 {...props} /> }
function GridIcon(props: any) { return <Activity {...props} /> }
function MessageCircleIcon(props: any) { return <Newspaper {...props} /> }

// ==========================================
// Main Page Implementation
// ==========================================
function InsightsDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

  const { data: queryData, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['marketDashboard', activeTab],
    queryFn: () => fetchDashboard(false, activeTab),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    toast.info("Refreshing market data...");
    const res = await fetchDashboard(true, activeTab);
    queryClient.setQueryData(['marketDashboard', activeTab], res);
    toast.success("Dashboard updated");
  };

  const data = queryData?.data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <Header onRefresh={handleRefresh} isFetching={isFetching} />
      <CategoryTabs active={activeTab} setActive={setActiveTab} />

      {isError ? (
        <div className="w-full h-64 flex items-center justify-center">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {isLoading && !data ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-[465px] rounded-2xl" />
                  <Skeleton className="h-[300px] rounded-2xl" />
                </div>
                
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-[250px] rounded-2xl" />
                  <Skeleton className="h-[300px] rounded-2xl" />
                  <Skeleton className="h-[200px] rounded-2xl" />
                </div>
                
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-[400px] rounded-2xl" />
                  <Skeleton className="h-[150px] rounded-2xl" />
                </div>

                <div className="flex flex-col gap-6 xl:col-span-1">
                  <Skeleton className="h-[350px] rounded-2xl" />
                </div>

                <div className="flex flex-col gap-6 xl:col-span-1">
                  <Skeleton className="h-[300px] rounded-2xl" />
                </div>

                <div className="flex flex-col gap-6 xl:col-span-1">
                  <Skeleton className="h-[300px] rounded-2xl" />
                  <Skeleton className="h-[250px] rounded-2xl" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, staggerChildren: 0.1 }}
              className="space-y-6"
            >
              {/* Top Row: Pulse & Sectors */}
              <div className="w-full">
                <MarketPulse data={data} />
              </div>

              {/* Grid Layout */}
              <AuthGate message="Sign in to access deep market analysis, sentiment tracking, and predictive sector heatmaps.">
                <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-8">
                  {data?.marketNews?.length > 0 && <div className="break-inside-avoid"><MarketNews data={data?.marketNews} /></div>}
                  {data?.socialBuzz?.length > 0 && <div className="break-inside-avoid"><SocialBuzz data={data?.socialBuzz} /></div>}
                  
                  {data?.topSectors?.length > 0 && <div className="break-inside-avoid"><TopSectors data={data?.topSectors} /></div>}
                  {data?.sectorHeatmap?.length > 0 && <div className="break-inside-avoid"><SectorHeatmap data={data?.sectorHeatmap} /></div>}
                  {data?.trendingStocks?.length > 0 && <div className="break-inside-avoid"><TrendingStocks data={data?.trendingStocks} /></div>}
                  
                  {data?.topMovers && <div className="break-inside-avoid"><TopMovers data={data?.topMovers} /></div>}
                  {data?.marketStatistics && <div className="break-inside-avoid"><MarketStatistics data={data?.marketStatistics} /></div>}

                  {data?.etfPerformance?.length > 0 && <div className="break-inside-avoid"><ETFPerformance data={data?.etfPerformance} /></div>}

                  {data?.upcomingEarnings?.length > 0 && <div className="break-inside-avoid"><UpcomingEarnings data={data?.upcomingEarnings} /></div>}

                  {data?.economicCalendar?.length > 0 && <div className="break-inside-avoid"><EconomicCalendar data={data?.economicCalendar} /></div>}
                  {data?.ipoCalendar?.length > 0 && <div className="break-inside-avoid"><IPOCalendar data={data?.ipoCalendar} /></div>}
                </div>
              </AuthGate>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InsightsDashboard />
    </QueryClientProvider>
  );
}
