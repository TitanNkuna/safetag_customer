"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Registration failed. Check your details."
        );
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#0b0d10]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3dd6c3] text-sm font-bold text-[#0b0d10]">
              ST
            </span>
            <span className="text-xl font-semibold text-white">SafeTag</span>
          </Link>
          <p className="mt-2 text-sm text-[#9aa3b2]">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[#2a313c] bg-[#12151a] p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#9aa3b2]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2a313c] bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-[#3dd6c3] focus:outline-none focus:ring-1 focus:ring-[#3dd6c3]"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#9aa3b2]">
              Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2a313c] bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-[#3dd6c3] focus:outline-none focus:ring-1 focus:ring-[#3dd6c3]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#9aa3b2]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2a313c] bg-white px-3 py-2 text-sm text-black caret-black focus:border-[#3dd6c3] focus:outline-none focus:ring-1 focus:ring-[#3dd6c3]"
            />
            <p className="mt-1 text-xs text-[#9aa3b2]">
              Min 8 characters, include upper, lower, and a number
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#3dd6c3] py-2.5 text-sm font-semibold text-[#0b0d10] hover:bg-[#2a9f91] disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#9aa3b2]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#3dd6c3] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
