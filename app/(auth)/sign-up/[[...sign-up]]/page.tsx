import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const instant = false;

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <Suspense
        fallback={
          <div className="flex min-h-[380px] items-center justify-center text-sm text-slate-400">
            Loading secure sign up...
          </div>
        }
      >
        <SignUp appearance={clerkAppearance} />
      </Suspense>
    </AuthShell>
  );
}