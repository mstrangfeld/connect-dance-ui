import { createContext, useContext, useRef, useCallback, useMemo } from "react"
import type { ReactNode } from "react"
import type { EventType, City } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"
import type { MapBounds } from "@/components/event-map"

// ── State shape ──────────────────────────────────────────────────────────────

export interface ExploreFilters {
  locationQuery: string
  activeLocation: string
  searchCenter: [number, number] | undefined
  dateRange: DateRange | undefined
  activeTypes: Set<EventType>
}

export interface ExploreMapView {
  /** User-panned center (overrides searchCenter for the map) */
  center: [number, number] | undefined
  zoom: number | undefined
}

export interface ExploreSnapshot {
  filters: ExploreFilters
  mapView: ExploreMapView
  mapBounds: MapBounds | null
  activeEventId: string | undefined
  scrollY: number
}

// ── Default values ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS: ExploreFilters = {
  locationQuery: "",
  activeLocation: "",
  searchCenter: undefined,
  dateRange: undefined,
  activeTypes: new Set(),
}

function createDefaultSnapshot(): ExploreSnapshot {
  return {
    filters: { ...DEFAULT_FILTERS, activeTypes: new Set() },
    mapView: { center: undefined, zoom: undefined },
    mapBounds: null,
    activeEventId: undefined,
    scrollY: 0,
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

/** Raw context — stores snapshots by key. Consumers use useExploreState(key). */
interface ExploreStateRaw {
  get: (key: string) => ExploreSnapshot
  set: (key: string, snapshot: ExploreSnapshot) => void
  update: (key: string, fn: (prev: ExploreSnapshot) => ExploreSnapshot) => void
}

/** Public interface returned by useExploreState — bound to a specific key */
export interface ExploreStateContextValue {
  getSnapshot: () => ExploreSnapshot
  setSnapshot: (snapshot: ExploreSnapshot) => void
  updateFilters: (partial: Partial<ExploreFilters>) => void
  updateMapView: (view: Partial<ExploreMapView>) => void
  setMapBounds: (bounds: MapBounds | null) => void
  setActiveEventId: (id: string | undefined) => void
  saveScrollY: (y: number) => void
  selectLocation: (city: City) => void
  clearLocation: () => void
  toggleType: (type: EventType) => void
  clearAll: () => void
  /** Copy this key's snapshot to another key (e.g. home → events) */
  copyTo: (targetKey: string) => void
}

const ExploreStateContext = createContext<ExploreStateRaw | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function ExploreStateProvider({ children }: { children: ReactNode }) {
  const ref = useRef<Record<string, ExploreSnapshot>>({
    events: createDefaultSnapshot(),
    home: createDefaultSnapshot(),
  })

  const get = useCallback((key: string) => {
    if (!ref.current[key]) ref.current[key] = createDefaultSnapshot()
    return ref.current[key]
  }, [])

  const set = useCallback((key: string, snapshot: ExploreSnapshot) => {
    ref.current[key] = snapshot
  }, [])

  const update = useCallback((key: string, fn: (prev: ExploreSnapshot) => ExploreSnapshot) => {
    if (!ref.current[key]) ref.current[key] = createDefaultSnapshot()
    ref.current[key] = fn(ref.current[key])
  }, [])

  return (
    <ExploreStateContext.Provider value={{ get, set, update }}>
      {children}
    </ExploreStateContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useExploreState(key = "events"): ExploreStateContextValue {
  const ctx = useContext(ExploreStateContext)
  if (!ctx) throw new Error("useExploreState must be used within ExploreStateProvider")

  const getSnapshot = useCallback(() => ctx.get(key), [ctx, key])

  const setSnapshot = useCallback(
    (snapshot: ExploreSnapshot) => ctx.set(key, snapshot),
    [ctx, key],
  )

  const updateFilters = useCallback(
    (partial: Partial<ExploreFilters>) =>
      ctx.update(key, (prev) => ({
        ...prev,
        filters: { ...prev.filters, ...partial },
      })),
    [ctx, key],
  )

  const updateMapView = useCallback(
    (view: Partial<ExploreMapView>) =>
      ctx.update(key, (prev) => ({
        ...prev,
        mapView: { ...prev.mapView, ...view },
      })),
    [ctx, key],
  )

  const setMapBounds = useCallback(
    (bounds: MapBounds | null) =>
      ctx.update(key, (prev) => ({ ...prev, mapBounds: bounds })),
    [ctx, key],
  )

  const setActiveEventId = useCallback(
    (id: string | undefined) =>
      ctx.update(key, (prev) => ({ ...prev, activeEventId: id })),
    [ctx, key],
  )

  const saveScrollY = useCallback(
    (y: number) =>
      ctx.update(key, (prev) => ({ ...prev, scrollY: y })),
    [ctx, key],
  )

  const selectLocation = useCallback(
    (city: City) =>
      ctx.update(key, (prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          locationQuery: city.name,
          activeLocation: city.name,
          searchCenter: [city.lat, city.lng],
        },
      })),
    [ctx, key],
  )

  const clearLocation = useCallback(
    () =>
      ctx.update(key, (prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          locationQuery: "",
          activeLocation: "",
          searchCenter: undefined,
        },
      })),
    [ctx, key],
  )

  const toggleType = useCallback(
    (type: EventType) =>
      ctx.update(key, (prev) => {
        const next = new Set(prev.filters.activeTypes)
        if (next.has(type)) next.delete(type)
        else next.add(type)
        return {
          ...prev,
          filters: { ...prev.filters, activeTypes: next },
        }
      }),
    [ctx, key],
  )

  const clearAll = useCallback(
    () =>
      ctx.update(key, (prev) => ({
        ...prev,
        filters: { ...DEFAULT_FILTERS, activeTypes: new Set() },
      })),
    [ctx, key],
  )

  const copyTo = useCallback(
    (targetKey: string) => {
      const snapshot = ctx.get(key)
      ctx.set(targetKey, { ...snapshot, scrollY: 0 })
    },
    [ctx, key],
  )

  return useMemo(
    () => ({
      getSnapshot,
      setSnapshot,
      updateFilters,
      updateMapView,
      setMapBounds,
      setActiveEventId,
      saveScrollY,
      selectLocation,
      clearLocation,
      toggleType,
      clearAll,
      copyTo,
    }),
    [
      getSnapshot,
      setSnapshot,
      updateFilters,
      updateMapView,
      setMapBounds,
      setActiveEventId,
      saveScrollY,
      selectLocation,
      clearLocation,
      toggleType,
      clearAll,
      copyTo,
    ],
  )
}
