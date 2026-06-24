"use client";
import { Search, Plus } from "lucide-react";
import { COMPARE_DATA } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ComparePage() {
  const data = COMPARE_DATA;

  const renderHighlight = (value: number, allValues: number[], isHigherBetter = true) => {
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    if (value === (isHigherBetter ? max : min)) return "text-success font-bold";
    if (value === (isHigherBetter ? min : max)) return "text-danger font-bold";
    return "";
  };

  const aiScores = data.map(d => d.aiScore);
  const revGrowths = data.map(d => d.revenueGrowth);
  const margins = data.map(d => d.grossMargin);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Compare Stocks</h1>
        <p className="text-muted-foreground">Compare up to 4 companies side by side.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {data.map((stock, i) => (
          <div key={i} className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              defaultValue={stock.ticker} 
              className="pl-9 bg-card border-border shadow-sm rounded-lg"
            />
          </div>
        ))}
        {data.length < 4 && (
          <button className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors h-10">
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px] bg-muted/30"></TableHead>
              {data.map((stock) => (
                <TableHead key={stock.ticker} className="min-w-[150px] p-6 align-top">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center font-bold text-xs mb-3 shadow-sm">
                      {stock.ticker.substring(0, 4)}
                    </div>
                    <div className="font-bold text-foreground">{stock.ticker}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{stock.name}</div>
                    <div className="mt-3">
                      <div className="font-mono font-bold">${stock.price.toFixed(2)}</div>
                      <div className={`text-xs font-semibold ${stock.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium bg-muted/30 text-muted-foreground">Market Cap</TableCell>
              {data.map((stock) => (
                <TableCell key={stock.ticker} className="text-center font-mono">{stock.marketCap}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-muted/30 text-muted-foreground">P/E Ratio (TTM)</TableCell>
              {data.map((stock) => (
                <TableCell key={stock.ticker} className="text-center font-mono">{stock.peRatio}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-muted/30 text-muted-foreground">Revenue Growth (YoY)</TableCell>
              {data.map((stock) => (
                <TableCell key={stock.ticker} className={`text-center font-mono ${renderHighlight(stock.revenueGrowth, revGrowths)}`}>
                  {stock.revenueGrowth > 0 ? '+' : ''}{stock.revenueGrowth}%
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-muted/30 text-muted-foreground">Gross Margin</TableCell>
              {data.map((stock) => (
                <TableCell key={stock.ticker} className={`text-center font-mono ${renderHighlight(stock.grossMargin, margins)}`}>
                  {stock.grossMargin}%
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-muted/30 text-muted-foreground">AI Research Score</TableCell>
              {data.map((stock) => (
                <TableCell key={stock.ticker} className={`text-center font-mono ${renderHighlight(stock.aiScore, aiScores)}`}>
                  {stock.aiScore}/100
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
