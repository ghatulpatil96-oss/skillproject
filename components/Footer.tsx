import Link from "next/link";
import { FOOTER_LINKS, CONTACT_EMAIL } from "@/lib/site-content";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-canvas">
                S
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                SkillBridge<span className="text-accent">.</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">
              Learn job-ready skills, prove them with verified tests, and get
              hired on ability — not your college name. Built for India&apos;s
              tier 2 &amp; 3 college students.
            </p>
            <p className="mt-4 text-xs text-ink-3">
              Questions?{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ink-2 transition hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row">
          <span>© {new Date().getFullYear()} SkillBridge · Learn → Prove → Get Hired</span>
          <span>Made for students in India · Free forever for learners</span>
        </div>
      </div>
    </footer>
  );
}
