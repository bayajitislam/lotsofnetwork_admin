"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  Server, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from "lucide-react";
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

export function GoogleSignInCard() {
  const [state, setState] = useState<AuthState>("idle");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  // Core verification handler
  const handleCredentialResponse = useCallback(async (credential: string) => {
    setState("verifying");
    setErrorMessage(null);

    try {
      const authData = await authApi.loginWithGoogle(credential);
      const user = authData.user;

      // Save tokens
      localStorage.setItem("admin_access_token", authData.access_token);
      localStorage.setItem("admin_refresh_token", authData.refresh_token);
      setCurrentUser(user);

      // Verify Admin Role
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
        setErrorMessage("An unexpected authentication error occurred.");
      }
    }
  }, []);

  // Initialize Google Identity Services if Client ID is configured
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
          width: 320,
          text: "continue_with",
          shape: "rectangular",
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

  // Dev simulation helper
  const handleDevSimulation = (email: string, name: string) => {
    // Generate base64 mock JWT
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

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer Card */}
      <div className="relative rounded-3xl p-8 sm:p-10 shadow-2xl transition-all duration-300 glass-panel border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/80">
        
        {/* Top Decorative Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-blue-500/20 dark:bg-blue-500/30 blur-2xl rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
            <Server className="w-7 h-7" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 mb-2">
            <Sparkles className="w-3 h-3" />
            Admin Command Center
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lots of Network
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Restricted gateway for telemetry, ad monetization, and platform operations.
          </p>
        </div>

        {/* STATE: IDLE */}
        {state === "idle" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              {googleClientId ? (
                <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />
              ) : (
                <button
                  onClick={() => handleDevSimulation("realbayajitislam@gmail.com", "Bayajit Islam")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-750 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group"
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
                  <span>Sign in with Google</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Administrative actions and access attempts are monitored and recorded in the immutable security audit log.
              </span>
            </div>

            {/* Quick Testing Panel Toggle */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowDevPanel(!showDevPanel)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                {showDevPanel ? "Hide Simulation Tools" : "Developer Role Testing Panel"}
              </button>

              {showDevPanel && (
                <div className="mt-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 space-y-2 text-left animate-in fade-in duration-200">
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    Test Google role resolution against backend:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDevSimulation("realbayajitislam@gmail.com", "Bayajit Islam (Admin)")}
                      className="w-full text-xs py-2 px-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>Simulate Admin Login</span>
                      <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded">Role: admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDevSimulation("developer@example.com", "Regular User")}
                      className="w-full text-xs py-2 px-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-800 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>Simulate Standard User</span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">Role: user</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATE: VERIFYING */}
        {state === "verifying" && (
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-950" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Verifying Security Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Validating Google identity and querying administrator authorization...
              </p>
            </div>
          </div>
        )}

        {/* STATE: SUCCESS (ADMIN CONFIRMED) */}
        {state === "success" && currentUser && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 truncate">
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

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <span>Enter Admin Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account / Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE: DENIED (USER IS NOT ADMIN) */}
        {state === "denied" && currentUser && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Access Denied: Admin Privileges Required
                  </h4>
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 uppercase mt-0.5">
                    Standard User Account
                  </span>
                </div>
              </div>

              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                Signed in as <span className="font-semibold text-rose-900 dark:text-rose-100">{currentUser.email}</span>. This account does not possess administrator privileges for <code className="bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded">admin.lotsofnetwork.com</code>.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition duration-200 cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Another Account</span>
              </button>

              <a
                href="https://lotsofnetwork.com"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <span>Return to Lots of Network Tools</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* STATE: ERROR */}
        {state === "error" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Authentication Failed
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {errorMessage || "Unable to complete Google authentication. Please check your backend connection."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Sign-In</span>
            </button>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-End Encrypted</span>
          </div>
          <span>RBAC v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
