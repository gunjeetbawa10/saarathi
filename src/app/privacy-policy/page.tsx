import type { Metadata } from "next";
import { CONTACT, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Saarathi Services Ltd Privacy Policy explaining how personal data is collected, used, retained, and protected under UK GDPR.",
};

const effectiveDate = "13 April 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Legal
          </p>
          <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-ink/65">
            Effective date: {effectiveDate}
          </p>
          <p className="mt-4 max-w-3xl text-ink/75">
            This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;,
            &quot;us&quot;, and &quot;our&quot;) handles personal data in
            accordance with UK GDPR, the Data Protection Act 2018, and related
            UK privacy law.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 py-14 text-ink/85 md:px-6 md:py-20">
        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            1. Data Controller
          </h2>
          <p className="mt-4">
            Saarathi Services Ltd is the data controller for personal data
            collected through this website and our service channels.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Email: {CONTACT.email}</li>
            <li>Phone: {CONTACT.phoneDisplay}</li>
            <li>Location: {CONTACT.location}</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            2. Data We Collect
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              Identity and contact details, including name, phone, email, and
              service address.
            </li>
            <li>
              Booking and operational information, including property access
              notes, service preferences, and timing.
            </li>
            <li>
              Payment and transaction records processed by approved payment
              providers.
            </li>
            <li>
              Marketing preferences and communication consent records.
            </li>
            <li>
              Technical data such as IP address, browser details, pages visited,
              and cookie identifiers.
            </li>
            <li>
              Evidence records (for example photos and visit logs) where needed
              to investigate complaints, access disputes, chargebacks, fraud
              concerns, or health and safety incidents.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            3. Lawful Bases and Why We Use Data
          </h2>
          <p className="mt-4">We process personal data to:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>perform service contracts and booking obligations;</li>
            <li>manage invoicing, debt recovery, and legal rights;</li>
            <li>
              operate and secure the website, including preventing abuse and
              fraud;
            </li>
            <li>
              improve service quality, scheduling, and customer communication;
            </li>
            <li>
              send marketing where consent is given or where soft opt-in rules
              permit under UK PECR.
            </li>
          </ul>
          <p className="mt-4">
            Our legal bases are contract, legal obligation, legitimate interests,
            and consent (where required).
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            4. Cookies, Analytics, and Tracking
          </h2>
          <p className="mt-4">
            We use strictly necessary cookies to run key website functions. We
            may also use analytics and marketing cookies where permitted. You can
            manage cookie preferences in your browser settings.
          </p>
          <p className="mt-4">
            Blocking certain cookies may affect booking flow, account access, or
            website performance.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            5. Sharing Your Data
          </h2>
          <p className="mt-4">
            We share data only where necessary and proportionate, including with:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>payment processors and finance tools;</li>
            <li>booking, CRM, and secure cloud service providers;</li>
            <li>
              vetted staff and contractors who need the information to deliver
              service;
            </li>
            <li>
              legal advisers, insurers, and law enforcement where legally
              required.
            </li>
          </ul>
          <p className="mt-4">
            We do not sell personal data. Any international transfer uses lawful
            transfer mechanisms and safeguards.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            6. Data Retention
          </h2>
          <p className="mt-4">
            We keep personal data only as long as necessary for service delivery,
            compliance, accounting, dispute handling, and legal enforcement.
            Retention periods vary by record type and statutory obligations.
          </p>
          <p className="mt-4">
            Where data is no longer needed, it is deleted or anonymised.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            7. Your UK Data Protection Rights
          </h2>
          <p className="mt-4">Subject to legal limits, you may request to:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>access your personal data;</li>
            <li>correct inaccurate data;</li>
            <li>erase or restrict processing in certain situations;</li>
            <li>object to processing based on legitimate interests;</li>
            <li>receive portable copies of applicable data;</li>
            <li>withdraw consent at any time where consent is the basis.</li>
          </ul>
          <p className="mt-4">
            To exercise rights, contact {CONTACT.email}. We may request identity
            verification before disclosing or changing data.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            8. Security and Fraud Prevention
          </h2>
          <p className="mt-4">
            We use reasonable technical and organisational safeguards to protect
            data. No internet transmission is fully risk-free; you provide data
            at your own transmission risk.
          </p>
          <p className="mt-4">
            We reserve the right to retain and use relevant records, including
            communication logs, booking history, IP information, and photographic
            evidence to investigate fraud, malicious complaints, abusive conduct,
            and chargeback disputes.
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            9. Complaints and Regulator
          </h2>
          <p className="mt-4">
            If you have concerns, contact us first at {CONTACT.email} so we can
            investigate promptly. You also have the right to complain to the UK
            Information Commissioner&apos;s Office (ICO):
          </p>
          <p className="mt-4">
            <a
              href="https://ico.org.uk/make-a-complaint/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              https://ico.org.uk/make-a-complaint/
            </a>
          </p>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-7 shadow-card md:p-9">
          <h2 className="font-display text-2xl text-primary">
            10. Policy Changes
          </h2>
          <p className="mt-4">
            We may update this Policy at any time. Updates take effect on
            publication. Continued use of our services after publication confirms
            acceptance of the revised version.
          </p>
        </section>
      </section>
    </div>
  );
}
