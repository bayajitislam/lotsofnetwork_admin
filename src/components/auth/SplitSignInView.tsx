"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  RefreshCw, 
  Sparkles,
  ExternalLink,
  KeyRound
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { authApi, UserProfile, ApiError } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: string | number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type AuthState = "idle" | "verifying" | "success" | "denied" | "error";

export function SplitSignInView() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<AuthState>("idle");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDevSimulation, setShowDevSimulation] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("realbayajitislam@gmail.com");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Google Token Response
  const handleCredentialResponse = useCallback(async (credential: string) => {
    setState("verifying");
    setErrorMessage(null);

    try {
      const authData = await authApi.loginWithGoogle(credential);
      const user = authData.user;

      localStorage.setItem("admin_access_token", authData.access_token);
      localStorage.setItem("admin_refresh_token", authData.refresh_token);
      setCurrentUser(user);

      if (user.role === "admin") {
        setState("success");
      } else {
        setState("denied");
      }
    } catch (err: unknown) {
      setState("error");
      if (err instanceof ApiError) {
        setErrorMessage(err.detail);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Authentication failed. Ensure your backend server is running.");
      }
    }
  }, []);

  // Initialize official Google Identity Services button if Client ID exists
  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => handleCredentialResponse(response.credential),
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: theme === "dark" ? "filled_black" : "outline",
          size: "large",
          width: 360,
          text: "continue_with",
          shape: "pill",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleClientId, theme, handleCredentialResponse]);

  // Dev simulation helper
  const handleDevSimulation = (email: string, name: string) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(
      JSON.stringify({
        email,
        name,
        sub: `dev_sub_${Date.now()}`,
        email_verified: true,
        iss: "https://accounts.google.com",
      })
    );
    const mockToken = `${header}.${payload}.mock_signature`;
    handleCredentialResponse(mockToken);
  };

  const handleReset = () => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    setCurrentUser(null);
    setState("idle");
    setErrorMessage(null);
  };

  // Determine which background image to use
  const heroImage = (mounted && theme === "dark") ? "/images/auth-dark.jpg" : "/images/auth-light.jpg";

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
      {/* Mockup Browser / Window Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#060911] transition-all duration-300">
        
        {/* Top Browser Bar */}
        <div className="h-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/80 dark:bg-[#0a0f1d] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>admin.lotsofnetwork.com</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden md:inline">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Split Content (50 / 50) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[720px]">
          
          {/* LEFT COLUMN: Visual Artwork (7 cols on large screens, or 6) */}
          <div className="lg:col-span-6 p-4 sm:p-6 flex flex-col">
            <div className="relative flex-1 rounded-2xl overflow-hidden min-h-[380px] lg:min-h-full shadow-inner flex flex-col justify-between p-6 sm:p-10">
              
              {/* Background Wallpaper */}
              {mounted && (
                <Image
                  src={heroImage}
                  alt="Network Landscape"
                  fill
                  priority
                  className="object-cover transition-opacity duration-700 select-none"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}

              {/* Gradient Scrim for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent dark:from-black/95 dark:via-black/40" />

              {/* Top Badge */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 text-white text-xs font-medium tracking-wide shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  <span>Lots of Network</span>
                  <span className="opacity-40">|</span>
                  <span className="font-semibold text-blue-200">Admin Control</span>
                </div>
              </div>

              {/* Bottom Typography (Matches screenshot aesthetic) */}
              <div className="relative z-10 text-white space-y-2 mt-auto">
                <p className="text-xs font-semibold tracking-widest uppercase text-blue-200/90">
                  Infrastructure & Ad Monetization
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Network Intelligence<br />
                  Everything Under Control
                </h2>
                <p className="text-xs sm:text-sm text-slate-200/80 max-w-md pt-1 font-light leading-relaxed">
                  Real-time tool telemetry, crash reporting, sponsored ad slots, and automated Google search indexing.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Login Form (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-14 lg:px-16 py-10 relative overflow-hidden">
            
            {/* Ambient Radial Cobalt Glow behind the Form (Matches screenshot) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-blue-600/15 dark:bg-blue-600/25 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-md w-full mx-auto space-y-7">
              
              {/* Form Header */}
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                  Login your account
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome Back!
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter your credentials or sign in with your authorized Google account
                </p>
              </div>

              {/* Form Body based on Auth State */}
              {state === "idle" && (
                <div className="space-y-5">
                  
                  {/* Visual Email Field with Glowing Focus (Matching screenshot) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Email address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={selectedEmail}
                        onChange={(e) => setSelectedEmail(e.target.value)}
                        placeholder="realbayajitislam@gmail.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Visual Password / Security Token Field with Neon Blue Glow (Matches screenshot glow) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Administrator Authentication
                    </label>
                    <div className="relative flex items-center rounded-2xl p-0.5 shadow-[0_0_24px_rgba(37,99,235,0.25)] dark:shadow-[0_0_35px_rgba(59,130,246,0.35)] transition-shadow">
                      <div className="w-full relative flex items-center">
                        <Lock className="absolute left-4 w-4 h-4 text-blue-500" />
                        <input
                          type="password"
                          readOnly
                          value="••••••••••••••••••••••••"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-blue-400/50 dark:border-blue-500/60 text-slate-900 dark:text-white text-sm focus:outline-hidden cursor-default"
                        />
                        <span className="absolute right-4 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/60">
                          Google Verified
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end pt-0.5">
                      <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        Whitelisted Google ID required
                      </span>
                    </div>
                  </div>

                  {/* Primary Google Sign-In Action (Matching screenshot's dark pill button) */}
                  <div className="pt-2">
                    {googleClientId ? (
                      <div ref={googleBtnRef} className="w-full flex justify-center min-h-[46px]" />
                    ) : (
                      <button
                        onClick={() => handleDevSimulation(selectedEmail, "Bayajit Islam")}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-950 dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-slate-850 text-white font-medium shadow-lg hover:shadow-xl dark:border dark:border-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span className="text-sm font-semibold">Sign in with Google</span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>

                  {/* Dev Testing Toggle (For local role validation) */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowDevSimulation(!showDevSimulation)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer font-medium"
                    >
                      <KeyRound className="w-3 h-3" />
                      {showDevSimulation ? "Hide Simulation Helpers" : "Quick Role Simulation (Admin vs Regular User)"}
                    </button>

                    {showDevSimulation && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 text-left animate-in fade-in duration-200">
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          Simulate backend role resolution:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmail("realbayajitislam@gmail.com");
                              handleDevSimulation("realbayajitislam@gmail.com", "Bayajit Islam (Admin)");
                            }}
                            className="text-xs py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition cursor-pointer text-center"
                          >
                            Admin Login
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmail("developer@example.com");
                              handleDevSimulation("developer@example.com", "Regular User");
                            }}
                            className="text-xs py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition cursor-pointer text-center"
                          >
                            User (Denied)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STATE: VERIFYING */}
              {state === "verifying" && (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-950" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Verifying Administrator Status
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Querying security credentials from Lots of Network backend...
                    </p>
                  </div>
                </div>
              )}

              {/* STATE: SUCCESS (ADMIN CONFIRMED) */}
              {state === "success" && currentUser && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 truncate">
                          Administrator Verified
                        </h4>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 uppercase">
                          Admin
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/dashboard";
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                    >
                      <span>Enter Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Account / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STATE: DENIED (USER IS NOT ADMIN) */}
              {state === "denied" && currentUser && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                          Access Denied: Administrator Privileges Required
                        </h4>
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 uppercase mt-0.5">
                          Standard User Account
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                      Signed in as <span className="font-semibold text-rose-900 dark:text-rose-100">{currentUser.email}</span>. This account is not listed on the administrator whitelist for <code className="bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded">admin.lotsofnetwork.com</code>.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition duration-200 cursor-pointer text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Try Another Google Account</span>
                    </button>

                    <a
                      href="https://lotsofnetwork.com"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      <span>Return to Lots of Network Public Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* STATE: ERROR */}
              {state === "error" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Connection or Verification Error
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {errorMessage || "Unable to reach the backend API at http://localhost:8000."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {/* Security Audit Badge */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit SSL / Google Identity OAuth 2.0</span>
                </div>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
