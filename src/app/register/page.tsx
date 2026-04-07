"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, teamName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
      setLoading(false);
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
        <source src="/register-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Registration card */}
      <div className="relative z-10 w-full max-w-sm">
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
      </div>
    </div>
  );
}
