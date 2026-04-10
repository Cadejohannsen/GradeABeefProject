"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSettings } from "@/components/providers/settings-provider";
import { generatePalette } from "@/lib/color-palette";
import { removeBackground } from "@/lib/remove-bg";
import {
  Upload, X, Check, RotateCcw, Palette, Image as ImageIcon, Tag,
  Eraser, Sliders, Undo2, Loader2,
} from "lucide-react";

const DEFAULT_COLOR = "#2D1B4E";

function ColorSwatch({ channels, label }: { channels: string; label: string }) {
  const [r, g, b] = channels.split(" ").map(Number);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded" style={{ backgroundColor: `rgb(${r},${g},${b})` }} />
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}

/** Checkerboard background to show transparency */
function TransparentPreview({ src, size = 128 }: { src: string; size?: number }) {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/[0.08]"
      style={{
        width: size, height: size,
        backgroundImage:
          "linear-gradient(45deg,#555 25%,transparent 25%)," +
          "linear-gradient(-45deg,#555 25%,transparent 25%)," +
          "linear-gradient(45deg,transparent 75%,#555 75%)," +
          "linear-gradient(-45deg,transparent 75%,#555 75%)",
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
        backgroundColor: "#333",
      }}
    >
      <img src={src} alt="Logo preview" className="w-full h-full object-contain p-2" />
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();

  const [teamName, setTeamName]       = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Remove-bg state
  const [originalLogo, setOriginalLogo] = useState<string | null>(null); // pre-removal copy
  const [removing, setRemoving]         = useState(false);
  const [tolerance, setTolerance]       = useState(40);
  const [showSlider, setShowSlider]     = useState(false);
  const [bgRemoved, setBgRemoved]       = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      setTeamName(settings.teamName ?? "");
      setPrimaryColor(settings.primaryColor ?? DEFAULT_COLOR);
      setLogoDataUrl(settings.logoDataUrl ?? null);
      setBgRemoved(false);
      setOriginalLogo(null);
    }
  }, [loading, settings]);

  const previewPalette = generatePalette(primaryColor);

  const handleFileRead = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setLogoDataUrl(url);
      setOriginalLogo(null);
      setBgRemoved(false);
      setShowSlider(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  }, []);

  const handleRemoveBg = async () => {
    if (!logoDataUrl) return;
    setRemoving(true);
    try {
      const original = originalLogo ?? logoDataUrl; // keep original for re-runs
      if (!originalLogo) setOriginalLogo(logoDataUrl);
      const result = await removeBackground(original, { tolerance });
      setLogoDataUrl(result);
      setBgRemoved(true);
    } catch (err) {
      console.error("Background removal failed:", err);
    } finally {
      setRemoving(false);
    }
  };

  const handleUndoRemoval = () => {
    if (originalLogo) {
      setLogoDataUrl(originalLogo);
      setOriginalLogo(null);
      setBgRemoved(false);
      setShowSlider(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ teamName, primaryColor, logoDataUrl });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setPrimaryColor(DEFAULT_COLOR);
    setLogoDataUrl(settings.logoDataUrl ?? null);
    setTeamName(settings.teamName ?? "");
    setBgRemoved(false);
    setOriginalLogo(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/30 text-sm">Loading settings…</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">App Settings</h1>
        <p className="text-white/40 text-sm mt-1">Customize branding for your program</p>
      </div>

      {/* ── Team Name ─────────────────────────────────────── */}
      <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Tag size={16} className="text-white/50" />
          <h2 className="text-base font-semibold text-white/80">Team Name</h2>
        </div>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g. Linfield Wildcats"
          className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
        />
        <p className="text-white/30 text-xs">Displayed throughout the app as your team identifier.</p>
      </section>

      {/* ── Logo ──────────────────────────────────────────── */}
      <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon size={16} className="text-white/50" />
          <h2 className="text-base font-semibold text-white/80">Team Logo</h2>
        </div>

        <div className="flex gap-6 items-start">
          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors duration-150 ${
              isDragging
                ? "border-primary-400 bg-primary-500/10"
                : "border-white/[0.12] hover:border-white/25 hover:bg-white/[0.03]"
            }`}
          >
            <Upload size={24} className="text-white/30" />
            <p className="text-white/40 text-sm text-center">
              Drop your logo here or <span className="text-white/70 underline">browse</span>
            </p>
            <p className="text-white/20 text-xs">PNG, JPG, SVG — recommended 512×512</p>
          </div>

          {/* Preview */}
          <div className="w-32 flex-shrink-0 flex flex-col items-center gap-2">
            {logoDataUrl ? (
              <>
                {bgRemoved ? (
                  <div className="relative">
                    <TransparentPreview src={logoDataUrl} size={128} />
                    <button
                      onClick={() => setLogoDataUrl(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                      <img src={logoDataUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
                    </div>
                    <button
                      onClick={() => { setLogoDataUrl(null); setBgRemoved(false); setOriginalLogo(null); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                )}
                <p className="text-white/30 text-xs text-center">
                  {bgRemoved ? "Background removed" : "Preview"}
                </p>
              </>
            ) : (
              <>
                <div className="w-32 h-32 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <ImageIcon size={32} className="text-white/10" />
                </div>
                <p className="text-white/30 text-xs text-center">Preview</p>
              </>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileRead(f); }}
        />

        {/* ── Remove Background Controls ─────────────────── */}
        {logoDataUrl && (
          <div className="border border-white/[0.08] rounded-lg p-4 space-y-3 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eraser size={15} className="text-white/50" />
                <span className="text-sm font-medium text-white/70">Background Removal</span>
              </div>
              {bgRemoved && (
                <button
                  onClick={handleUndoRemoval}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  <Undo2 size={12} /> Undo
                </button>
              )}
            </div>

            <p className="text-white/30 text-xs leading-relaxed">
              Automatically detects and removes the solid color background from your logo,
              leaving only the logo itself on a transparent background.
            </p>

            {/* Tolerance slider (toggleable) */}
            <div>
              <button
                onClick={() => setShowSlider((s) => !s)}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-2"
              >
                <Sliders size={12} />
                {showSlider ? "Hide" : "Adjust"} sensitivity ({tolerance})
              </button>

              {showSlider && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full accent-white/60 h-1"
                  />
                  <div className="flex justify-between text-[10px] text-white/20">
                    <span>Precise (10)</span>
                    <span>Aggressive (100)</span>
                  </div>
                  <p className="text-white/20 text-[10px]">
                    Increase if background isn't fully removed. Decrease if logo edges are being cut off.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleRemoveBg}
              disabled={removing}
              className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white/80 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removing ? (
                <><Loader2 size={15} className="animate-spin" /> Removing…</>
              ) : bgRemoved ? (
                <><Eraser size={15} /> Re-run with new sensitivity</>
              ) : (
                <><Eraser size={15} /> Remove Background</>
              )}
            </button>
          </div>
        )}
      </section>

      {/* ── Primary Color ─────────────────────────────────── */}
      <section className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={16} className="text-white/50" />
          <h2 className="text-base font-semibold text-white/80">Primary Color</h2>
        </div>

        <div className="flex items-center gap-4">
          <label className="relative cursor-pointer group">
            <div
              className="w-12 h-12 rounded-lg border-2 border-white/20 group-hover:border-white/40 transition-colors shadow-lg"
              style={{ backgroundColor: primaryColor }}
            />
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
          <div>
            <p className="text-white text-sm font-mono">{primaryColor.toUpperCase()}</p>
            <p className="text-white/30 text-xs">Click the swatch to open the color picker</p>
          </div>
          <button
            onClick={() => setPrimaryColor(DEFAULT_COLOR)}
            className="ml-auto text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        <div>
          <p className="text-white/30 text-xs mb-2">Generated palette preview</p>
          <div className="flex gap-2">
            {["50","100","200","300","400","500","600","700","800","900"].map((shade) => (
              <ColorSwatch key={shade} channels={previewPalette[shade]} label={shade} />
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">
          This color is used for buttons, active nav items, highlights, and accents across the app.
        </p>
      </section>

      {/* ── Actions ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {saved ? (
            <><Check size={15} /> Saved</>
          ) : saving ? (
            "Saving…"
          ) : (
            "Save Changes"
          )}
        </button>

        <button
          onClick={handleReset}
          className="text-sm text-white/30 hover:text-white/60 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw size={13} /> Reset to defaults
        </button>
      </div>
    </div>
  );
}
