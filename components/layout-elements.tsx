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
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Menu, X } from 'lucide-react';


export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isLoaded, userId } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const links = ['Home', 'Watchlist', 'Compare', 'Insights', 'Alerts'];

  const searchInputRef = useRef<HTMLInputElement>(null);

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
              <img src="/logo-light.png" alt="StockForge Logo" className="w-8 h-8 dark:hidden object-contain" />
              <img src="/logo-dark.png" alt="StockForge Logo" className="hidden dark:block w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">StockForge</span>
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
              const formData = new FormData(e.currentTarget);
              const query = formData.get('search');
              if (query) {
                // If router is not available here, we could use standard window.location, but we can import useRouter
                window.location.href = `/stock/${query.toString().trim().toUpperCase()}`;
              }
            }}
            className="relative hidden lg:flex items-center"
          >
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input 
              ref={searchInputRef}
              name="search"
              placeholder="Search company or ticker..." 
              className="w-[280px] pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-9"
            />
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="w-3 h-3"/> K
              </kbd>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <div className="w-5 h-5" />}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            
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
                    window.location.href = `/stock/${query.toString().trim().toUpperCase()}`;
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

