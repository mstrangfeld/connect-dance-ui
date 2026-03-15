import { Button } from "@/components/ui/button"

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    location: "Portland, OR",
    text: "I moved to a new city and found my first social within a day. Now I have a whole new dance family.",
  },
  {
    name: "Marcus T.",
    location: "Denver, CO",
    text: "Planning my WSDC event schedule used to mean checking five different Facebook groups. Everything in one place now.",
  },
  {
    name: "Julia R.",
    location: "Austin, TX",
    role: "Organizer",
    text: "This platform doubled our workshop attendance. Dancers actually find us now.",
  },
]

export function CommunitySection() {
  return (
    <section className="border-t border-border/50 bg-slate-50/50 py-20 dark:bg-slate-800/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="text-xs font-semibold tracking-widest text-sky-600 uppercase">
              Community
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Built by dancers,
              <br />
              for dancers
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              West Coast Swing thrives on connection — between partners, with the
              music, and across communities. We make finding your people easier.
            </p>
            <div className="mt-6 flex gap-3">
              <Button size="sm">Join the community</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-primary/5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="mb-3 size-5 text-orange-400/50">
                    <path d="M11.3 2.8C7.1 4.9 4.2 8.3 4.2 12.5c0 2.7 1.6 4.5 3.8 4.5 2 0 3.5-1.5 3.5-3.4 0-1.8-1.3-3.2-3-3.4.3-2.3 2.2-4.5 4.5-5.6L11.3 2.8zm9.5 0C17 4.9 14 8.3 14 12.5c0 2.7 1.6 4.5 3.8 4.5 2 0 3.5-1.5 3.5-3.4 0-1.8-1.3-3.2-3-3.4.3-2.3 2.2-4.5 4.5-5.6L20.8 2.8z" />
                  </svg>
                  <p className="text-[13px] leading-relaxed text-foreground">
                    {t.text}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
                  <div>
                    <div className="text-[13px] font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.location}
                    </div>
                  </div>
                  {"role" in t && t.role && (
                    <span className="rounded bg-orange-400/12 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-orange-600 uppercase">
                      {t.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
