import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { Calendar } from "@/components/ui/calendar"
import { XIcon, ChevronIcon, LocationIcon, CheckIcon } from "@/components/icons"
import { EVENT_TYPE_LABELS, CITIES, MOCK_EVENTS } from "@/data/mock-events"
import type { EventType, City } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"
import { formatDateRangeLabel, formatEventDateRange, TYPE_DOTS } from "@/lib/events"

const EVENT_TYPES: Array<{ value: EventType; label: string }> = Object.entries(
  EVENT_TYPE_LABELS,
).map(([value, label]) => ({ value: value as EventType, label }))

type ExpandedSection = "location" | "date" | "type" | null

export interface MobileEventsFilterPillProps {
  locationQuery: string
  onLocationQueryChange: (q: string) => void
  activeLocation: string
  onLocationSelect: (city: City) => void
  onLocationClear: () => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  activeTypes: Set<EventType>
  onTypeToggle: (type: EventType) => void
  onClearAll: () => void
  resultCount: number
  embedded?: boolean
  onNavigateToEvents?: () => void
}

export function MobileEventsFilterPill({
  locationQuery,
  onLocationQueryChange,
  activeLocation,
  onLocationSelect,
  onLocationClear,
  dateRange,
  onDateRangeChange,
  activeTypes,
  onTypeToggle,
  onClearAll,
  resultCount,
  embedded,
  onNavigateToEvents,
}: MobileEventsFilterPillProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [animState, setAnimState] = useState<"closed" | "entering" | "open" | "exiting">("closed")
  const [expandedSection, setExpandedSection] =
    useState<ExpandedSection>("location")
  const locationInputRef = useRef<HTMLInputElement>(null)
  const pillRef = useRef<HTMLButtonElement>(null)
  const [clipOrigin, setClipOrigin] = useState({ top: 0, right: 0, bottom: 0, left: 0 })

  const navigate = useNavigate()

  const citySuggestions = useMemo(() => {
    if (!locationQuery.trim()) return CITIES.slice(0, 6)
    const q = locationQuery.toLowerCase()
    return CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6)
  }, [locationQuery])

  const eventSuggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase()
    if (!q) return []
    return MOCK_EVENTS.filter((e) =>
      e.title.toLowerCase().includes(q),
    ).slice(0, 5)
  }, [locationQuery])

  useEffect(() => {
    if (animState === "entering" || animState === "open") document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [animState])

  const closePanelRef = useRef(closePanel)
  closePanelRef.current = closePanel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePanelRef.current()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  function openPanel(section: ExpandedSection = "location") {
    // Capture pill position for clip-path origin
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      setClipOrigin({
        top: rect.top,
        right: vw - rect.right,
        bottom: vh - rect.bottom,
        left: rect.left,
      })
    }
    setExpandedSection(section)
    setPanelOpen(true)
    setAnimState("entering")
    // Trigger reflow then transition to open
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimState("open")
      })
    })
    if (section === "location")
      setTimeout(() => locationInputRef.current?.focus(), 100)
  }

  function closePanel() {
    setAnimState("exiting")
    setTimeout(() => {
      setPanelOpen(false)
      setAnimState("closed")
    }, 350)
  }

  function toggleSection(section: ExpandedSection) {
    setExpandedSection((prev) => (prev === section ? null : section))
    if (section === "location")
      setTimeout(() => locationInputRef.current?.focus(), 100)
  }

  const hasActiveFilters =
    activeTypes.size > 0 || activeLocation !== "" || !!dateRange?.from
  const filterCount =
    (activeLocation ? 1 : 0) +
    (dateRange?.from ? 1 : 0) +
    (activeTypes.size > 0 ? 1 : 0)
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
        ref={pillRef}
        onClick={() => openPanel("location")}
        className="flex w-full items-center gap-3 rounded-full border border-border/60 bg-card px-4 py-2.5 shadow-sm text-left transition-colors hover:bg-secondary/50 active:bg-secondary"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-[18px] shrink-0 text-muted-foreground/50"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-bold leading-none text-foreground">
            {activeLocation || "Anywhere"}
          </span>
          <span className="truncate text-[11px] leading-none text-slate-500 dark:text-slate-400">
            {dateLabel} · {typeLabel}
          </span>
        </div>
        {hasActiveFilters ? (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
            {filterCount}
          </span>
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-[14px]"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
        )}
      </button>

      {/* Full-screen filter panel */}
      {panelOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex flex-col bg-background"
            style={{
              clipPath: animState === "open"
                ? "inset(0 0 0 0 round 0px)"
                : `inset(${clipOrigin.top}px ${clipOrigin.right}px ${clipOrigin.bottom}px ${clipOrigin.left}px round 24px)`,
              transition: "clip-path 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-4 border-b border-border/50 px-4 py-4">
              <button
                onClick={closePanel}
                className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
                aria-label="Close filters"
              >
                <XIcon />
              </button>
              <span className="flex-1 text-center text-sm font-semibold">
                Filters
              </span>
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
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Where
                    </div>
                    <div
                      className={`mt-0.5 text-[15px] font-medium ${activeLocation ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {activeLocation || "Anywhere"}
                    </div>
                  </div>
                  <ChevronIcon expanded={expandedSection === "location"} />
                </button>
                {expandedSection === "location" && (
                  <div className="px-5 pb-5">
                    <input
                      ref={locationInputRef}
                      type="text"
                      placeholder="Search events or cities..."
                      value={locationQuery}
                      onChange={(e) => {
                        onLocationQueryChange(e.target.value)
                        if (!e.target.value.trim()) onLocationClear()
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (eventSuggestions.length > 0) {
                            navigate(`/events/${eventSuggestions[0].id}`)
                            closePanel()
                          } else if (citySuggestions.length > 0) {
                            onLocationSelect(citySuggestions[0])
                          }
                        }
                      }}
                      className="mb-2 h-10 w-full rounded-xl bg-secondary/50 px-4 text-sm transition-colors placeholder:text-muted-foreground/40 focus:bg-secondary focus:outline-none"
                    />

                    {/* Event results */}
                    {eventSuggestions.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Events
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {eventSuggestions.map((event) => {
                            const isPast = new Date((event.endDate ?? event.date) + "T23:59:59") < new Date()
                            return (
                              <button
                                key={event.id}
                                onClick={() => {
                                  navigate(`/events/${event.id}`)
                                  closePanel()
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors text-foreground hover:bg-secondary"
                              >
                                <span className={`size-2 shrink-0 rounded-full ${TYPE_DOTS[event.type] ?? "bg-slate-400"}`} />
                                <div className="min-w-0 flex-1">
                                  <div className={`truncate text-[13px] font-medium ${isPast ? "text-muted-foreground" : ""}`}>
                                    {event.title}
                                  </div>
                                  <div className="truncate text-[11px] text-muted-foreground">
                                    {event.location} · {formatEventDateRange(event.date, event.endDate)}
                                    {isPast && <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider opacity-60">Past</span>}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    {eventSuggestions.length > 0 && citySuggestions.length > 0 && (
                      <div className="my-1 border-t border-border/40" />
                    )}

                    {/* City results */}
                    {citySuggestions.length > 0 && (
                      <div>
                        {locationQuery.trim() && (
                          <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Cities
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          {citySuggestions.map((city) => (
                            <button
                              key={city.name}
                              onClick={() => onLocationSelect(city)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                                activeLocation === city.name
                                  ? "bg-primary/8 text-primary font-medium"
                                  : "text-foreground hover:bg-secondary"
                              }`}
                            >
                              <LocationIcon className="size-4" />
                              {city.name}
                              {activeLocation === city.name && (
                                <CheckIcon className="ml-auto size-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No results */}
                    {eventSuggestions.length === 0 && citySuggestions.length === 0 && locationQuery.trim() && (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No events or cities found
                      </div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      When
                    </div>
                    <div
                      className={`mt-0.5 text-[15px] font-medium ${dateRange?.from ? "text-foreground" : "text-muted-foreground"}`}
                    >
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
                        month_caption:
                          "flex h-8 items-center justify-center px-8",
                        caption_label: "text-[13px] font-bold tracking-wide",
                        weekdays: "flex border-b border-border/40 pb-2",
                        weekday:
                          "flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none",
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
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      What
                    </div>
                    <div
                      className={`mt-0.5 text-[15px] font-medium ${activeTypes.size > 0 ? "text-foreground" : "text-muted-foreground"}`}
                    >
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
                            <span
                              className={`size-2.5 rounded-full ${TYPE_DOTS[type.value] ?? "bg-slate-400"}`}
                            />
                            {type.label}
                            <span
                              className={`ml-auto flex size-5 items-center justify-center rounded-md ${selected ? "bg-primary" : "border border-border"}`}
                            >
                              {selected && (
                                <CheckIcon className="size-3 text-primary-foreground" />
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
            <div className="shrink-0 border-t border-border/50 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {embedded ? (
                <button
                  onClick={onNavigateToEvents}
                  className="flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
                >
                  Search events
                </button>
              ) : (
                <button
                  onClick={closePanel}
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
