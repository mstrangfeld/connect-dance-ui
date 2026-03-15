import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Link } from "react-router"
import type { DanceEvent } from "@/data/mock-events"
import { EVENT_TYPE_LABELS } from "@/data/mock-events"

/*
 * Type accent colors — curated pops against a clean canvas.
 * Each type gets a top stripe accent + subtle badge tint.
 */
const TYPE_ACCENTS: Record<string, { stripe: string; badge: string; dot: string }> = {
  party:     { stripe: "bg-violet-400",  badge: "bg-violet-400/12 text-violet-600 dark:bg-violet-400/20 dark:text-violet-400", dot: "bg-violet-400" },
  intensive: { stripe: "bg-orange-400",  badge: "bg-orange-400/12 text-orange-600 dark:bg-orange-400/20 dark:text-orange-400", dot: "bg-orange-400" },
  workshop:  { stripe: "bg-yellow-400",  badge: "bg-yellow-400/15 text-yellow-600 dark:bg-yellow-400/20 dark:text-yellow-400", dot: "bg-yellow-400" },
  class:     { stripe: "bg-emerald-400", badge: "bg-emerald-400/12 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400", dot: "bg-emerald-400" },
  festival:  { stripe: "bg-sky-400",     badge: "bg-sky-400/12 text-sky-600 dark:bg-sky-400/20 dark:text-sky-400",             dot: "bg-sky-400" },
}


const MOCK_AVATARS = ["AL", "KM", "JB", "RS", "TP", "DN", "CW", "MH"]
const AVATAR_COLORS = [
  "bg-sky-400/12 text-sky-600",
  "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
  "bg-orange-400/12 text-orange-600",
  "bg-red-400/12 text-red-600",
]

function getEventAvatars(eventId: string) {
  const seed = parseInt(eventId, 10)
  const count = 2 + (seed % 3)
  return MOCK_AVATARS.slice(seed % 4, (seed % 4) + count)
}

interface EventCardProps {
  event: DanceEvent
  isActive?: boolean
}

export function EventCard({ event, isActive }: EventCardProps) {
  const avatars = getEventAvatars(event.id)
  const extraCount = Math.max(0, event.attendees - avatars.length)
  const accent = TYPE_ACCENTS[event.type] ?? TYPE_ACCENTS.party

  return (
    <Link
      to={`/events/${event.id}`}
      className={`group relative block overflow-hidden rounded-xl bg-card transition-all duration-200 ${
        isActive
          ? "shadow-lg shadow-slate-900/8 ring-1 ring-border dark:shadow-slate-900/20"
          : "hover:shadow-md hover:shadow-slate-900/5 hover:ring-1 hover:ring-border/60 dark:hover:shadow-slate-900/15"
      }`}
    >
      {/* Type color stripe */}
      <div className={`h-1 ${accent.stripe}`} />
      <div className="p-4 pt-3">
        {/* Top row: type + date */}
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <span className={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${accent.badge}`}>
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            {event.festivalType === "wsdc" && (
              <span className="inline-flex items-center rounded-md bg-sky-400/8 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sky-600 ring-1 ring-inset ring-sky-400/30 dark:bg-sky-400/15 dark:text-sky-400">
                WSDC
              </span>
            )}
            {/* Secondary category dots */}
            {event.categories.filter((c) => c !== event.type).length > 0 && (
              <div className="flex items-center gap-1">
                {event.categories
                  .filter((c) => c !== event.type)
                  .map((c) => (
                    <span
                      key={c}
                      title={EVENT_TYPE_LABELS[c]}
                      className={`size-1.5 rounded-full ${TYPE_ACCENTS[c]?.dot ?? "bg-slate-400"}`}
                    />
                  ))}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDateRange(event.date, event.endDate)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-2.5 text-[15px] leading-snug font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-150">
          {event.title}
        </h3>

        {/* Time + Location */}
        <div className="mt-1.5 flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">
            {event.time}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <LocationIcon />
            <span className="truncate">{event.venue} · {event.location}{getContinent(event.country) ? ` · ${getContinent(event.country)}` : ""}</span>
          </span>
        </div>

        {/* Level + Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {event.level}
          </span>
          {event.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-sm bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              {tag}
            </span>
          ))}
          {event.tags.length > 2 && (
            <span className="text-[11px] text-muted-foreground">
              +{event.tags.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Footer: organizer + attendees — flush, no separator */}
      <div className="flex items-center justify-between px-4 pb-3">
        <span className="truncate text-xs font-medium text-muted-foreground">{event.organizer}</span>
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            {avatars.slice(0, 3).map((initials, i) => (
              <Avatar key={i} className="size-5 border-[1.5px] border-card">
                <AvatarFallback className={`text-[7px] font-medium ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {extraCount > 0 ? `+${extraCount}` : event.attendees}
          </span>
        </div>
      </div>
    </Link>
  )
}

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  US: "North America",
  CA: "North America",
  MX: "North America",
  BR: "South America",
  AR: "South America",
  DE: "Europe",
  FR: "Europe",
  GB: "Europe",
  UK: "Europe",
  NL: "Europe",
  SE: "Europe",
  ES: "Europe",
  IT: "Europe",
  AT: "Europe",
  CH: "Europe",
  PL: "Europe",
  NO: "Europe",
  DK: "Europe",
  FI: "Europe",
  BE: "Europe",
  PT: "Europe",
  CZ: "Europe",
  IE: "Europe",
  AU: "Oceania",
  NZ: "Oceania",
  JP: "Asia",
  KR: "Asia",
  CN: "Asia",
  SG: "Asia",
  TH: "Asia",
  ZA: "Africa",
}

function getContinent(country: string): string {
  return COUNTRY_TO_CONTINENT[country] ?? ""
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3 shrink-0 text-muted-foreground/50" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function formatDateRange(dateStr: string, endDateStr?: string) {
  const date = new Date(dateStr + "T00:00:00")
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const day = date.getDate()

  if (endDateStr) {
    const endDate = new Date(endDateStr + "T00:00:00")
    const endMonth = endDate.toLocaleDateString("en-US", { month: "short" })
    const endDay = endDate.getDate()
    if (month === endMonth) return `${month} ${day}–${endDay}`
    return `${month} ${day} – ${endMonth} ${endDay}`
  }

  return `${month} ${day}`
}
