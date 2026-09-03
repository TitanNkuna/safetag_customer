"use client";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

interface Props {
  profile: {
    firstName: string;
    surname: string;
    preferredName?: string | null;
    photoUrl?: string | null;
    emergencyContacts: Contact[];
  };
  publicTagId: string;
}

/**
 * Level 3 — Public / Normal view.
 * Minimal information only.
 */
export function PublicProfileView({ profile, publicTagId }: Props) {
  const displayName =
    profile.preferredName ||
    `${profile.firstName} ${profile.surname.charAt(0)}.`;

  const primary = profile.emergencyContacts[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-8">
      <header className="w-full max-w-md mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Registered SafeTag
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          SafeTag
        </h1>
        <p className="text-sm text-slate-500">Your identity. Your safety.</p>
      </header>

      <main className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden">
        {/* Photo */}
        <div className="bg-slate-100 aspect-[4/3] flex items-center justify-center">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-slate-400 text-6xl font-light">
              {profile.firstName.charAt(0)}
              {profile.surname.charAt(0)}
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Name
            </p>
            <p className="text-xl font-semibold text-slate-900">{displayName}</p>
          </div>

          <p className="text-sm text-slate-600">
            This person is registered with SafeTag.
          </p>

          {primary && (
            <div className="pt-2 space-y-3">
              <a
                href={`tel:${primary.phone}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow hover:bg-emerald-700 active:scale-[0.98] transition"
              >
                Call {primary.relationship || "Guardian"}
              </a>
              <a
                href={`sms:${primary.phone}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 px-4 py-3 text-base font-semibold text-emerald-700 hover:bg-emerald-50 active:scale-[0.98] transition"
              >
                Message {primary.relationship || "Guardian"}
              </a>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-8 text-center text-xs text-slate-400">
        <p>Tag: {publicTagId}</p>
        <p className="mt-1">SafeTag · Privacy-first identification</p>
      </footer>
    </div>
  );
}
