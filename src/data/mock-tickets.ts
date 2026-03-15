export interface PricingTier {
  id: string
  label: string   // "Early Bird", "Regular", "At Door"
  price: number
  endsAt?: string // ISO date — undefined means "no end" (at-door / final tier)
}

export interface TicketPass {
  id: string
  name: string
  tagline: string
  includes: string[]
  tiers: PricingTier[]  // sorted cheapest first (early → door)
  currency: string
  recommended?: boolean
  soldOut?: boolean
  spotsLeft?: number
}

export interface TicketAddOn {
  id: string
  name: string
  description: string
  price: number
  currency: string
  spotsLeft?: number
  soldOut?: boolean
}

export interface EventTicketData {
  eventId: string
  currency: string
  passes: TicketPass[]
  addOns: TicketAddOn[]
}

export const MOCK_TICKET_DATA: Record<string, EventTicketData> = {
  // Swingtime in the Rockies — April 17–19 2026
  // Today is 2026-03-15 → early bird ends Mar 20 = 5 days left!
  "1": {
    eventId: "1",
    currency: "USD",
    passes: [
      {
        id: "full",
        name: "Full Pass",
        tagline: "The complete experience",
        recommended: true,
        currency: "USD",
        includes: [
          "All workshops — 3 tracks, both days",
          "All social dances (Fri, Sat, Sun)",
          "Competition entry as competitor",
          "Pro show seating included",
          "Welcome reception",
        ],
        tiers: [
          { id: "early", label: "Early Bird", price: 149, endsAt: "2026-03-20" },
          { id: "regular", label: "Regular", price: 169, endsAt: "2026-04-10" },
          { id: "door", label: "At Door", price: 189 },
        ],
        spotsLeft: 158,
      },
      {
        id: "party",
        name: "Party Pass",
        tagline: "Dance the nights away",
        currency: "USD",
        includes: [
          "All social dances (Fri, Sat, Sun)",
          "Competition viewing (floor seating)",
          "Welcome reception",
        ],
        tiers: [
          { id: "early", label: "Early Bird", price: 79, endsAt: "2026-03-20" },
          { id: "regular", label: "Regular", price: 89, endsAt: "2026-04-10" },
          { id: "door", label: "At Door", price: 99 },
        ],
      },
      {
        id: "competitor",
        name: "Competitor Pass",
        tagline: "Compete on the floor",
        currency: "USD",
        includes: [
          "One workshop track per time slot",
          "All social dances (Fri, Sat, Sun)",
          "Competition entry as competitor",
          "Welcome reception",
        ],
        tiers: [
          { id: "early", label: "Early Bird", price: 139, endsAt: "2026-03-20" },
          { id: "regular", label: "Regular", price: 159, endsAt: "2026-04-10" },
          { id: "door", label: "At Door", price: 179 },
        ],
        spotsLeft: 47,
      },
    ],
    addOns: [
      {
        id: "fri-intensive",
        name: "Friday Intensive",
        description: "2-hour deep-dive with Alex & Jordan · Room A · limited to 12 couples",
        price: 45,
        currency: "USD",
        spotsLeft: 8,
      },
      {
        id: "judging-class",
        name: "Judging Masterclass",
        description: "How WSDC judging works — with Sam & River · open to all",
        price: 35,
        currency: "USD",
        spotsLeft: 14,
      },
      {
        id: "proshow-seats",
        name: "Pro Show Reserved Seating",
        description: "Priority front-section seating for Saturday night Pro Show",
        price: 25,
        currency: "USD",
      },
    ],
  },

  // Munich Swing Festival — May 8–10 2026
  // Today is 2026-03-15 → early bird ends Mar 31 = 16 days left
  "4": {
    eventId: "4",
    currency: "EUR",
    passes: [
      {
        id: "full",
        name: "Full Pass",
        tagline: "Das komplette Erlebnis",
        recommended: true,
        currency: "EUR",
        includes: [
          "All workshops — 2 tracks, both days",
          "All social dances (Fri, Sat, Sun)",
          "Competition entry as competitor",
          "Pro show seating included",
        ],
        tiers: [
          { id: "early", label: "Early Bird", price: 115, endsAt: "2026-03-31" },
          { id: "regular", label: "Regular", price: 135, endsAt: "2026-04-30" },
          { id: "door", label: "At Door", price: 165 },
        ],
        spotsLeft: 120,
      },
      {
        id: "party",
        name: "Party Pass",
        tagline: "Für die Nächte",
        currency: "EUR",
        includes: [
          "All social dances (Fri, Sat, Sun)",
          "Competition viewing",
        ],
        tiers: [
          { id: "early", label: "Early Bird", price: 69, endsAt: "2026-03-31" },
          { id: "regular", label: "Regular", price: 79, endsAt: "2026-04-30" },
          { id: "door", label: "At Door", price: 89 },
        ],
      },
      {
        id: "competitor",
        name: "Competitor Pass",
        tagline: "Auf dem Parkett antreten",
        currency: "EUR",
        includes: [
          "One workshop track per time slot",
          "All social dances",
          "Competition entry as competitor",
        ],
        tiers: [
          { id: "early", label: "Early Bird", price: 105, endsAt: "2026-03-31" },
          { id: "regular", label: "Regular", price: 125, endsAt: "2026-04-30" },
          { id: "door", label: "At Door", price: 145 },
        ],
        spotsLeft: 35,
      },
    ],
    addOns: [
      {
        id: "connection-lab",
        name: "Connection Lab Intensive",
        description: "Kleine Gruppe, max 10 Paare · mit Nadia & Marc · Saal B",
        price: 45,
        currency: "EUR",
        spotsLeft: 4,
      },
      {
        id: "judging-workshop",
        name: "Judging Workshop",
        description: "Wie funktioniert WSDC-Wertung? · mit Sophie & Klaus",
        price: 30,
        currency: "EUR",
        spotsLeft: 15,
      },
    ],
  },
}
