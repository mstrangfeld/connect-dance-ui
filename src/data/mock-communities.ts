export type CommunityType = "general" | "regional" | "event" | "collective" | "interest"

export const COMMUNITY_TYPE_LABELS: Record<CommunityType, string> = {
  general: "General",
  regional: "Regional",
  event: "Event",
  collective: "Official",
  interest: "Interest",
}

// Accent color per community type — used for headers and badges
export const COMMUNITY_TYPE_COLORS: Record<CommunityType, string> = {
  general: "#5A9CB5",
  regional: "#FAAC68",
  event: "#FA6868",
  collective: "#5A9CB5",
  interest: "#FACE68",
}

export interface MockCommunity {
  id: string
  handle: string
  name: string
  description: string
  type: CommunityType
  members: string[] // dancer IDs (subset for display)
  memberCount: number
  eventId?: string // auto-generated from event
  collectiveId?: string // tied to a collective
  createdAt: string
  isPublic: boolean
}

export const MOCK_COMMUNITIES: MockCommunity[] = [
  {
    id: "com1",
    handle: "germany-wcs",
    name: "Germany WCS",
    description:
      "The central community for West Coast Swing dancers in Germany. Share events, find partners, connect with the German scene.",
    type: "general",
    members: ["me", "d9", "d10", "d11", "d12", "d13"],
    memberCount: 447,
    createdAt: "2023-03-12T00:00:00Z",
    isPublic: true,
  },
  {
    id: "com2",
    handle: "westie-nrw",
    name: "Westie NRW",
    description:
      "North Rhine-Westphalia WCS community. Cologne, Düsseldorf, Dortmund and everything in between. Find your local dance.",
    type: "regional",
    members: ["d9", "d10", "d11"],
    memberCount: 183,
    createdAt: "2023-07-20T00:00:00Z",
    isPublic: true,
  },
  {
    id: "com3",
    handle: "westie-memes",
    name: "Westie Memes",
    description:
      "Because sometimes you just need to laugh at the thing you love most. Memes, gifs, and deeply relatable content for WCS dancers.",
    type: "interest",
    members: ["me", "d2", "d4", "d5", "d6", "d7", "d8"],
    memberCount: 892,
    createdAt: "2022-11-05T00:00:00Z",
    isPublic: true,
  },
  {
    id: "com4",
    handle: "sf-bay-scene",
    name: "SF Bay WCS Scene",
    description:
      "For dancers in San Francisco, Oakland, and the greater Bay Area. Find your next dance, meet local westies, share the love.",
    type: "regional",
    members: ["me", "d15"],
    memberCount: 328,
    collectiveId: "col2",
    createdAt: "2023-01-15T00:00:00Z",
    isPublic: true,
  },
  {
    id: "com5",
    handle: "stockholm-smash-2026",
    name: "Stockholm Swing Smash 2026",
    description:
      "Official community for Stockholm Swing Smash 2026. Event updates, travel tips, roommate matching, and social planning.",
    type: "event",
    members: ["d4", "d11", "d12"],
    memberCount: 210,
    eventId: "10",
    createdAt: "2026-01-10T00:00:00Z",
    isPublic: true,
  },
  {
    id: "com6",
    handle: "swingtime-rockies-2026",
    name: "Swingtime in the Rockies 2026",
    description:
      "Official community for Swingtime in the Rockies 2026. Denver, April 17–19. Organizer updates, travel coordination, post-event photos.",
    type: "event",
    members: ["me", "d3", "d8"],
    memberCount: 342,
    eventId: "1",
    createdAt: "2026-01-20T00:00:00Z",
    isPublic: true,
  },
  {
    id: "com7",
    handle: "rheinland-swing-community",
    name: "Rheinland Swing Community",
    description:
      "Official community of Rheinland Swing. Students, alumni, and friends of the Cologne WCS scene. Class updates, social info, and more.",
    type: "collective",
    members: ["d9", "d10", "d11", "d13"],
    memberCount: 561,
    collectiveId: "col1",
    createdAt: "2022-09-01T00:00:00Z",
    isPublic: true,
  },
  {
    id: "com8",
    handle: "munich-swing-community",
    name: "Munich Swing Connection",
    description:
      "Official community of Munich Swing Connection. Stay up to date with the Munich scene, workshops, and the annual festival.",
    type: "collective",
    members: ["d11", "d12"],
    memberCount: 383,
    collectiveId: "col5",
    createdAt: "2022-06-15T00:00:00Z",
    isPublic: true,
  },
]
