"use client";
import { Rocket } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A0A0A] text-white py-12 mt-auto border-t border-border/10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Ready to make smarter investment decisions?</h3>
            <p className="text-sm text-white/60">Join 15,000+ investors using Quantix AI for research.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Start Free Research
          </button>
          <button className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </footer>
  );
}
