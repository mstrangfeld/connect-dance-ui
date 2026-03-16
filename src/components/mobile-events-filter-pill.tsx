import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router"
import { Calendar } from "@/components/ui/calendar"
import { EVENT_TYPE_LABELS, RADIUS_OPTIONS, CITIES } from "@/data/mock-events"
import type { EventType, City } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"

const EVENT_TYPES: Array<{ value: EventType; label: string }> = Object.entries(EVENT_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as EventType, label }),
)

const TYPE_DOTS: Record<string, string> = {
  party:     "bg-violet-400",
  intensive: "bg-orange-400",
  workshop:  "bg-yellow-400",
  class:     "bg-emerald-400",
  festival:  "bg-sky-400",
}

function formatDateRangeLabel(range: DateRange | undefined): string {
  if (!range?.from) return "Any date"
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (!range.to || range.from.toDateString() === range.to.toDateString()) return fmt(range.from)
  if (range.from.getFullYear() === range.to.getFullYear() && range.from.getMonth() === range.to.getMonth()) {
    return `${range.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${range.to.getDate()}`
  }
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

type ExpandedSection = "location" | "date" | "type" | null

export interface MobileEventsFilterPillProps {
  locationQuery: string
  onLocationQueryChange: (q: string) => void
  activeLocation: string
  onLocationSelect: (city: City) => void
  onLocationClear: () => void
  radius: number
  onRadiusChange: (r: number) => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  activeTypes: Set<EventType>
  onTypeToggle: (type: EventType) => void
  onClearAll: () => void
  resultCount: number
  /** If true, the "Show results" button navigates to /events instead of closing the panel */
  embedded?: boolean
}

export function MobileEventsFilterPill({
  locationQuery,
  onLocationQueryChange,
  activeLocation,
  onLocationSelect,
  onLocationClear,
  radius,
  onRadiusChange,
  dateRange,
  onDateRangeChange,
  activeTypes,
  onTypeToggle,
  onClearAll,
  resultCount,
  embedded,
}: MobileEventsFilterPillProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>("location")
  const locationInputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    if (!locationQuery.trim()) return CITIES.slice(0, 6)
    const q = locationQuery.toLowerCase()
    return CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6)
  }, [locationQuery])

  // Lock body scroll while panel is open
  useEffect(() => {
    if (panelOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [panelOpen])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPanelOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  function openPanel(section: ExpandedSection = "location") {
    setExpandedSection(section)
    setPanelOpen(true)
    if (section === "location") {
      setTimeout(() => locationInputRef.current?.focus(), 100)
    }
  }

  function toggleSection(section: ExpandedSection) {
    setExpandedSection((prev) => (prev === section ? null : section))
    if (section === "location") {
      setTimeout(() => locationInputRef.current?.focus(), 100)
    }
  }

  const hasActiveFilters = activeTypes.size > 0 || activeLocation !== "" || !!dateRange?.from
  const filterCount = (activeLocation ? 1 : 0) + (dateRange?.from ? 1 : 0) + (activeTypes.size > 0 ? 1 : 0)
  const dateLabel = formatDateRangeLabel(dateRange)
  const typeLabel =
    activeTypes.size === 0
      ? "All types"
      : activeTypes.size === 1
        ? EVENT_TYPE_LABELS[[...activeTypes][0]]
        : `${activeTypes.size} types`

  return (
    <>
      {/* Pill trigger button */}
      <button
        onClick={() => openPanel("location")}
        className="flex w-full items-center gap-3 rounded-full border border-border/60 bg-card px-4 py-2.5 shadow-sm text-left transition-colors hover:bg-secondary/50 active:bg-secondary"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-[18px] shrink-0 text-muted-foreground/50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-semibold leading-none text-foreground">
            {activeLocation || "Anywhere"}
          </span>
          <span className="truncate text-[11px] leading-none text-muted-foreground">
            {dateLabel} · {typeLabel}
          </span>
        </div>
        {hasActiveFilters ? (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
            {filterCount}
          </span>
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="size-[14px]" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
        )}
      </button>

      {/* Full-screen filter panel — portalled to body to escape parent stacking context */}
      {panelOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex flex-col bg-background">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-4 border-b border-border/50 px-4 py-4">
            <button
              onClick={() => setPanelOpen(false)}
              className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="Close filters"
            >
              <XIcon />
            </button>
            <span className="flex-1 text-center text-sm font-semibold">Filters</span>
            {hasActiveFilters ? (
              <button
                onClick={onClearAll}
                className="text-xs font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            ) : (
              <div className="w-14" />
            )}
          </div>

          {/* Filter sections */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/50">

            {/* WHERE */}
            <div>
              <button
                onClick={() => toggleSection("location")}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Where</div>
                  <div className={`mt-0.5 text-[15px] font-medium ${activeLocation ? "text-foreground" : "text-muted-foreground"}`}>
                    {activeLocation || "Anywhere"}
                    {activeLocation && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        · {RADIUS_OPTIONS.find(o => o.value === radius)?.label}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronIcon expanded={expandedSection === "location"} />
              </button>
              {expandedSection === "location" && (
                <div className="px-5 pb-5">
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Search cities..."
                    value={locationQuery}
                    onChange={(e) => {
                      onLocationQueryChange(e.target.value)
                      if (!e.target.value.trim()) onLocationClear()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && suggestions.length > 0) onLocationSelect(suggestions[0])
                    }}
                    className="mb-2 h-10 w-full rounded-xl bg-secondary/50 px-4 text-sm transition-colors placeholder:text-muted-foreground/40 focus:bg-secondary focus:outline-none"
                  />
                  <div className="flex flex-col gap-0.5">
                    {suggestions.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => onLocationSelect(city)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                          activeLocation === city.name
                            ? "bg-primary/8 text-primary font-medium"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-muted-foreground/40" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {city.name}
                        {activeLocation === city.name && (
                          <svg viewBox="0 0 24 24" fill="none" className="ml-auto size-4 text-primary" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  {activeLocation && (
                    <>
                      <div className="my-3 h-px bg-border/50" />
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Radius</div>
                      <div className="flex flex-wrap gap-2">
                        {RADIUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => onRadiusChange(opt.value)}
                            className={`rounded-xl px-4 py-2 text-[13px] font-medium transition-colors ${
                              radius === opt.value
                                ? "bg-foreground text-background"
                                : "border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* WHEN */}
            <div>
              <button
                onClick={() => toggleSection("date")}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">When</div>
                  <div className={`mt-0.5 text-[15px] font-medium ${dateRange?.from ? "text-foreground" : "text-muted-foreground"}`}>
                    {dateLabel}
                  </div>
                </div>
                <ChevronIcon expanded={expandedSection === "date"} />
              </button>
              {expandedSection === "date" && (
                <div className="pb-4">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={onDateRangeChange}
                    defaultMonth={dateRange?.from ?? new Date()}
                    numberOfMonths={1}
                    modifiers={{ past: { before: new Date() } }}
                    modifiersClassNames={{ past: "opacity-25" }}
                    classNames={{
                      months: "relative flex flex-col",
                      month: "flex w-full flex-col gap-3 px-4 py-2",
                      month_caption: "flex h-8 items-center justify-center px-8",
                      caption_label: "text-[13px] font-bold tracking-wide",
                      weekdays: "flex border-b border-border/40 pb-2",
                      weekday: "flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none",
                      week: "mt-2 flex w-full",
                    }}
                  />
                  {dateRange?.from && (
                    <div className="flex justify-end px-5 pt-1">
                      <button
                        onClick={() => onDateRangeChange(undefined)}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WHAT */}
            <div>
              <button
                onClick={() => toggleSection("type")}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What</div>
                  <div className={`mt-0.5 text-[15px] font-medium ${activeTypes.size > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {typeLabel}
                  </div>
                </div>
                <ChevronIcon expanded={expandedSection === "type"} />
              </button>
              {expandedSection === "type" && (
                <div className="px-5 pb-5">
                  <div className="flex flex-col gap-1">
                    {EVENT_TYPES.map((type) => {
                      const selected = activeTypes.has(type.value)
                      return (
                        <button
                          key={type.value}
                          onClick={() => onTypeToggle(type.value)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                            selected
                              ? "bg-primary/8 text-primary font-medium"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          <span className={`size-2.5 rounded-full ${TYPE_DOTS[type.value] ?? "bg-slate-400"}`} />
                          {type.label}
                          <span className={`ml-auto flex size-5 items-center justify-center rounded-md ${selected ? "bg-primary" : "border border-border"}`}>
                            {selected && (
                              <svg viewBox="0 0 24 24" fill="none" className="size-3 text-primary-foreground" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border/50 px-4 py-4">
            {embedded ? (
              <Link
                to="/events"
                className="flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
              >
                Search events
              </Link>
            ) : (
              <button
                onClick={() => setPanelOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
              >
                Show {resultCount} result{resultCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`size-5 shrink-0 text-muted-foreground/60 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
