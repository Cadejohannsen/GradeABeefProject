"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { applyPrimaryColor } from "@/lib/color-palette";

export interface BrandSettings {
  teamName: string;
  primaryColor: string;
  logoDataUrl: string | null;
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
};

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: BrandSettings) => {
        setSettings(data);
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
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
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
