import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

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
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

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

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">{user.email}</p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800">My Profiles</h2>
          {user.profilesOwned.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No profiles linked yet. Contact SafeTag support or your
              administrator to have a profile created and NFC tag assigned.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {user.profilesOwned.map((p) => {
                const tag = p.nfcTags[0];
                const isEmergency = p.emergencyMode;
                return (
                  <li
                    key={p.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {p.firstName} {p.surname}
                        </p>
                        <p className="text-xs text-slate-500">{p.safeTagId}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isEmergency
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isEmergency ? "Emergency" : "Normal"}
                      </span>
                    </div>
                    {tag && (
                      <p className="mt-3 text-sm text-slate-600">
                        Tag:{" "}
                        <a
                          href={`/p/${tag.publicTagId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-600 hover:underline"
                        >
                          {tag.publicTagId}
                        </a>
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/dashboard/profile/${p.id}`}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        View / Edit
                      </Link>
                      {tag && (
                        <a
                          href={`/p/${tag.publicTagId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Test SafeTag
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
