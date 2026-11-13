
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Image as ImageIcon,
  Video,
  Eraser,
  ShieldCheck,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

type Preferences = {
  uploadNotifications: boolean;
  processingNotifications: boolean;
  backgroundRemovalNotifications: boolean;
  securityNotifications: boolean;
};

const defaults: Preferences = {
  uploadNotifications: true,
  processingNotifications: true,
  backgroundRemovalNotifications: true,
  securityNotifications: true,
};

export default function SettingsPanel() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/settings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load settings.");
      }

      setPreferences({
        uploadNotifications: data.preferences.uploadNotifications,
        processingNotifications: data.preferences.processingNotifications,
        backgroundRemovalNotifications:
          data.preferences.backgroundRemovalNotifications,
        securityNotifications: data.preferences.securityNotifications,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Keep the application permanently in Dark mode.
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-theme", "dark");
    root.setAttribute("data-theme-preference", "dark");
    root.style.colorScheme = "dark";
    root.classList.add("dark");
  }, []);

  const saveSetting = async (updates: Partial<Preferences>) => {
    const previous = preferences;

    setPreferences((current) => ({
      ...current,
      ...updates,
    }));

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save settings.");
      }

      setPreferences({
        uploadNotifications: data.preferences.uploadNotifications,
        processingNotifications: data.preferences.processingNotifications,
        backgroundRemovalNotifications:
          data.preferences.backgroundRemovalNotifications,
        securityNotifications: data.preferences.securityNotifications,
      });

      setMessage("Your settings have been saved.");
    } catch (err) {
      setPreferences(previous);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const notificationOptions = [
    {
      key: "uploadNotifications" as const,
      title: "Upload notifications",
      description: "Receive updates when images or videos are uploaded.",
      icon: ImageIcon,
    },
    {
      key: "processingNotifications" as const,
      title: "Processing notifications",
      description: "Know when image and video processing tasks are completed.",
      icon: Video,
    },
    {
      key: "backgroundRemovalNotifications" as const,
      title: "Background removal",
      description: "Get notified when background removal is completed.",
      icon: Eraser,
    },
    {
      key: "securityNotifications" as const,
      title: "Security notifications",
      description: "Receive important account security updates.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Heading */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">
            Workspace preferences
          </p>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Global Settings<span className="text-violet-400">.</span>
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Manage your Cloudinary Studio workspace and notification preferences.
        </p>
      </section>

      {/* Status messages */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4 text-xs text-emerald-300">
          <Check className="h-4 w-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] p-4 text-xs text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}

          <button
            type="button"
            onClick={() => void loadSettings()}
            className="ml-auto underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Notification preferences */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#10101a]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-5 sm:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Notification Preferences
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Choose which updates you want to receive.
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06] px-5 sm:px-6">
          {notificationOptions.map((option) => {
            const Icon = option.icon;
            const enabled = preferences[option.key];

            return (
              <div
                key={option.key}
                className="flex items-center justify-between gap-4 py-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-400">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-white">
                      {option.title}
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {option.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={option.title}
                  disabled={saving}
                  onClick={() =>
                    void saveSetting({
                      [option.key]: !enabled,
                    })
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled ? "bg-violet-500" : "bg-slate-700"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                      enabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Account security */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#10101a] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Account Security
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Authentication and account management are handled securely
              through Clerk.
            </p>
          </div>
        </div>
      </section>

      {/* Saving indicator */}
      {saving && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving your preferences...
        </div>
      )}
    </div>
  );
}
