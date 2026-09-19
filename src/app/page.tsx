import { GoogleSignInCard } from "@/components/auth/GoogleSignInCard";

export default function LoginPage() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-grid-pattern min-h-[calc(100vh-4rem)]">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* Centered Auth Card */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <GoogleSignInCard />
      </div>
    </main>
  );
}
