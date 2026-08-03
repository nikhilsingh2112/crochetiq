import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-10 place-items-center rounded-2xl bg-warm-gradient shadow-soft">
        <YarnMark className="size-6 text-foreground/70" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Crochet<span className="text-primary">IQ</span>
      </span>
    </Link>
  );
}

export function YarnMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="14" cy="16" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 12c4.5 1.5 9.5 5 12.5 10M8 20c3-4.5 7.5-7.5 12-8.5M14 6c1 5 3.5 9.5 7.5 12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M23.5 20.5c3 1 5 3 5.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
