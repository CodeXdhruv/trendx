import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout-elements";
import { PageTransition } from "@/components/layout-elements";
import { Footer } from "@/components/layout-elements";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Quantix AI - AI-Powered Investment Research",
  description: "Smarter research. Better investments.",
};

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { ui } from '@clerk/ui'
import { ThemeProvider } from "@/components/layout-elements";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      ui={ui}
      appearance={{

        variables: {
          colorPrimary: '#A855F7',
          colorBackground: '#0D0D12',
        },
        elements: {
          card: 'bg-card border border-border shadow-sm rounded-2xl',
          formButtonPrimary: 'bg-primary hover:bg-primary-hover text-primary-foreground',
          socialButtonsBlockButton: 'border border-border bg-background hover:bg-muted text-foreground',
          socialButtonsBlockButtonText: 'font-semibold',
          formFieldInput: 'bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg',
          footerActionLink: 'text-primary hover:text-primary/90',
        }
      }}
      localization={{
        signIn: {
          start: {
            title: 'Quantix AI',
            subtitle: 'Welcome back! Please enter your details.',
          }
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`} suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Navbar />
            <main className="flex-1 flex flex-col">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
