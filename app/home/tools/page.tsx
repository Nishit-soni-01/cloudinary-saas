
import Link from "next/link";
import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileDashboardNav } from "@/components/mobile-dashboard-nav";
import NotificationBell from "@/components/notification-bell";
import {
  Image as ImageIcon,
  Video,
  Eraser,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

const tools = [
  {
    title: "Image Studio",
    description:
      "Resize, compress and convert your images into optimized formats without losing quality.",
    href: "/home/image-studio",
    icon: ImageIcon,
    category: "Image Processing",
    color: "from-violet-500/20 to-indigo-500/10",
    iconColor: "text-violet-400",
  },
  {
    title: "Video Studio",
    description:
      "Optimize video files, reduce file sizes and convert videos into web-friendly MP4 format.",
    href: "/home/video-studio",
    icon: Video,
    category: "Video Processing",
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    title: "Background Remover",
    description:
      "Automatically remove backgrounds from your images and download transparent PNG files.",
    href: "/home/background-remover",
    icon: Eraser,
    category: "AI Image Editing",
    color: "from-fuchsia-500/20 to-purple-500/10",
    iconColor: "text-fuchsia-400",
  },
];

export default function ToolsPage() {
  return (
    <main className="flex min-h-screen bg-[#080810] text-white">
      {/* Sidebar */}
      <Suspense
        fallback={
          <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.07] bg-[#0c0c15] lg:flex" />
        }
      >
        <DashboardSidebar />
      </Suspense>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#080810]/90 px-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Workspace
            </p>

            <h2 className="mt-1 text-sm font-semibold text-white">
              All Tools
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="h-7 w-px bg-white/[0.08]" />

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-violet-500/20",
                },
              }}
            />
          </div>
        </header>

        {/* Mobile Navigation */}
        <Suspense
          fallback={
            <div className="h-[69px] border-b border-white/[0.06] bg-[#0c0c15] lg:hidden" />
          }
        >
          <MobileDashboardNav />
        </Suspense>

        {/* Tools */}
        <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
          {/* Page introduction */}
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2 text-violet-400">
              <Sparkles className="h-4 w-4" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Creative Workspace
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your media toolkit.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Everything you need to optimize and transform your media.
              Choose a tool and get started.
            </p>
          </div>

          {/* Available tools heading */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Available Tools
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Explore your media processing tools
              </p>
            </div>

            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
              {tools.length} Tools
            </span>
          </div>

          {/* Tool cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10101a] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-[#141421]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-50 transition group-hover:opacity-100`}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                        <Icon className={`h-6 w-6 ${tool.iconColor}`} />
                      </div>

                      <ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
                    </div>

                    <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {tool.category}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-white">
                      {tool.title}
                    </h3>

                    <p className="mt-3 min-h-[60px] text-sm leading-6 text-slate-400">
                      {tool.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-violet-400 transition group-hover:gap-3">
                      Open Tool

                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-5 py-6 text-center text-[11px] text-slate-600 sm:px-8">
          © 2026 Cloudinary Studio. Made for your creative workflow.
        </footer>
      </div>
    </main>
  );
}
