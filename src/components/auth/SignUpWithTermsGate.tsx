"use client";

import Link from "next/link";
import { useState } from "react";
import { SignUp } from "@clerk/nextjs";

export function SignUpWithTermsGate() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <div className={!acceptedTerms ? "pointer-events-none opacity-60" : undefined}>
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-card border border-primary/10 bg-white",
              },
            }}
            signInUrl="/sign-in"
            fallbackRedirectUrl="/"
          />
        </div>
        {!acceptedTerms ? (
          <div className="absolute inset-0 z-10 flex items-end justify-center rounded-3xl p-4">
            <div className="rounded-xl border border-primary/20 bg-white/95 px-4 py-2 text-center text-xs font-medium text-ink/70 shadow-card">
              Accept Terms &amp; Conditions below to enable this form.
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-2xl border border-primary/10 bg-white p-5 shadow-card">
        <label htmlFor="accept-terms" className="flex cursor-pointer gap-3 text-sm text-ink/85">
          <input
            id="accept-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
          />
          <span>
            I confirm that I have read and accept the{" "}
            <Link href="/terms-and-conditions" className="font-medium text-primary hover:underline">
              Terms &amp; Conditions
            </Link>
            .
          </span>
        </label>
      </div>
    </div>
  );
}
