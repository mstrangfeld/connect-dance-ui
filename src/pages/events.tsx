import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { EventsSection } from "@/components/events-section"
import { EventMap } from "@/components/event-map"
import { EventCard } from "@/components/event-card"
import { MobileEventsFilterPill } from "@/components/mobile-events-filter-pill"
import { MOCK_EVENTS } from "@/data/mock-events"
import type { EventType } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILL_AREA_HEIGHT = 68 // search pill height + margin (px)
const NAV_HEIGHT = 64 // bottom nav height (px)
const PEEK_HEIGHT = 120 // how much of the listings panel peeks above the bottom nav

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

// ---------------------------------------------------------------------------
// Mobile map + scrollable listings (Airbnb-style architecture)
//
// Layout layers:
//   z-10  Fixed map — full viewport, interactive
//   z-20  Scroll container (pointer-events: none) with listings (pointer-events: auto)
//   z-45  Search pill + animated backdrop — fixed at top
//   z-50  Bottom nav (rendered by App)
//
// The scroll container has pointer-events: none so the map stays interactive
// through the transparent spacer. Only the listings panel captures touches.
// ---------------------------------------------------------------------------

function MobileEventsView() {
  const [locationQuery, setLocationQuery] = useState("")
  const [activeLocation, setActiveLocation] = useState("")
  const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>(undefined)
  const [radius, setRadius] = useState(200)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [activeTypes, setActiveTypes] = useState<Set<EventType>>(new Set())
  const [activeEventId, setActiveEventId] = useState<string | undefined>()

  // Scroll tracking for search bar backdrop animation
  const scrollRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const spacerHeight = useRef(0)

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

  // Measure spacer height once on mount/resize
  useEffect(() => {
    const measure = () => {
      spacerHeight.current = window.innerHeight - PILL_AREA_HEIGHT - NAV_HEIGHT - PEEK_HEIGHT
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Animate backdrop opacity based on scroll position
  const onScroll = useCallback(() => {
    const el = scrollRef.current
    const bd = backdropRef.current
    if (!el || !bd) return

    // The listings top edge hits the search pill when scrollTop ≈ spacerHeight - PILL_AREA_HEIGHT
    const threshold = spacerHeight.current - PILL_AREA_HEIGHT
    // Start fading in 60px before the listings reach the pill
    const fadeStart = threshold - 60
    const progress = Math.max(0, Math.min(1, (el.scrollTop - fadeStart) / 60))
    bd.style.opacity = String(progress)
  }, [])

  function toggleType(type: EventType) {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function clearAll() {
    setLocationQuery("")
    setActiveLocation("")
    setSearchCenter(undefined)
    setDateRange(undefined)
    setActiveTypes(new Set())
  }

  return (
    <>
      {/* ── 1. Map layer — fixed, fully interactive ── */}
      <div className="fixed inset-0 md:hidden" style={{ zIndex: 10 }}>
        <EventMap
          events={filtered}
          radiusKm={radius}
          searchCenter={searchCenter}
          activeEventId={activeEventId}
          onEventSelect={setActiveEventId}
        />
      </div>

      {/* ── 2. Scroll container — pointer-events:none so map stays interactive ── */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative flex-1 overflow-y-auto pointer-events-none md:hidden"
        style={{ zIndex: 20, WebkitOverflowScrolling: "touch" }}
      >
        {/* Transparent spacer — map shows through, touches pass to map */}
        <div
          style={{ height: `calc(100svh - ${PILL_AREA_HEIGHT}px - ${NAV_HEIGHT}px - ${PEEK_HEIGHT}px)` }}
          aria-hidden
        />

        {/* Listings panel — opaque, receives pointer events */}
        <div className="pointer-events-auto relative rounded-t-2xl bg-background shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          {/* Drag handle (decorative) */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          {/* Count row */}
          <div className="flex items-center justify-between px-4 py-2">
            <p className="text-[13px] font-semibold">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Event list */}
          <div className="px-4 pb-6">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">No events match your filters.</p>
                <button
                  onClick={clearAll}
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
                    <EventCard event={event} isActive={activeEventId === event.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Search pill + animated backdrop ── */}
      <div className="fixed top-0 left-0 right-0 pointer-events-none md:hidden" style={{ zIndex: 45 }}>
        {/* Backdrop — fades in as listings approach the search bar */}
        <div
          ref={backdropRef}
          className="absolute inset-0 bg-background/95 backdrop-blur-md"
          style={{ opacity: 0, height: PILL_AREA_HEIGHT, transition: "opacity 0.15s ease-out" }}
        />
        <div className="relative mx-4 mt-3 pointer-events-auto">
          <MobileEventsFilterPill
            locationQuery={locationQuery}
            onLocationQueryChange={(q) => {
              setLocationQuery(q)
              if (!q.trim()) { setActiveLocation(""); setSearchCenter(undefined) }
            }}
            activeLocation={activeLocation}
            onLocationSelect={(city) => {
              setLocationQuery(city.name)
              setActiveLocation(city.name)
              setSearchCenter([city.lat, city.lng])
            }}
            onLocationClear={() => {
              setLocationQuery("")
              setActiveLocation("")
              setSearchCenter(undefined)
            }}
            radius={radius}
            onRadiusChange={setRadius}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            activeTypes={activeTypes}
            onTypeToggle={toggleType}
            onClearAll={clearAll}
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
