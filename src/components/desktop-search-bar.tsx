import { useState, useRef, useEffect, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { XIcon, LocationIcon, CheckIcon, SearchIcon, MapIcon } from "@/components/icons"
import { CITIES, EVENT_TYPE_LABELS } from "@/data/mock-events"
import type { EventType, City } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"
import { formatDateRangeLabel, TYPE_DOTS } from "@/lib/events"

type OpenPanel = "location" | "date" | "type" | null

const EVENT_TYPES: Array<{ value: EventType; label: string }> = Object.entries(
  EVENT_TYPE_LABELS,
).map(([value, label]) => ({ value: value as EventType, label }))

interface DesktopSearchBarProps {
  locationQuery: string
  onLocationQueryChange: (q: string) => void
  activeLocation: string
  onLocationSelect: (city: City) => void
  onLocationClear: () => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  activeTypes: Set<EventType>
  onTypeToggle: (type: EventType) => void
  onTypesReset: () => void
  embedded?: boolean
  showMap?: boolean
  onToggleMap?: () => void
  onNavigateToEvents?: () => void
}

export function DesktopSearchBar({
  locationQuery,
  onLocationQueryChange,
  activeLocation,
  onLocationSelect,
  onLocationClear,
  dateRange,
  onDateRangeChange,
  activeTypes,
  onTypeToggle,
  onTypesReset,
  embedded,
  showMap,
  onToggleMap,
  onNavigateToEvents,
}: DesktopSearchBarProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node))
        setOpenPanel(null)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenPanel(null)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const suggestions = useMemo(() => {
    if (!locationQuery.trim()) return CITIES.slice(0, 6)
    const q = locationQuery.toLowerCase()
    return CITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6)
  }, [locationQuery])

  function selectLocation(city: City) {
    onLocationSelect(city)
    setOpenPanel(null)
  }

  function togglePanel(panel: OpenPanel) {
    setOpenPanel((prev) => (prev === panel ? null : panel))
    if (panel === "location") {
      setTimeout(() => locationInputRef.current?.focus(), 0)
    }
  }

  const locationLabel = activeLocation || "Anywhere"
  const dateLabel = formatDateRangeLabel(dateRange)
  const typeLabel =
    activeTypes.size === 0
      ? "All types"
      : activeTypes.size === 1
        ? EVENT_TYPE_LABELS[[...activeTypes][0]]
        : `${activeTypes.size} types`

  return (
    <div ref={searchBarRef} className="relative mx-auto max-w-2xl hidden md:block">
      <div
        className="flex items-stretch rounded-full border border-border/60 bg-card shadow-sm transition-shadow has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-primary/15"
        role="toolbar"
        aria-label="Search and filter events"
      >
        {/* Location segment */}
        <button
          onClick={() => togglePanel("location")}
          className={`group relative flex min-w-0 flex-1 items-center gap-2.5 rounded-l-full py-3 pl-5 pr-4 text-left transition-colors focus-visible:z-10 focus-visible:outline-none ${
            openPanel === "location" ? "bg-secondary" : "hover:bg-secondary/50"
          }`}
          aria-expanded={openPanel === "location"}
          aria-haspopup="listbox"
        >
          <LocationIcon className="size-[18px]" />
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Where
            </div>
            <div
              className={`truncate text-[13px] font-medium ${activeLocation ? "text-foreground" : "text-muted-foreground"}`}
            >
              {locationLabel}
            </div>
          </div>
          {activeLocation && (
            <ClearButton
              onClick={(e) => {
                e.stopPropagation()
                onLocationClear()
              }}
              label="Clear location"
            />
          )}
        </button>

        <div className="my-2.5 w-px bg-border/50" />

        {/* Date segment */}
        <button
          onClick={() => togglePanel("date")}
          className={`group relative flex min-w-0 items-center gap-2.5 px-4 py-3 text-left transition-colors focus-visible:z-10 focus-visible:outline-none ${
            openPanel === "date" ? "bg-secondary" : "hover:bg-secondary/50"
          }`}
          aria-expanded={openPanel === "date"}
          aria-haspopup="listbox"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-[18px] shrink-0 text-muted-foreground/50"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
          </svg>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              When
            </div>
            <div
              className={`truncate text-[13px] font-medium ${dateRange?.from ? "text-foreground" : "text-muted-foreground"}`}
            >
              {dateLabel}
            </div>
          </div>
          {dateRange?.from && (
            <ClearButton
              onClick={(e) => {
                e.stopPropagation()
                onDateRangeChange(undefined)
              }}
              label="Clear date filter"
            />
          )}
        </button>

        <div className="my-2.5 w-px bg-border/50" />

        {/* Type segment */}
        <button
          onClick={() => togglePanel("type")}
          className={`group relative flex min-w-0 items-center gap-2.5 px-4 py-3 text-left transition-colors focus-visible:z-10 focus-visible:outline-none ${
            openPanel === "type" ? "bg-secondary" : "hover:bg-secondary/50"
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
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              What
            </div>
            <div
              className={`truncate text-[13px] font-medium ${activeTypes.size > 0 ? "text-foreground" : "text-muted-foreground"}`}
            >
              {typeLabel}
            </div>
          </div>
          {activeTypes.size > 0 && (
            <ClearButton
              onClick={(e) => {
                e.stopPropagation()
                onTypesReset()
              }}
              label="Clear type filter"
            />
          )}
        </button>

        {/* Search / map toggle */}
        <div className="flex items-center pr-2">
          {embedded ? (
            <button
              onClick={onNavigateToEvents}
              className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              aria-label="Search all events"
            >
              <SearchIcon />
            </button>
          ) : (
            <button
              onClick={onToggleMap}
              className={`flex size-10 items-center justify-center rounded-full transition-all ${
                showMap
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              aria-label={showMap ? "Hide map" : "Show map"}
              aria-pressed={showMap}
            >
              <MapIcon />
            </button>
          )}
        </div>
      </div>

      {/* Location dropdown panel */}
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
              onChange={(e) => onLocationQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && suggestions.length > 0)
                  selectLocation(suggestions[0])
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
              <LocationIcon className="size-4" />
              {city.name}
              {activeLocation === city.name && (
                <CheckIcon className="ml-auto size-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Date dropdown panel */}
      {openPanel === "date" && (
        <div
          className="absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-xl shadow-slate-900/8"
          aria-label="Select date range"
        >
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            defaultMonth={dateRange?.from ?? new Date()}
            numberOfMonths={2}
            modifiers={{ past: { before: new Date() } }}
            modifiersClassNames={{ past: "opacity-25" }}
            classNames={{
              months:
                "relative flex flex-col gap-6 sm:flex-row sm:divide-x sm:divide-border/60",
              month: "flex w-full flex-col gap-3 px-5 py-4",
              month_caption: "flex h-8 items-center justify-center px-8",
              caption_label: "text-[13px] font-bold tracking-wide",
              weekdays: "flex border-b border-border/40 pb-2",
              weekday:
                "flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground select-none",
              week: "mt-2 flex w-full",
            }}
          />
          {dateRange?.from && (
            <div className="border-t border-border/50 px-3 py-2 flex justify-end">
              <button
                onClick={() => {
                  onDateRangeChange(undefined)
                  setOpenPanel(null)
                }}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Type dropdown panel */}
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
                onClick={() => onTypeToggle(type.value)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
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
                  className={`ml-auto flex size-4 items-center justify-center rounded ${selected ? "bg-primary" : "border border-border"}`}
                >
                  {selected && (
                    <CheckIcon className="size-3 text-primary-foreground" />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ClearButton({
  onClick,
  label,
}: {
  onClick: (e: React.MouseEvent) => void
  label: string
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation()
          e.preventDefault()
          onClick(e as unknown as React.MouseEvent)
        }
      }}
      className="ml-auto shrink-0 rounded-full p-1 text-muted-foreground/30 transition-colors hover:bg-background hover:text-foreground"
      aria-label={label}
    >
      <XIcon />
    </span>
  )
}
