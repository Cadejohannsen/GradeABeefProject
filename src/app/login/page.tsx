"use client";

import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/settings-provider";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const logoSrc = settings.logoDataUrl || "/logo.png";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-[#050505]">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/85" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)"
      }} />

      {/* Large logo — behind content */}
      <img
        src={logoSrc}
        alt={settings.teamName || "Team Logo"}
        className="absolute z-10 object-contain pointer-events-none select-none opacity-[0.06]"
        style={{
          width: "800px",
          height: "800px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -58%)",
          filter: "blur(1px)",
        }}
      />

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center text-center" style={{ marginTop: "180px" }}>
        {/* Team logo mark */}
        {settings.logoDataUrl && (
          <div className="mb-6">
            <img
              src={settings.logoDataUrl}
              alt={settings.teamName || "Team Logo"}
              className="w-16 h-16 object-contain mx-auto drop-shadow-2xl"
            />
          </div>
        )}

        {/* Title */}
        <h1
          className="holo-text font-bebas leading-none mb-3"
          style={{ fontSize: "5.5rem", letterSpacing: "0.1em" }}
        >
          Grade-A-Beef
        </h1>

        {/* Subtitle */}
        <p
          className="text-white/35 font-inter font-medium mb-10"
          style={{ fontSize: "0.7rem", letterSpacing: "0.45em", textTransform: "uppercase" }}
        >
          {settings.teamName ? `${settings.teamName} · ` : ""}Lineman Grade Tracker
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/signin")}
          className="group relative inline-flex items-center gap-3 bg-white text-black font-semibold font-inter py-3.5 px-10 rounded-xl hover:bg-white/92 active:scale-[0.98] transition-all duration-150 text-[14px] shadow-[0_0_40px_rgba(255,255,255,0.08)]"
        >
          Get Started
          <ArrowRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform duration-150"
          />
        </button>

        {/* Footer hint */}
        <p className="mt-8 text-white/20 text-[11px] font-inter">
          Coaching analytics for offensive linemen
        </p>
      </div>
    </div>
  );
}
