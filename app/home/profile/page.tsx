
import { Suspense } from "react";
import { UserProfile, UserButton } from "@clerk/nextjs";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileDashboardNav } from "@/components/mobile-dashboard-nav";
import NotificationBell from "@/components/notification-bell";
import { UserRound } from "lucide-react";

export default function ProfilePage() {
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

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#080810]/90 px-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Account
            </p>

            <h2 className="mt-1 text-sm font-semibold text-white">
              My Profile
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
        <Suspense fallback={null}>
          <MobileDashboardNav />
        </Suspense>

        {/* Profile Content */}
        <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 xl:px-10">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10">
              <UserRound className="h-6 w-6 text-violet-300" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Account management
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Manage your personal information, email addresses, password,
              connected accounts and account security.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111b] p-3 sm:p-5">
            <UserProfile
              routing="hash"
              appearance={{
                variables: {
                    colorPrimary: "#8b5cf6",
                    colorBackground: "#11111b",
                    colorForeground: "#f8fafc",
                    colorMutedForeground: "#94a3b8",
                    colorInput: "#0b0b13",
                    colorInputForeground: "#f8fafc",
                    colorNeutral: "#94a3b8",
                    borderRadius: "0.75rem",
                    },
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "w-full border-0 bg-transparent shadow-none",
                  navbar: "border-white/[0.08]",
                  navbarButton: "text-slate-400 hover:text-white",
                  navbarButton__active:
                    "text-violet-300 border-violet-400",
                  headerTitle: "text-white",
                  headerSubtitle: "text-slate-400",
                  profileSectionTitle: "text-white",
                  profileSectionPrimaryButton:
                    "text-violet-300 hover:text-violet-200",
                  formButtonPrimary:
                    "bg-violet-600 hover:bg-violet-500",
                  formFieldLabel: "text-slate-300",
                  formFieldInput:
                    "border-white/10 bg-[#0b0b13] text-white",
                  badge: "bg-violet-500/10 text-violet-300",
                  dividerLine: "bg-white/[0.08]",
                  footer: "hidden",
                },
              }}
            />
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
