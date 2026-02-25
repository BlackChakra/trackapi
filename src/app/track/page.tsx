"use client";

import React, { useState } from "react";
import { trackShipment, type TrackResult } from "./actions";
import type { TrackingMoreCheckpoint } from "@/app/types";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await trackShipment(
        trackingNumber,
        courier || undefined
      );
      setResult(res);
    } catch {
      setResult({ success: false, error: "An unexpected error occurred. Please try again." });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-700 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Track Shipment</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tracking-number" className="block text-sm font-medium text-slate-600 mb-1">
              Tracking Number
            </label>
            <input
              id="tracking-number"
              type="text"
              placeholder="e.g. 1Z999AA10123456784"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              required
              maxLength={60}
            />
          </div>

          <div>
            <label htmlFor="courier" className="block text-sm font-medium text-slate-600 mb-1">
              Courier <span className="text-slate-400">(optional — auto-detected if empty)</span>
            </label>
            <input
              id="courier"
              type="text"
              placeholder="e.g. fedex, ups, dhl"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              maxLength={40}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Tracking…
              </span>
            ) : (
              "Track"
            )}
          </button>
        </form>

        {/* Error display */}
        {result && !result.success && (
          <div className="mt-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100">
            {result.error}
          </div>
        )}

        {/* Success display */}
        {result && result.success && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Status</span>
                <p className="text-green-800 font-semibold capitalize">{result.data.status || "Unknown"}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Courier</span>
                <p className="text-green-800 font-semibold uppercase">{result.data.courier || "—"}</p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-slate-700 mb-3">Checkpoints</h2>
              {result.data.checkpoints.length > 0 ? (
                <ul className="space-y-3">
                  {result.data.checkpoints.map((cp: TrackingMoreCheckpoint, i: number) => (
                    <li key={i} className="border-l-4 border-purple-400 pl-3 py-1">
                      <p className="text-sm text-slate-700 font-medium">
                        {cp.StatusDescription || cp.status_description || cp.status || "Update"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {cp.Date || cp.date || cp.checkpoint_time || ""}
                        {(cp.Details || cp.details || cp.location) &&
                          ` — ${cp.Details || cp.details || cp.location}`}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 text-sm">No checkpoints available yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Powered by <span className="font-medium text-slate-500">TrackAPI</span>
      </p>
    </div>
  );
}
