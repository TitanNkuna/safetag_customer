import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <AppShell email={user.email}>
      <Link href="/dashboard" className="text-sm text-[#3dd6c3] hover:underline">
        ← Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-white">Account</h1>
      <p className="mt-1 text-sm text-[#9aa3b2]">
        Your SafeTag customer account details.
      </p>

      <div className="mt-8 max-w-lg space-y-4 rounded-2xl border border-[#2a313c] bg-[#12151a] p-6">
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone || "Not set"} />
        <Row
          label="Role"
          value={user.role === "GUARDIAN" ? "Guardian" : "Customer"}
        />
        <Row label="Status" value={user.isActive ? "Active" : "Inactive"} />
        <Row label="Member since" value={user.createdAt.toLocaleDateString()} />
        <Row
          label="Last login"
          value={user.lastLoginAt ? user.lastLoginAt.toLocaleString() : "—"}
        />
      </div>

      <p className="mt-6 max-w-lg text-sm text-[#9aa3b2]">
        To change your email or recover access, contact SafeTag support. Staff
        create and link NFC profiles from the admin portal.
      </p>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#2a313c] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[#9aa3b2]">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}
