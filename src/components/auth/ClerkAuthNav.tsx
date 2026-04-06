"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function ClerkAuthNav() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-ink/80 transition-colors hover:text-primary"
        >
          Log in
        </Link>
        <Link
          href="/sign-up"
          className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Register
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/account/bookings"
          className="text-sm font-medium text-ink/80 transition-colors hover:text-primary"
        >
          My bookings
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-2 ring-primary/10",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
