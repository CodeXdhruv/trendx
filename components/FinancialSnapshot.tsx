"use client";
import { FinancialSnapshot as TFinancialSnapshot } from "@/lib/mock-data";

export default function FinancialSnapshot({ data }: { data: TFinancialSnapshot }) {
  const renderMetric = (key: string, metric: any) => {
    const isPositive = metric.trend === 'up';
    return (
      <div key={key} className="flex flex-col">
        <span className="text-xs text-muted-foreground mb-1">{metric.label}</span>
        <span className="text-xl font-bold font-mono mb-1">{metric.value}</span>
        <span className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? '+' : ''}{metric.changePercent}% YoY
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
      {Object.entries(data).map(([key, metric]) => renderMetric(key, metric))}
      
      <div className="md:col-span-4 flex justify-end mt-2">
        <button className="text-sm font-semibold hover:text-primary transition-colors flex items-center gap-1">
          View All Financials <span className="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
