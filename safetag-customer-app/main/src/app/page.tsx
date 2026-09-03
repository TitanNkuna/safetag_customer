import Link from "next/link";

const features = [
  {
    title: "NFC identifier only",
    body: "The physical tag holds a unique URL — never names, IDs, or medical data.",
  },
  {
    title: "Emergency Mode",
    body: "Parents can activate emergency mode so finders see only the information needed to help.",
  },
  {
    title: "Privacy first",
    body: "Minimum data exposure, server-side access control, and full audit trails.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#2a313c] bg-[#0b0d10]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3dd6c3] text-sm font-bold text-[#0b0d10]">
              ST
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              SafeTag
            </span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#9aa3b2] hover:text-white"
            >
              Customer login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#3dd6c3] px-3 py-1.5 text-sm font-semibold text-[#0b0d10] hover:bg-[#2a9f91]"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#3dd6c3]">
          Personal safety · NFC
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Your identity. Your safety.
          <br />
          <span className="text-[#3dd6c3]">One simple tap.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[#9aa3b2]">
          SafeTag links physical NFC tags to secure online profiles. Help identify
          loved ones who are lost or unable to communicate — while keeping private
          information protected.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-[#3dd6c3] px-6 py-3 text-base font-semibold text-[#0b0d10] shadow-lg shadow-[#3dd6c3]/10 hover:bg-[#2a9f91]"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[#2a313c] bg-[#12151a] px-6 py-3 text-base font-semibold text-white hover:border-[#3dd6c3]/40"
          >
            Customer login
          </Link>
        </div>

        <div className="mt-20 grid max-w-4xl gap-5 text-left sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="st-card-accent rounded-2xl border p-5 shadow-sm"
            >
              <div className="mb-3 h-1 w-10 rounded-full bg-[#3dd6c3]" />
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9aa3b2]">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[#2a313c] py-6 text-center text-sm text-[#9aa3b2]">
        © {new Date().getFullYear()} SafeTag · Built for safety and privacy
      </footer>
    </div>
  );
}
