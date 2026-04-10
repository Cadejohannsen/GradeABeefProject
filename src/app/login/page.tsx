"use client";

import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/settings-provider";

export default function LoginPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const logoSrc = settings.logoDataUrl || "/logo.png";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay to subdue the video */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Large logo behind content */}
      <img
        src={logoSrc}
        alt={settings.teamName || "Team Logo"}
        className="absolute z-10 object-contain drop-shadow-2xl pointer-events-none"
        style={{ width: "900px", height: "900px", top: "50%", left: "50%", transform: "translate(-50%, -62%)" }}
      />

      {/* Content on top */}
      <div className="relative z-20 flex flex-col items-center" style={{ marginTop: "220px" }}>
        <h1 className="text-7xl font-extrabold mb-2 holo-text" style={{ letterSpacing: "0.15em" }}>Grade-A-Beef</h1>
        <p className="text-base text-white/50 uppercase mb-8" style={{ letterSpacing: "0.3em" }}>Lineman Grade Tracker</p>

        <button
          onClick={() => router.push("/signin")}
          className="bg-white text-black font-semibold py-3 px-12 rounded-sm hover:bg-white/90 transition-colors duration-150 text-sm"
        >
          Login
        </button>
      </div>
    </div>
  );
}
