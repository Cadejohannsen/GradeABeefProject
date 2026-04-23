"use client";

import { useRef, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VolumeControl } from "@/components/ui/volume-control";
import { useSettings } from "@/components/providers/settings-provider";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const { settings } = useSettings();

  const customUrl = settings.videoUrls?.register ?? "";
  const ytMatch = customUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  const ytId = ytMatch ? ytMatch[1] : null;

  function handleVolume(vol: number) {
    if (ytId) {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      if (vol === 0) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*");
      } else {
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
        iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [vol] }), "*");
      }
    } else {
      if (!videoRef.current) return;
      videoRef.current.muted = vol === 0;
      videoRef.current.volume = vol / 100;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
      setLoading(false);
      return;
    }

    try {
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, teamName, idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Roll back the Firebase user if our DB registration fails
        await userCredential.user.delete();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      await signIn("credentials", { idToken, redirect: false });
      router.push("/dashboard");
    } catch {
      await userCredential.user.delete();
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Video background */}
      {ytId ? (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            className="absolute pointer-events-none"
            style={{ top:"50%",left:"50%",width:"177.78vh",height:"56.25vw",minWidth:"100%",minHeight:"100%",transform:"translate(-50%,-50%)",opacity:uiHidden?1:0.4,border:"none" }}
          />
        </div>
      ) : (
        <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/register-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Dark overlay */}
      {!uiHidden && <div className="absolute inset-0 bg-black/70" />}

      {/* Registration card */}
      {!uiHidden && <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-md p-8 shadow-2xl space-y-5">
          <h2 className="text-lg font-semibold text-white text-center">Create Your Account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                Coach Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/[0.12] rounded-sm px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-transparent transition"
                placeholder="Coach Johnson"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/[0.12] rounded-sm px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-transparent transition"
                placeholder="coach@team.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/[0.12] rounded-sm px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-transparent transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-white/[0.08] border border-white/[0.12] rounded-sm px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-transparent transition"
                placeholder="Wildcats"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-sm hover:bg-white/90 transition-colors duration-150 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-white/40">
            Already have an account?{" "}
            <Link href="/signin" className="text-white/70 hover:text-white transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full mt-4 text-xs text-white/30 hover:text-white/60 py-2 transition-colors"
        >
          &larr; Back
        </button>
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
