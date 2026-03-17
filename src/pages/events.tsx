import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { EventsSection } from "@/components/events-section"
import { EventMap, type MapBounds, type MapViewState } from "@/components/event-map"
import { EventCard } from "@/components/event-card"
import { MobileEventsFilterPill } from "@/components/mobile-events-filter-pill"
import { useEventFilters } from "@/hooks/use-event-filters"
import { useExploreState } from "@/context/explore-state"
import type { City } from "@/data/mock-events"
import type { SearchSuggestion } from "@/lib/search-suggestions"
import { useNavigate } from "react-router"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILL_AREA_HEIGHT = 68
const NAV_HEIGHT = 64
const PEEK_HEIGHT = 120

// CartoDB light tile background — used for status bar blending on iOS
const MAP_THEME_COLOR = "#e8e0d8"
const DEFAULT_THEME_COLOR = "#f9f9f8"

// ---------------------------------------------------------------------------
// Mobile map + scrollable listings (Airbnb-style architecture)
//
// Uses native document scroll — enables Safari toolbar auto-hide on iOS.
//
// Layer stacking:
//   z  5  Spacer — below map, so map receives touch events
//   z 10  Fixed map — interactive
//   z 15  Floor — fixed to bottom, top tracks panel midpoint
//   z 20  Listings panel — above map, scrolls over it
//   z 45  Search pill — fixed at top
//   z 50  Bottom nav (rendered by App)
// ---------------------------------------------------------------------------

function isInBounds(lat: number, lng: number, bounds: MapBounds) {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  )
}

function MobileEventsView() {
  const explore = useExploreState()
  const navigate = useNavigate()

  // Hydrate local state from the persistent context
  const initial = explore.getSnapshot()

  const { filters, actions, filtered, searchBounds } = useEventFilters({
    initialState: initial.filters,
  })
  const [activeEventId, setActiveEventId] = useState<string | undefined>(initial.activeEventId)
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(initial.mapBounds)

  // Sync filter changes back to context (on every render is fine — ref-based, no re-render)
  useEffect(() => {
    explore.updateFilters(filters)
  })

  useEffect(() => {
    explore.setActiveEventId(activeEventId)
  }, [activeEventId, explore])

  // Save scroll position on unmount & restore on mount
  useEffect(() => {
    const savedY = explore.getSnapshot().scrollY
    if (savedY > 0) {
      // Defer to let the DOM render first
      requestAnimationFrame(() => {
        window.scrollTo(0, savedY)
      })
    }
    return () => {
      explore.saveScrollY(window.scrollY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
    explore.setMapBounds(bounds)
  }, [explore])

  const handleViewChange = useCallback((view: MapViewState) => {
    explore.updateMapView(view)
  }, [explore])

  const visibleEvents = useMemo(() => {
    if (!mapBounds) return filtered
    return filtered.filter((e) => isInBounds(e.lat, e.lng, mapBounds))
  }, [filtered, mapBounds])

  // Set theme-color to map tile bg so iOS status bar blends with the map
  useEffect(() => {
    const meta = document.getElementById("theme-color") as HTMLMetaElement | null
    if (meta) meta.content = MAP_THEME_COLOR
    return () => {
      if (meta) meta.content = DEFAULT_THEME_COLOR
    }
  }, [])

  // Scroll tracking for search bar backdrop animation + floor positioning
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const floorRef = useRef<HTMLDivElement>(null)
  const spacerHeightVal = useRef(0)

  useEffect(() => {
    spacerHeightVal.current =
      window.innerHeight - PILL_AREA_HEIGHT - NAV_HEIGHT - PEEK_HEIGHT
  }, [])

  // Listen to window scroll (native body scroll)
  useEffect(() => {
    const onScroll = () => {
      const bd = backdropRef.current
      if (!bd) return
      const threshold = spacerHeightVal.current - PILL_AREA_HEIGHT
      const fadeStart = threshold - 60
      const progress = Math.max(
        0,
        Math.min(1, (window.scrollY - fadeStart) / 60),
      )
      bd.style.opacity = String(progress)

      const panel = panelRef.current
      const floor = floorRef.current
      if (panel && floor) {
        const rect = panel.getBoundingClientRect()
        const mid = rect.top + rect.height / 2
        floor.style.top = `${Math.max(0, mid)}px`
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll() // initial position
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Wrap actions to also sync to context
  const handleSelectLocation = useCallback((city: City) => {
    actions.selectLocation(city)
    explore.selectLocation(city)
  }, [actions, explore])

  const handleClearAll = useCallback(() => {
    actions.clearAll()
    explore.clearAll()
  }, [actions, explore])

  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.type === "event" && suggestion.event) {
        navigate(`/events/${suggestion.event.id}`)
        return
      }
      if (suggestion.type === "city" && suggestion.city) {
        handleSelectLocation(suggestion.city)
      } else if (
        (suggestion.type === "venue" || suggestion.type === "organizer") &&
        suggestion.filterValue
      ) {
        actions.setSearchQuery(suggestion.filterValue)
        explore.updateFilters({ searchQuery: suggestion.filterValue })
      }
    },
    [actions, explore, navigate, handleSelectLocation],
  )

  // Compute filter count for badge
  const filterCount =
    (filters.dateRange?.from ? 1 : 0) +
    (filters.activeTypes.size > 0 ? 1 : 0) +
    (filters.includePast ? 1 : 0)

  return (
    <>
      {/* 1. Map layer — fixed, fully interactive */}
      <div className="fixed top-0 left-0 w-full md:hidden" style={{ zIndex: 10, height: "100lvh" }}>
        <EventMap
          events={filtered}
          searchCenter={filters.searchCenter}
          searchBounds={searchBounds}
          activeEventId={activeEventId}
          onEventSelect={setActiveEventId}
          onBoundsChange={handleBoundsChange}
          onViewChange={handleViewChange}
          initialCenter={initial.mapView.center}
          initialZoom={initial.mapView.zoom}
        />
      </div>

      {/* Spacer — below map so map gets touch events */}
      <div
        className="relative shrink-0 md:hidden"
        style={{
          zIndex: 5,
          height: `calc(100lvh - ${PILL_AREA_HEIGHT}px - ${NAV_HEIGHT}px - ${PEEK_HEIGHT}px)`,
        }}
        aria-hidden
      />

      {/* Floor */}
      <div
        ref={floorRef}
        className="fixed bottom-0 left-0 right-0 bg-background md:hidden"
        style={{ zIndex: 15 }}
      />

      {/* 2. Listings panel — above map (z:20 > z:10), scrolls over it */}
      <div
        ref={panelRef}
        className="relative rounded-t-2xl bg-background shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:hidden"
        style={{ zIndex: 20 }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-2">
          <p className="min-w-0 text-[13px] font-semibold">
            {visibleEvents.length} event{visibleEvents.length !== 1 ? "s" : ""}
            {filters.searchQuery && !filters.activeLocation && (
              <span className="font-normal text-muted-foreground">
                {" "}matching &ldquo;{filters.searchQuery}&rdquo;
              </span>
            )}
            <span className="font-normal text-muted-foreground"> in this area</span>
          </p>
          <label className="shrink-0 flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[11px] font-medium text-muted-foreground">Show past</span>
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

        <div className="px-4 pb-6">
          {visibleEvents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No events in this area.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Zoom out or pan the map to see more events.
              </p>
              {(filters.activeTypes.size > 0 || filters.activeLocation || filters.dateRange?.from || filters.searchQuery) && (
                <button
                  onClick={handleClearAll}
                  className="mt-3 text-[13px] font-medium text-primary"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setActiveEventId(event.id)}
                  className={`transition-all ${activeEventId === event.id ? "ring-2 ring-primary rounded-xl" : ""}`}
                >
                  <EventCard
                    event={event}
                    isActive={activeEventId === event.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Search pill + animated backdrop */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none md:hidden"
        style={{ zIndex: 45 }}
      >
        <div
          ref={backdropRef}
          className="absolute inset-0 bg-background/95 backdrop-blur-md"
          style={{
            opacity: 0,
            height: PILL_AREA_HEIGHT,
            transition: "opacity 0.15s ease-out",
          }}
        />
        <div className="relative mx-4 mt-3 pointer-events-auto">
          <MobileEventsFilterPill
            searchQuery={filters.searchQuery}
            onSearchQueryChange={(q: string) => {
              actions.setSearchQuery(q)
              explore.updateFilters({ searchQuery: q })
            }}
            onSuggestionSelect={handleSuggestionSelect}
            onClearSearch={() => {
              actions.clearSearch()
              explore.updateFilters({ searchQuery: "" })
            }}
            dateRange={filters.dateRange}
            onDateRangeChange={(range) => {
              actions.setDateRange(range)
              explore.updateFilters({ dateRange: range })
            }}
            activeTypes={filters.activeTypes}
            onTypeToggle={(type) => {
              actions.toggleType(type)
              explore.toggleType(type)
            }}
            includePast={filters.includePast}
            onIncludePastChange={(include) => {
              actions.setIncludePast(include)
              explore.updateFilters({ includePast: include })
            }}
            onClearAll={handleClearAll}
            resultCount={visibleEvents.length}
            filterCount={filterCount}
            activeLocation={filters.activeLocation}
          />
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function EventsPage() {
  return (
    <>
      {/* Mobile: map background + scrollable listings */}
      <MobileEventsView />

      {/* Desktop: full events section with sidebar/map toggle */}
      <div className="hidden md:block flex-1">
        <EventsSection />
      </div>
    </>
  )
}
