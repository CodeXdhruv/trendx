import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui";
import { Search } from "lucide-react";
import { getTickerIconUrl } from "@/lib/utils";

export function TickerAutocomplete({ value, onChange, onSelect, placeholder, className, autoFocus, disabled, errorClass, inputRef, children }: any) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const skipNextFetch = useRef(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (skipNextFetch.current) {
        skipNextFetch.current = false;
        return;
      }

      if (query && query.length >= 2) {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';
        fetch(`${BACKEND_URL}/search?q=${query}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.results.length > 0) {
              setResults(data.results);
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          })
          .catch(() => setIsOpen(false));
      } else {
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (ticker: string) => {
    skipNextFetch.current = true;
    onChange(ticker);
    setQuery(ticker);
    setIsOpen(false);
    if (onSelect) onSelect(ticker);
  };

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value.toUpperCase());
        }}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        className={`pl-9 w-full h-full ${errorClass || ''}`}
        disabled={disabled}
      />
      {children}
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {results.map((res: any, idx: number) => (
            <div
              key={idx}
              onClick={() => handleSelect(res.symbol)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0 transition-colors"
            >
              <img src={getTickerIconUrl(res.symbol)} alt={res.symbol} className="w-8 h-8 rounded-md bg-white p-0.5 border border-border/50 shrink-0" onError={(e) => e.currentTarget.style.display = 'none'} />
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-bold text-sm text-foreground">{res.symbol}</span>
                <span className="text-xs text-muted-foreground truncate">{res.name}</span>
              </div>
              <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md uppercase shrink-0">{res.exchange}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
