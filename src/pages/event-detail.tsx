import { useParams, Link, useNavigate } from "react-router"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MOCK_EVENTS, EVENT_TYPE_LABELS } from "@/data/mock-events"
import { MOCK_SCHEDULES } from "@/data/mock-schedules"
import { EventSchedule } from "@/components/event-schedule"
import { EventTickets } from "@/components/event-tickets"
import { useAuth } from "@/context/auth"

const TYPE_ACCENTS: Record<string, { badge: string; accent: string }> = {
  party:     { badge: "bg-violet-400/12 text-violet-600",  accent: "bg-violet-400" },
  intensive: { badge: "bg-orange-400/12 text-orange-600",  accent: "bg-orange-400" },
  workshop:  { badge: "bg-yellow-400/15 text-yellow-600",  accent: "bg-yellow-400" },
  class:     { badge: "bg-emerald-400/12 text-emerald-600", accent: "bg-emerald-400" },
  festival:  { badge: "bg-sky-400/12 text-sky-600",         accent: "bg-sky-400" },
}

const MOCK_AVATARS = ["AL", "KM", "JB", "RS", "TP", "DN", "CW", "MH"]
const AVATAR_COLORS = [
  "bg-sky-400/12 text-sky-600",
  "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
  "bg-orange-400/12 text-orange-600",
  "bg-red-400/12 text-red-600",
]

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateRange(dateStr: string, endDateStr?: string) {
  if (!endDateStr) return formatDate(dateStr)
  return `${formatDate(dateStr)} – ${formatDate(endDateStr)}`
}

export function EventDetailPage() {
  const { id } = useParams()
  const event = useMemo(() => MOCK_EVENTS.find((e) => e.id === id), [id])
  const { isLoggedIn, attendingEventIds, toggleAttending } = useAuth()
  const navigate = useNavigate()
  const isGoing = event ? attendingEventIds.includes(event.id) : false

  function handleGoingClick() {
    if (!isLoggedIn) {
      navigate("/sign-in")
      return
    }
    if (event) toggleAttending(event.id)
  }

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <svg viewBox="0 0 24 24" fill="none" className="size-5 text-muted-foreground" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Event not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This event may have been removed or the link is incorrect.
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    )
  }

  const accent = TYPE_ACCENTS[event.type] ?? TYPE_ACCENTS.party
  const avatars = MOCK_AVATARS.slice(0, 4)
  const extraCount = Math.max(0, event.attendees - avatars.length)
  const schedule = MOCK_SCHEDULES[event.id] ?? []

  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link to="/events" className="transition-colors hover:text-foreground">Events</Link>
          <svg viewBox="0 0 24 24" fill="none" className="size-3 text-muted-foreground/40" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-foreground">{event.title}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${accent.badge}`}>
                {EVENT_TYPE_LABELS[event.type]}
              </span>
              {event.festivalType === "wsdc" && (
                <span className="inline-flex items-center rounded-md bg-sky-400/8 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sky-600 ring-1 ring-inset ring-sky-400/30 dark:bg-sky-400/15 dark:text-sky-400">
                  WSDC
                </span>
              )}
              <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {event.level}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {event.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              by {event.organizer}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={handleGoingClick}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                isGoing
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border/60 bg-card text-foreground hover:bg-secondary/50"
              }`}
            >
              {isGoing ? (
                <>
                  <svg viewBox="0 0 16 16" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 8l4 4 7-7" />
                  </svg>
                  I'm going
                </>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                  I'm going
                </>
              )}
            </button>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Left column: info */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="rounded-xl border border-border/60 p-5">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                When
              </h3>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4 text-primary" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4" />
                    <path d="M8 2v4" />
                    <path d="M3 10h18" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {formatDateRange(event.date, event.endDate)}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{event.time}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-border/60 p-5">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Where
              </h3>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4 text-primary" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{event.venue}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                About
              </h3>
              <p className="text-sm leading-relaxed text-foreground">
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right column: attendees + organizer */}
          <div className="space-y-6">
            {/* Attendees */}
            <div className="rounded-xl border border-border/60 p-5">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Who's going
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatars.map((initials, i) => (
                    <Avatar key={i} className="size-8 border-2 border-card">
                      <AvatarFallback
                        className={`text-[10px] font-medium ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-[13px] text-muted-foreground">
                  {extraCount > 0
                    ? `+${extraCount} others`
                    : `${event.attendees} attending`}
                </span>
              </div>
            </div>

            {/* Organizer */}
            <div className="rounded-xl border border-border/60 p-5">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Organizer
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-border/60">
                  <AvatarFallback className="bg-primary/8 text-[13px] font-medium text-primary">
                    {event.organizer
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{event.organizer}</p>
                  <p className="text-[12px] text-muted-foreground">Event organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets & Pricing */}
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Tickets</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <EventTickets eventId={event.id} eventTitle={event.title} />
        </div>

        {/* Schedule */}
        {schedule.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Schedule</h2>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <EventSchedule blocks={schedule} />
          </div>
        )}
      </div>
    </>
  )
}
