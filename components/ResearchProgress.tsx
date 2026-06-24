"use client";
import { Check, Loader2, Circle, Bot, FileText, BarChart2, Briefcase, AlertTriangle, TrendingUp } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const agents = [
  { id: 'fundamentals', label: 'Fundamentals Agent', status: 'completed', icon: FileText },
  { id: 'news', label: 'News Agent', status: 'completed', icon: BarChart2 },
  { id: 'sentiment', label: 'Sentiment Agent', status: 'completed', icon: Briefcase },
  { id: 'industry', label: 'Industry Agent', status: 'completed', icon: AlertTriangle },
  { id: 'risk', label: 'Risk Agent', status: 'in_progress', icon: AlertTriangle },
  { id: 'valuation', label: 'Valuation Agent', status: 'pending', icon: TrendingUp },
];

export default function ResearchProgress() {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(78), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Stepper */}
        <div className="flex-1 w-full overflow-x-auto pb-4 lg:pb-0">
          <div className="flex items-center min-w-[800px]">
            {agents.map((agent, index) => {
              const isCompleted = agent.status === 'completed';
              const isInProgress = agent.status === 'in_progress';
              const isPending = agent.status === 'pending';

              return (
                <div key={agent.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center relative z-10 w-24">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 relative
                      ${isCompleted ? 'bg-success/10 text-success' : 
                        isInProgress ? 'bg-primary/10 text-primary' : 
                        'bg-muted text-muted-foreground'}`}
                    >
                      {isInProgress && (
                        <motion.div 
                          className="absolute inset-0 border-2 border-primary rounded-xl"
                          animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                      <agent.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-semibold text-center whitespace-nowrap">{agent.label}</div>
                    <div className="text-xs mt-1 flex items-center gap-1 font-medium h-4">
                      {isCompleted && <><Check className="w-3 h-3 text-success"/> <span className="text-success">Completed</span></>}
                      {isInProgress && <><Loader2 className="w-3 h-3 text-primary animate-spin"/> <span className="text-primary">In Progress</span></>}
                      {isPending && <><Circle className="w-3 h-3 text-muted-foreground"/> <span className="text-muted-foreground">Pending</span></>}
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < agents.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-2 relative -top-6">
                      {isCompleted && (
                        <motion.div 
                          className="absolute left-0 top-0 bottom-0 bg-success"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.5, delay: index * 0.2 }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side - Progress & Mascot */}
        <div className="w-full lg:w-72 flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6">
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold">Overall Progress</span>
              <span className="text-lg font-bold font-mono">{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2 bg-muted [&>div]:bg-primary" />
          </div>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center shrink-0">
             <Bot className="w-8 h-8 text-foreground" />
          </div>
        </div>

      </div>
    </div>
  );
}
