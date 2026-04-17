import Link from "next/link";
import { CONTACT, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

const social = [
  { label: "Facebook", href: SOCIAL_LINKS.facebook },
  { label: "TikTok", href: SOCIAL_LINKS.tiktok },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/10 bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-2xl text-accent">{SITE_NAME}</p>
          <p className="mt-4 max-w-xs text-sm text-white/75">
            Premier property management and cleaning across North Wales: calm,
            consistent, and quietly exceptional.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Contact
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li>
              <a href={`tel:${CONTACT.phone}`} className="hover:text-accent">
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="hover:text-accent"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="text-white/75">{CONTACT.location}</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/services" className="text-white/85 hover:text-accent">
                Services
              </Link>
            </li>
            <li>
              <Link href="/booking" className="text-white/85 hover:text-accent">
                Book online
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-white/85 hover:text-accent">
                Insights
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="text-white/85 hover:text-accent"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/cancellation-refund-policy"
                className="text-white/85 hover:text-accent"
              >
                Cancellation &amp; Refund
              </Link>
            </li>
            <li>
              <Link
                href="/fair-usage-room-size-policy"
                className="text-white/85 hover:text-accent"
              >
                Fair Usage &amp; Room Size
              </Link>
            </li>
          </ul>
          <div className="mt-6 flex gap-4">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium uppercase tracking-wider text-white/60 hover:text-accent"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
