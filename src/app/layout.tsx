import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Command Center | Lots of Network",
  description: "Administrative console and control center for Lots of Network",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          {/* Global Header */}
          <header className="w-full border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  LN
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white tracking-tight">
                    Lots of Network
                  </span>
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Admin
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Body */}
          <div className="flex-1 flex flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
