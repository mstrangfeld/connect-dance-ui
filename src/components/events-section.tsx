import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/event-card"
import { EventMap, type MapBounds, type MapViewState } from "@/components/event-map"
import { DesktopSearchBar } from "@/components/desktop-search-bar"
import { MobileEventsFilterPill } from "@/components/mobile-events-filter-pill"
import { useEventFilters } from "@/hooks/use-event-filters"
import { useExploreState } from "@/context/explore-state"
import { formatDateRangeLabel } from "@/lib/events"
import type { EventType } from "@/data/mock-events"

const BATCH_SIZE = 12

interface EventsSectionProps {
  embedded?: boolean
  stateKey?: string
  activeTypes?: Set<EventType>
  onActiveTypesChange?: (types: Set<EventType>) => void
}

export function EventsSection({
  embedded,
  stateKey = "events",
  activeTypes: externalActiveTypes,
  onActiveTypesChange,
}: EventsSectionProps) {
  const navigate = useNavigate()
  const explore = useExploreState(stateKey)
  const initial = explore.getSnapshot()

  const { filters, actions, filtered, sorted } =
    useEventFilters({
      externalActiveTypes,
      onActiveTypesChange,
      initialState: initial.filters,
    })

  const [visibleCount, setVisibleCount] = useState(embedded ? 6 : BATCH_SIZE)
  const [showMap, setShowMap] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  )
  const [activeEventId, setActiveEventId] = useState<string | undefined>(initial.activeEventId)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(initial.mapBounds)

  // Sync filter changes back to context
  useEffect(() => {
    explore.updateFilters(filters)
  })

  useEffect(() => {
    explore.setActiveEventId(activeEventId)
  }, [activeEventId, explore])

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
    explore.setMapBounds(bounds)
  }, [explore])

  const handleViewChange = useCallback((view: MapViewState) => {
    explore.updateMapView(view)
  }, [explore])

  const visibleInBounds = useMemo(() => {
    if (!showMap || !mapBounds) return sorted
    return sorted.filter(
      (e) =>
        e.lat >= mapBounds.south &&
        e.lat <= mapBounds.north &&
        e.lng >= mapBounds.west &&
        e.lng <= mapBounds.east,
    )
  }, [sorted, mapBounds, showMap])

  const sentinelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setVisibleCount((prev) => prev + BATCH_SIZE)
      },
      { rootMargin: "200px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const displayEvents = showMap ? visibleInBounds : sorted
  const visible = displayEvents.slice(0, visibleCount)
  const hasMore = visibleCount < displayEvents.length

  const handleEventSelect = useCallback((eventId: string) => {
    setActiveEventId(eventId)
    const card = document.getElementById(`event-${eventId}`)
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [])

  const handleNavigateToEvents = useCallback(() => {
    explore.copyTo("events")
    navigate("/events")
  }, [explore, navigate])

  return (
    <div
      id="events-list"
      className={`flex flex-col ${embedded ? "mx-auto w-full max-w-7xl" : "h-[calc(100svh-3.5rem)]"}`}
    >
      {/* Search bar */}
      <div
        ref={searchBarRef}
        className="relative shrink-0 border-b border-border/50 bg-background px-6 py-4 z-40"
      >
        {/* Mobile pill */}
        <div className="md:hidden mx-auto max-w-2xl">
          <MobileEventsFilterPill
            locationQuery={filters.locationQuery}
            onLocationQueryChange={actions.setLocationQuery}
            activeLocation={filters.activeLocation}
            onLocationSelect={actions.selectLocation}
            onLocationClear={actions.clearLocation}
            dateRange={filters.dateRange}
            onDateRangeChange={actions.setDateRange}
            activeTypes={filters.activeTypes}
            onTypeToggle={actions.toggleType}
            onClearAll={actions.clearAll}
            resultCount={filtered.length}
            embedded={embedded}
            onNavigateToEvents={embedded ? handleNavigateToEvents : undefined}
          />
        </div>

        {/* Desktop search bar */}
        <DesktopSearchBar
          locationQuery={filters.locationQuery}
          onLocationQueryChange={actions.setLocationQuery}
          activeLocation={filters.activeLocation}
          onLocationSelect={actions.selectLocation}
          onLocationClear={actions.clearLocation}
          dateRange={filters.dateRange}
          onDateRangeChange={actions.setDateRange}
          activeTypes={filters.activeTypes}
          onTypeToggle={actions.toggleType}
          onTypesReset={() => actions.setActiveTypes(new Set())}
          embedded={embedded}
          showMap={showMap}
          onToggleMap={() => setShowMap(!showMap)}
          onNavigateToEvents={embedded ? handleNavigateToEvents : undefined}
        />

      </div>

      {/* Main content: event list + map sidebar */}
      <div
        className={`relative z-0 flex w-full flex-1 justify-center ${embedded ? "lg:min-h-[600px]" : "min-h-0"}`}
      >
        <div className="flex min-h-0 w-full max-w-[2500px] flex-1">
          {/* Scrollable event list */}
          <div ref={listRef} className="@container min-h-0 flex-1 overflow-y-auto">
            {sorted.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-4 text-muted-foreground"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
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
                <Button
                  variant="outline"
                  size="xs"
                  className="mt-4"
                  onClick={actions.clearAll}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    {displayEvents.length} event{displayEvents.length !== 1 ? "s" : ""}
                    {showMap && mapBounds && (
                      <span className="font-normal text-muted-foreground"> in this area</span>
                    )}
                    {filters.activeLocation && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        near {filters.activeLocation}
                      </span>
                    )}
                    {filters.dateRange?.from && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {formatDateRangeLabel(filters.dateRange).toLowerCase()}
                      </span>
                    )}
                  </h2>
                  <label className="shrink-0 flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[11px] font-medium text-muted-foreground">Show past events</span>
                    <button
                      role="switch"
                      aria-checked={filters.includePast}
                      onClick={() => actions.setIncludePast(!filters.includePast)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        filters.includePast ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                          filters.includePast ? "translate-x-[18px]" : "translate-x-[3px]"
                        }`}
                      />
                    </button>
                  </label>
                </div>
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
                {!embedded && hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-8">
                    <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                  </div>
                )}
                {!embedded && !hasMore && displayEvents.length > 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    All {displayEvents.length} events shown
                  </p>
                )}
                {embedded && displayEvents.length > 6 && (
                  <div className="flex justify-center py-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        explore.copyTo("events")
                        navigate("/events")
                      }}
                    >
                      View all {displayEvents.length} events
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map sidebar — fixed height, no scroll */}
          {showMap && (
            <div className="hidden lg:block w-[45%] shrink-0 pr-3 pb-3">
              <div className="h-full overflow-hidden rounded-xl">
                <EventMap
                  events={filtered}
                  searchCenter={filters.searchCenter}

                  activeEventId={activeEventId}
                  onEventSelect={handleEventSelect}
                  onBoundsChange={handleBoundsChange}
                  onViewChange={handleViewChange}
                  initialCenter={initial.mapView.center}
                  initialZoom={initial.mapView.zoom}
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="mr-1.5 size-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        <div className="fixed inset-0 top-0 z-30 lg:hidden">
          <EventMap
            events={filtered}
            searchCenter={filters.searchCenter}
            activeEventId={activeEventId}
            onEventSelect={handleEventSelect}
            onBoundsChange={handleBoundsChange}
            onViewChange={handleViewChange}
            initialCenter={initial.mapView.center}
            initialZoom={initial.mapView.zoom}
          />
        </div>
      )}
    </div>
  )
}
