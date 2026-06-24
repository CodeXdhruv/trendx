"use client";
import Link from 'next/link';
import { Search, Sun, Moon, Bell, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
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
              const href = link === 'Research' ? '/research' : link === 'Compare' ? '/compare' : link === 'Watchlist' ? '/watchlist' : link === 'Portfolio' ? '/portfolio' : `/${link.toLowerCase()}`;
              // Research highlights on '/' or '/research'
              const isActive = pathname === href || (link === 'Research' && pathname === '/');
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
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </button>
            
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-semibold leading-none">Arjun Mehta</span>
                <span className="text-[10px] text-muted-foreground mt-1">Pro Plan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
