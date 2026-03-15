import { useState } from "react"
import { Hero } from "@/components/hero"
import { EventsSection } from "@/components/events-section"
import { Footer } from "@/components/footer"
import type { EventType } from "@/data/mock-events"

export function HomePage() {
  const [activeTypes, setActiveTypes] = useState<Set<EventType>>(new Set())

  return (
    <>
      <Hero activeTypes={activeTypes} onActiveTypesChange={setActiveTypes} />
      <div className="flex-1">
        <EventsSection embedded activeTypes={activeTypes} onActiveTypesChange={setActiveTypes} />
      </div>
      <Footer />
    </>
  )
}
