import { useEffect, useMemo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import type { DanceEvent } from "@/data/mock-events"
import { EVENT_TYPE_LABELS } from "@/data/mock-events"

// Fix default marker icon issue with bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const TYPE_COLORS: Record<string, string> = {
  party:     "#a78bfa",  // violet-400
  intensive: "#fb923c",  // orange-400
  workshop:  "#facc15",  // yellow-400
  class:     "#34d399",  // emerald-400
  festival:  "#38bdf8",  // sky-400
}

function createEventIcon(type: string, isActive: boolean) {
  const color = TYPE_COLORS[type] ?? "#5A9CB5"
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

function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number]
  zoom: number
}) {
  const map = useMap()
  const prevCenter = useRef(center)
  const prevZoom = useRef(zoom)

  useEffect(() => {
    if (
      prevCenter.current[0] !== center[0] ||
      prevCenter.current[1] !== center[1] ||
      prevZoom.current !== zoom
    ) {
      map.flyTo(center, zoom, { duration: 0.8 })
      prevCenter.current = center
      prevZoom.current = zoom
    }
  }, [map, center, zoom])

  return null
}

function radiusToZoom(radiusKm: number): number {
  if (radiusKm <= 25) return 10
  if (radiusKm <= 50) return 9
  if (radiusKm <= 100) return 8
  if (radiusKm <= 200) return 7
  return 5
}

interface EventMapProps {
  events: DanceEvent[]
  searchCenter?: [number, number]
  radiusKm: number
  activeEventId?: string
  onEventSelect?: (eventId: string) => void
}

export function EventMap({
  events,
  searchCenter,
  radiusKm,
  activeEventId,
  onEventSelect,
}: EventMapProps) {
  const defaultCenter: [number, number] = [45, -20]
  const center = searchCenter ?? defaultCenter
  const zoom = searchCenter ? radiusToZoom(radiusKm) : 3

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
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <MapUpdater center={center} zoom={zoom} />

      {searchCenter && (
        <Circle
          center={searchCenter}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#5A9CB5",
            fillColor: "#5A9CB5",
            fillOpacity: 0.06,
            weight: 1.5,
            dashArray: "4 4",
          }}
        />
      )}

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
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{event.attendees} going</span>
                <span className="text-[12px] font-semibold text-slate-700">{event.price}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

function formatDateShort(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
