"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  WELCOME_COUPON_CODE,
  WELCOME_COUPON_PERCENT,
  WELCOME_POPUP_COOKIE,
} from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const COOKIE_MAX_AGE_SEC = 365 * 24 * 60 * 60;

function hasSeenWelcomePopup(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split(";").some((c) =>
    c.trim().startsWith(`${WELCOME_POPUP_COOKIE}=`)
  );
}

function setWelcomePopupSeen(): void {
  document.cookie = `${WELCOME_POPUP_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
}

export function WelcomeCouponPopup() {
  const fmReduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hasSeenWelcomePopup()) return;
    const t = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    setWelcomePopupSeen();
    setOpen(false);
  }, []);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_COUPON_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-popup-title"
          initial={fmReduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={fmReduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            aria-label="Close welcome offer"
            onClick={dismiss}
          />
          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-primary/15 bg-surface shadow-luxury"
            initial={fmReduce ? false : { opacity: 0, scale: 0.94, y: 12 }}
            animate={
              fmReduce
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 380, damping: 28 },
                  }
            }
            exit={fmReduce ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
          >
            <div className="bg-primary px-6 py-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
                Welcome
              </p>
              <h2
                id="welcome-popup-title"
                className="mt-2 font-display text-2xl text-white md:text-3xl"
              >
                {WELCOME_COUPON_PERCENT}% off your first booking
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Use this code at checkout. Valid for new visitors.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/65">
                First cleans use our eco-friendly product range: same
                five-star finish, lighter footprint.
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <motion.div
                  className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-accent/60 bg-cream px-4 py-3 font-mono text-lg font-semibold tracking-[0.2em] text-primary"
                  animate={
                    fmReduce
                      ? undefined
                      : {
                          boxShadow: [
                            "0 0 0 0 rgba(197, 160, 89, 0.35)",
                            "0 0 0 10px rgba(197, 160, 89, 0)",
                          ],
                        }
                  }
                  transition={
                    fmReduce
                      ? undefined
                      : { duration: 1.2, repeat: 2, repeatDelay: 0.4 }
                  }
                >
                  {WELCOME_COUPON_CODE}
                </motion.div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="rounded-2xl border border-primary/20 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/5"
                >
                  {copied ? "Copied" : "Copy code"}
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={dismiss}
                  className="order-2 rounded-2xl px-4 py-3 text-sm font-medium text-ink/60 transition hover:text-ink sm:order-1"
                >
                  Maybe later
                </button>
                <Button
                  variant="secondary"
                  href="/booking"
                  className="order-1 w-full sm:order-2 sm:w-auto"
                  onClick={setWelcomePopupSeen}
                >
                  Book with offer
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
