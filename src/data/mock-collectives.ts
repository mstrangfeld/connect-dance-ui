export type CollectiveType = "dance-school" | "teaching-couple" | "event-organizer" | "association"

export const COLLECTIVE_TYPE_LABELS: Record<CollectiveType, string> = {
  "dance-school": "Dance School",
  "teaching-couple": "Teaching Couple",
  "event-organizer": "Event Organizer",
  "association": "Association",
}

export interface MockCollective {
  id: string
  handle: string
  name: string
  avatar: string
  type: CollectiveType
  location: string
  description: string
  website?: string
  admins: string[] // dancer IDs
  followers: string[] // dancer IDs
  postsCount: number
  eventsOrganized: number
  foundedYear: number
  hasCommunity: boolean
  communityHandle?: string
  coverGradient: string
}

export const MOCK_COLLECTIVES: MockCollective[] = [
  {
    id: "col1",
    handle: "rheinland-swing",
    name: "Rheinland Swing",
    avatar: "https://picsum.photos/seed/rheinlandswing99/200/200",
    type: "dance-school",
    location: "Cologne, Germany",
    description:
      "West Coast Swing dance school in Cologne. Weekly socials, workshops, and the annual Rheinland Swing Classic. Building the NRW scene since 2014.",
    website: "rheinland-swing.de",
    admins: ["d11"],
    followers: ["me", "d3", "d9", "d10", "d13"],
    postsCount: 48,
    eventsOrganized: 12,
    foundedYear: 2014,
    hasCommunity: true,
    communityHandle: "rheinland-swing-community",
    coverGradient: "linear-gradient(135deg, oklch(0.62 0.10 225) 0%, oklch(0.80 0.05 245) 100%)",
  },
  {
    id: "col2",
    handle: "bay-area-wcs",
    name: "Bay Area WCS",
    avatar: "https://picsum.photos/seed/bayareawcs77/200/200",
    type: "dance-school",
    location: "San Francisco, CA",
    description:
      "San Francisco Bay Area's West Coast Swing community. Weekly classes at Mission Dance, monthly socials, and intensive weekends for all levels.",
    website: "bayareawcs.com",
    admins: ["me", "d15"],
    followers: ["d2", "d5", "d6", "d14"],
    postsCount: 61,
    eventsOrganized: 18,
    foundedYear: 2011,
    hasCommunity: true,
    communityHandle: "sf-bay-scene",
    coverGradient: "linear-gradient(135deg, oklch(0.60 0.09 200) 0%, oklch(0.78 0.06 230) 100%)",
  },
  {
    id: "col3",
    handle: "pdx-swing",
    name: "PDX Swing",
    avatar: "https://picsum.photos/seed/pdxswing44/200/200",
    type: "event-organizer",
    location: "Portland, OR",
    description:
      "Portland's WCS event organizers. Home of the Friday Night Westie Social and the annual Rose City Swing convention.",
    admins: ["d4", "d16"],
    followers: ["me", "d3", "d6"],
    postsCount: 34,
    eventsOrganized: 9,
    foundedYear: 2017,
    hasCommunity: false,
    coverGradient: "linear-gradient(135deg, oklch(0.65 0.10 140) 0%, oklch(0.82 0.05 170) 100%)",
  },
  {
    id: "col4",
    handle: "schmidt-meyer-wcs",
    name: "Schmidt & Meyer WCS",
    avatar: "https://picsum.photos/seed/schmidtmeyer22/200/200",
    type: "teaching-couple",
    location: "Munich, Germany",
    description:
      "Teaching couple touring Germany and Europe. Known for their musicality-focused workshops and their approach to connected partnership dancing.",
    website: "schmidtmeyerwcs.com",
    admins: ["d11"],
    followers: ["d9", "d10", "d13"],
    postsCount: 29,
    eventsOrganized: 6,
    foundedYear: 2019,
    hasCommunity: false,
    coverGradient: "linear-gradient(135deg, oklch(0.72 0.13 60) 0%, oklch(0.86 0.07 80) 100%)",
  },
  {
    id: "col5",
    handle: "munich-swing",
    name: "Munich Swing Connection",
    avatar: "https://picsum.photos/seed/munichswing11/200/200",
    type: "association",
    location: "Munich, Germany",
    description:
      "Munich's WCS association and organizers of the Munich Swing Festival. Connecting Bavarian dancers with the European and international scene.",
    website: "munichswing.de",
    admins: ["d11"],
    followers: ["d9", "d10", "d12", "d13"],
    postsCount: 55,
    eventsOrganized: 15,
    foundedYear: 2010,
    hasCommunity: true,
    communityHandle: "germany-wcs",
    coverGradient: "linear-gradient(135deg, oklch(0.60 0.14 25) 0%, oklch(0.78 0.08 40) 100%)",
  },
  {
    id: "col6",
    handle: "keep-austin-swinging",
    name: "Keep Austin Swinging",
    avatar: "https://picsum.photos/seed/keepaustinswinging55/200/200",
    type: "event-organizer",
    location: "Austin, TX",
    description:
      "Keeping Austin weird and dancing. Organizers of Austin Spring Swing and the beginner bootcamp series. No ego, just dancing.",
    admins: ["d7"],
    followers: ["d5", "d8"],
    postsCount: 22,
    eventsOrganized: 8,
    foundedYear: 2016,
    hasCommunity: false,
    coverGradient: "linear-gradient(135deg, oklch(0.64 0.15 22) 0%, oklch(0.82 0.09 35) 100%)",
  },
]
