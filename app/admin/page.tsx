"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, Booking } from "@/lib/supabaseClient";

const STATUS_OPTIONS: Booking["status"][] = ["pending", "called", "completed"];

const STATUS_STYLES: Record<Booking["status"], string> = {
  pending:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  called:    "bg-blue-500/15   text-blue-400   border-blue-500/30",
  completed: "bg-green-500/15  text-green-400  border-green-500/30",
};

const STATUS_LABELS: Record<Booking["status"], string> = {
  pending:   "⏳ Pending",
  called:    "📞 Called",
  completed: "✅ Done",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Initial fetch ───────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Failed to load bookings.");
      console.error(fetchError);
    } else {
      setBookings((data as Booking[]) ?? []);
    }
    setLoading(false);
  }, []);

  // ── Realtime subscription ───────────────────────────────────────
  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookings((prev) => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === payload.new.id ? (payload.new as Booking) : b
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBookings((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  // ── Status update ───────────────────────────────────────────────
  async function updateStatus(id: string, status: Booking["status"]) {
    setUpdating(id);
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      alert("Failed to update status. Please try again.");
      console.error(updateError);
    }
    setUpdating(null);
  }

  // ── Counts ──────────────────────────────────────────────────────
  const counts = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    called:    bookings.filter((b) => b.status === "called").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 tracking-tight">
            Admin <span className="text-brand-400">Panel</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Live bookings &bull; Auto-updates</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-600">LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: "Total",     value: counts.total,     color: "text-zinc-200" },
          { label: "Pending",   value: counts.pending,   color: "text-yellow-400" },
          { label: "Called",    value: counts.called,    color: "text-blue-400" },
          { label: "Completed", value: counts.completed, color: "text-green-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center"
          >
            <p className={`text-xl font-800 ${color}`}>{value}</p>
            <p className="text-zinc-600 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-zinc-500 text-sm text-center py-12">Loading bookings…</p>
      )}

      {/* Empty */}
      {!loading && bookings.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">🚕</p>
          <p className="text-sm">No bookings yet. Waiting for customers…</p>
        </div>
      )}

      {/* Booking Cards */}
      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              {/* Row 1: Name + Status badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-700 text-base text-white leading-tight">
                    {booking.name}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5 font-mono">
                    {formatTime(booking.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-600 px-2.5 py-1 rounded-full border ${
                    STATUS_STYLES[booking.status]
                  }`}
                >
                  {STATUS_LABELS[booking.status]}
                </span>
              </div>

              {/* Row 2: Phone (click-to-call) */}
              <a
                href={`tel:${booking.phone}`}
                className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20
                           rounded-lg px-3 py-2 mb-3 text-brand-400 font-700 text-base
                           hover:bg-brand-500/20 active:bg-brand-500/30 transition-colors"
              >
                <span>📞</span>
                <span>{booking.phone}</span>
              </a>

              {/* Row 3: Pickup / Drop */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-zinc-800 rounded-lg px-3 py-2">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-600 mb-0.5">
                    Pickup
                  </p>
                  <p className="text-zinc-200 text-sm font-500 leading-snug">
                    {booking.pickup}
                  </p>
                </div>
                <div className="bg-zinc-800 rounded-lg px-3 py-2">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-600 mb-0.5">
                    Drop
                  </p>
                  <p className="text-zinc-200 text-sm font-500 leading-snug">
                    {booking.drop || (
                      <span className="text-zinc-600 italic">Not specified</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Row 4: Status buttons */}
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    disabled={booking.status === s || updating === booking.id}
                    onClick={() => updateStatus(booking.id, s)}
                    className={`flex-1 text-xs font-700 py-1.5 rounded-lg border transition-colors
                      ${
                        booking.status === s
                          ? `${STATUS_STYLES[s]} cursor-default`
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 disabled:opacity-40"
                      }`}
                  >
                    {updating === booking.id && booking.status !== s
                      ? "…"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-zinc-700 text-xs mt-8">
        RideBook Admin &bull; All times in IST
      </p>
    </main>
  );
}
