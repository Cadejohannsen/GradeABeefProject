"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/select-year");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-[#050505]">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/signin-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />

      {/* Back button */}
      <button
        onClick={() => router.push("/login")}
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-[12px] text-white/30 hover:text-white/60 transition-colors font-inter"
      >
        <ArrowLeft size={13} />
        Back
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[360px]">

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
      </div>
    </div>
  );
}
