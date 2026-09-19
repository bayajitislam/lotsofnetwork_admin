import { SplitSignInView } from "@/components/auth/SplitSignInView";

export default function LoginPage() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-6 lg:p-8 bg-grid-pattern min-h-screen">
      <SplitSignInView />
    </main>
  );
}
