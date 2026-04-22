"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/settings-provider";
import { ArrowRight } from "lucide-react";
import { VolumeControl } from "@/components/ui/volume-control";

export default function LoginPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [uiHidden, setUiHidden] = useState(false);

  function getEmbedUrl() {
    const raw = settings.videoUrls?.login ?? "";
    const match = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    const id = match ? match[1] : "CZT2eeQUFXk";
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  }

  function handleVolume(vol: number) {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    if (vol === 0) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*");
    } else {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [vol] }), "*");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-[#050505]">
      {/* YouTube video background */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          allow="autoplay; encrypted-media"
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            width: "177.78vh",
            height: "56.25vw",
            minWidth: "100%",
            minHeight: "100%",
            transform: "translate(-50%, -50%)",
            opacity: uiHidden ? 1 : 0.4,
            border: "none",
          }}
        />
      </div>

      {/* Gradient overlay */}
      {!uiHidden && <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/85" />}

      {/* Vignette */}
      {!uiHidden && <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)"
      }} />}

      {/* Main content */}
      {!uiHidden && <div className="relative z-20 flex flex-col items-center text-center">

        {/* Logo section */}
        {settings.logoDataUrl && (
          <div className="relative flex items-center justify-center mb-8">
            <img
              src={settings.logoDataUrl}
              aria-hidden="true"
              className="absolute pointer-events-none select-none"
              style={{
                width: "min(820px, 90vw)",
                height: "min(820px, 90vw)",
                objectFit: "contain",
                opacity: 0.08,
                filter: "blur(18px)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            <img
              src={settings.logoDataUrl}
              alt={settings.teamName || "Team Logo"}
              className="relative"
              style={{
                maxWidth: "min(480px, 70vw)",
                maxHeight: "480px",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.7))",
              }}
            />
          </div>
        )}

        {/* Title */}
        <h1
          className="holo-text font-bebas leading-none mb-3"
          style={{ fontSize: "5.5rem", letterSpacing: "0.1em", textShadow: "0 2px 20px rgba(0,0,0,0.95)" }}
        >
          Grade-A-Beef
        </h1>

        {/* Subtitle */}
        <p
          className="font-inter font-medium mb-10"
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)",
            textShadow: "0 1px 8px rgba(0,0,0,0.9)",
          }}
        >
          {settings.teamName ? `${settings.teamName} · ` : ""}Lineman Grade Tracker
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/signin")}
          className="group relative inline-flex items-center gap-3 bg-white text-black font-semibold font-inter py-3.5 px-10 rounded-xl hover:bg-white/92 active:scale-[0.98] transition-all duration-150 text-[14px] shadow-[0_0_40px_rgba(255,255,255,0.08)]"
        >
          Get Started
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-150" />
        </button>

        {/* Footer hint */}
        <p
          className="mt-8 text-[11px] font-inter"
          style={{ color: "rgba(255,255,255,0.55)", textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
        >
          Coaching analytics for offensive linemen
        </p>
      </div>}

      {/* Bottom-left controls */}
      <div className="absolute bottom-6 left-6 z-30 flex flex-row items-end gap-2">
        <VolumeControl onVolumeChange={handleVolume} className="flex flex-col items-center gap-2" />
        <button
          onClick={() => setUiHidden((h) => !h)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-inter font-semibold transition-all duration-150 active:scale-[0.98] text-[11px]"
          style={{ background: "#ffffff", color: "#000000", boxShadow: "0 0 40px rgba(255,255,255,0.08)" }}
        >
          {uiHidden ? "Show" : "Hide"}
        </button>
      </div>
    </div>
  );
}
