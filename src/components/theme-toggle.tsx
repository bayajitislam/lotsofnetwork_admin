"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${className}`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}
