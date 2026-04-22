"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { applyPrimaryColor } from "@/lib/color-palette";

export interface VideoUrls {
  login?: string;
  selectYear?: string;
  signin?: string;
  register?: string;
}

export interface BrandSettings {
  teamName: string;
  primaryColor: string;
  logoDataUrl: string | null;
  lightMode: boolean;
  videoUrls: VideoUrls;
}

interface SettingsContextType {
  settings: BrandSettings;
  updateSettings: (patch: Partial<BrandSettings>) => Promise<void>;
  loading: boolean;
}

// Default videos shown until the coach saves their own in Settings
const DEFAULT_VIDEO_URLS: VideoUrls = {
  login:      "https://www.youtube.com/watch?v=5O7fwA35s-U",
  signin:     "https://www.youtube.com/watch?v=5K3w7CKkeOQ",
  register:   "https://www.youtube.com/watch?v=MogY-m5Ewe0",
  selectYear: "https://www.youtube.com/watch?v=12TWMk85lmk",
};

const DEFAULT_SETTINGS: BrandSettings = {
  teamName: "",
  primaryColor: "#E10600",
  logoDataUrl: null,
  lightMode: false,
  videoUrls: DEFAULT_VIDEO_URLS,
};

const LS_KEY = "gab-light-mode";
const LS_FAVICON_KEY = "gab-favicon";

function setFaviconHref(href: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

function applyFavicon(logoDataUrl: string | null) {
  if (!logoDataUrl) {
    try { localStorage.removeItem(LS_FAVICON_KEY); } catch (_) {}
    setFaviconHref("/favicon.svg");
    return;
  }

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) { setFaviconHref(logoDataUrl); return; }

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, size, size);
    const scale = Math.min(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    const dataUrl = canvas.toDataURL("image/png");
    setFaviconHref(dataUrl);
    // Persist so next page load applies it instantly before API responds
    try { localStorage.setItem(LS_FAVICON_KEY, dataUrl); } catch (_) {}
  };
  img.src = logoDataUrl;
}

// Apply cached favicon immediately (before API call) to avoid flash
function applyFaviconFromCache() {
  try {
    const cached = localStorage.getItem(LS_FAVICON_KEY);
    if (cached) setFaviconHref(cached);
  } catch (_) {}
}

function applyLightMode(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
  }
  try {
    localStorage.setItem(LS_KEY, String(enabled));
  } catch (_) {}
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply cached favicon instantly before API responds
    applyFaviconFromCache();

    // Read light mode from localStorage immediately (before API call)
    let storedLightMode = false;
    try {
      storedLightMode = localStorage.getItem(LS_KEY) === "true";
    } catch (_) {}

    if (storedLightMode) {
      applyLightMode(true);
      setSettings((s) => ({ ...s, lightMode: true }));
    }

    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Omit<BrandSettings, "lightMode">) => {
        setSettings({
          ...data,
          lightMode: storedLightMode,
          // merge saved videoUrls over defaults so unset keys still have a fallback
          videoUrls: { ...DEFAULT_VIDEO_URLS, ...(data.videoUrls ?? {}) },
        });
        if (data.primaryColor) applyPrimaryColor(data.primaryColor);
        applyFavicon(data.logoDataUrl ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<BrandSettings>) => {
      const updated = { ...settings, ...patch };
      setSettings(updated);

      if (patch.primaryColor) applyPrimaryColor(patch.primaryColor);
      if (typeof patch.lightMode === "boolean") applyLightMode(patch.lightMode);
      if ("logoDataUrl" in patch) applyFavicon(patch.logoDataUrl ?? null);

      // Only send branding fields to the API (lightMode stays in localStorage)
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: updated.teamName,
          primaryColor: updated.primaryColor,
          logoDataUrl: updated.logoDataUrl,
          videoUrls: updated.videoUrls,
        }),
      });
    },
    [settings]
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
