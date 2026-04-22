"use client";

import { useState } from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

interface VolumeControlProps {
  onVolumeChange: (volume: number) => void; // 0–100
  className?: string;
}

export function VolumeControl({ onVolumeChange, className }: VolumeControlProps) {
  const [volume, setVolume] = useState(0);
  const [hovered, setHovered] = useState(false);

  function handleChange(val: number) {
    setVolume(val);
    onVolumeChange(val);
  }

  const Icon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div
      className={className ?? "absolute bottom-6 left-6 z-30 flex flex-col items-center gap-2"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Vertical slider — appears on hover */}
      {hovered && (
        <div
          className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border border-white/20 backdrop-blur-md"
          style={{ background: "rgba(20,20,20,0.85)" }}
        >
          <span className="text-[10px] font-semibold font-inter" style={{ color: "rgb(var(--cp-300))" }}>
            {volume}%
          </span>

          <div style={{ height: "110px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleChange(Number(e.target.value))}
              style={{
                WebkitAppearance: "slider-vertical",
                width: "6px",
                height: "110px",
                cursor: "pointer",
                accentColor: "rgb(var(--cp-500))",
              } as React.CSSProperties}
            />
          </div>

          <VolumeX size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>
      )}

      {/* Speaker button */}
      <button
        onClick={() => handleChange(volume > 0 ? 0 : 50)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-semibold transition-all duration-150 border-0 active:scale-[0.98]"
        style={{
          background: "#ffffff",
          color: "#000000",
          boxShadow: "0 0 40px rgba(255,255,255,0.08)",
        }}
      >
        <Icon size={16} />
        <span className="text-[11px]">{volume === 0 ? "Muted" : `Vol ${volume}%`}</span>
      </button>
    </div>
  );
}
