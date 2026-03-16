import { useState, useMemo, useCallback } from "react"
import { MOCK_EVENTS } from "@/data/mock-events"
import type { EventType, City, DanceEvent } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"
import { haversine } from "@/lib/events"

export interface EventFilters {
  locationQuery: string
  activeLocation: string
  searchCenter: [number, number] | undefined
  radius: number
  dateRange: DateRange | undefined
  activeTypes: Set<EventType>
}

export interface EventFilterActions {
  setLocationQuery: (q: string) => void
  selectLocation: (city: City) => void
  clearLocation: () => void
  setRadius: (r: number) => void
  setDateRange: (range: DateRange | undefined) => void
  toggleType: (type: EventType) => void
  setActiveTypes: (types: Set<EventType>) => void
  clearAll: () => void
}

export interface UseEventFiltersReturn {
  filters: EventFilters
  actions: EventFilterActions
  filtered: DanceEvent[]
  sorted: DanceEvent[]
  hasActiveFilters: boolean
}

export function useEventFilters(options?: {
  externalActiveTypes?: Set<EventType>
  onActiveTypesChange?: (types: Set<EventType>) => void
}): UseEventFiltersReturn {
  const [locationQuery, setLocationQuery] = useState("")
  const [activeLocation, setActiveLocation] = useState("")
  const [searchCenter, setSearchCenter] = useState<
    [number, number] | undefined
  >(undefined)
  const [radius, setRadius] = useState(200)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [internalActiveTypes, setInternalActiveTypes] = useState<
    Set<EventType>
  >(new Set())

  const activeTypes = options?.externalActiveTypes ?? internalActiveTypes

  const setActiveTypes = useCallback(
    (types: Set<EventType>) => {
      if (options?.onActiveTypesChange) options.onActiveTypesChange(types)
      else setInternalActiveTypes(types)
    },
    [options?.onActiveTypesChange],
  )

  const selectLocation = useCallback((city: City) => {
    setLocationQuery(city.name)
    setActiveLocation(city.name)
    setSearchCenter([city.lat, city.lng])
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
    setDateRange(undefined)
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
    return MOCK_EVENTS.filter((e) => {
      if (activeTypes.size > 0 && !e.categories.some((c) => activeTypes.has(c)))
        return false
      if (activeLocation && searchCenter) {
        const dist = haversine(searchCenter[0], searchCenter[1], e.lat, e.lng)
        if (dist > radius) return false
      }
      if (dateRange?.from) {
        const eventDate = new Date(e.date + "T00:00:00")
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)
        const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
        to.setHours(23, 59, 59, 999)
        if (eventDate < from || eventDate > to) return false
      }
      return true
    })
  }, [activeTypes, activeLocation, searchCenter, radius, dateRange])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.date.localeCompare(b.date)),
    [filtered],
  )

  const hasActiveFilters =
    activeTypes.size > 0 || activeLocation !== "" || !!dateRange?.from

  return {
    filters: {
      locationQuery,
      activeLocation,
      searchCenter,
      radius,
      dateRange,
      activeTypes,
    },
    actions: {
      setLocationQuery: handleLocationQueryChange,
      selectLocation,
      clearLocation,
      setRadius,
      setDateRange,
      toggleType,
      setActiveTypes,
      clearAll,
    },
    filtered,
    sorted,
    hasActiveFilters,
  }
}
