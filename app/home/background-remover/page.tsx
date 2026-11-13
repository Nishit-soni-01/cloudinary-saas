
import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import BackgroundRemover from "@/components/background-remover";
import NotificationBell from "@/components/notification-bell";
import { Command } from "lucide-react";

export default function BackgroundRemoverPage() {
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
              Media Tools
            </p>
            <h2 className="mt-1 text-sm font-semibold text-white">
              Background Remover
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

        {/* Mobile brand */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Command className="h-5 w-5 text-white" />
          </div>

          <span className="text-sm font-bold">
            Cloudinary
            <span className="text-violet-400"> Studio</span>
          </span>
        </div>

        {/* Background Remover */}
        <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
          <BackgroundRemover />
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-5 py-6 text-center text-[11px] text-slate-600 sm:px-8">
          © 2026 Cloudinary Studio. Made for your creative workflow.
        </footer>
      </div>
    </main>
  );
}
