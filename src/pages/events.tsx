import { useState, useRef, useEffect } from "react"
import { EventsSection } from "@/components/events-section"
import { EventMap } from "@/components/event-map"
import { EventCard } from "@/components/event-card"
import { MobileEventsFilterPill } from "@/components/mobile-events-filter-pill"
import { useEventFilters } from "@/hooks/use-event-filters"

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
//   z 20  Listings panel — above map, scrolls over it
//   z 45  Search pill — fixed at top
//   z 50  Bottom nav (rendered by App)
// ---------------------------------------------------------------------------

function MobileEventsView() {
  const { filters, actions, filtered } = useEventFilters()
  const [activeEventId, setActiveEventId] = useState<string | undefined>()

  // Set theme-color to map tile bg so iOS status bar blends with the map
  useEffect(() => {
    const meta = document.getElementById("theme-color") as HTMLMetaElement | null
    if (meta) meta.content = MAP_THEME_COLOR
    return () => {
      if (meta) meta.content = DEFAULT_THEME_COLOR
    }
  }, [])

  // Scroll tracking for search bar backdrop animation + bottom floor
  const backdropRef = useRef<HTMLDivElement>(null)
  const floorRef = useRef<HTMLDivElement>(null)
  const spacerHeightVal = useRef(0)

  // Measure spacer height once on mount using the initial viewport.
  // We intentionally do NOT re-measure on resize to avoid layout jumps
  // when Safari's toolbar appears/disappears.
  const initialHeight = useRef(0)
  useEffect(() => {
    initialHeight.current = window.innerHeight
    spacerHeightVal.current =
      window.innerHeight - PILL_AREA_HEIGHT - NAV_HEIGHT - PEEK_HEIGHT
  }, [])

  // Listen to window scroll (native body scroll)
  useEffect(() => {
    const onScroll = () => {
      const bd = backdropRef.current
      const floor = floorRef.current
      if (!bd) return
      const threshold = spacerHeightVal.current - PILL_AREA_HEIGHT
      const fadeStart = threshold - 60
      const progress = Math.max(
        0,
        Math.min(1, (window.scrollY - fadeStart) / 60),
      )
      bd.style.opacity = String(progress)

      // Show the fixed floor only once the listings panel fully covers
      // the viewport, so overscroll bounce at the bottom never reveals
      // the map. The spacer height equals the distance from the top of
      // the page to where the listings panel starts, so once scrollY
      // exceeds it the panel is at the top of the screen.
      if (floor) {
        floor.style.visibility =
          window.scrollY >= spacerHeightVal.current ? "visible" : "hidden"
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* 0. Fixed floor — solid background between map and listings.
            Starts hidden; becomes visible once the listings cover the map.
            Prevents the map from showing through during overscroll bounce. */}
      <div
        ref={floorRef}
        className="fixed inset-0 bg-background md:hidden"
        style={{ zIndex: 15, visibility: "hidden" }}
      />

      {/* 1. Map layer — fixed, fully interactive.
            Uses lvh so Leaflet doesn't re-layout when Safari's toolbar
            appears/disappears (which would cause the map to jump). */}
      <div className="fixed top-0 left-0 w-full md:hidden" style={{ zIndex: 10, height: "100lvh" }}>
        <EventMap
          events={filtered}
          radiusKm={filters.radius}
          searchCenter={filters.searchCenter}
          activeEventId={activeEventId}
          onEventSelect={setActiveEventId}
        />
      </div>

      {/* 2. Spacer — below map (z:5 < z:10) so map gets touch events.
            Uses lvh (large viewport height) so the spacer doesn't resize
            when Safari's toolbar appears/disappears during scrolling. */}
      <div
        className="relative shrink-0 md:hidden"
        style={{
          zIndex: 5,
          height: `calc(100lvh - ${PILL_AREA_HEIGHT}px - ${NAV_HEIGHT}px - ${PEEK_HEIGHT}px)`,
        }}
        aria-hidden
      />

      {/* 3. Listings panel — above map (z:20 > z:10), scrolls over it */}
      <div
        className="relative rounded-t-2xl bg-background shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:hidden"
        style={{ zIndex: 20 }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-[13px] font-semibold">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="px-4 pb-6">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No events match your filters.
              </p>
              <button
                onClick={actions.clearAll}
                className="mt-3 text-[13px] font-medium text-primary"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((event) => (
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

      {/* 4. Search pill + animated backdrop */}
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
            locationQuery={filters.locationQuery}
            onLocationQueryChange={actions.setLocationQuery}
            activeLocation={filters.activeLocation}
            onLocationSelect={actions.selectLocation}
            onLocationClear={actions.clearLocation}
            radius={filters.radius}
            onRadiusChange={actions.setRadius}
            dateRange={filters.dateRange}
            onDateRangeChange={actions.setDateRange}
            activeTypes={filters.activeTypes}
            onTypeToggle={actions.toggleType}
            onClearAll={actions.clearAll}
            resultCount={filtered.length}
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
