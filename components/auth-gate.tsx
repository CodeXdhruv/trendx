"use client";
import React from 'react';
import { useUser, SignInButton } from "@clerk/nextjs";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui";

export function AuthGate({ children, message = "Authentication required for data access" }: { children: React.ReactNode, message?: string }) {
  const { isLoaded, isSignedIn } = useUser();
  
  if (!isLoaded) return <div className="animate-pulse bg-muted/10 h-64 w-full rounded-2xl"></div>;
  
  if (isSignedIn) return <>{children}</>;
  
  return (
    <div className="relative w-full overflow-hidden">
      <div className="blur-xl opacity-20 pointer-events-none select-none max-h-[500px] overflow-hidden grayscale">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
        <div className="flex flex-col items-center gap-4 p-8">
          <Lock className="w-4 h-4 text-muted-foreground/50" strokeWidth={2} />
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.2em] max-w-[300px] leading-relaxed">
            {message}
          </p>
          <SignInButton mode="modal">
            <Button 
              variant="default"
              className="mt-4 rounded-md font-medium text-sm px-8 h-10 shadow-md hover:shadow-lg transition-all"
            >
              Authenticate
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
