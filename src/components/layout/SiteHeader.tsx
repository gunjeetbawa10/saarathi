"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { SITE_NAME } from "@/lib/constants";
import { ClerkAuthNav } from "@/components/auth/ClerkAuthNav";

const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const bookHref = isSignedIn ? "/booking" : "/sign-in?redirect_url=%2Fbooking";

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="font-display text-xl tracking-tight text-primary">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={bookHref}
            className="text-sm font-medium text-ink/80 transition-colors hover:text-primary"
          >
            Book
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ClerkAuthNav />
          <Link
            href={bookHref}
            className="hidden rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-luxury md:inline-flex"
          >
            Request a quote
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 text-primary md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <span className="text-2xl leading-none">×</span>
          ) : (
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="h-0.5 w-6 bg-primary" />
              <span className="h-0.5 w-6 bg-primary" />
              <span className="h-0.5 w-6 bg-primary" />
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-primary/10 md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-primary/5"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={bookHref}
                className="mt-2 rounded-2xl bg-accent py-3 text-center text-sm font-semibold text-ink"
                onClick={() => setOpen(false)}
              >
                Request a quote
              </Link>
              <Link
                href={bookHref}
                className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-primary/5"
                onClick={() => setOpen(false)}
              >
                Book
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
