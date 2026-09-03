import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProfile } from "@/lib/permissions";
import SignOutButton from "@/components/SignOutButton";
import CustomerProfilePanel from "@/components/dashboard/CustomerProfilePanel";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const allowed = await canManageProfile(session, id, "VIEW");
  if (!allowed) notFound();

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      nfcTags: { where: { status: { in: ["ACTIVE", "EMERGENCY"] } }, take: 1 },
      emergencyContacts: { orderBy: { priority: "asc" } },
    },
  });
  if (!profile) notFound();

  const canEdit = await canManageProfile(session, id, "EDIT");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              ST
            </span>
            <span className="font-semibold">SafeTag</span>
          </Link>
          <SignOutButton redirectTo="/login" className="text-sm text-slate-600 hover:text-slate-900" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/dashboard" className="text-sm text-emerald-700 hover:underline">
          ← Back to dashboard
        </Link>
        <CustomerProfilePanel profile={JSON.parse(JSON.stringify(profile))} canEdit={canEdit} />
      </main>
    </div>
  );
}
