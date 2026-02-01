// app/page.tsx (Server Component)
import Upload from "./upload";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-56 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-56 left-1/4 h-[520px] w-[520px] rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        {/* Header */}
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-cyan-500/10" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">Statify</div>
              <div className="text-xs text-slate-400">
                Your lifetime Spotify stats, visualized.
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Private by default
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Takes ~30s
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-1 items-center py-6">
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Left */}
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Upload your Spotify data export
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                See your{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  lifetime listening
                </span>{" "}
                at a glance.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                Statify turns your Spotify “Account Data” export into clean,
                interactive charts: top artists, top tracks, listening trends,
                eras, and more.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-slate-100">Top</div>
                  <div className="mt-1 text-xs text-slate-400">
                    artists &amp; tracks
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-slate-100">Trends</div>
                  <div className="mt-1 text-xs text-slate-400">
                    over months/years
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-slate-100">Private</div>
                  <div className="mt-1 text-xs text-slate-400">
                    your data stays yours
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Works with Spotify JSON exports
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  No login required
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center">
              <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-100">
                      Upload &amp; generate your recap
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      Drop your exported files here to start.
                    </div>
                  </div>

                  <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 sm:block">
                    1 step
                  </div>
                </div>

                  <Upload />
              

                <div className="mt-5 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Tip: Spotify → Privacy settings → “Download your data”
                  </span>
                  <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Server-rendered page
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Statify
        </footer>
      </div>
    </main>
  );
}
