"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  LogOut, 
  RefreshCw, 
  ExternalLink,
  Activity,
  Globe2,
  ArrowRight
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NetworkTopologyMesh } from "@/components/auth/NetworkTopologyMesh";
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
  const [state, setState] = useState<AuthState>("idle");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Handle Google Token Response from GIS
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
        setErrorMessage("Authentication failed. Please verify that the backend API is running.");
      }
    }
  }, []);

  // Initialize official Google Identity Services
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
          theme: "outline",
          size: "large",
          width: 340,
          text: "signin_with",
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
  }, [googleClientId, handleCredentialResponse]);

  // Direct Google Sign-In button click handler
  const triggerGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // If client ID is pending configuration, prompt helpful setup guidance
      setErrorMessage(
        "Google Client ID is not configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID in lotsofnetwork_admin/.env.local."
      );
      setState("error");
    }
  };

  const handleReset = () => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    setCurrentUser(null);
    setState("idle");
    setErrorMessage(null);
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#060911] transition-colors duration-300">
      
      {/* ======================================================== */}
      {/* LEFT COLUMN: Fullscreen Network Infrastructure Visual    */}
      {/* ======================================================== */}
      <div className="lg:col-span-6 relative overflow-hidden min-h-[380px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-14 z-10 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/5">
        
        {/* Animated Network Topology Mesh Canvas */}
        <NetworkTopologyMesh />

        {/* Subtle Darkening Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 dark:from-black/90 dark:via-black/30 pointer-events-none" />

        {/* Top Header & Telemetry Status */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-white text-xs font-semibold shadow-xs">
            <Globe2 className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Lots of Network</span>
            <span className="opacity-30">/</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">admin.lotsofnetwork.com</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Nodes Online</span>
          </div>
        </div>

        {/* Bottom Hero Overlay Typography */}
        <div className="relative z-20 space-y-4 max-w-lg mt-auto pt-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider font-semibold uppercase bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <Activity className="w-3 h-3 text-blue-500" />
            Real-Time Network Operations
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            Network Intelligence.<br />
            Everything Under Control.
          </h2>

          <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-light">
            Centralized operations for 22 network diagnostics tools, real-time BGP & DNS telemetry, sponsored ad engine, and automated Google index management.
          </p>

          {/* Quick Metrics Badges */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/10">
              22 Tools Monitored
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/10">
              Google OAuth 2.0
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/10">
              RBAC Protected
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Fullscreen Authentication Panel            */}
      {/* ======================================================== */}
      <div className="lg:col-span-6 relative flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-[550px] lg:min-h-screen">
        
        {/* Floating Theme Toggle (Top Right Corner) */}
        <div className="w-full flex justify-end items-center gap-3 relative z-30">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Theme</span>
          <ThemeToggle />
        </div>

        {/* Ambient Radial Blue Glow behind the Form (Matches reference screenshot) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 sm:w-[520px] h-96 sm:h-[520px] bg-blue-600/15 dark:bg-blue-600/25 blur-3xl rounded-full pointer-events-none" />

        {/* Centered Authentication Form */}
        <div className="my-auto max-w-md w-full mx-auto relative z-20 space-y-8">
          
          {/* Header */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
              Login your account
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome Back!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in with your authorized Google administrator account to enter the command center.
            </p>
          </div>

          {/* STATE: IDLE */}
          {state === "idle" && (
            <div className="space-y-6">
              
              {/* Google Sign-In Container */}
              <div className="pt-2">
                {googleClientId ? (
                  <div ref={googleBtnRef} className="w-full flex justify-center min-h-[48px]" />
                ) : (
                  <button
                    onClick={triggerGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3.5 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 dark:bg-slate-900 dark:hover:bg-slate-850 text-white font-semibold text-sm shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 border border-slate-800 dark:border-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                    <span>Sign in with Google</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-auto" />
                  </button>
                )}
              </div>

              {/* Security Guard Notice */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Restricted Administrator Portal</span>
                </div>
                <p className="leading-relaxed pl-6">
                  Only whitelisted administrator emails (<code className="font-mono text-blue-600 dark:text-blue-400">realbayajitislam@gmail.com</code>) will be granted access. All access attempts are cryptographically verified and recorded.
                </p>
              </div>
            </div>
          )}

          {/* STATE: VERIFYING */}
          {state === "verifying" && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-950" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Verifying Security Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Validating Google identity and querying administrator authorization...
                </p>
              </div>
            </div>
          )}

          {/* STATE: SUCCESS (ADMIN CONFIRMED) */}
          {state === "success" && currentUser && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 truncate">
                      Administrator Confirmed
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
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                      Access Denied: Administrator Privileges Required
                    </h4>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 uppercase mt-0.5">
                      Standard User Account
                    </span>
                  </div>
                </div>

                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  Signed in as <span className="font-semibold text-rose-900 dark:text-rose-100">{currentUser.email}</span>. This account is not authorized on the administrator whitelist for <code className="bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded">admin.lotsofnetwork.com</code>.
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
                  Authentication Notice
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
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
        </div>

        {/* Footer Security Badge */}
        <div className="w-full pt-6 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit SSL / Google Identity OAuth 2.0</span>
          </div>
          <span>Lots of Network Admin v1.0</span>
        </div>
      </div>
    </div>
  );
}
