import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { EventCard } from "@/components/event-card"
import { EventMap } from "@/components/event-map"
import { MobileEventsFilterPill } from "@/components/mobile-events-filter-pill"
import { MOCK_EVENTS, EVENT_TYPE_LABELS, RADIUS_OPTIONS, CITIES } from "@/data/mock-events"
import type { EventType, DanceEvent } from "@/data/mock-events"
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

function sortByDate(events: DanceEvent[]) {
  return [...events].sort((a, b) => a.date.localeCompare(b.date))
}

const BATCH_SIZE = 12

type OpenPanel = "location" | "date" | "type" | null

interface EventsSectionProps {
  embedded?: boolean
  activeTypes?: Set<EventType>
  onActiveTypesChange?: (types: Set<EventType>) => void
}

export function EventsSection({ embedded, activeTypes: externalActiveTypes, onActiveTypesChange }: EventsSectionProps) {
  const [internalActiveTypes, setInternalActiveTypes] = useState<Set<EventType>>(new Set())
  const activeTypes = externalActiveTypes ?? internalActiveTypes
  const [locationQuery, setLocationQuery] = useState("")
  const [activeLocation, setActiveLocation] = useState("")
  const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>(undefined)
  const [radius, setRadius] = useState(200)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [visibleCount, setVisibleCount] = useState(embedded ? 6 : BATCH_SIZE)
  const [showMap, setShowMap] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024)
  const [activeEventId, setActiveEventId] = useState<string | undefined>(undefined)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  const searchBarRef = useRef<HTMLDivElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Close desktop panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setOpenPanel(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close panels on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPanel(null)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + BATCH_SIZE)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const suggestions = useMemo(() => {
    if (!locationQuery.trim()) return CITIES.slice(0, 6)
    const q = locationQuery.toLowerCase()
    return CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6)
  }, [locationQuery])

  const filtered = useMemo(() => {
    return MOCK_EVENTS.filter((e) => {
      if (activeTypes.size > 0 && !e.categories.some((c) => activeTypes.has(c))) return false

      if (activeLocation && searchCenter) {
        const dist = haversine(searchCenter[0], searchCenter[1], e.lat, e.lng)
        if (dist > radius) return false
      }

      if (dateRange?.from) {
        const eventDate = new Date(e.date + "T00:00:00")
        const from = new Date(dateRange.from); from.setHours(0, 0, 0, 0)
        const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
        to.setHours(23, 59, 59, 999)
        if (eventDate < from || eventDate > to) return false
      }

      return true
    })
  }, [activeTypes, activeLocation, searchCenter, radius, dateRange])

  const sorted = useMemo(() => sortByDate(filtered), [filtered])
  const visible = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  const hasActiveFilters = activeTypes.size > 0 || activeLocation !== "" || !!dateRange?.from

  function selectLocation(city: { name: string; lat: number; lng: number }) {
    setLocationQuery(city.name)
    setActiveLocation(city.name)
    setSearchCenter([city.lat, city.lng])
    setOpenPanel(null)
  }

  function clearLocation() {
    setLocationQuery("")
    setActiveLocation("")
    setSearchCenter(undefined)
  }

  function setTypes(next: Set<EventType>) {
    if (onActiveTypesChange) onActiveTypesChange(next)
    else setInternalActiveTypes(next)
  }

  function clearAll() {
    setTypes(new Set())
    clearLocation()
    setDateRange(undefined)
  }

  function toggleType(type: EventType) {
    const next = new Set(activeTypes)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    setTypes(next)
  }

  const handleEventSelect = useCallback((eventId: string) => {
    setActiveEventId(eventId)
    const card = document.getElementById(`event-${eventId}`)
    if (card && listRef.current) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [])

  function togglePanel(panel: OpenPanel) {
    setOpenPanel((prev) => (prev === panel ? null : panel))
    if (panel === "location") {
      setTimeout(() => locationInputRef.current?.focus(), 0)
    }
  }

  // Summary labels for each segment
  const locationLabel = activeLocation || "Anywhere"
  const dateLabel = formatDateRangeLabel(dateRange)
  const typeLabel =
    activeTypes.size === 0
      ? "All types"
      : activeTypes.size === 1
        ? EVENT_TYPE_LABELS[[...activeTypes][0]]
        : `${activeTypes.size} types`

  return (
    <div id="events-list" className={`flex flex-col ${embedded ? "mx-auto w-full max-w-7xl" : "h-[calc(100svh-3.5rem)]"}`}>
      {/* Search bar */}
      <div className="shrink-0 border-b border-border/50 bg-background px-6 py-4">
        <div ref={searchBarRef} className="relative mx-auto max-w-2xl">

          {/* ── Mobile pill (< md) ──────────────────────────── */}
          <div className="md:hidden">
            <MobileEventsFilterPill
              locationQuery={locationQuery}
              onLocationQueryChange={(q) => {
                setLocationQuery(q)
                if (!q.trim()) { setActiveLocation(""); setSearchCenter(undefined) }
              }}
              activeLocation={activeLocation}
              onLocationSelect={(city) => { setLocationQuery(city.name); setActiveLocation(city.name); setSearchCenter([city.lat, city.lng]) }}
              onLocationClear={() => { setLocationQuery(""); setActiveLocation(""); setSearchCenter(undefined) }}
              radius={radius}
              onRadiusChange={setRadius}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              activeTypes={activeTypes}
              onTypeToggle={toggleType}
              onClearAll={clearAll}
              resultCount={filtered.length}
              embedded={embedded}
            />
          </div>

          {/* ── Desktop segmented bar (≥ md) ───────────────── */}
          <div
            className="hidden md:flex items-stretch rounded-full border border-border/60 bg-card shadow-sm transition-shadow has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-primary/15"
            role="toolbar"
            aria-label="Search and filter events"
          >
            {/* Location segment */}
            <button
              onClick={() => togglePanel("location")}
              className={`group relative flex min-w-0 flex-1 items-center gap-2.5 rounded-l-full py-3 pl-5 pr-4 text-left transition-colors focus-visible:z-10 focus-visible:outline-none ${
                openPanel === "location"
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
              }`}
              aria-expanded={openPanel === "location"}
              aria-haspopup="listbox"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-[18px] shrink-0 text-muted-foreground/50" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Where</div>
                <div className={`truncate text-[13px] font-medium ${activeLocation ? "text-foreground" : "text-muted-foreground"}`}>
                  {locationLabel}
                  {activeLocation && (
                    <span className="ml-1.5 text-muted-foreground">· {RADIUS_OPTIONS.find(o => o.value === radius)?.label}</span>
                  )}
                </div>
              </div>
              {activeLocation && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); clearLocation() }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); clearLocation() } }}
                  className="ml-auto shrink-0 rounded-full p-1 text-muted-foreground/30 transition-colors hover:bg-background hover:text-foreground"
                  aria-label="Clear location"
                >
                  <XIcon />
                </span>
              )}
            </button>

            <div className="my-2.5 w-px bg-border/50" />

            {/* Date segment */}
            <button
              onClick={() => togglePanel("date")}
              className={`group relative flex min-w-0 items-center gap-2.5 px-4 py-3 text-left transition-colors focus-visible:z-10 focus-visible:outline-none ${
                openPanel === "date"
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
              }`}
              aria-expanded={openPanel === "date"}
              aria-haspopup="listbox"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-[18px] shrink-0 text-muted-foreground/50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">When</div>
                <div className={`truncate text-[13px] font-medium ${dateRange?.from ? "text-foreground" : "text-muted-foreground"}`}>
                  {dateLabel}
                </div>
              </div>
              {dateRange?.from && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setDateRange(undefined) }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); setDateRange(undefined) } }}
                  className="shrink-0 rounded-full p-1 text-muted-foreground/30 transition-colors hover:bg-background hover:text-foreground"
                  aria-label="Clear date filter"
                >
                  <XIcon />
                </span>
              )}
            </button>

            <div className="my-2.5 w-px bg-border/50" />

            {/* Type segment */}
            <button
              onClick={() => togglePanel("type")}
              className={`group relative flex min-w-0 items-center gap-2.5 px-4 py-3 text-left transition-colors focus-visible:z-10 focus-visible:outline-none ${
                openPanel === "type"
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
              }`}
              aria-expanded={openPanel === "type"}
              aria-haspopup="listbox"
            >
              <div className="flex shrink-0 -space-x-1">
                <span className="size-2 rounded-full bg-sky-400 ring-1 ring-card" />
                <span className="size-2 rounded-full bg-yellow-400 ring-1 ring-card" />
                <span className="size-2 rounded-full bg-red-400 ring-1 ring-card" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What</div>
                <div className={`truncate text-[13px] font-medium ${activeTypes.size > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {typeLabel}
                </div>
              </div>
              {activeTypes.size > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setTypes(new Set()) }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); setTypes(new Set()) } }}
                  className="shrink-0 rounded-full p-1 text-muted-foreground/30 transition-colors hover:bg-background hover:text-foreground"
                  aria-label="Clear type filter"
                >
                  <XIcon />
                </span>
              )}
            </button>

            {/* Search / map toggle */}
            <div className="flex items-center pr-2">
              {embedded ? (
                <Link
                  to="/events"
                  className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                  aria-label="Search all events"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`flex size-10 items-center justify-center rounded-full transition-all ${
                    showMap
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  aria-label={showMap ? "Hide map" : "Show map"}
                  aria-pressed={showMap}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                    <path d="M8 2v16" />
                    <path d="M16 6v16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Dropdown panels – desktop only */}
          {openPanel === "location" && (
            <div
              className="absolute top-full left-0 z-50 mt-2 w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-popover p-2 shadow-xl shadow-slate-900/8"
              role="listbox"
              aria-label="Select location"
            >
              <div className="px-2 pb-2">
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Search cities..."
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value)
                    if (!e.target.value.trim()) {
                      setActiveLocation("")
                      setSearchCenter(undefined)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && suggestions.length > 0) {
                      selectLocation(suggestions[0])
                    }
                  }}
                  className="h-10 w-full rounded-lg bg-secondary/50 px-3 text-sm transition-colors placeholder:text-muted-foreground/40 focus:bg-secondary focus:outline-none"
                />
              </div>
              {suggestions.map((city) => (
                <button
                  key={city.name}
                  role="option"
                  aria-selected={activeLocation === city.name}
                  onClick={() => selectLocation(city)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
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
              {activeLocation && (
                <>
                  <div className="my-2 h-px bg-border/50" />
                  <div className="px-2 pb-1">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Radius</div>
                    <div className="flex flex-wrap gap-1.5">
                      {RADIUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setRadius(opt.value)}
                          className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                            radius === opt.value
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {openPanel === "date" && (
            <div
              className="absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-xl shadow-slate-900/8"
              aria-label="Select date range"
            >
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                defaultMonth={dateRange?.from ?? new Date()}
                numberOfMonths={2}
                modifiers={{ past: { before: new Date() } }}
                modifiersClassNames={{ past: "opacity-25" }}
                classNames={{
                  months: "relative flex flex-col gap-6 sm:flex-row sm:divide-x sm:divide-border/60",
                  month: "flex w-full flex-col gap-3 px-5 py-4",
                  month_caption: "flex h-8 items-center justify-center px-8",
                  caption_label: "text-[13px] font-bold tracking-wide",
                  weekdays: "flex border-b border-border/40 pb-2",
                  weekday: "flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none",
                  week: "mt-2 flex w-full",
                }}
              />
              {dateRange?.from && (
                <div className="border-t border-border/50 px-3 py-2 flex justify-end">
                  <button
                    onClick={() => { setDateRange(undefined); setOpenPanel(null) }}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {openPanel === "type" && (
            <div
              className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border/60 bg-popover p-2 shadow-xl shadow-slate-900/8"
              role="listbox"
              aria-label="Select event types"
              aria-multiselectable="true"
            >
              {EVENT_TYPES.map((type) => {
                const selected = activeTypes.has(type.value)
                return (
                  <button
                    key={type.value}
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleType(type.value)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selected
                        ? "bg-primary/8 text-primary font-medium"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className={`size-2.5 rounded-full ${TYPE_DOTS[type.value] ?? "bg-slate-400"}`} />
                    {type.label}
                    <span className={`ml-auto flex size-4 items-center justify-center rounded ${selected ? "bg-primary" : "border border-border"}`}>
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
          )}

          {/* Active filters summary – desktop only */}
          {hasActiveFilters && (
            <div className="mt-2.5 hidden md:flex items-center justify-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {filtered.length} event{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground">·</span>
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content: event list + map sidebar */}
      <div className={`flex w-full flex-1 justify-center ${embedded ? "lg:min-h-[600px]" : "min-h-0"}`}>
      <div className="flex min-h-0 w-full max-w-[2500px] flex-1">
        <div
          ref={listRef}
          className={`@container min-h-0 flex-1 ${embedded ? "" : "overflow-y-auto"}`}
        >
          {sorted.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 text-muted-foreground" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4" />
                  <path d="M8 2v4" />
                  <path d="M3 10h18" />
                </svg>
              </div>
              <p className="text-sm font-medium">No events found</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Try adjusting your filters or expanding the search area.
              </p>
              <Button variant="outline" size="xs" className="mt-4" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="px-5 py-4">
              {/* Results headline */}
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                {filtered.length} event{filtered.length !== 1 ? "s" : ""}
                {activeLocation && <span className="font-normal text-muted-foreground"> near {activeLocation}</span>}
                {dateRange?.from && <span className="font-normal text-muted-foreground"> · {formatDateRangeLabel(dateRange).toLowerCase()}</span>}
              </h2>
              <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @5xl:grid-cols-3">
                {visible.map((event) => (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    onMouseEnter={() => setActiveEventId(event.id)}
                    onMouseLeave={() => setActiveEventId(undefined)}
                  >
                    <EventCard
                      event={event}
                      isActive={event.id === activeEventId}
                    />
                  </div>
                ))}
              </div>
              {/* Infinite scroll sentinel */}
              {!embedded && hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-8">
                  <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                </div>
              )}
              {!embedded && !hasMore && sorted.length > 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  All {sorted.length} events shown
                </p>
              )}
              {embedded && sorted.length > 6 && (
                <div className="flex justify-center py-8">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/events">View all {sorted.length} events</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map sidebar on desktop */}
        {showMap && (
          <div className="hidden lg:block w-[45%] shrink-0 z-0 p-3 pl-0">
            <div className="h-full overflow-hidden rounded-xl">
              <EventMap
                events={filtered}
                searchCenter={searchCenter}
                radiusKm={radius}
                activeEventId={activeEventId}
                onEventSelect={handleEventSelect}
              />
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Mobile map toggle (floating) */}
      {!embedded && (
        <div className="fixed right-4 bottom-[4.5rem] z-40 lg:hidden">
          <Button
            onClick={() => setShowMap(!showMap)}
            className="shadow-lg shadow-slate-900/15"
            size="sm"
          >
            <svg viewBox="0 0 24 24" fill="none" className="mr-1.5 size-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {showMap ? (
                <>
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </>
              ) : (
                <>
                  <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                  <path d="M8 2v16" />
                  <path d="M16 6v16" />
                </>
              )}
            </svg>
            {showMap ? "List" : "Map"}
          </Button>
        </div>
      )}

      {/* Mobile map overlay */}
      {!embedded && showMap && (
        <div className="fixed inset-0 top-[3.5rem] z-30 lg:hidden">
          <EventMap
            events={filtered}
            searchCenter={searchCenter}
            radiusKm={radius}
            activeEventId={activeEventId}
            onEventSelect={handleEventSelect}
          />
        </div>
      )}

    </div>
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


// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
