"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const card = "mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const smallBtn =
  "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50";
const primaryBtn =
  "rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50";

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
  safeTagId: string;
  emergencyMode: boolean;
  nfcTags: { publicTagId: string }[];
  emergencyContacts: Contact[];
}

export default function CustomerProfilePanel({ profile, canEdit }: { profile: Profile; canEdit: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const tag = profile.nfcTags[0];

  async function toggleEmergency() {
    setBusy(true);
    setError("");
    try {
      const url = profile.emergencyMode ? "/api/emergency/deactivate" : "/api/emergency/activate";
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
    <div>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile.firstName} {profile.surname}
          </h1>
          <p className="text-sm text-slate-500">{profile.safeTagId}</p>
          {tag && (
            <a
              href={`/p/${tag.publicTagId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-emerald-600 hover:underline"
            >
              View public SafeTag page
            </a>
          )}
        </div>
        {canEdit && (
          <button
            disabled={busy}
            onClick={toggleEmergency}
            className={
              profile.emergencyMode
                ? "rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200"
                : "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            }
          >
            {profile.emergencyMode ? "Deactivate emergency mode" : "Activate emergency mode"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <ContactsCard profileId={profile.id} contacts={profile.emergencyContacts} canEdit={canEdit} onChange={() => router.refresh()} />
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

  async function add() {
    setBusy(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priority: contacts.length + 1 }),
      });
      if (res.ok) {
        setForm({ name: "", relationship: "", phone: "" });
        onChange();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(contactId: string) {
    setBusy(true);
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
      <h2 className="font-semibold text-slate-900">Emergency contacts</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <div>
              <span className="text-slate-900">{c.name}</span>
              <span className="ml-2 text-xs text-slate-500">
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
        {contacts.length === 0 && <p className="text-slate-500">No emergency contacts yet.</p>}
      </ul>
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
