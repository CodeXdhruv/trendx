"use client";
import { AlertTriangle, BarChart2, Bot, Briefcase, Check, Circle, FileText, Loader2, RefreshCw, Send, Sparkles, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";

import { Input } from "@/components/ui";
import { Progress } from "@/components/ui";


export function AIAnalystChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ id: number; role: string; content: string; sources?: string[]; }[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I am your AI Investment Analyst. Ask me any question about the company's financials, recent news, or market sentiment.",
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newUserMsg = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    
    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Based on current market analysis, this is an interesting observation. The company continues to invest heavily in R&D to maintain its competitive edge."
      }]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          Ask AI Analyst
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground">
          <button onClick={() => setMessages([messages[0]])} className="p-2 hover:bg-muted rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Suggested Question */}
      <div className="p-4 flex justify-end">
        <div 
          onClick={() => setInputValue("What's driving NVIDIA's growth?")}
          className="bg-primary cursor-pointer hover:bg-primary-hover text-primary-foreground text-sm px-4 py-2 rounded-2xl rounded-tr-sm inline-block shadow-sm"
        >
          What's driving NVIDIA's growth?
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                 <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`text-sm p-4 rounded-2xl border ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm border-transparent' : 'bg-muted/50 rounded-tl-sm border-border/50 text-foreground'}`}>
                {msg.content}
              </div>
              {msg.sources && (
                <div className="flex flex-col gap-2 mt-1 w-full">
                  <span className="text-xs font-semibold text-muted-foreground">Sources</span>
                  {msg.sources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3 py-2 rounded-lg">
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="truncate">{source}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask another question..." 
            className="w-full pr-12 rounded-xl bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary h-12"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-2 w-8 h-8 bg-foreground hover:bg-foreground/90 text-background rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const agents = [
  { id: 'fundamentals', label: 'Fundamentals Agent', status: 'completed', icon: FileText },
  { id: 'news', label: 'News Agent', status: 'completed', icon: BarChart2 },
  { id: 'sentiment', label: 'Sentiment Agent', status: 'completed', icon: Briefcase },
  { id: 'industry', label: 'Industry Agent', status: 'completed', icon: AlertTriangle },
  { id: 'risk', label: 'Risk Agent', status: 'in_progress', icon: AlertTriangle },
  { id: 'valuation', label: 'Valuation Agent', status: 'pending', icon: TrendingUp },
];

export function ResearchProgress() {
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

