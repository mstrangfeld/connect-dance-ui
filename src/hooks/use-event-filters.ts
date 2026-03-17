import { useState, useMemo, useCallback } from "react"
import { MOCK_EVENTS } from "@/data/mock-events"
import type { EventType, City, DanceEvent } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"


export interface EventFilters {
  locationQuery: string
  activeLocation: string
  searchCenter: [number, number] | undefined
  dateRange: DateRange | undefined
  activeTypes: Set<EventType>
  includePast: boolean
}

export interface EventFilterActions {
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
  hasActiveFilters: boolean
}

export function useEventFilters(options?: {
  externalActiveTypes?: Set<EventType>
  onActiveTypesChange?: (types: Set<EventType>) => void
  initialState?: Partial<EventFilters>
}): UseEventFiltersReturn {
  const init = options?.initialState
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
      return true
    })
  }, [activeTypes, dateRange, includePast])

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

  const hasActiveFilters =
    activeTypes.size > 0 || activeLocation !== "" || !!dateRange?.from

  return {
    filters: {
      locationQuery,
      activeLocation,
      searchCenter,
      dateRange,
      activeTypes,
      includePast,
    },
    actions: {
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
    hasActiveFilters,
  }
}
