"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { applyPrimaryColor } from "@/lib/color-palette";

export interface BrandSettings {
  teamName: string;
  primaryColor: string;
  logoDataUrl: string | null;
  lightMode: boolean;
}

interface SettingsContextType {
  settings: BrandSettings;
  updateSettings: (patch: Partial<BrandSettings>) => Promise<void>;
  loading: boolean;
}

const DEFAULT_SETTINGS: BrandSettings = {
  teamName: "",
  primaryColor: "#2D1B4E",
  logoDataUrl: null,
  lightMode: false,
};

const LS_KEY = "gab-light-mode";

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
        });
        if (data.primaryColor) applyPrimaryColor(data.primaryColor);
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

      // Only send branding fields to the API (lightMode stays in localStorage)
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: updated.teamName,
          primaryColor: updated.primaryColor,
          logoDataUrl: updated.logoDataUrl,
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
