import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cloud,
  Image as ImageIcon,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { SpotlightCard } from "@/components/spotlight-card";

const copy = {
  "sign-in": {
    badge: "Your workspace is waiting",
    lead: "Welcome back to",
    accent: "your creative world.",
    body: "Your media, projects, and creative workflow are right where you left them. Sign in and pick up where you stopped.",
    formTitle: "Sign in to continue",
    formBody: "Enter your details to open your Cloudinary Studio account.",
    legal:
      "By continuing, you agree to use Cloudinary Studio responsibly and keep your account credentials secure.",
    footnote: "A secure space for your creativity.",
  },
  "sign-up": {
    badge: "Start your creative library",
    lead: "Create something",
    accent: "extraordinary.",
    body: "Your ideas deserve a home that stays organized. Upload your media, shape it, and find it again in seconds.",
    formTitle: "Create your account",
    formBody: "Set up your own creative workspace in under a minute.",
    legal:
      "By creating an account, you agree to keep your account credentials secure.",
    footnote: "Your creative space, secured.",
  },
} as const;

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex w-fit items-center gap-3 ${className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/25">
        <Cloud className="h-5 w-5 text-white" />
      </span>
      <span className="text-xl font-bold tracking-tight">
        Cloudinary<span className="text-violet-400">.</span>
        <span className="ml-1 font-medium text-slate-400">Studio</span>
      </span>
    </Link>
  );
}

export function AuthShell({
  mode,
  children,
}: {
  mode: "sign-in" | "sign-up";
  children: ReactNode;
}) {
  const c = copy[mode];

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#080810] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-[150px]" />
        <div className="absolute -bottom-40 right-0 h-[480px] w-[480px] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      {/* Brand panel */}
      <section className="relative z-10 hidden w-1/2 flex-col justify-between border-r border-white/[0.07] p-10 lg:flex xl:p-16">
        <div className="rise" style={{ "--d": "0ms" } as React.CSSProperties}>
          <Logo />
        </div>

        <div className="max-w-xl">
          <p
            className="rise mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2 text-sm text-violet-200"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            {c.badge}
          </p>

          <h1
            className="rise text-5xl font-semibold leading-[1.08] tracking-[-0.045em] xl:text-6xl"
            style={{ "--d": "220ms" } as React.CSSProperties}
          >
            {c.lead}
            <span className="text-sheen mt-1 block font-serif text-[1.15em] font-normal italic tracking-[-0.02em]">
              {c.accent}
            </span>
          </h1>

          <p
            className="rise mt-7 max-w-md text-base leading-8 text-slate-400"
            style={{ "--d": "340ms" } as React.CSSProperties}
          >
            {c.body}
          </p>

          <div
            className="rise mt-12 grid max-w-md grid-cols-2 gap-3"
            style={{ "--d": "460ms" } as React.CSSProperties}
          >
            <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 transition hover:border-violet-400/30">
              <ImageIcon className="mb-4 h-6 w-6 text-violet-400" />
              <h3 className="text-sm font-semibold">Media library</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Every image and video, organized.
              </p>
            </SpotlightCard>

            <SpotlightCard className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 transition hover:border-violet-400/30">
              <WandSparkles className="mb-4 h-6 w-6 text-indigo-400" />
              <h3 className="text-sm font-semibold">Smart transformations</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Resize, crop, and optimize with ease.
              </p>
            </SpotlightCard>
          </div>
        </div>

        <p
          className="rise flex items-center gap-2 text-xs text-slate-500"
          style={{ "--d": "560ms" } as React.CSSProperties}
        >
          <ShieldCheck className="h-4 w-4 text-violet-400" />
          {c.footnote}
        </p>
      </section>

      {/* Form panel */}
      <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-8 lg:w-1/2">
        <Logo className="mb-8 lg:hidden" />

        <div
          className="rise w-full max-w-[440px]"
          style={{ "--d": "200ms" } as React.CSSProperties}
        >
          <Link
            href="/"
            className="group mb-7 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            Back to home
          </Link>

          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {c.formTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {c.formBody}
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/[0.09] bg-[#11111b]/80 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
            {children}
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-slate-600">
            {c.legal}
          </p>
        </div>

        <p className="mt-auto pt-10 text-center text-xs text-slate-600">
          © 2026 Cloudinary Studio. All rights reserved.
        </p>
      </section>
    </main>
  );
}