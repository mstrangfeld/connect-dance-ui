import { useState, useMemo, useCallback } from "react"
import { MOCK_EVENTS } from "@/data/mock-events"
import type { EventType, City, DanceEvent } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"


export interface EventFilters {
  searchQuery: string
  locationQuery: string
  activeLocation: string
  searchCenter: [number, number] | undefined
  dateRange: DateRange | undefined
  activeTypes: Set<EventType>
  includePast: boolean
}

export interface EventFilterActions {
  setSearchQuery: (q: string) => void
  clearSearch: () => void
  setLocationQuery: (q: string) => void
  selectLocation: (city: City) => void
  clearLocation: () => void
  setDateRange: (range: DateRange | undefined) => void
  toggleType: (type: EventType) => void
  setActiveTypes: (types: Set<EventType>) => void
  setIncludePast: (include: boolean) => void
  clearAll: () => void
}

export interface UseEventFiltersReturn {
  filters: EventFilters
  actions: EventFilterActions
  filtered: DanceEvent[]
  sorted: DanceEvent[]
  searchBounds: [[number, number], [number, number]] | undefined
  hasActiveFilters: boolean
}

export function useEventFilters(options?: {
  externalActiveTypes?: Set<EventType>
  onActiveTypesChange?: (types: Set<EventType>) => void
  initialState?: Partial<EventFilters>
}): UseEventFiltersReturn {
  const init = options?.initialState
  const [searchQuery, setSearchQueryState] = useState(init?.searchQuery ?? "")
  const [locationQuery, setLocationQuery] = useState(init?.locationQuery ?? "")
  const [activeLocation, setActiveLocation] = useState(init?.activeLocation ?? "")
  const [searchCenter, setSearchCenter] = useState<
    [number, number] | undefined
  >(init?.searchCenter)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(init?.dateRange)
  const [includePast, setIncludePast] = useState(init?.includePast ?? false)
  const [internalActiveTypes, setInternalActiveTypes] = useState<
    Set<EventType>
  >(init?.activeTypes ?? new Set())

  const activeTypes = options?.externalActiveTypes ?? internalActiveTypes

  const setActiveTypes = useCallback(
    (types: Set<EventType>) => {
      if (options?.onActiveTypesChange) options.onActiveTypesChange(types)
      else setInternalActiveTypes(types)
    },
    [options?.onActiveTypesChange],
  )

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q)
    // When typing in the unified search, clear the city selection
    if (q.trim()) {
      setActiveLocation("")
      setSearchCenter(undefined)
      setLocationQuery("")
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQueryState("")
  }, [])

  const selectLocation = useCallback((city: City) => {
    setLocationQuery(city.name)
    setActiveLocation(city.name)
    setSearchCenter([city.lat, city.lng])
    setSearchQueryState(city.name)
  }, [])

  const clearLocation = useCallback(() => {
    setLocationQuery("")
    setActiveLocation("")
    setSearchCenter(undefined)
  }, [])

  const toggleType = useCallback(
    (type: EventType) => {
      const next = new Set(activeTypes)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      setActiveTypes(next)
    },
    [activeTypes, setActiveTypes],
  )

  const clearAll = useCallback(() => {
    setActiveTypes(new Set())
    clearLocation()
    setSearchQueryState("")
    setDateRange(undefined)
    setIncludePast(false)
  }, [setActiveTypes, clearLocation])

  const handleLocationQueryChange = useCallback(
    (q: string) => {
      setLocationQuery(q)
      if (!q.trim()) {
        setActiveLocation("")
        setSearchCenter(undefined)
      }
    },
    [],
  )

  const filtered = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return MOCK_EVENTS.filter((e) => {
      // Past events filter: use endDate if available, otherwise date
      if (!includePast) {
        const eventEnd = new Date((e.endDate ?? e.date) + "T23:59:59")
        if (eventEnd < today) return false
      }
      if (activeTypes.size > 0 && !e.categories.some((c) => activeTypes.has(c)))
        return false
      if (dateRange?.from) {
        const eventDate = new Date(e.date + "T00:00:00")
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)
        const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
        to.setHours(23, 59, 59, 999)
        if (eventDate < from || eventDate > to) return false
      }
      // Text search filtering
      if (searchQuery.trim() && !activeLocation) {
        const q = searchQuery.trim().toLowerCase()
        const haystack = [
          e.title,
          e.location,
          e.city,
          e.venue,
          e.organizer,
          ...e.tags,
        ]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [activeTypes, dateRange, includePast, searchQuery, activeLocation])

  const sorted = useMemo(() => {
    if (!includePast) {
      return [...filtered].sort((a, b) => a.date.localeCompare(b.date))
    }
    // When showing past events, put upcoming first (ascending), then past (most recent first)
    const today = new Date().toISOString().slice(0, 10)
    const upcoming = filtered.filter((e) => (e.endDate ?? e.date) >= today)
    const past = filtered.filter((e) => (e.endDate ?? e.date) < today)
    return [
      ...upcoming.sort((a, b) => a.date.localeCompare(b.date)),
      ...past.sort((a, b) => b.date.localeCompare(a.date)),
    ]
  }, [filtered, includePast])

  // Compute bounding box from filtered events when text search is active without a city
  const searchBounds = useMemo<
    [[number, number], [number, number]] | undefined
  >(() => {
    if (!searchQuery.trim() || activeLocation || filtered.length === 0) return undefined
    let south = 90,
      north = -90,
      west = 180,
      east = -180
    for (const e of filtered) {
      if (e.lat < south) south = e.lat
      if (e.lat > north) north = e.lat
      if (e.lng < west) west = e.lng
      if (e.lng > east) east = e.lng
    }
    // Add padding
    const latPad = Math.max((north - south) * 0.15, 0.5)
    const lngPad = Math.max((east - west) * 0.15, 0.5)
    return [
      [south - latPad, west - lngPad],
      [north + latPad, east + lngPad],
    ]
  }, [searchQuery, activeLocation, filtered])

  const hasActiveFilters =
    activeTypes.size > 0 ||
    activeLocation !== "" ||
    !!dateRange?.from ||
    searchQuery.trim() !== ""

  return {
    filters: {
      searchQuery,
      locationQuery,
      activeLocation,
      searchCenter,
      dateRange,
      activeTypes,
      includePast,
    },
    actions: {
      setSearchQuery,
      clearSearch,
      setLocationQuery: handleLocationQueryChange,
      selectLocation,
      clearLocation,
      setDateRange,
      toggleType,
      setActiveTypes,
      setIncludePast,
      clearAll,
    },
    filtered,
    sorted,
    searchBounds,
    hasActiveFilters,
  }
}
