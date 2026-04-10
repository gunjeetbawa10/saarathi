"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function inputClass(err?: boolean) {
  return cn(
    "mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
    err ? "border-red-400" : "border-primary/15"
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setStatus("err");
        setMessage("Could not send. Please call or email us directly.");
        return;
      }
      setStatus("ok");
      setMessage("Message sent. We will respond shortly.");
      form.reset();
    } catch {
      setStatus("err");
      setMessage("Network error. Try again or use the details beside this form.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-primary/80">
          Name
        </label>
        <input id="name" name="name" required className={inputClass()} />
      </div>
      <div>
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-primary/80">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass()} />
      </div>
      <div>
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-primary/80">
          Message
        </label>
        <textarea id="message" name="message" required rows={5} className={inputClass()} />
      </div>
      {message && (
        <p className={status === "ok" ? "text-primary" : "text-red-700"} role="status">
          {message}
        </p>
      )}
      <Button type="submit" disabled={status === "loading"} variant="secondary">
        {status === "loading" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
