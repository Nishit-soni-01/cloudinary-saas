
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  ImageIcon,
  UploadCloud,
  Video,
  Settings,
  Cloud,
  Sparkles,
  ChevronRight,
  Grid2X2,
  UserRound,
} from "lucide-react";

const navigation = [
  {
    label: "Workspace",
    items: [
      {
        name: "Overview",
        href: "/home",
        icon: LayoutDashboard,
      },
      {
        name: "Tools",
        href: "/home/tools",
        icon: Grid2X2,
      },
      {
        name: "All Media",
        href: "/home/media",
        icon: Images,
      },
      {
        name: "Images",
        href: "/home/media?type=image",
        icon: ImageIcon,
      },
      {
        name: "Videos",
        href: "/home/media?type=video",
        icon: Video,
      },
      {
        name: "Upload Media",
        href: "/home#quick-actions",
        icon: UploadCloud,
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(item: (typeof navigation)[number]["items"][number]) {
    if (item.href === "/home") {
      return pathname === "/home";
    }

    if (item.href === "/home/media") {
      return (
        pathname === "/home/media" &&
        !searchParams.get("type")
      );
    }

    if (item.href === "/home/media?type=image") {
      return (
        pathname === "/home/media" &&
        searchParams.get("type") === "image"
      );
    }

    if (item.href === "/home/media?type=video") {
      return (
        pathname === "/home/media" &&
        searchParams.get("type") === "video"
      );
    }

    return pathname === item.href;
  }

  const profileActive = pathname === "/home/profile";
  const settingsActive = pathname === "/home/settings";

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0c0c15] lg:flex">
      {/* Brand */}
      <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.07] px-7">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/20">
          <Cloud className="h-5 w-5 text-white" />
        </div>

        <div>
          <h1 className="text-[15px] font-bold tracking-tight text-white">
            Cloudinary
            <span className="text-violet-400"> Studio</span>
          </h1>

          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Creative workspace
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        {navigation.map((section) => (
          <div key={section.label} className="mb-9">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              {section.label}
            </p>

            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? "border border-violet-400/15 bg-violet-500/[0.10] text-violet-200"
                        : "border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`h-[17px] w-[17px] ${
                          active
                            ? "text-violet-400"
                            : "text-slate-500 transition group-hover:text-violet-300"
                        }`}
                      />

                      {item.name}
                    </span>

                    {active && (
                      <ChevronRight className="h-4 w-4 text-violet-400" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Account */}
        <div className="mb-9">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Account
          </p>

          <Link
            href="/home/profile"
            className={`group flex items-center justify-between rounded-xl border px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
              profileActive
                ? "border border-violet-400/15 bg-violet-500/[0.10] text-violet-200"
                : "border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <UserRound
                className={`h-[17px] w-[17px] ${
                  profileActive
                    ? "text-violet-400"
                    : "text-slate-500 transition group-hover:text-violet-300"
                }`}
              />
              Profile
            </span>

            {profileActive && (
              <ChevronRight className="h-4 w-4 text-violet-400" />
            )}
          </Link>
        </div>

        {/* Preferences */}
        <div>
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Preferences
          </p>

          <Link
            href="/home/settings"
            className={`group flex items-center justify-between rounded-xl border px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
              settingsActive
                ? "border-violet-400/15 bg-violet-500/[0.10] text-violet-200"
                : "border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings
                className={`h-[17px] w-[17px] ${
                  settingsActive
                    ? "text-violet-400"
                    : "text-slate-500 transition group-hover:text-violet-300"
                }`}
              />
              Settings
            </span>

            {settingsActive && (
              <ChevronRight className="h-4 w-4 text-violet-400" />
            )}
          </Link>
        </div>
      </div>

      {/* Workspace card */}
      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.12] to-indigo-500/[0.05] p-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl" />

          <div className="relative">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
              <Sparkles className="h-4 w-4 text-violet-300" />
            </div>

            <h3 className="text-xs font-semibold text-white">
              Your creative space
            </h3>

            <p className="mt-2 text-[11px] leading-5 text-slate-400">
              Keep your images and videos organized in one place.
            </p>

            <p className="mt-3 text-[10px] font-semibold tracking-wide text-violet-300">
              CLOUDINARY STUDIO
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-slate-700">
          © 2026 Cloudinary Studio
        </p>
      </div>
    </aside>
  );
}
