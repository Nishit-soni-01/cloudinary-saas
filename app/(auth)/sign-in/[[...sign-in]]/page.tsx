import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const instant = false;

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <Suspense
        fallback={
          <div className="flex min-h-[380px] items-center justify-center text-sm text-slate-400">
            Loading secure sign in...
          </div>
        }
      >
        <SignIn appearance={clerkAppearance} />
      </Suspense>
    </AuthShell>
  );
}