import { MOCK_EVENTS, CITIES } from "@/data/mock-events"
import type { DanceEvent, City } from "@/data/mock-events"

export interface SearchSuggestion {
  type: "event" | "city" | "venue" | "organizer"
  label: string
  sublabel?: string
  event?: DanceEvent
  city?: City
  filterValue?: string
}

// Extract unique venues and organizers from mock data
const UNIQUE_VENUES = Array.from(
  new Map(
    MOCK_EVENTS.map((e) => [e.venue, { name: e.venue, city: e.location }]),
  ).entries(),
).map(([, v]) => v)

const UNIQUE_ORGANIZERS = Array.from(
  new Set(MOCK_EVENTS.map((e) => e.organizer)),
)

const POPULAR_CITIES = CITIES.slice(0, 6)

/** Score a match: lower index = better match. Prefix match beats contains. */
function matchScore(haystack: string, q: string): number {
  const h = haystack.toLowerCase()
  if (h === q) return 0
  if (h.startsWith(q)) return 1
  const idx = h.indexOf(q)
  if (idx >= 0) return 2 + idx
  return Infinity
}

export function getSearchSuggestions(query: string): SearchSuggestion[] {
  const q = query.trim().toLowerCase()

  if (!q) {
    return POPULAR_CITIES.map((city) => ({
      type: "city" as const,
      label: city.name,
      city,
    }))
  }

  const scored: Array<{ suggestion: SearchSuggestion; score: number }> = []

  // Events — match title, location, venue, organizer, tags
  for (const event of MOCK_EVENTS) {
    const titleScore = matchScore(event.title, q)
    const locationScore = matchScore(event.location, q)
    const venueScore = matchScore(event.venue, q)
    const organizerScore = matchScore(event.organizer, q)
    const tagScore = Math.min(
      ...event.tags.map((t) => matchScore(t, q)),
      Infinity,
    )
    const best = Math.min(titleScore, locationScore, venueScore, organizerScore, tagScore)
    if (best < Infinity) {
      scored.push({
        suggestion: {
          type: "event",
          label: event.title,
          sublabel: event.location,
          event,
        },
        score: best,
      })
    }
  }

  // Cities
  for (const city of CITIES) {
    const score = matchScore(city.name, q)
    if (score < Infinity) {
      scored.push({
        suggestion: {
          type: "city",
          label: city.name,
          city,
        },
        score,
      })
    }
  }

  // Venues
  for (const venue of UNIQUE_VENUES) {
    const score = matchScore(venue.name, q)
    if (score < Infinity) {
      scored.push({
        suggestion: {
          type: "venue",
          label: venue.name,
          sublabel: venue.city,
          filterValue: venue.name,
        },
        score,
      })
    }
  }

  // Organizers
  for (const org of UNIQUE_ORGANIZERS) {
    const score = matchScore(org, q)
    if (score < Infinity) {
      scored.push({
        suggestion: {
          type: "organizer",
          label: org,
          filterValue: org,
        },
        score,
      })
    }
  }

  // Sort by score (best match first); cities always rank above others at the same score
  const typePriority = (type: string) => (type === "city" ? 0 : 1)
  scored.sort(
    (a, b) =>
      typePriority(a.suggestion.type) - typePriority(b.suggestion.type) ||
      a.score - b.score,
  )
  return scored.slice(0, 10).map((s) => s.suggestion)
}
