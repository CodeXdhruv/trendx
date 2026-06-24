"use client";
import { X, RefreshCw, Send, FileText, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AIAnalystChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "NVIDIA's growth is primarily driven by explosive demand for AI chips, especially its H100 and Blackwell GPUs. Data center revenue grew 262% YoY. Strong ecosystem, software moat (CUDA), and expanding automotive & robotics segments also contribute significantly.",
      sources: ["Earnings Report Q4 2025", "NVIDIA Investor Relations", "MarketWatch Article – May 15, 2025"]
    }
  ]);
  const [inputValue, setInputValue] = useState('');

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
          <button className="p-2 hover:bg-muted rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Suggested Question */}
      <div className="p-4 flex justify-end">
        <div className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-2xl rounded-tr-sm inline-block shadow-sm">
          What's driving NVIDIA's growth?
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
               <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-muted/50 text-sm p-4 rounded-2xl rounded-tl-sm border border-border/50 text-foreground">
                {msg.content}
              </div>
              {msg.sources && (
                <div className="flex flex-col gap-2 mt-1">
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
            placeholder="Ask another question..." 
            className="w-full pr-12 rounded-xl bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary h-12"
          />
          <button className="absolute right-2 top-2 w-8 h-8 bg-foreground hover:bg-foreground/90 text-background rounded-lg flex items-center justify-center transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
