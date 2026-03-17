import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { Calendar } from "@/components/ui/calendar"
import { XIcon, ChevronIcon, SearchIcon, FilterIcon, LocationIcon, VenueIcon, UserIcon, CheckIcon } from "@/components/icons"
import { EVENT_TYPE_LABELS } from "@/data/mock-events"
import type { EventType } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"
import { formatEventDateRange, TYPE_DOTS } from "@/lib/events"
import { getSearchSuggestions, type SearchSuggestion } from "@/lib/search-suggestions"

const EVENT_TYPES: Array<{ value: EventType; label: string }> = Object.entries(
  EVENT_TYPE_LABELS,
).map(([value, label]) => ({ value: value as EventType, label }))

type ExpandedSection = "date" | "type" | null

export interface MobileEventsFilterPillProps {
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  onSuggestionSelect: (suggestion: SearchSuggestion) => void
  onClearSearch: () => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  activeTypes: Set<EventType>
  onTypeToggle: (type: EventType) => void
  includePast: boolean
  onIncludePastChange: (include: boolean) => void
  onClearAll: () => void
  resultCount: number
  filterCount: number
  embedded?: boolean
  onNavigateToEvents?: () => void
  activeLocation: string
}

export function MobileEventsFilterPill({
  searchQuery,
  onSearchQueryChange,
  onSuggestionSelect,
  onClearSearch,
  dateRange,
  onDateRangeChange,
  activeTypes,
  onTypeToggle,
  includePast,
  onIncludePastChange,
  onClearAll,
  resultCount,
  filterCount,
  embedded,
  onNavigateToEvents,
  activeLocation,
}: MobileEventsFilterPillProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [animState, setAnimState] = useState<"closed" | "entering" | "open" | "exiting">("closed")
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>("date")
  const inputRef = useRef<HTMLInputElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const [clipOrigin, setClipOrigin] = useState({ top: 0, right: 0, bottom: 0, left: 0 })

  const navigate = useNavigate()

  const suggestions = useMemo(
    () => getSearchSuggestions(searchQuery),
    [searchQuery],
  )

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (animState === "entering" || animState === "open") document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [animState])

  const closePanelRef = useRef(closeFilterPanel)
  closePanelRef.current = closeFilterPanel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closePanelRef.current()
        setShowSuggestions(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  function openFilterPanel() {
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
    setShowSuggestions(false)
    setExpandedSection("date")
    setFilterPanelOpen(true)
    setAnimState("entering")
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimState("open")
      })
    })
  }

  function closeFilterPanel() {
    setAnimState("exiting")
    setTimeout(() => {
      setFilterPanelOpen(false)
      setAnimState("closed")
    }, 350)
  }

  function toggleSection(section: ExpandedSection) {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === "event" && suggestion.event) {
      navigate(`/events/${suggestion.event.id}`)
      setShowSuggestions(false)
      return
    }
    onSuggestionSelect(suggestion)
    setShowSuggestions(false)
    if (embedded && onNavigateToEvents) onNavigateToEvents()
  }, [navigate, onSuggestionSelect, embedded, onNavigateToEvents])

  const hasActiveFilters = filterCount > 0 || searchQuery.trim() !== ""

  return (
    <>
      {/* Search pill — directly typeable */}
      <div ref={pillRef} className="relative">
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary/15">
          <SearchIcon className="shrink-0 text-muted-foreground/50 size-[16px]" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            placeholder="Search events, cities, venues..."
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) {
                if (e.key === "Enter") {
                  setShowSuggestions(false)
                  inputRef.current?.blur()
                  if (embedded && onNavigateToEvents) onNavigateToEvents()
                }
                return
              }
              switch (e.key) {
                case "ArrowDown":
                  e.preventDefault()
                  setHighlightedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev,
                  )
                  break
                case "ArrowUp":
                  e.preventDefault()
                  setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
                  break
                case "Enter":
                  if (highlightedIndex >= 0) {
                    e.preventDefault()
                    handleSuggestionClick(suggestions[highlightedIndex])
                  } else {
                    setShowSuggestions(false)
                  }
                  inputRef.current?.blur()
                  break
              }
            }}
            className="h-7 flex-1 min-w-0 bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onClearSearch()
                inputRef.current?.focus()
              }}
              className="shrink-0 rounded-full p-0.5 text-muted-foreground/40 transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="size-3" />
            </button>
          )}
          <button
            onClick={openFilterPanel}
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Open filters"
          >
            <FilterIcon className="size-[16px]" />
            {filterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {/* Suggestions dropdown — flat ranked list */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-xl shadow-slate-900/8"
            style={{ maxHeight: "50vh" }}
            role="listbox"
            aria-label="Search suggestions"
          >
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {suggestions.map((s, i) => (
                <MobileSuggestionRow
                  key={`${s.type}-${s.label}-${i}`}
                  suggestion={s}
                  index={i}
                  isHighlighted={i === highlightedIndex}
                  activeLocation={activeLocation}
                  onSelect={handleSuggestionClick}
                  onHover={setHighlightedIndex}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-screen filter panel */}
      {filterPanelOpen &&
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
                onClick={closeFilterPanel}
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
                      {dateRange?.from ? formatDateRangeLabel(dateRange) : "Any date"}
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
                      {activeTypes.size === 0
                        ? "All types"
                        : activeTypes.size === 1
                          ? EVENT_TYPE_LABELS[[...activeTypes][0]]
                          : `${activeTypes.size} types`}
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

              {/* Show past events */}
              <div className="px-5 py-4">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-[15px] font-medium text-foreground">Show past events</span>
                  <button
                    role="switch"
                    aria-checked={includePast}
                    onClick={() => onIncludePastChange(!includePast)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      includePast ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                        includePast ? "translate-x-[18px]" : "translate-x-[3px]"
                      }`}
                    />
                  </button>
                </label>
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
                  onClick={closeFilterPanel}
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

function formatDateRangeLabel(range: DateRange | undefined): string {
  if (!range?.from) return "Any date"
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (!range.to || range.from.toDateString() === range.to.toDateString())
    return fmt(range.from)
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

function MobileSuggestionIcon({ type }: { type: SearchSuggestion["type"] }) {
  switch (type) {
    case "city":
      return <LocationIcon className="size-4" />
    case "venue":
      return <VenueIcon className="size-4 text-muted-foreground/50" />
    case "organizer":
      return <UserIcon className="size-4 text-muted-foreground/50" />
    case "event":
      return null
  }
}

function MobileSuggestionRow({
  suggestion,
  index,
  isHighlighted,
  activeLocation,
  onSelect,
  onHover,
}: {
  suggestion: SearchSuggestion
  index: number
  isHighlighted: boolean
  activeLocation: string
  onSelect: (s: SearchSuggestion) => void
  onHover: (i: number) => void
}) {
  const s = suggestion

  if (s.type === "event" && s.event) {
    const event = s.event
    const isPast = new Date((event.endDate ?? event.date) + "T23:59:59") < new Date()
    return (
      <button
        id={`mobile-suggestion-${index}`}
        role="option"
        aria-selected={isHighlighted}
        onClick={() => onSelect(s)}
        onMouseEnter={() => onHover(index)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors text-foreground ${
          isHighlighted ? "bg-secondary" : "hover:bg-secondary"
        }`}
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
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Event
        </span>
      </button>
    )
  }

  const isActiveCity = s.type === "city" && activeLocation === s.label

  return (
    <button
      id={`mobile-suggestion-${index}`}
      role="option"
      aria-selected={isHighlighted}
      onClick={() => onSelect(s)}
      onMouseEnter={() => onHover(index)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
        isActiveCity
          ? "bg-primary/8 text-primary font-medium"
          : isHighlighted
            ? "bg-secondary text-foreground"
            : "text-foreground hover:bg-secondary"
      }`}
    >
      <MobileSuggestionIcon type={s.type} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium">{s.label}</div>
        {s.sublabel && (
          <div className="truncate text-[11px] text-muted-foreground">{s.sublabel}</div>
        )}
      </div>
      {isActiveCity ? (
        <CheckIcon className="ml-auto size-4 shrink-0 text-primary" />
      ) : (
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          {s.type === "city" ? "City" : s.type === "venue" ? "Venue" : "Organizer"}
        </span>
      )}
    </button>
  )
}
