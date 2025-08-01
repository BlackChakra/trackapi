"use client";
import React, { useState } from "react";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "testkey",
        },
        body: JSON.stringify({ tracking_number: trackingNumber, courier: courier || undefined }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Unknown error");
      else setResult(data);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-800">Track Your Shipment</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Tracking Number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Courier (optional)" value={courier} onChange={e => setCourier(e.target.value)} className="w-full border rounded px-3 py-2" />
          <button type="submit" className="w-full bg-purple-700 text-white py-2 rounded" disabled={loading}>{loading ? "Tracking..." : "Track"}</button>
        </form>
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        {result && (
          <div className="mt-6 text-center">
            <div className="mb-2"><span className="font-semibold">Status:</span> {result.status || "-"}</div>
            <div className="mb-2"><span className="font-semibold">Courier:</span> {result.courier || "-"}</div>
            <div className="text-left mt-4">
              <h2 className="font-semibold mb-2">Checkpoints</h2>
              <ul className="space-y-2">
                {result.checkpoints && result.checkpoints.length > 0 ? result.checkpoints.map((cp: any, i: number) => (
                  <li key={i} className="border-l-4 border-purple-400 pl-2">
                    <div className="text-sm text-gray-700">{cp.Date || cp.date || cp.checkpoint_time} - {cp.StatusDescription || cp.status_description || cp.status}</div>
                    <div className="text-xs text-gray-500">{cp.Details || cp.details || cp.location || ""}</div>
                  </li>
                )) : <li className="text-gray-400">No checkpoints available.</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
