import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            Publish Everywhere
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-xs">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-xs py-2 px-4">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-50/30 via-stone-50 to-stone-50" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent-600">
            One dashboard. Every platform.
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-7xl leading-[1.05]">
            Write once.<br />
            <span className="text-neutral-400">Publish everywhere.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Craft your content in one place and push it live to Medium, WordPress,
            and Substack with a single click.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary px-8 py-3.5 text-sm">
              Start publishing
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3.5 text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group rounded-3xl border border-stone-200/60 bg-stone-100/60 p-8 transition-all duration-300 hover:bg-white/80 hover:shadow-elevated hover:border-neutral-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white text-sm font-bold">
                M
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Medium</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Publish articles directly to your Medium profile with full formatting and tags.
              </p>
            </div>

            <div className="group rounded-3xl border border-stone-200/60 bg-stone-100/60 p-8 transition-all duration-300 hover:bg-white/80 hover:shadow-elevated hover:border-neutral-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white text-sm font-bold">
                W
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">WordPress</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Push posts to your self-hosted WordPress site via the REST API.
              </p>
            </div>

            <div className="group rounded-3xl border border-stone-200/60 bg-stone-100/60 p-8 transition-all duration-300 hover:bg-white/80 hover:shadow-elevated hover:border-neutral-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white text-sm font-bold">
                S
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Substack</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Send newsletters to your Substack subscribers without switching tabs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-stone-200/60">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Three steps to everywhere.
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 text-left">
            <div>
              <div className="text-4xl font-bold text-neutral-200 mb-3">01</div>
              <h3 className="text-base font-semibold text-neutral-900">Connect</h3>
              <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                Link your Medium, WordPress, and Substack accounts securely.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-neutral-200 mb-3">02</div>
              <h3 className="text-base font-semibold text-neutral-900">Write</h3>
              <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                Compose in Markdown with a clean, distraction-free editor.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-neutral-200 mb-3">03</div>
              <h3 className="text-base font-semibold text-neutral-900">Publish</h3>
              <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                Hit publish once. Your content goes live on every platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Ready to simplify your workflow?
          </h2>
          <p className="mt-4 text-base text-neutral-500">
            Join writers who save hours every week by publishing from one place.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="btn-primary px-10 py-4 text-sm">
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 py-8 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Publish Everywhere
          </span>
          <span className="text-xs text-neutral-400">
            Built for writers.
          </span>
        </div>
      </footer>
    </div>
  );
}
