import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageProfile } from "@/lib/permissions";
import AppShell from "@/components/AppShell";
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
    <AppShell email={session.email}>
      <Link href="/dashboard" className="text-sm text-[#3dd6c3] hover:underline">
        ← Back to dashboard
      </Link>
      <CustomerProfilePanel
        profile={JSON.parse(JSON.stringify(profile))}
        canEdit={canEdit}
      />
    </AppShell>
  );
}
