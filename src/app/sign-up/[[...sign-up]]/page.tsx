import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Saarathi Services account.",
};

export default function SignUpPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-primary/10 bg-white px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Account</p>
            <h1 className="mt-3 font-display text-3xl text-primary md:text-4xl">Create an account</h1>
          </Reveal>
        </div>
      </section>
      <div className="flex justify-center px-4 py-12 md:py-16">
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
    </div>
  );
}
