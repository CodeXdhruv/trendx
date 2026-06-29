"use client";
import { Rocket } from "lucide-react";

import * as React from "react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { Input } from "@/components/ui";
import { Search, Sun, Moon, Bell, Command } from 'lucide-react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { UserButton, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X, ArrowUpRight, ArrowDownRight, Activity, AlertCircle } from 'lucide-react';
import { TickerAutocomplete } from "@/components/ticker-autocomplete";
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isLoaded, userId } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const links = ['Home', 'Watchlist', 'Compare', 'Insights'];
  const { getMarketOverview, getWatchlist } = useApi();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const alertsRef = useRef<HTMLDivElement>(null);

  // Close alerts dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const newAlerts = [];
        const now = new Date();
        const currentHour = now.getHours();
        
        // 1. Market Mood Alert & 2. Daily Movers Digest
        try {
          const response = await getMarketOverview();
          const dash = response?.data?.dashboard;

          if (dash?.fearGreed?.value < 40) {
            newAlerts.push({
              id: 'mood',
              title: 'Market Sentiment Warning',
              message: `The Fear & Greed Index has dropped to Fear (${dash.fearGreed.value}).`,
              type: 'warning',
              icon: <AlertCircle className="w-4 h-4 text-warning" />,
              time: 'Just now'
            });
          }

          // Daily automated alerts (only trigger after 6 AM)
          if (currentHour >= 6 && dash) {
            // Morning Market Digest uses real Market News
            if (dash.marketNews && dash.marketNews.length > 0) {
              const topNews = dash.marketNews[0];
              newAlerts.push({
                id: 'morning-digest',
                title: 'Morning Market Digest',
                message: topNews.title.length > 80 ? topNews.title.substring(0, 80) + '...' : topNews.title,
                type: 'info',
                icon: <Sun className="w-4 h-4 text-primary" />,
                time: '6:00 AM'
              });
            }

            // Stock of the Day uses the actual Top Gainer from API
            if (dash.topMovers?.gainers && dash.topMovers.gainers.length > 0) {
              const sotd = dash.topMovers.gainers[0];
              newAlerts.push({
                id: 'sotd',
                title: 'Stock of the Day',
                message: `${sotd.company || sotd.symbol} is up +${sotd.changePercent?.toFixed(2)}% today. Consider reviewing its latest insights.`,
                type: 'success',
                icon: <Rocket className="w-4 h-4 text-success" />,
                time: '6:00 AM'
              });
            }
          }
        } catch (e) {
          console.error("Failed to fetch dashboard alerts", e);
        }

        // 3. Watchlist Volatility Spikes
        if (userId) {
          try {
            const watchlistData = await getWatchlist();
            if (watchlistData?.success && Array.isArray(watchlistData?.data)) {
              const highVolatility = watchlistData.data.filter((item: any) => Math.abs(item.changePercent) > 2);
              if (highVolatility.length > 0) {
                highVolatility.slice(0, 2).forEach((item: any) => {
                  const isDown = item.changePercent < 0;
                  newAlerts.push({
                    id: `vol-${item.ticker}`,
                    title: 'Volatility Spike',
                    message: `${item.ticker} has moved ${isDown ? 'down' : 'up'} by ${Math.abs(item.changePercent).toFixed(2)}% today.`,
                    type: isDown ? 'danger' : 'success',
                    icon: isDown ? <ArrowDownRight className="w-4 h-4 text-danger" /> : <ArrowUpRight className="w-4 h-4 text-success" />,
                    time: '2h ago'
                  });
                });
              }
            }
          } catch (e) {
            console.error("Failed to fetch watchlist alerts", e);
          }
        }
        
        
        setAlerts(newAlerts);
        
        // Handle unread status based on daily reset (12 AM)
        const lastRead = localStorage.getItem('alertsReadDate');
        const todayStr = now.toDateString();
        
        if (lastRead !== todayStr) {
          setUnreadCount(newAlerts.length);
        } else {
          setUnreadCount(0);
        }
      } catch (e) {
        console.error("Failed to load alerts", e);
      }
    };
    
    if (isLoaded) {
      fetchAlerts();
    }
  }, [isLoaded, userId]);

  const handleMarkAllRead = () => {
    localStorage.setItem('alertsReadDate', new Date().toDateString());
    setUnreadCount(0);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K on Mac, Ctrl+K or Win+K on Windows/Linux
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md dark:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo-light.png" alt="StocksForge Logo" className="w-8 h-8 dark:hidden object-contain" />
              <img src="/logo-dark.png" alt="StocksForge Logo" className="hidden dark:block w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">StocksForge</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => {
              let displayLabel = link;
              const href = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
              let isActive = false;
              if (link === 'Home') {
                isActive = pathname === '/' || pathname === '/research' || pathname.startsWith('/stock/');
                if (pathname.startsWith('/stock/')) {
                  const ticker = pathname.split('/')[2];
                  if (ticker) {
                    displayLabel = `Researching: ${ticker.toUpperCase()}`;
                  }
                }
              } else {
                isActive = pathname.startsWith(href);
              }

              return (
                <Link
                  key={link}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {displayLabel}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery) {
                router.push(`/stock/${searchQuery.trim().toUpperCase()}`);
              }
            }}
            className="relative hidden lg:flex items-center"
          >
            <TickerAutocomplete
              inputRef={searchInputRef}
              value={searchQuery}
              onChange={(val: string) => setSearchQuery(val)}
              onSelect={(val: string) => router.push(`/stock/${val}`)}
              placeholder="Search company or ticker..."
              className="w-[280px]"
              errorClass="pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-9"
            >
              <div className="absolute right-3 flex items-center gap-1 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <Command className="w-3 h-3" /> K
                </kbd>
              </div>
            </TickerAutocomplete>
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>
            <div className="relative" ref={alertsRef}>
              <button 
                onClick={() => { setIsAlertsOpen(!isAlertsOpen); setUnreadCount(0); }}
                className={`p-2 rounded-full transition-colors relative ${isAlertsOpen ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {isAlertsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="px-3 py-2.5 border-b border-border/60 flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-foreground">Alerts</h4>
                      <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-full">{alerts.length} New</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="p-6 text-center flex flex-col items-center justify-center text-muted-foreground">
                          <Bell className="w-6 h-6 mb-2 opacity-20" />
                          <p className="text-xs font-medium">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {alerts.map((alert, idx) => (
                            <div key={idx} className="p-3 border-b border-border/40 hover:bg-muted/40 transition-colors cursor-pointer flex gap-2.5 items-start">
                              <div className={`mt-0.5 p-1.5 rounded-md bg-muted/30 border border-border/50 flex-shrink-0 shadow-sm`}>
                                {alert.icon}
                              </div>
                              <div className="flex flex-col gap-0.5 w-full">
                                <div className="flex justify-between items-start w-full">
                                  <h5 className="text-[13px] font-medium text-foreground">{alert.title}</h5>
                                  <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-2">{alert.time}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug pr-1 mt-0.5">{alert.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-2 text-center border-t border-border/60">
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              {isLoaded && userId ? (
                <UserButton />
              ) : isLoaded && !userId ? (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium hover:text-primary transition-colors px-3 py-1.5">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary-hover transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 rounded bg-muted animate-pulse" />
                  <div className="w-20 h-8 rounded bg-muted animate-pulse" />
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const query = formData.get('search');
                  if (query) {
                    router.push(`/stock/${query.toString().trim().toUpperCase()}`);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="relative flex items-center w-full mb-2"
              >
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search company or ticker..."
                  className="w-full pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-10"
                />
              </form>

              {links.map((link) => {
                let displayLabel = link;
                const href = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
                let isActive = false;
                if (link === 'Home') {
                  isActive = pathname === '/' || pathname === '/research' || pathname.startsWith('/stock/');
                  if (pathname.startsWith('/stock/')) {
                    const ticker = pathname.split('/')[2];
                    if (ticker) {
                      displayLabel = `Researching: ${ticker.toUpperCase()}`;
                    }
                  }
                } else {
                  isActive = pathname.startsWith(href);
                }

                return (
                  <Link
                    key={link}
                    href={href}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    {displayLabel}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return null;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

