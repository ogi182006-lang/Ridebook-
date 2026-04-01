"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type FormState = {
  name: string;
  phone: string;
  pickup: string;
  drop: string;
};

const INITIAL: FormState = { name: "", phone: "", pickup: "", drop: "" };

export default function BookingPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { name, phone, pickup, drop } = form;

    if (!name.trim()) return setError("Please enter your name.");
    if (!phone.trim()) return setError("Please enter your mobile number.");
    if (phone.trim().length < 10)
      return setError("Enter a valid 10-digit mobile number.");
    if (!pickup.trim()) return setError("Please enter your pickup location.");

    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from("bookings").insert([
      {
        name: name.trim(),
        phone: phone.trim(),
        pickup: pickup.trim(),
        drop: drop.trim(),
        status: "pending",
      },
    ]);

    setLoading(false);

    if (dbError) {
      setError("Something went wrong. Please try again.");
      console.error(dbError);
      return;
    }

    setSubmitted(true);
  }

  // ── Success screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-6">🚕</div>
          <h1 className="text-2xl font-extrabold text-brand-400 mb-3">Ride Booked!</h1>
          <p className="text-zinc-300 text-lg leading-relaxed">
            Thank you{" "}
            <span className="text-white font-bold">{form.name}</span>, we will
            call you shortly.
          </p>
          <p className="mt-3 text-zinc-500 text-sm">
            Please keep your phone reachable on{" "}
            <span className="font-semibold text-zinc-300">{form.phone}</span>.
          </p>
          <button
            onClick={() => {
              setForm(INITIAL);
              setSubmitted(false);
            }}
            className="mt-8 text-brand-400 text-sm underline underline-offset-4"
          >
            Book another ride
          </button>
        </div>
      </main>
    );
  }

  // ── Booking form ────────────────────────────────────────────────
  return (
    <main className="min-h-screen px-4 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-sm mb-8 text-center">
        <span className="text-4xl">🚕</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Book a{" "}
          <span className="text-brand-400">Ride</span>
        </h1>
        <p className="mt-1 text-zinc-400 text-sm">
          Fill in your details — we&apos;ll call you to confirm.
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5"
      >
        {/* Name */}
        <div>
          <label htmlFor="name" className="field-label">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Ramesh Kumar"
            value={form.name}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="field-label">
            Mobile Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="e.g. 9876543210"
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        {/* Pickup */}
        <div>
          <label htmlFor="pickup" className="field-label">
            Pickup Location
          </label>
          <input
            id="pickup"
            name="pickup"
            type="text"
            placeholder="e.g. Sindhi Camp Bus Stand"
            value={form.pickup}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        {/* Drop */}
        <div>
          <label htmlFor="drop" className="field-label">
            Drop Location{" "}
            <span className="normal-case text-zinc-600 font-normal">(optional)</span>
          </label>
          <input
            id="drop"
            name="drop"
            type="text"
            placeholder="e.g. Jaipur Airport"
            value={form.drop}
            onChange={handleChange}
            className="field-input"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Booking…" : "Book Ride"}
        </button>
      </form>

      <p className="mt-6 text-zinc-600 text-xs text-center">
        No app needed &bull; 100% free &bull; We call you to confirm
      </p>
    </main>
  );
}
