"use client";
import Link from 'next/link';
import { Search, Sun, Moon, Bell, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';

import { useTheme } from 'next-themes';
import { UserButton, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isLoaded, userId } = useAuth();
  const links = ['Research', 'Watchlist', 'Compare', 'Insights', 'Alerts', 'Portfolio'];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md dark:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Quantix AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const href = link === 'Research' ? '/' : `/${link.toLowerCase()}`;
              let isActive = false;
              if (link === 'Research') {
                isActive = pathname === '/' || pathname === '/research' || pathname.startsWith('/stock/');
              } else {
                isActive = pathname.startsWith(href);
              }
              
              return (
                <Link
                  key={link}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {link}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search company or ticker..." 
              className="w-[280px] pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-9"
            />
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="w-3 h-3"/> K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              {isLoaded && userId ? (
                <UserButton afterSignOutUrl="/" />
              ) : isLoaded && !userId ? (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium hover:text-primary transition-colors px-3 py-1.5">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
