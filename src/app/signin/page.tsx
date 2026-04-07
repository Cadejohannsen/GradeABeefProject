"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

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
        <source src="/signin-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Sign-in card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/[0.08] backdrop-blur-md border border-white/[0.12] rounded-md p-8 shadow-2xl space-y-5">
          <h2 className="text-lg font-semibold text-white text-center">Sign in to your account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-sm hover:bg-white/90 transition-colors duration-150 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-white/40">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white/70 hover:text-white transition-colors">
              Register
            </Link>
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full mt-4 text-xs text-white/30 hover:text-white/60 py-2 transition-colors"
        >
          &larr; Back
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full text-xs text-white/30 hover:text-white/60 py-2 transition-colors"
        >
          Skip for now &rarr;
        </button>
      </div>
    </div>
  );
}
