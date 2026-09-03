interface Props {
  type: "invalid" | "not_found" | "deactivated" | "replaced";
  newTagId?: string;
}

export function TagErrorView({ type, newTagId }: Props) {
  const messages = {
    invalid: {
      title: "Invalid SafeTag",
      body: "This SafeTag could not be found. Please check the tag and try again.",
    },
    not_found: {
      title: "SafeTag not found",
      body: "This SafeTag could not be found.",
    },
    deactivated: {
      title: "SafeTag inactive",
      body: "This SafeTag is no longer active.",
    },
    replaced: {
      title: "SafeTag replaced",
      body: "This SafeTag has been replaced. Please use the new tag.",
    },
  };

  const msg = messages[type];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-slate-200 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-slate-900">{msg.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{msg.body}</p>

        {type === "replaced" && newTagId && (
          <a
            href={`/p/${newTagId}`}
            className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Open new SafeTag
          </a>
        )}
      </div>
      <p className="mt-8 text-xs text-slate-400">SafeTag</p>
    </div>
  );
}
