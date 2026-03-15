import { useState, useMemo } from "react"
import type { ScheduleBlock, ScheduleBlockType } from "@/data/mock-events"

// ── Styles ────────────────────────────────────────────────────────────────────

const BLOCK_STYLES: Record<
  ScheduleBlockType,
  { stripe: string; badge: string; label: string }
> = {
  class:       { stripe: "bg-emerald-400", badge: "bg-emerald-400/12 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400", label: "Class" },
  workshop:    { stripe: "bg-yellow-400",  badge: "bg-yellow-400/15 text-yellow-600 dark:bg-yellow-400/15 dark:text-yellow-400",    label: "Workshop" },
  intensive:   { stripe: "bg-orange-400",  badge: "bg-orange-400/12 text-orange-600 dark:bg-orange-400/15 dark:text-orange-400",    label: "Intensive" },
  party:       { stripe: "bg-violet-400",  badge: "bg-violet-400/12 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",    label: "Party" },
  competition: { stripe: "bg-red-400",     badge: "bg-red-400/12 text-red-600 dark:bg-red-400/15 dark:text-red-400",               label: "Competition" },
  social:      { stripe: "bg-slate-400",   badge: "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",             label: "Social" },
}

const ALL_FILTER = "__all__"

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  // Past midnight: treat 00:xx–05:xx as next day for sorting
  const hours = h < 6 ? h + 24 : h
  return hours * 60 + (m ?? 0)
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const normalH = h % 24
  const p = normalH < 12 ? "AM" : "PM"
  const displayH = normalH === 0 ? 12 : normalH > 12 ? normalH - 12 : normalH
  return m === 0 ? `${displayH} ${p}` : `${displayH}:${String(m).padStart(2, "0")} ${p}`
}

function getDuration(start: string, end: string): string {
  let diff = parseMinutes(end) - parseMinutes(start)
  if (diff <= 0) return ""
  const hrs = Math.floor(diff / 60)
  const mins = diff % 60
  if (hrs === 0) return `${mins} min`
  if (mins === 0) return `${hrs} hr`
  return `${hrs} hr ${mins} min`
}

function formatDayShort(dateStr: string): { weekday: string; date: string } {
  const d = new Date(dateStr + "T00:00:00")
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface EventScheduleProps {
  blocks: ScheduleBlock[]
}

export function EventSchedule({ blocks }: EventScheduleProps) {
  // Derive sorted unique days
  const days = useMemo(
    () => [...new Set(blocks.map((b) => b.day))].sort(),
    [blocks],
  )

  const [selectedDay, setSelectedDay] = useState(days[0] ?? "")
  const [activeFilter, setActiveFilter] = useState<ScheduleBlockType | typeof ALL_FILTER>(ALL_FILTER)

  // Unique block types present in the entire event
  const availableTypes = useMemo(
    () =>
      [...new Set(blocks.map((b) => b.type))] as ScheduleBlockType[],
    [blocks],
  )

  // Filter blocks for the selected day and active type filter
  const visibleBlocks = useMemo(() => {
    return blocks
      .filter(
        (b) =>
          b.day === selectedDay &&
          (activeFilter === ALL_FILTER || b.type === activeFilter),
      )
      .sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime))
  }, [blocks, selectedDay, activeFilter])

  // Group consecutive blocks by start time
  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleBlock[]>()
    for (const block of visibleBlocks) {
      const key = block.startTime
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(block)
    }
    return [...map.entries()]
  }, [visibleBlocks])

  if (days.length === 0) return null

  return (
    <div>
      {/* Day switcher */}
      {days.length > 1 && (
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-0.5">
          {days.map((day) => {
            const { weekday, date } = formatDayShort(day)
            const active = day === selectedDay
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex shrink-0 flex-col items-center rounded-lg px-3.5 py-2 text-center transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {weekday}
                </span>
                <span className={`mt-0.5 text-[13px] font-medium tabular-nums ${active ? "" : ""}`}>
                  {date}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Category filter pills */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveFilter(ALL_FILTER)}
          className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
            activeFilter === ALL_FILTER
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {availableTypes.map((type) => {
          const style = BLOCK_STYLES[type]
          const active = activeFilter === type
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(active ? ALL_FILTER : type)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                active ? style.badge + " ring-1 ring-inset ring-current/20" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {style.label}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sessions match this filter.
        </p>
      ) : (
        <div className="space-y-0">
          {grouped.map(([startTime, timeBlocks], groupIndex) => (
            <div key={startTime} className="flex gap-3">
              {/* Time column */}
              <div className="relative w-16 shrink-0 pt-3">
                <span className="text-[12px] font-medium tabular-nums text-muted-foreground">
                  {formatTime(startTime)}
                </span>
                {/* Connecting line */}
                <div
                  className={`absolute top-8 bottom-0 left-1.5 w-px bg-border/60 ${
                    groupIndex === grouped.length - 1 ? "hidden" : ""
                  }`}
                />
                {/* Dot */}
                <div className="absolute top-3.5 left-0 size-[5px] translate-y-px rounded-full bg-border" />
              </div>

              {/* Blocks for this time slot */}
              <div className="min-w-0 flex-1 space-y-2 pb-4">
                {timeBlocks.map((block) => {
                  const style = BLOCK_STYLES[block.type]
                  const duration = getDuration(block.startTime, block.endTime)
                  return (
                    <div
                      key={block.id}
                      className="flex overflow-hidden rounded-lg border border-border/60 bg-card transition-colors hover:border-border"
                    >
                      {/* Color stripe */}
                      <div className={`w-1 shrink-0 ${style.stripe}`} />

                      {/* Content */}
                      <div className="min-w-0 flex-1 px-3.5 py-3">
                        {/* Type badge + duration */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style.badge}`}
                          >
                            {style.label}
                          </span>
                          {duration && (
                            <span className="text-[11px] text-muted-foreground">
                              {duration}
                            </span>
                          )}
                          {block.endTime && (
                            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                              – {formatTime(block.endTime)}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="mt-1.5 text-[14px] font-semibold leading-snug">
                          {block.title}
                        </p>

                        {/* Meta row */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {block.room && (
                            <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                              <svg viewBox="0 0 24 24" fill="none" className="size-3 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                              {block.room}
                            </span>
                          )}
                          {block.instructor && (
                            <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                              <svg viewBox="0 0 24 24" fill="none" className="size-3 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              {block.instructor}
                            </span>
                          )}
                          {block.level && (
                            <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {block.level}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {block.tags && block.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {block.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
