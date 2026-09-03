"use client";

import { useState } from "react";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

interface Props {
  profile: {
    firstName: string;
    surname: string;
    preferredName?: string | null;
    dateOfBirth?: Date | null;
    photoUrl?: string | null;
    emergencyContacts: Contact[];
  };
  publicTagId: string;
  tagId: string;
  profileId: string;
}

function calcAge(dob: Date | null | undefined): number | null {
  if (!dob) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/**
 * Level 2 — Emergency view.
 * Only necessary identifying + contact information.
 * Large buttons, mobile-first, no login required.
 */
export function EmergencyProfileView({
  profile,
  publicTagId,
  tagId,
  profileId,
}: Props) {
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "shared" | "denied" | "error"
  >("idle");

  const displayName =
    profile.preferredName ||
    `${profile.firstName} ${profile.surname}`;
  const age = calcAge(profile.dateOfBirth);
  const primary = profile.emergencyContacts[0];

  async function shareLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/emergency/share-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              publicTagId,
              tagId,
              profileId,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            }),
          });
          if (res.ok) {
            setLocationStatus("shared");
          } else {
            setLocationStatus("error");
          }
        } catch {
          setLocationStatus("error");
        }
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center px-4 py-6">
      {/* Emergency banner */}
      <div className="w-full max-w-md mb-4 rounded-xl bg-red-600 text-white px-4 py-3 text-center shadow-lg">
        <p className="text-lg font-bold tracking-wide">🔴 EMERGENCY MODE</p>
        <p className="text-sm opacity-90 mt-0.5">
          This SafeTag has been placed into emergency mode.
        </p>
      </div>

      <main className="w-full max-w-md rounded-2xl bg-white shadow-xl border-2 border-red-200 overflow-hidden">
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

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Name
            </p>
            <p className="text-2xl font-bold text-slate-900">{displayName}</p>
            {age !== null && (
              <p className="text-sm text-slate-600 mt-0.5">Age: {age}</p>
            )}
          </div>

          {/* Primary actions – large, obvious */}
          <div className="space-y-3 pt-1">
            {primary && (
              <>
                <a
                  href={`tel:${primary.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-4 text-lg font-bold text-white shadow-md hover:bg-red-700 active:scale-[0.98] transition"
                >
                  CALL {primary.relationship?.toUpperCase() || "PARENT"}
                </a>
                <a
                  href={`sms:${primary.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-base font-semibold text-white shadow hover:bg-orange-600 active:scale-[0.98] transition"
                >
                  MESSAGE {primary.relationship?.toUpperCase() || "PARENT"}
                </a>
              </>
            )}

            {/* Optional location share – explicit consent only */}
            <button
              type="button"
              onClick={shareLocation}
              disabled={
                locationStatus === "requesting" || locationStatus === "shared"
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition disabled:opacity-60"
            >
              {locationStatus === "idle" && "SHARE MY LOCATION"}
              {locationStatus === "requesting" && "Requesting…"}
              {locationStatus === "shared" && "✓ Location shared"}
              {locationStatus === "denied" && "Location denied"}
              {locationStatus === "error" && "Could not share – try again"}
            </button>
          </div>

          {profile.emergencyContacts.length > 1 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Other contacts</p>
              <ul className="space-y-1.5">
                {profile.emergencyContacts.slice(1).map((c) => (
                  <li key={c.id} className="flex justify-between text-sm">
                    <span>
                      {c.name} ({c.relationship})
                    </span>
                    <a
                      href={`tel:${c.phone}`}
                      className="text-red-600 font-medium"
                    >
                      Call
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-6 text-center text-xs text-slate-500 max-w-md">
        <p>
          If you have found this person, please contact the guardian above.
          Location is only shared if you explicitly allow it.
        </p>
        <p className="mt-2 text-slate-400">Tag: {publicTagId}</p>
      </footer>
    </div>
  );
}
