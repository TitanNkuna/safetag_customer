import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function AppShell({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">
      <header className="border-b border-[#2a313c] bg-[#0b0d10]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3dd6c3] text-sm font-bold text-[#0b0d10]">
              ST
            </span>
            <span className="text-lg font-semibold tracking-tight">SafeTag</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/dashboard"
              className="hidden text-[#9aa3b2] hover:text-white sm:inline"
            >
              Dashboard
            </Link>
            <Link
              href="/account"
              className="hidden text-[#9aa3b2] hover:text-white sm:inline"
            >
              Account
            </Link>
            {email && (
              <span className="max-w-[140px] truncate text-[#9aa3b2] sm:max-w-none">
                {email}
              </span>
            )}
            <SignOutButton
              redirectTo="/login"
              className="rounded-lg border border-[#2a313c] px-3 py-1.5 text-[#9aa3b2] hover:border-[#3dd6c3]/40 hover:text-white"
            />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
