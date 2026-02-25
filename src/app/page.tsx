import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-medium mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          API Online
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
          TrackAPI
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed">
          Track shipments across <span className="text-white font-medium">1,200+ couriers</span> worldwide
          with a single API endpoint. Auto-detect carriers, real-time status, standardized JSON.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/track"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-500/20"
          >
            Track a Shipment →
          </Link>
          <a
            href="#api-docs"
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium rounded-xl transition-colors backdrop-blur-sm"
          >
            API Docs
          </a>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left backdrop-blur-sm">
            <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">Auto-Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically identifies the courier from any tracking number.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left backdrop-blur-sm">
            <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">API Key Auth</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Secured with API key authentication and rate limiting.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left backdrop-blur-sm">
            <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm mb-1">Standardized JSON</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clean, consistent response format regardless of carrier.
            </p>
          </div>
        </div>
      </main>

      {/* API Docs section */}
      <section id="api-docs" className="bg-black/30 border-t border-white/5 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
          <div className="bg-slate-950 border border-white/10 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <div className="text-slate-500 mb-1"># Track a shipment</div>
            <div className="text-green-400">
              curl -X POST https://your-domain.com/api/track \
            </div>
            <div className="text-green-400 pl-4">
              -H &quot;x-api-key: YOUR_API_KEY&quot; \
            </div>
            <div className="text-green-400 pl-4">
              -H &quot;Content-Type: application/json&quot; \
            </div>
            <div className="text-green-400 pl-4">
              -d &#39;&#123;&quot;tracking_number&quot;: &quot;1Z999AA10123456784&quot;&#125;&#39;
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Endpoint</span>
              <p className="text-white font-mono mt-1">POST /api/track</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Auth</span>
              <p className="text-white font-mono mt-1">x-api-key header</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-500 border-t border-white/5">
        TrackAPI — Shipment tracking made simple
      </footer>
    </div>
  );
}
