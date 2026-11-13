
import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileDashboardNav } from "@/components/mobile-dashboard-nav";
import { MediaLibrary } from "@/components/media-library";
import NotificationBell from "@/components/notification-bell";

export default function MediaPage() {
  return (
    <main className="flex min-h-screen bg-[#080810] text-white">
      {/* Desktop Sidebar */}
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
              Media Library
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
        <MobileDashboardNav />

        {/* Media Library */}
        <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
          <Suspense
            fallback={
              <div className="animate-pulse rounded-2xl bg-white/[0.03] p-10 text-sm text-slate-500">
                Loading media library...
              </div>
            }
          >
            <MediaLibrary />
          </Suspense>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-5 py-6 text-center text-[11px] text-slate-600 sm:px-8">
          © 2026 Cloudinary Studio. Made for your creative workflow.
        </footer>
      </div>
    </main>
  );
}
