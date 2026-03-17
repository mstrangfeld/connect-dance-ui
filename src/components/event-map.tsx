import { useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { useNavigate } from "react-router"
import L from "leaflet"
import type { DanceEvent, EventType } from "@/data/mock-events"
import { EVENT_TYPE_LABELS } from "@/data/mock-events"
import { TYPE_COLORS, formatDateShort } from "@/lib/events"

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// Fix default marker icon issue with bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function createEventIcon(type: string, isActive: boolean) {
  const color = TYPE_COLORS[type as keyof typeof TYPE_COLORS] ?? "#5A9CB5"
  const size = isActive ? 32 : 24
  const label = EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS] ?? ""
  const letter = label.charAt(0)
  const fontSize = isActive ? 14 : 11
  return L.divIcon({
    className: "event-marker",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${fontSize}px;
      line-height:1;font-family:system-ui,sans-serif;
      ${isActive ? "transform:scale(1.2);" : ""}
    ">${letter}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  const prevCenter = useRef(center)
  const prevZoom = useRef(zoom)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip the initial render — the MapContainer's center/zoom props handle that
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (
      prevCenter.current[0] !== center[0] ||
      prevCenter.current[1] !== center[1] ||
      prevZoom.current !== zoom
    ) {
      const size = map.getSize()
      if (size.x > 0 && size.y > 0) {
        map.flyTo(center, zoom, { duration: 0.8 })
      } else {
        map.setView(center, zoom)
      }
      prevCenter.current = center
      prevZoom.current = zoom
    }
  }, [map, center, zoom])

  return null
}

export interface MapViewState {
  center: [number, number]
  zoom: number
}

function BoundsTracker({
  onBoundsChange,
  onViewChange,
}: {
  onBoundsChange: (bounds: MapBounds) => void
  onViewChange?: (view: MapViewState) => void
}) {
  const map = useMap()
  const boundsRef = useRef(onBoundsChange)
  boundsRef.current = onBoundsChange
  const viewRef = useRef(onViewChange)
  viewRef.current = onViewChange

  useEffect(() => {
    function report() {
      const b = map.getBounds()
      boundsRef.current({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
      const c = map.getCenter()
      viewRef.current?.({ center: [c.lat, c.lng], zoom: map.getZoom() })
    }

    map.on("moveend", report)
    // Report initial bounds once map is ready
    if (map.getSize().x > 0) report()
    else map.once("load", report)

    return () => { map.off("moveend", report) }
  }, [map])

  return null
}

/** Zoom level when flying to a selected city */
const CITY_ZOOM = 10

const LEGEND_TYPES: EventType[] = ["festival", "workshop", "intensive", "party", "class"]

function MapLegend() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="absolute top-20 left-3 md:top-auto md:bottom-3 z-[1000] isolate will-change-transform">
      <div className="relative">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-1.5 rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-md border border-slate-200/60 transition-colors hover:bg-white ${collapsed ? "" : "invisible"}`}
          aria-label="Show map legend"
        >
          <span className="flex gap-1">
            {LEGEND_TYPES.slice(0, 3).map((type) => (
              <span
                key={type}
                className="size-2 rounded-full"
                style={{ background: TYPE_COLORS[type] }}
              />
            ))}
          </span>
          Legend
        </button>
        {!collapsed && (
          <div
            onClick={() => setCollapsed(true)}
            className="absolute top-0 left-0 md:top-auto md:bottom-0 rounded-lg bg-white/95 backdrop-blur-sm shadow-md border border-slate-200/60 p-2.5 cursor-pointer md:cursor-default z-10"
          >
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Legend</span>
              <button
                onClick={(e) => { e.stopPropagation(); setCollapsed(true) }}
                className="hidden md:flex text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Collapse legend"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-3.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {LEGEND_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                    style={{ background: TYPE_COLORS[type] }}
                  >
                    {EVENT_TYPE_LABELS[type].charAt(0)}
                  </span>
                  <span className="text-[11px] text-slate-600">{EVENT_TYPE_LABELS[type]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <span className="mt-1.5 block text-[9px] leading-tight text-slate-400 [&_a]:text-slate-500 [&_a]:underline [&_a]:underline-offset-2">
        <span className="hidden md:inline">&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a></span>
        <span className="md:hidden flex flex-col"><span>&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></span><span>&copy; <a href="https://carto.com/attributions">CARTO</a></span></span>
      </span>
    </div>
  )
}

interface EventMapProps {
  events: DanceEvent[]
  searchCenter?: [number, number]
  activeEventId?: string
  onEventSelect?: (eventId: string) => void
  onBoundsChange?: (bounds: MapBounds) => void
  /** Restored center from a previous session — used only for the initial mount */
  initialCenter?: [number, number]
  /** Restored zoom from a previous session — used only for the initial mount */
  initialZoom?: number
  /** Called when the user pans/zooms the map */
  onViewChange?: (view: MapViewState) => void
}

export function EventMap({
  events,
  searchCenter,
  activeEventId,
  onEventSelect,
  onBoundsChange,
  initialCenter,
  initialZoom,
  onViewChange,
}: EventMapProps) {
  const navigate = useNavigate()
  const defaultCenter: [number, number] = [45, -20]
  const filterCenter = searchCenter ?? defaultCenter
  const filterZoom = searchCenter ? CITY_ZOOM : 3

  // On mount, prefer restored position; afterwards MapUpdater drives filter changes
  const center = initialCenter ?? filterCenter
  const zoom = initialZoom ?? filterZoom

  const markers = useMemo(
    () =>
      events.map((event) => ({
        event,
        position: [event.lat, event.lng] as [number, number],
        icon: createEventIcon(event.type, event.id === activeEventId),
      })),
    [events, activeEventId],
  )

  return (
    <div className="relative h-full w-full">
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
      minZoom={2}
      maxBounds={[
        [-85, -180],
        [85, 180],
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <MapUpdater center={filterCenter} zoom={filterZoom} />
      {onBoundsChange && <BoundsTracker onBoundsChange={onBoundsChange} onViewChange={onViewChange} />}

      {markers.map(({ event, position, icon }) => (
        <Marker
          key={event.id}
          position={position}
          icon={icon}
          eventHandlers={{
            click: () => onEventSelect?.(event.id),
          }}
        >
          <Popup className="event-popup" closeButton={false} autoPan={false}>
            <div className="min-w-[180px] p-0.5">
              <div className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">
                {EVENT_TYPE_LABELS[event.type]}
              </div>
              <div className="mt-0.5 text-[13px] font-semibold leading-snug text-slate-900">
                {event.title}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {event.venue} · {formatDateShort(event.date)}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  {event.attendees} going
                </span>
                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="text-[11px] font-medium text-[#5A9CB5] hover:underline"
                >
                  View event →
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    <MapLegend />
    </div>
  )
}
