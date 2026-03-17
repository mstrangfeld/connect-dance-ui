import { useState, useCallback } from "react"
import { Hero } from "@/components/hero"
import { EventsSection } from "@/components/events-section"
import { Footer } from "@/components/footer"
import { useExploreState } from "@/context/explore-state"
import type { EventType } from "@/data/mock-events"

export function HomePage() {
  const explore = useExploreState("home")
  const [activeTypes, setActiveTypes] = useState<Set<EventType>>(
    () => explore.getSnapshot().filters.activeTypes,
  )

  const handleActiveTypesChange = useCallback(
    (types: Set<EventType>) => {
      setActiveTypes(types)
      explore.updateFilters({ activeTypes: types })
    },
    [explore],
  )

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] flex-col">
      <Hero activeTypes={activeTypes} onActiveTypesChange={handleActiveTypesChange} />
      <div className="flex-1">
        <EventsSection embedded stateKey="home" activeTypes={activeTypes} onActiveTypesChange={handleActiveTypesChange} />
      </div>
      <Footer />
    </div>
  )
}
