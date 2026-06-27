"use client";
import { WatchlistPanel } from "@/components/dashboard-widgets";

export default function WatchlistPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-2xl font-bold mb-2">My Watchlist</h1>
        <p className="text-muted-foreground">Track your favorite stocks and their performance.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Reusing the WatchlistPanel component but full width */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
           <WatchlistPanel />
        </div>
      </div>
    </div>
  );
}
