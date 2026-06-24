export type MetricTrend = 'up' | 'down' | 'neutral';

export interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  trend: MetricTrend;
  chartData: number[];
}

export interface StockMetric {
  label: string;
  value: string | number;
  changePercent?: number;
  trend?: MetricTrend;
}

export interface FinancialSnapshot {
  revenue: StockMetric;
  netIncome: StockMetric;
  grossMargin: StockMetric;
  roe: StockMetric;
}

export interface CompareStock {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: string;
  peRatio: string | number;
  revenueGrowth: number;
  grossMargin: number;
  aiScore: number;
}

export const WATCHLIST_DATA: WatchlistItem[] = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 189.98,
    change: 2.27,
    changePercent: 1.20,
    trend: 'up',
    chartData: [150, 155, 160, 158, 162, 170, 189],
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.75,
    change: 3.50,
    changePercent: 0.85,
    trend: 'up',
    chartData: [390, 395, 400, 410, 405, 412, 415],
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.65,
    change: -0.63,
    changePercent: -0.35,
    trend: 'down',
    chartData: [185, 182, 180, 184, 181, 179, 178],
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    price: 182.32,
    change: 1.82,
    changePercent: 1.01,
    trend: 'up',
    chartData: [170, 175, 172, 178, 180, 181, 182],
  },
];

export const NVIDIA_DATA = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  exchange: 'Nasdaq',
  price: 949.43,
  change: 27.65,
  changePercent: 3.00,
  trend: 'up' as MetricTrend,
  aiRecommendation: 'Strong Buy',
  aiScore: 82,
  priceTarget: 1086.45,
  fairValue: 1032.12,
  confidence: 78,
  summary: "NVIDIA continues to lead the AI revolution with unmatched demand for its GPUs in data centers and gaming. Strong revenue growth, expanding margins, and strategic positioning in AI chips make it a compelling long-term investment.",
  scoreBreakdown: {
    fundamentals: { score: 26, max: 30 },
    newsSentiment: { score: 18, max: 20 },
    industryOutlook: { score: 16, max: 20 },
    valuation: { score: 12, max: 20 },
    riskAssessment: { score: 10, max: 10 },
  },
  financials: {
    revenue: { label: 'Revenue (TTM)', value: '$60.92B', changePercent: 126.1, trend: 'up' as MetricTrend },
    netIncome: { label: 'Net Income (TTM)', value: '$29.76B', changePercent: 581.3, trend: 'up' as MetricTrend },
    grossMargin: { label: 'Gross Margin', value: '78.4%', changePercent: 4.2, trend: 'up' as MetricTrend },
    roe: { label: 'ROE', value: '135.4%', changePercent: 37.6, trend: 'up' as MetricTrend },
  } as FinancialSnapshot,
  chartData: Array.from({ length: 30 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    price: 800 + Math.random() * 200 + (i * 5),
  })),
};

export const COMPARE_DATA: CompareStock[] = [
  { ticker: 'NVDA', name: 'NVIDIA', price: 949.43, changePercent: 3.00, marketCap: '$2.34T', peRatio: 48.21, revenueGrowth: 126.1, grossMargin: 78.4, aiScore: 82 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 166.21, changePercent: 1.35, marketCap: '$252.6B', peRatio: 100.35, revenueGrowth: 14.3, grossMargin: 50.2, aiScore: 64 },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', price: 168.75, changePercent: -0.45, marketCap: '$874.6B', peRatio: 26.12, revenueGrowth: 32.1, grossMargin: 53.1, aiScore: 74 },
  { ticker: 'INTC', name: 'Intel Corporation', price: 31.52, changePercent: -1.25, marketCap: '$133.2B', peRatio: '-', revenueGrowth: -2.4, grossMargin: 35.4, aiScore: 42 },
];
