"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { VolumeControl } from "@/components/ui/volume-control";
import { useSettings } from "@/components/providers/settings-provider";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export default function SelectYearPage() {
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [uiHidden, setUiHidden] = useState(false);
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { settings } = useSettings();

  function getEmbedUrl() {
    const raw = settings.videoUrls?.selectYear ?? "";
    const match = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    const id = match ? match[1] : "nnE3K1w6xYw";
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=high1080&fs=0&enablejsapi=1`;
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

  const handleYearSelect = async () => {
    // Ensure season exists for selected year
    try {
      await fetch("/api/seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ year: selectedYear }),
      });
    } catch (error) {
      console.error("Failed to create season:", error);
    }
    
    router.push(`/dashboard?year=${selectedYear}`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          ref={iframeRef}
          src={getEmbedUrl()}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100vw",
            height: "100vh",
            transform: "translate(-50%, -50%) scale(1.3)",
            pointerEvents: "none",
            border: "none",
          }}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
        {/* Dark overlay for better text visibility */}
        {!uiHidden && <div className="absolute inset-0 bg-black/50" />}
      </div>

      {/* Content */}
      {!uiHidden && <div className="relative z-10 flex flex-col items-center justify-center w-screen h-screen px-4">
        <div className="bg-white/[0.1] backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/[0.2]">
          <h1 className="text-4xl font-bold text-white text-center mb-2">Select Season Year</h1>
          <p className="text-white/70 text-center mb-8">Choose the year you want to manage</p>

          <div className="space-y-6">
            {/* Year Dropdown */}
            <div>
              <label htmlFor="year-select" className="block text-sm font-medium text-white/80 mb-2">
                Season Year
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white/[0.1] border border-white/[0.2] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
              >
                {years.map((year) => (
                  <option key={year} value={year.toString()} className="bg-gray-900 text-white">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleYearSelect}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-white/[0.2]"
            >
              Continue to {selectedYear} Dashboard
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              You'll be able to view and manage all data for the {selectedYear} season
            </p>
          </div>
        </div>
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
