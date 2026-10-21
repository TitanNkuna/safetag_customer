import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profilesOwned: {
        include: {
          nfcTags: {
            where: { status: { in: ["ACTIVE", "EMERGENCY"] } },
            take: 1,
          },
          photos: { where: { isPrimary: true }, take: 1 },
          emergencyContacts: { orderBy: { priority: "asc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const emergencyCount = user.profilesOwned.filter((p) => p.emergencyMode).length;

  return (
    <AppShell email={user.email}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          My dashboard
        </h1>
        <p className="mt-1 text-sm text-[#9aa3b2]">
          Manage linked SafeTag profiles and emergency mode.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatCard label="Profiles" value={String(user.profilesOwned.length)} />
        <StatCard
          label="Emergency active"
          value={String(emergencyCount)}
          accent={emergencyCount > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Account"
          value={user.role === "GUARDIAN" ? "Guardian" : "Customer"}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">My profiles</h2>
          <Link href="/account" className="text-sm text-[#3dd6c3] hover:underline">
            Account settings
          </Link>
        </div>

        {user.profilesOwned.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2a313c] bg-[#12151a] p-8 text-center">
            <p className="text-base font-medium text-white">No profiles linked yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#9aa3b2]">
              A SafeTag staff member creates your profile and assigns an NFC tag.
              Once linked to this account, it will appear here so you can manage
              emergency contacts and emergency mode.
            </p>
            <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-[#9aa3b2]">
              <li className="flex gap-2">
                <span className="font-semibold text-[#3dd6c3]">1.</span>
                Contact SafeTag or your administrator
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-[#3dd6c3]">2.</span>
                Ask them to create a profile and assign a tag
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-[#3dd6c3]">3.</span>
                Link the profile to <span className="text-white">{user.email}</span>
              </li>
            </ol>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {user.profilesOwned.map((p) => {
              const tag = p.nfcTags[0];
              const isEmergency = p.emergencyMode;
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-[#2a313c] bg-[#12151a] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {p.firstName} {p.surname}
                      </p>
                      <p className="text-xs text-[#9aa3b2]">{p.safeTagId}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-[#9aa3b2]">
                        {p.profileType}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isEmergency
                          ? "bg-[rgba(240,113,120,0.15)] text-[#f07178]"
                          : "bg-[rgba(61,214,195,0.12)] text-[#3dd6c3]"
                      }`}
                    >
                      {isEmergency ? "Emergency" : "Normal"}
                    </span>
                  </div>

                  {tag && (
                    <p className="mt-3 text-sm text-[#9aa3b2]">
                      Tag:{" "}
                      <span className="font-medium text-white">{tag.publicTagId}</span>
                    </p>
                  )}
                  {p.emergencyContacts[0] && (
                    <p className="mt-1 text-sm text-[#9aa3b2]">
                      Primary contact: {p.emergencyContacts[0].name}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/profile/${p.id}`}
                      className="rounded-lg bg-[#3dd6c3] px-3 py-1.5 text-xs font-semibold text-[#0b0d10] hover:bg-[#2a9f91]"
                    >
                      Manage
                    </Link>
                    {tag && (
                      <a
                        href={`/p/${tag.publicTagId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[#2a313c] px-3 py-1.5 text-xs font-medium text-[#9aa3b2] hover:border-[#3dd6c3]/40 hover:text-white"
                      >
                        Test public page
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: string;
  accent?: "default" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-[#2a313c] bg-[#12151a] px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-[#9aa3b2]">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          accent === "danger" ? "text-[#f07178]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
