"use client";
import { Search, Plus, Loader2, BarChart2, CheckCircle2, TrendingUp, ShieldAlert, Award, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Input, Button, Badge, Skeleton } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { getTickerIconUrl } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function ComparePage() {
  const [tickers, setTickers] = useState<string[]>(["MSFT", "NVDA"]);
  const [advancedData, setAdvancedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const { getAdvancedCompare } = useApi();

  const handleCompare = async () => {
    if (!tickers[0] || !tickers[1]) return;
    setLoading(true);
    try {
      const response = await getAdvancedCompare(tickers[0], tickers[1]);
      if (response?.success) {
        setAdvancedData(response.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Extract data for rendering
  const aiWinner = advancedData?.aiWinner;
  const scores = advancedData?.scores || [];
  const radarData = advancedData?.radarData || [];
  const prosCons = advancedData?.prosCons || {};
  const t1 = tickers[0]?.toUpperCase() || "";
  const t2 = tickers[1]?.toUpperCase() || "";

  const compLvl = advancedData?.comparisonLevel;

  // Calculate synthetic overall score based on returned scores array
  const t1Total = scores.reduce((acc: number, curr: any) => acc + (curr[t1] || 0), 0);
  const t2Total = scores.reduce((acc: number, curr: any) => acc + (curr[t2] || 0), 0);
  const maxTotal = scores.length * 100;
  const t1Overall = maxTotal > 0 ? Math.round((t1Total / maxTotal) * 100) : 0;
  const t2Overall = maxTotal > 0 ? Math.round((t2Total / maxTotal) * 100) : 0;

  // Peer maps for recommendations
  const peerMap: Record<string, string[]> = {
    'NVDA': ['AMD', 'AVGO', 'QCOM', 'INTC'],
    'MSFT': ['AAPL', 'AMZN', 'ORCL', 'CRM'],
    'AMZN': ['MSFT', 'GOOGL', 'META', 'WMT'],
    'GOOGL': ['META', 'MSFT', 'AMZN', 'AAPL'],
    'AAPL': ['MSFT', 'GOOGL', 'AMZN', 'META'],
    'TSLA': ['BYD', 'F', 'GM', 'RIVN']
  };
  const getPeers = (ticker: string) => peerMap[ticker] || ['MSFT', 'AAPL', 'GOOGL', 'AMZN'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      {/* Header & Search */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">Compare Stocks</h1>
          <p className="text-muted-foreground">Transparent, evidence-based comparison.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-row items-center gap-1 sm:gap-2 bg-card border border-border rounded-xl p-1.5 sm:p-2 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2 sm:left-3 top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <Input value={tickers[0]} onChange={(e) => setTickers([e.target.value.toUpperCase(), tickers[1]])} className="pl-7 sm:pl-9 border-none shadow-none bg-transparent h-10 w-full min-w-0 text-xs sm:text-sm" />
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2 sm:left-3 top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <Input value={tickers[1]} onChange={(e) => setTickers([tickers[0], e.target.value.toUpperCase()])} className="pl-7 sm:pl-9 border-none shadow-none bg-transparent h-10 w-full min-w-0 text-xs sm:text-sm" />
            </div>
            <Button onClick={handleCompare} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 sm:px-8 h-10 shrink-0 text-xs sm:text-sm">
              {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Compare'}
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-14 w-full rounded-lg" />

          <Skeleton className="h-[250px] w-full rounded-2xl" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] w-full rounded-2xl col-span-1" />
            <Skeleton className="h-[400px] w-full rounded-2xl col-span-2" />
          </div>

          <Skeleton className="h-[300px] w-full rounded-2xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[350px] w-full rounded-2xl" />
            <Skeleton className="h-[350px] w-full rounded-2xl" />
          </div>

          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {!loading && !advancedData && (
        <div className="flex flex-col justify-center items-center py-20 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <BarChart2 className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Ready to Compare</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Enter two stock tickers above and click Compare to generate a transparent, data-backed analysis report.
          </p>
        </div>
      )}

      {/* Main UI */}
      {advancedData && compLvl === 'DIFFERENT_SECTOR' && (
        <div className="bg-card border border-border rounded-2xl p-8 mb-6 flex flex-col items-center text-center">
          <BarChart2 className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Comparison Not Recommended</h2>
          <p className="text-muted-foreground mb-6 max-w-lg">
            <strong>{advancedData.t1Info.name}</strong> ({advancedData.t1Info.sector}) and <strong>{advancedData.t2Info.name}</strong> ({advancedData.t2Info.sector}) operate in completely different sectors. Meaningful quantitative comparison requires companies to share similar business models and financial structures.
          </p>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Try comparing with similar peers</div>
          <div className="flex flex-wrap justify-center gap-3">
            {getPeers(t1).map(peer => (
              <Button key={peer} variant="outline" onClick={() => { setTickers([t1, peer]); handleCompare(); }} className="gap-2">
                Compare with {peer} <ArrowRight className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>
      )}

      {advancedData && compLvl !== 'DIFFERENT_SECTOR' && (
        <>
          {compLvl === 'SAME_INDUSTRY' && (
            <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span><strong>High Confidence Comparison:</strong> Both companies operate in the {advancedData.t1Info.industry} industry.</span>
            </div>
          )}
          {compLvl === 'CROSS_INDUSTRY_THEME' && (
            <div className="bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span><strong>Cross-Industry Comparison:</strong> These companies operate in different GICS sectors but compete within similar megacap or technology investment themes. Some valuation metrics are normalized for fair comparison.</span>
            </div>
          )}
          {compLvl === 'SAME_SECTOR' && (
            <div className="bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span><strong>Warning:</strong> These companies operate in different industries within the {advancedData.t1Info.sector} sector. Some metrics may not be directly comparable.</span>
            </div>
          )}

          {/* Transparent Winner Card */}
          <div className={`bg-card border border-border shadow-2xl rounded-2xl p-8 mb-6 relative overflow-hidden ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
              <div className="flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full shrink-0 border border-primary/30">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Overall Comparison</div>
                <h3 className="text-lg text-muted-foreground mb-1">Winner</h3>
                <div className="flex items-center gap-4 mb-2">
                  <img src={getTickerIconUrl(aiWinner?.ticker || "")} alt="" className="w-10 h-10 rounded-md bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <h2 className="text-4xl font-bold text-white mb-0">{aiWinner?.ticker}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold">
                  <span className="text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border">Confidence: {aiWinner?.confidence}%</span>
                  <span className="text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border">Data Completeness: {aiWinner?.dataCompleteness}%</span>
                  <span className="text-muted-foreground">Updated just now</span>
                </div>
              </div>

              <div className="flex gap-6 items-center border-l border-border/50 pl-8">
                <div className="flex flex-col gap-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Overall Score</div>

                  <div className="flex items-center justify-between gap-6 bg-background/50 p-3 rounded-lg border border-border min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <img src={getTickerIconUrl(t1)} alt="" className="w-4 h-4 rounded-sm bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      <span className="font-bold text-sm">{t1}</span>
                    </div>
                    <span className="text-2xl font-bold font-mono text-[#8884d8]">{t1Overall}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6 bg-background/50 p-3 rounded-lg border border-border min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <img src={getTickerIconUrl(t2)} alt="" className="w-4 h-4 rounded-sm bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      <span className="font-bold text-sm">{t2}</span>
                    </div>
                    <span className="text-2xl font-bold font-mono text-success">{t2Overall}</span>
                  </div>
                </div>
              </div>

              <div className="border-l border-border/50 pl-8 hidden xl:block">
                <div className="text-xs text-muted-foreground mb-3 font-bold uppercase tracking-wider">Decision based on</div>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <li className="flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Financial Health</li>
                  <li className="flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Growth</li>
                  <li className="flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Valuation</li>
                  <li className="flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Profitability</li>
                  <li className="flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Risk</li>
                  <li className="flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> News Sentiment</li>
                  <li className="flex items-center gap-2 text-xs text-foreground"><CheckCircle2 className="w-4 h-4 text-primary" /> Analyst Ratings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why They Win (Pros Comparison) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <img src={getTickerIconUrl(t1)} alt="" className="w-5 h-5 rounded-sm bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                {t1} wins
              </h3>
              <ul className="space-y-4">
                {prosCons[t1]?.pros?.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-success font-bold mt-0.5 text-lg leading-none">+</span>
                    <span className="text-sm text-foreground/90">{p}</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">No prominent advantages found.</li>}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <img src={getTickerIconUrl(t2)} alt="" className="w-5 h-5 rounded-sm bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
                {t2} wins
              </h3>
              <ul className="space-y-4">
                {prosCons[t2]?.pros?.map((p: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-success font-bold mt-0.5 text-lg leading-none">+</span>
                    <span className="text-sm text-foreground/90">{p}</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">No prominent advantages found.</li>}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Comparison Factors (Score Breakdown) */}
            <div className="bg-card border border-border rounded-2xl p-6 col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Comparison Factors</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground border-b border-border pb-2">
                  <span>Factor</span>
                  <div className="flex gap-4">
                    <span className="w-10 text-right">{t1}</span>
                    <span className="w-10 text-right">{t2}</span>
                  </div>
                </div>
                {scores.map((score: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{score.label} <span className="text-xs text-muted-foreground ml-1">({advancedData?.weights?.[score.label.split(' ')[0].toLowerCase()] || 20}%)</span></span>
                    <div className="flex gap-4 font-mono font-bold">
                      <span className="text-[#8884d8] w-10 text-right">{score[t1]}</span>
                      <span className="text-success w-10 text-right">{score[t2]}</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm border-t border-border pt-4 mt-4 font-bold">
                  <span>Total Score</span>
                  <div className="flex gap-4 font-mono">
                    <span className="text-[#8884d8] w-10 text-right">{t1Overall}</span>
                    <span className="text-success w-10 text-right">{t2Overall}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 col-span-2 flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Multidimensional Analysis</h3>
              <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                    <Radar name={t1} dataKey={t1} stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Radar name={t2} dataKey={t2} stroke="var(--success)" fill="var(--success)" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-muted-foreground text-center mt-2">
                *Scores normalized from 0–100 using sector-adjusted percentiles.
              </div>
            </div>
          </div>

          {/* Interactive Comparison Table Placeholder */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-6">Financial Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Metric</th>
                    <th className="px-4 py-3 text-right">{t1}</th>
                    <th className="px-4 py-3 text-right">{t2}</th>
                    <th className="px-4 py-3 text-center">Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {advancedData?.tableMetrics?.map((m: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium">{m.metric}</td>
                      <td className="px-4 py-3 text-right font-mono">{m[t1]}</td>
                      <td className="px-4 py-3 text-right font-mono">{m[t2]}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={m.winner === t1 ? 'text-[#8884d8] border-[#8884d8]/30 bg-[#8884d8]/10' : (m.winner === 'TIE' ? 'text-muted-foreground' : 'text-success border-success/30 bg-success/10')}>
                          {m.winner}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Investment Suitability</h3>
              <div className="space-y-4">
                {advancedData?.suitability?.map((s: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{s.profile} <span className="text-muted-foreground font-normal ml-2">Based on: {s.basis}</span></span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">{t1}</span>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[#8884d8]" style={{ width: `${(s[t1] / 5) * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">{t2}</span>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success" style={{ width: `${(s[t2] / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col justify-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Bottom Line
              </h3>
              <p className="text-foreground text-sm leading-relaxed mb-6">
                {advancedData?.bottomLine?.text}
              </p>
              <div className="flex gap-4 mb-4">
                <div className="bg-card border border-border rounded-lg p-4 flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{advancedData?.bottomLine?.recommendation}</div>
                  <div className="text-xs text-muted-foreground mt-4">Current Price</div>
                  <div className="font-bold text-lg font-mono">${advancedData?.bottomLine?.currentPrice}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 flex-1 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Median Analyst Target</div>
                  <div className="font-bold text-lg font-mono text-foreground mb-2">{advancedData?.bottomLine?.targetPrice}</div>
                  <div className="text-xs text-muted-foreground">Potential Upside</div>
                  <div className="font-bold text-lg font-mono text-success">{advancedData?.bottomLine?.potentialUpside}</div>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground text-right italic">
                Source: Wall Street Analyst Consensus
              </div>
            </div>
          </div>

          {/* Data Sources Footer */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8 text-xs text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-2">
              <div className="font-bold text-foreground">Data Sources</div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                <li>• Live Market Data</li>
                <li>• SEC Filings</li>
                <li>• Analyst Consensus</li>
                <li>• News Aggregation</li>
              </ul>
            </div>
            <div className="text-right">
              <div>Last Updated</div>
              <div className="font-mono mt-1 text-foreground">{new Date().toISOString().slice(0, 10)} • {new Date().toISOString().slice(11, 16)} UTC</div>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
