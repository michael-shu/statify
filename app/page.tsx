import Upload from "./upload";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-56 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-56 left-1/4 h-[520px] w-[520px] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Statify
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Upload your Spotify data to see your lifetime listening stats.
          </p>
        </div>

        {/* Upload Card (BIG focus) */}
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/30">
          <Upload />
        </div>

        {/* Small hint */}
        <p className="mt-6 text-xs text-slate-500 text-center">
          Spotify → Privacy → “Download your data”
        </p>
      </div>
    </main>
  );
}