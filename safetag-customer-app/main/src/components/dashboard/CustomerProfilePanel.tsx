"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const card =
  "mt-6 rounded-2xl border border-[#2a313c] bg-[#12151a] p-5 shadow-sm";
const inputClass =
  "mt-1 w-full rounded-lg border border-[#2a313c] bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-[#3dd6c3] focus:outline-none focus:ring-1 focus:ring-[#3dd6c3]";
const smallBtn =
  "rounded-lg border border-[#2a313c] px-3 py-1.5 text-xs font-medium text-[#9aa3b2] hover:border-[#3dd6c3]/40 hover:text-white disabled:opacity-50";
const primaryBtn =
  "rounded-lg bg-[#3dd6c3] px-3 py-1.5 text-xs font-semibold text-[#0b0d10] hover:bg-[#2a9f91] disabled:opacity-50";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}
interface Profile {
  id: string;
  firstName: string;
  surname: string;
  preferredName?: string | null;
  profileType?: string;
  safeTagId: string;
  emergencyMode: boolean;
  nfcTags: { publicTagId: string }[];
  emergencyContacts: Contact[];
}

export default function CustomerProfilePanel({
  profile,
  canEdit,
}: {
  profile: Profile;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const tag = profile.nfcTags[0];

  async function toggleEmergency() {
    setBusy(true);
    setError("");
    try {
      const url = profile.emergencyMode
        ? "/api/emergency/deactivate"
        : "/api/emergency/activate";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update emergency mode");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {profile.firstName} {profile.surname}
          </h1>
          {profile.preferredName && (
            <p className="text-sm text-[#9aa3b2]">Preferred: {profile.preferredName}</p>
          )}
          <p className="mt-1 text-sm text-[#9aa3b2]">{profile.safeTagId}</p>
          {tag && (
            <a
              href={`/p/${tag.publicTagId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-[#3dd6c3] hover:underline"
            >
              Open public SafeTag page ({tag.publicTagId})
            </a>
          )}
        </div>
        {canEdit && (
          <button
            disabled={busy}
            onClick={toggleEmergency}
            className={
              profile.emergencyMode
                ? "rounded-xl border border-[#f07178]/40 bg-[rgba(240,113,120,0.15)] px-4 py-2.5 text-sm font-semibold text-[#f07178]"
                : "rounded-xl bg-[#f07178] px-4 py-2.5 text-sm font-semibold text-[#0b0d10]"
            }
          >
            {profile.emergencyMode
              ? "Deactivate emergency mode"
              : "Activate emergency mode"}
          </button>
        )}
      </div>

      {profile.emergencyMode && (
        <div className="mt-4 rounded-xl border border-[#f07178]/30 bg-[rgba(240,113,120,0.12)] px-4 py-3 text-sm text-[#f07178]">
          Emergency mode is <strong>on</strong>. Finders who scan the tag see
          emergency contacts and limited help information only.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-[#f07178]/30 bg-[rgba(240,113,120,0.12)] px-3 py-2 text-sm text-[#f07178]">
          {error}
        </div>
      )}

      <div className={card}>
        <h2 className="font-semibold text-white">How this works</h2>
        <ul className="mt-3 space-y-2 text-sm text-[#9aa3b2]">
          <li>• Normal mode: minimal public info when the tag is scanned.</li>
          <li>• Emergency mode: finders see contacts so they can help quickly.</li>
          <li>• The NFC tag only stores a URL — never your personal data.</li>
        </ul>
      </div>

      <ContactsCard
        profileId={profile.id}
        contacts={profile.emergencyContacts}
        canEdit={canEdit}
        onChange={() => router.refresh()}
      />
    </div>
  );
}

function ContactsCard({
  profileId,
  contacts,
  canEdit,
  onChange,
}: {
  profileId: string;
  contacts: Contact[];
  canEdit: boolean;
  onChange: () => void;
}) {
  const [form, setForm] = useState({ name: "", relationship: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/profiles/${profileId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priority: contacts.length + 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not add contact");
        return;
      }
      setForm({ name: "", relationship: "", phone: "" });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove(contactId: string) {
    setBusy(true);
    setError("");
    try {
      await fetch(`/api/profiles/${profileId}/contacts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={card}>
      <h2 className="font-semibold text-white">Emergency contacts</h2>
      <p className="mt-1 text-sm text-[#9aa3b2]">
        Shown to finders when emergency mode is active.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {contacts.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#2a313c] px-3 py-2.5"
          >
            <div>
              <span className="font-medium text-white">{c.name}</span>
              <span className="ml-2 text-xs text-[#9aa3b2]">
                {c.relationship} · {c.phone}
              </span>
            </div>
            {canEdit && (
              <button disabled={busy} className={smallBtn} onClick={() => remove(c.id)}>
                Remove
              </button>
            )}
          </li>
        ))}
        {contacts.length === 0 && (
          <p className="text-[#9aa3b2]">No emergency contacts yet.</p>
        )}
      </ul>
      {error && <p className="mt-3 text-sm text-[#f07178]">{error}</p>}
      {canEdit && (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <input
              placeholder="Name"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              placeholder="Relationship"
              className={inputClass}
              value={form.relationship}
              onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
            />
            <input
              placeholder="Phone"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <button
            disabled={busy || !form.name || !form.relationship || !form.phone}
            onClick={add}
            className={`${primaryBtn} mt-3`}
          >
            Add contact
          </button>
        </>
      )}
    </div>
  );
}
