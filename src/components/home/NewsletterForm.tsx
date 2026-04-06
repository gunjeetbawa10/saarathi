"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setStatus("err");
        setMessage(d.error ?? "Could not subscribe");
        return;
      }
      setStatus("ok");
      setMessage("You’re subscribed. Watch your inbox.");
      setEmail("");
    } catch {
      setStatus("err");
      setMessage("Network error — try again shortly.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:items-start"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <Button type="submit" disabled={status === "loading"} variant="primary" className="shrink-0">
        {status === "loading" ? "Joining…" : "Join the list"}
      </Button>
      {message && (
        <p
          className={`w-full text-sm ${status === "ok" ? "text-primary" : "text-red-700"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
