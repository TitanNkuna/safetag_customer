"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton({
  redirectTo = "/",
  className,
}: {
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the network call fails, still send the user to a safe page.
    } finally {
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={loading} className={className}>
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
