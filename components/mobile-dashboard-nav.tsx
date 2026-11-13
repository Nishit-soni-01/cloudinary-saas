
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Cloud,
  Menu,
  X,
  LayoutDashboard,
  Grid2X2,
  Images,
  Image as ImageIcon,
  Video,
  UploadCloud,
  Settings,
  UserRound,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/home", icon: LayoutDashboard },
  { name: "Tools", href: "/home/tools", icon: Grid2X2 },
  { name: "All Media", href: "/home/media", icon: Images },
  { name: "Images", href: "/home/media?type=image", icon: ImageIcon },
  { name: "Videos", href: "/home/media?type=video", icon: Video },
  { name: "Upload Media", href: "/home#quick-actions", icon: UploadCloud },
];

function MobileDashboardNavContent() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type");

  function isActive(href: string) {
    switch (href) {
      case "/home":
        return pathname === "/home";

      case "/home/tools":
        return pathname === "/home/tools";

      case "/home/media":
        return pathname === "/home/media" && !currentType;

      case "/home/media?type=image":
        return pathname === "/home/media" && currentType === "image";

      case "/home/media?type=video":
        return pathname === "/home/media" && currentType === "video";

      case "/home/profile":
        return pathname === "/home/profile";

      case "/home/settings":
        return pathname === "/home/settings";

      default:
        return false;
    }
  }

  const linkClass = (active: boolean) =>
    `flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-medium transition ${
      active
        ? "border-violet-400/15 bg-violet-500/[0.10] text-violet-200"
        : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
    }`;

  function renderAccountLink(
    name: string,
    href: string,
    Icon: typeof UserRound
  ) {
    const active = isActive(href);

    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className={linkClass(active)}
      >
        <span className="flex items-center gap-3">
          <Icon
            className={`h-[18px] w-[18px] ${
              active ? "text-violet-400" : "text-slate-500"
            }`}
          />
          {name}
        </span>

        {active && (
          <ChevronRight className="h-4 w-4 text-violet-400" />
        )}
      </Link>
    );
  }

  return (
    <div className="relative z-50 border-b border-white/[0.06] bg-[#0c0c15] lg:hidden">
      {/* Mobile header */}
      <div className="flex items-center justify-between px-5 py-4">
        <Link
          href="/home"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Cloud className="h-5 w-5 text-white" />
          </div>

          <span className="text-sm font-bold text-white">
            Cloudinary
            <span className="text-violet-400"> Studio</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation menu */}
      {open && (
        <div className="absolute left-0 right-0 top-full max-h-[75vh] overflow-y-auto border-b border-white/[0.08] bg-[#0c0c15] px-4 pb-5 pt-3 shadow-2xl shadow-black/40">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={linkClass(active)}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        active ? "text-violet-400" : "text-slate-500"
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

          <div className="my-4 h-px bg-white/[0.06]" />

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Account
          </p>

          <nav className="space-y-1">
            {renderAccountLink("My Profile", "/home/profile", UserRound)}
            {renderAccountLink("Settings", "/home/settings", Settings)}
          </nav>

          <p className="mt-5 text-center text-[10px] text-slate-600">
            © 2026 Cloudinary Studio
          </p>
        </div>
      )}
    </div>
  );
}

export function MobileDashboardNav() {
  return (
    <Suspense
      fallback={
        <div className="border-b border-white/[0.06] bg-[#0c0c15] px-5 py-4 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <Cloud className="h-5 w-5 text-white" />
            </div>

            <span className="text-sm font-bold text-white">
              Cloudinary
              <span className="text-violet-400"> Studio</span>
            </span>
          </div>
        </div>
      }
    >
      <MobileDashboardNavContent />
    </Suspense>
  );
}
