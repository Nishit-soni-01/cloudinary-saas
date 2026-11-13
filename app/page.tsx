import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Suspense, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cloud,
  Image as ImageIcon,
  Layers3,
  Play,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight-card";

const features = [
  {
    icon: Cloud,
    title: "Cloud storage",
    description:
      "Keep your creative assets organized, secure, and available whenever inspiration strikes.",
  },
  {
    icon: WandSparkles,
    title: "Smart transformations",
    description:
      "Resize, crop, optimize, and deliver sharp media with Cloudinary's transformation tools.",
  },
  {
    icon: Layers3,
    title: "One creative space",
    description:
      "Bring your images and videos together in a workspace built around how you work.",
  },
];

const tiles = [
  {
    name: "Sunset campaign",
    tone: "from-indigo-500/60 via-violet-500/35 to-slate-900",
    glow: "30% 30%",
  },
  {
    name: "Product shoot",
    tone: "from-orange-400/50 via-rose-500/35 to-slate-900",
    glow: "70% 25%",
  },
  {
    name: "Brand film",
    tone: "from-cyan-400/40 via-blue-500/35 to-slate-900",
    glow: "50% 30%",
  },
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080810] text-white selection:bg-violet-500/30">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="drift absolute -top-72 left-1/2 h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[150px]" />
        <div
          className="absolute inset-x-0 top-0 h-[900px] opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
          }}
        />
      </div>

      {/* Navigation (sticky) */}
      <header className="sticky top-0 z-30 px-5 pt-4 md:px-10">
        <nav
          aria-label="Main"
          className="rise mx-auto flex h-[68px] max-w-7xl items-center justify-between rounded-2xl border border-white/[0.09] bg-[#0c0c16]/70 px-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:px-7"
        >
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/25">
              <Cloud className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Cloudinary<span className="text-violet-400">.</span>
              <span className="ml-1 font-medium text-slate-400">Studio</span>
            </span>
          </a>

          <div className="hidden items-center gap-9 text-sm text-slate-400 md:flex">
            {[
              ["Workspace", "#workspace"],
              ["Features", "#features"],
              ["About", "#about"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="relative py-1 transition hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-violet-400 after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {label}
              </a>
            ))}
          </div>

          <Suspense fallback={<div className="h-10 w-36" />}>
            <Show when="signed-out">
              <div className="flex items-center gap-2">
                <SignInButton>
                  <button className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:block">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="btn-shine group flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-violet-100">
                    Get started
                    <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </Suspense>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-5 pb-24 pt-20 text-center md:px-10 md:pt-28">
        <p
          className="rise mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2 text-sm text-violet-200"
          style={delay(100)}
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          Your creative workspace, reimagined
        </p>

        <h1 className="max-w-5xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl md:text-8xl">
          <span className="rise block" style={delay(220)}>
            Your media deserves
          </span>
          <span
            className="rise text-sheen mt-1 block font-serif text-[1.12em] font-normal italic tracking-[-0.02em]"
            style={delay(380)}
          >
            a better space.
          </span>
        </h1>

        <p
          className="rise mt-8 max-w-2xl text-base leading-8 text-slate-400 md:text-lg"
          style={delay(540)}
        >
          Upload, organize, transform, and manage your images and videos from
          one beautifully crafted creative workspace.
        </p>

        <div
          className="rise mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          style={delay(680)}
        >
          <Suspense fallback={<div className="h-14 w-48" />}>
            <Show when="signed-out">
              <SignUpButton>
                <button className="btn-shine group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-600/40 sm:w-auto">
                  Start creating
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </SignUpButton>
            </Show>
          </Suspense>

          <Suspense fallback={<div className="h-14 w-36" />}>
            <SignInButton>
              <button className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-8 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] sm:w-auto">
                <Play className="h-4 w-4" />
                Sign in
              </button>
            </SignInButton>
          </Suspense>
        </div>

        <ul
          className="rise mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500"
          style={delay(800)}
        >
          {["Simple workflow", "Cloud-powered", "Built for creators"].map(
            (item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-violet-400" />
                {item}
              </li>
            )
          )}
        </ul>
      </section>

      {/* Workspace preview: the one showpiece moment */}
      <section
        id="workspace"
        className="relative z-10 mx-auto max-w-6xl px-5 pb-28 md:px-10"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[110px]" />

        <Reveal className="relative">
          <div className="relative [perspective:1800px]">
            <div className="grain relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#11111b] p-2 shadow-2xl shadow-black/60 transition-transform duration-700 ease-out md:rounded-3xl md:p-3 md:[transform:rotateX(5deg)] md:hover:[transform:rotateX(0deg)]">
              <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0b0b13]">
                {/* Top bar */}
                <div className="flex h-14 items-center justify-between border-b border-white/[0.07] px-4 md:px-6">
                  <div className="flex items-center gap-2" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Cloudinary Studio / Media library
                  </span>
                  <span
                    className="h-7 w-7 rounded-full border border-violet-400/30 bg-violet-500/20"
                    aria-hidden
                  />
                </div>

                <div className="grid min-h-[360px] md:grid-cols-[190px_1fr]">
                  {/* Sidebar */}
                  <aside className="hidden border-r border-white/[0.07] p-5 md:block">
                    <p className="mb-6 text-xs font-medium text-slate-600">
                      Workspace
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      {[
                        { icon: ImageIcon, label: "All media", active: true },
                        { icon: Cloud, label: "Uploads" },
                        { icon: Layers3, label: "Collections" },
                        { icon: WandSparkles, label: "Transformations" },
                      ].map(({ icon: Icon, label, active }) => (
                        <li
                          key={label}
                          className={`flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                            active
                              ? "bg-violet-500/15 text-violet-300"
                              : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </li>
                      ))}
                    </ul>
                  </aside>

                  {/* Content */}
                  <div className="p-5 md:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold tracking-tight">
                          Your media library
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Everything you create, in one place.
                        </p>
                      </div>
                      <span className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">
                        <Cloud className="h-4 w-4" />
                        Upload media
                      </span>
                    </div>

                    {/* Upload progress */}
                    <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
                      <span>Optimizing 3 files</span>
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <span className="progress block h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" />
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {tiles.map((tile, i) => (
                        <figure
                          key={tile.name}
                          className={`group relative aspect-[1.35] overflow-hidden rounded-xl border border-white/10 bg-slate-900 ${
                            i === 2 ? "col-span-2 sm:col-span-1" : ""
                          }`}
                        >
                          <div
                            className={`develop absolute inset-0 bg-gradient-to-br ${tile.tone} transition-transform duration-700 group-hover:scale-110`}
                            style={delay(300 + i * 250)}
                          >
                            <div
                              className="absolute inset-0"
                              style={{
                                background: `radial-gradient(circle at ${tile.glow}, rgba(255,255,255,.32), transparent 42%)`,
                              }}
                            />
                          </div>
                          <div
                            className="scan pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 [.is-visible_&]:opacity-100"
                            style={delay(300 + i * 250)}
                          />
                          <figcaption className="absolute bottom-3 left-3 text-xs font-medium text-white/90">
                            {tile.name}
                          </figcaption>
                        </figure>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs text-slate-600">
                      <span>Your creative space</span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        All systems ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating status chip appears when the transformation finishes */}
            <div
              className="chip-pop absolute -bottom-5 right-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-[#0e1a17]/90 px-4 py-3 text-xs font-medium text-emerald-300 shadow-xl shadow-black/40 backdrop-blur-md md:right-10"
              style={delay(1900)}
            >
              <Check className="h-4 w-4" />
              3 files optimized and ready
            </div>
          </div>
        </Reveal>

        <p className="mt-10 text-center text-xs text-slate-600">
          A preview of the experience we're building.
        </p>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-5 pb-28 md:px-10"
      >
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">
            Everything you need.
            <span className="mt-1 block font-serif text-[1.1em] font-normal italic text-slate-500">
              Nothing you don't.
            </span>
          </h2>
          <p className="max-w-sm text-sm leading-7 text-slate-500">
            Powerful media tools meet a thoughtfully designed workspace. Less
            friction, more creating.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <SpotlightCard
                key={feature.title}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30"
              >
                <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300 transition duration-300 group-hover:scale-110 group-hover:bg-violet-500/20">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-500 transition-colors group-hover:text-slate-400">
                  {feature.description}
                </p>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section
        id="about"
        className="relative z-10 mx-5 mb-16 overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-950/70 via-[#171326] to-[#0d1020] px-6 py-16 text-center md:mx-auto md:max-w-7xl md:px-12 md:py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-3/4 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="relative">
          <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10">
            <Zap className="h-5 w-5 text-violet-300" />
          </span>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Make room for{" "}
            <span className="font-serif font-normal italic">creativity.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
            Your next great idea deserves a workspace that keeps up. Start
            building your creative library today.
          </p>
          <Suspense fallback={<div className="mx-auto mt-8 h-12 w-40" />}>
            <Show when="signed-out">
              <SignUpButton>
                <button className="btn-shine group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-violet-100">
                  Get started
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </SignUpButton>
            </Show>
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07] px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-slate-600 sm:flex-row">
          <span>© 2026 Cloudinary Studio. All rights reserved.</span>
          <span>Made for creators, powered by the cloud.</span>
        </div>
      </footer>
    </main>
  );
}