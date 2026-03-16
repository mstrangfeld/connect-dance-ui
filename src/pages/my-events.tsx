import { useMemo } from "react"
import { Link } from "react-router"
import { useAuth } from "@/context/auth"
import { MOCK_EVENTS } from "@/data/mock-events"
import { EventCard } from "@/components/event-card"

const TODAY = new Date().toISOString().slice(0, 10)

export function MyEventsPage() {
  const { isLoggedIn, attendingEventIds, toggleAttending } = useAuth()

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="size-5 text-muted-foreground" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M8 2v4M16 2v4M3 10h18" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Sign in to see your events</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Events you mark as "I'm going" will be saved here.
        </p>
        <Link
          to="/sign-in"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    )
  }

  const { upcoming, past } = useMemo(() => {
    const attending = MOCK_EVENTS.filter((e) => attendingEventIds.includes(e.id))
    return {
      upcoming: attending.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date)),
      past: attending.filter((e) => e.date < TODAY).sort((a, b) => b.date.localeCompare(a.date)),
    }
  }, [attendingEventIds])

  if (attendingEventIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="size-5 text-muted-foreground" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">No events yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          When you mark an event as "I'm going", it will appear here.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Find events
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-xl font-bold tracking-tight">My Events</h1>

      {upcoming.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <div key={event.id} className="relative">
                <EventCard event={event} />
                <button
                  onClick={() => toggleAttending(event.id)}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-medium text-primary-foreground backdrop-blur transition-colors hover:bg-primary/70"
                  title="Remove from my events"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="size-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 8l4 4 7-7" />
                  </svg>
                  Going
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Past
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
