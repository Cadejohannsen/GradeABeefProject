"use client";

import { useRef, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { VolumeControl } from "@/components/ui/volume-control";
import { useSettings } from "@/components/providers/settings-provider";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const { settings } = useSettings();

  const customUrl = settings.videoUrls?.signin ?? "";
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

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const res = await signIn("credentials", {
        idToken,
        redirect: false,
      });

      if (res?.error) {
        setError("Account not found. Please register first.");
        setLoading(false);
      } else {
        router.push("/select-year");
      }
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Sign in failed. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-[#050505]">
      {/* Video background */}
      {ytId ? (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            className="absolute pointer-events-none"
            style={{ top:"50%",left:"50%",width:"177.78vh",height:"56.25vw",minWidth:"100%",minHeight:"100%",transform:"translate(-50%,-50%)",opacity:uiHidden?1:0.3,border:"none" }}
          />
        </div>
      ) : (
        <video ref={videoRef} autoPlay loop muted playsInline className={`absolute inset-0 w-full h-full object-cover ${uiHidden ? "" : "opacity-30"}`}>
          <source src="/signin-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      {!uiHidden && <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />}

      {/* Back button */}
      {!uiHidden && <button
        onClick={() => router.push("/login")}
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors font-inter"
      >
        <ArrowLeft size={13} />
        Back
      </button>}

      {/* Card */}
      {!uiHidden && <div className="relative z-10 w-full max-w-[360px]">

        {/* Wordmark */}
        <div className="text-center mb-7">
          <span
            className="font-bebas text-white/70 tracking-widest"
            style={{ fontSize: "1.4rem", letterSpacing: "0.14em" }}
          >
            Grade-A-Beef
          </span>
        </div>

        <div
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-8 shadow-modal"
        >
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-[1.4rem] text-white font-bebas tracking-wide">Welcome back</h2>
            <p className="text-[12px] text-white/40 mt-1 font-inter">Sign in to your coaching account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/[0.08] border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-[12px] mb-5 font-inter">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="coach@team.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 font-inter">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold font-inter py-3 rounded-xl hover:bg-white/92 active:scale-[0.99] transition-all duration-150 text-[14px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/[0.06] flex flex-col gap-2">
            <p className="text-center text-[12px] text-white/35 font-inter">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
                Register
              </Link>
            </p>
            <button
              onClick={() => router.push("/select-year")}
              className="text-center text-[11px] text-white/20 hover:text-white/40 transition-colors font-inter py-1"
            >
              Skip sign in →
            </button>
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
