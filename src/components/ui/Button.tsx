import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-ink shadow-card hover:shadow-luxury hover:-translate-y-0.5",
  secondary:
    "bg-primary text-white shadow-card hover:bg-primary/90 hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-primary border border-primary/20 hover:border-primary/40 hover:bg-primary/5",
};

export function Button({
  className,
  variant = "primary",
  href,
  children,
  type = "button",
  disabled,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children: React.ReactNode;
}) {
  const cls = cn(
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
