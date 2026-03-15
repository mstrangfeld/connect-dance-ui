import type { DancerLevel } from "@/context/auth"

export interface MockDancer {
  id: string
  name: string
  username: string
  avatar: string
  level: DancerLevel
  location: string
  bio: string
  followers: string[]
  following: string[]
  postsCount: number
  eventsAttended: number
}

export interface MockComment {
  id: string
  authorId: string
  content: string
  createdAt: string
}

export interface MockPost {
  id: string
  authorId: string
  content: string
  mediaUrl?: string
  eventId?: string
  communityId?: string
  likes: string[]
  comments: MockComment[]
  createdAt: string
}

export const MOCK_DANCERS: MockDancer[] = [
  {
    id: "me",
    name: "Alex Rivera",
    username: "alexdances",
    avatar: "https://picsum.photos/seed/alexrivera99/200/200",
    level: "Advanced",
    location: "San Francisco, CA",
    bio: "WCS dancer based in SF. Chasing points, finding flow. Instructor at Bay Area WCS.",
    followers: ["d2", "d3", "d4", "d5", "d7", "d8"],
    following: ["d2", "d4", "d6", "d8", "d9"],
    postsCount: 23,
    eventsAttended: 41,
  },
  {
    id: "d2",
    name: "Jamie Chen",
    username: "jamieswings",
    avatar: "https://picsum.photos/seed/jamiechen42/200/200",
    level: "All-Star",
    location: "Los Angeles, CA",
    bio: "Full-time WCS competitor & coach. Champion mindset, humble heart. Teaching workshops globally.",
    followers: ["me", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"],
    following: ["me", "d4", "d8"],
    postsCount: 87,
    eventsAttended: 130,
  },
  {
    id: "d3",
    name: "Morgan Williams",
    username: "morgan_wcs",
    avatar: "https://picsum.photos/seed/morganwilliams7/200/200",
    level: "Intermediate",
    location: "Denver, CO",
    bio: "Weekend warrior dancer. Rocky Mountain scene is home. Lover of live music events.",
    followers: ["d2", "d5", "d7"],
    following: ["me", "d2", "d5"],
    postsCount: 14,
    eventsAttended: 18,
  },
  {
    id: "d4",
    name: "Sam Torres",
    username: "sam_dances",
    avatar: "https://picsum.photos/seed/samtorres55/200/200",
    level: "Advanced",
    location: "Portland, OR",
    bio: "PDX Swing regular. J&J addict. Musicality is everything.",
    followers: ["me", "d2", "d6", "d8", "d11"],
    following: ["d2", "d6", "d7", "d11"],
    postsCount: 36,
    eventsAttended: 57,
  },
  {
    id: "d5",
    name: "Riley Kim",
    username: "rileykim_dance",
    avatar: "https://picsum.photos/seed/rileykim88/200/200",
    level: "Novice",
    location: "Chicago, IL",
    bio: "Started dancing 8 months ago and completely obsessed. Chi-Town scene is the best.",
    followers: ["d3", "d7"],
    following: ["me", "d2", "d3", "d4", "d7"],
    postsCount: 9,
    eventsAttended: 7,
  },
  {
    id: "d6",
    name: "Casey Park",
    username: "caseyparks",
    avatar: "https://picsum.photos/seed/caseypark33/200/200",
    level: "Intermediate",
    location: "Seattle, WA",
    bio: "Dance teacher by day, social dancer by night. Century Ballroom is my second home.",
    followers: ["d4", "d8", "d9"],
    following: ["me", "d4", "d8"],
    postsCount: 28,
    eventsAttended: 32,
  },
  {
    id: "d7",
    name: "Jordan Smith",
    username: "jordansmith_wcs",
    avatar: "https://picsum.photos/seed/jordansmith21/200/200",
    level: "Advanced",
    location: "Austin, TX",
    bio: "Keep Austin Swinging organizer. I believe every city deserves a great WCS scene.",
    followers: ["me", "d3", "d5", "d8"],
    following: ["d3", "d5", "d8", "d10"],
    postsCount: 44,
    eventsAttended: 68,
  },
  {
    id: "d8",
    name: "Taylor Brooks",
    username: "taylorb_wcs",
    avatar: "https://picsum.photos/seed/taylorbrooks16/200/200",
    level: "All-Star",
    location: "Atlanta, GA",
    bio: "Swing Classic organizer. Pro dancer. Passionate about building community everywhere I go.",
    followers: ["me", "d4", "d6", "d7", "d9", "d10", "d11"],
    following: ["me", "d2", "d7"],
    postsCount: 102,
    eventsAttended: 185,
  },
  {
    id: "d9",
    name: "Blake Johnson",
    username: "blakej_swing",
    avatar: "https://picsum.photos/seed/blakejohnson74/200/200",
    level: "Intermediate",
    location: "London, UK",
    bio: "London WCS community member. Saving up for my first WSDC convention abroad.",
    followers: ["d6", "d11"],
    following: ["me", "d4", "d6", "d8"],
    postsCount: 17,
    eventsAttended: 22,
  },
  {
    id: "d10",
    name: "Quinn Davis",
    username: "quinnd",
    avatar: "https://picsum.photos/seed/quinndavis50/200/200",
    level: "Novice",
    location: "Paris, France",
    bio: "Parisian dancer. Le Bal Blomet regular. Trying to learn English so I can understand the workshop instructors.",
    followers: ["d7", "d8"],
    following: ["d7", "d8", "d11", "d12"],
    postsCount: 6,
    eventsAttended: 11,
  },
  {
    id: "d11",
    name: "Avery Martinez",
    username: "averymartinez",
    avatar: "https://picsum.photos/seed/averymartinez63/200/200",
    level: "Advanced",
    location: "Munich, Germany",
    bio: "Munich Swing Connection team. European circuit regulars. WCS is my lifestyle.",
    followers: ["d4", "d8", "d9", "d12"],
    following: ["d2", "d8", "d12"],
    postsCount: 51,
    eventsAttended: 74,
  },
  {
    id: "d12",
    name: "Peyton Wilson",
    username: "peyton_swing",
    avatar: "https://picsum.photos/seed/peytonwilson29/200/200",
    level: "All-Star",
    location: "Stockholm, Sweden",
    bio: "Stockholm Swing Society director. Competing internationally since 2019. The floor is home.",
    followers: ["d10", "d11", "d13"],
    following: ["d2", "d8", "d11"],
    postsCount: 78,
    eventsAttended: 140,
  },
  {
    id: "d13",
    name: "Sage Anderson",
    username: "sage_wcs",
    avatar: "https://picsum.photos/seed/sageanderson81/200/200",
    level: "Intermediate",
    location: "Amsterdam, Netherlands",
    bio: "Amsterdam dancer. Body movement workshop obsessed. Every week at Dansmakers.",
    followers: ["d12", "d14"],
    following: ["d11", "d12"],
    postsCount: 19,
    eventsAttended: 26,
  },
  {
    id: "d14",
    name: "Drew Thompson",
    username: "drewt_dancer",
    avatar: "https://picsum.photos/seed/drewthompson45/200/200",
    level: "Newcomer",
    location: "New York, NY",
    bio: "Brand new to WCS. Went to one social and now I can't stop thinking about dancing. Is this normal?",
    followers: ["d13"],
    following: ["me", "d5", "d13"],
    postsCount: 3,
    eventsAttended: 4,
  },
  {
    id: "d15",
    name: "Reese Garcia",
    username: "reese_garcia",
    avatar: "https://picsum.photos/seed/reesegarcia66/200/200",
    level: "Advanced",
    location: "San Francisco, CA",
    bio: "Bay Area native. Bay Area WCS instructor. Love building the local scene one dance at a time.",
    followers: ["me", "d5"],
    following: ["me", "d2", "d5"],
    postsCount: 31,
    eventsAttended: 49,
  },
  {
    id: "d16",
    name: "Hayden Lee",
    username: "hayden_lee_wcs",
    avatar: "https://picsum.photos/seed/haydenlee38/200/200",
    level: "Intermediate",
    location: "Portland, OR",
    bio: "PDX dancer and weekend festival enthusiast. Never say no to a good Jack & Jill.",
    followers: ["d4"],
    following: ["d4", "d7", "d15"],
    postsCount: 22,
    eventsAttended: 35,
  },
]

export const MOCK_POSTS: MockPost[] = [
  {
    id: "p1",
    authorId: "d2",
    content:
      "That moment when the music hits and you and your partner are completely locked in — there's nothing else in the world. Last night at the LA Saturday social was exactly that. Thank you to everyone who came out.",
    likes: ["me", "d4", "d6", "d7", "d8", "d11", "d12", "d15"],
    comments: [
      {
        id: "c1",
        authorId: "d4",
        content: "That energy was electric! Best social in months.",
        createdAt: "2026-03-14T23:15:00Z",
      },
      {
        id: "c2",
        authorId: "d8",
        content: "Wish I could have been there. See you at Swing Classic in June!",
        createdAt: "2026-03-15T00:32:00Z",
      },
    ],
    createdAt: "2026-03-14T22:00:00Z",
  },
  {
    id: "p2",
    authorId: "d3",
    content: "Workshop recap: spent all afternoon working on my anchor. My arms looked like spaghetti at first but by the third hour something clicked. Progress is real.",
    mediaUrl: "https://picsum.photos/seed/workshop_recap/800/600",
    likes: ["me", "d5", "d7", "d15"],
    comments: [
      {
        id: "c3",
        authorId: "d5",
        content: "Spaghetti arms is such a relatable phase 😂",
        createdAt: "2026-03-14T19:45:00Z",
      },
    ],
    createdAt: "2026-03-14T18:30:00Z",
  },
  {
    id: "p3",
    authorId: "d4",
    content: "Registered for Stockholm Swing Smash! Who else is making the trip? Would love to coordinate travel.",
    eventId: "10",
    communityId: "com5",
    likes: ["me", "d2", "d6", "d11", "d12"],
    comments: [
      {
        id: "c4",
        authorId: "d12",
        content: "Yes!! See you on the floor. Stockholm is going to be amazing this year.",
        createdAt: "2026-03-13T14:20:00Z",
      },
      {
        id: "c5",
        authorId: "d11",
        content: "Flying in from Munich, we should grab dinner on Friday!",
        createdAt: "2026-03-13T15:00:00Z",
      },
    ],
    createdAt: "2026-03-13T12:00:00Z",
  },
  {
    id: "p4",
    authorId: "d5",
    content: "3 years ago I stepped onto a dance floor for the first time and could barely do a basic. Last night I placed 2nd in Novice Jack & Jill at the Chicago social. Crying a little (a lot). This community is everything.",
    likes: ["me", "d3", "d4", "d6", "d7", "d8", "d14", "d15"],
    comments: [
      {
        id: "c6",
        authorId: "d7",
        content: "RILEY!!! I'm so proud of you!!",
        createdAt: "2026-03-12T20:10:00Z",
      },
      {
        id: "c7",
        authorId: "me",
        content: "You've worked so hard for this. Well deserved!!",
        createdAt: "2026-03-12T20:45:00Z",
      },
      {
        id: "c8",
        authorId: "d14",
        content: "This gives me so much hope as a newcomer 🙏",
        createdAt: "2026-03-12T21:30:00Z",
      },
    ],
    createdAt: "2026-03-12T19:30:00Z",
  },
  {
    id: "p5",
    authorId: "d6",
    content: "Late night floor at Century Ballroom after a 4-hour social. The last two hours hit different when everyone's tired and just dancing for pure joy.",
    mediaUrl: "https://picsum.photos/seed/latenight_floor/800/500",
    likes: ["d4", "d8", "d9", "d11"],
    comments: [],
    createdAt: "2026-03-11T01:45:00Z",
  },
  {
    id: "p6",
    authorId: "d7",
    content: "Hot take: the best dancing happens at the after-parties, not the main events. The music gets rawer, people are more playful, and the connection is unfiltered. Thoughts?",
    likes: ["d2", "d4", "d8", "d12", "d15"],
    comments: [
      {
        id: "c9",
        authorId: "d2",
        content: "Hard agree. The 2am floor at any convention is sacred.",
        createdAt: "2026-03-10T21:00:00Z",
      },
      {
        id: "c10",
        authorId: "d8",
        content: "This is why we organizers always fight to keep the late room open 😂",
        createdAt: "2026-03-10T21:30:00Z",
      },
    ],
    createdAt: "2026-03-10T20:00:00Z",
  },
  {
    id: "p7",
    authorId: "d8",
    content: "Swingtime in the Rockies registration is officially open! Denver in April is going to be something special — we've got a lineup I'm so excited to share. Save your spot.",
    eventId: "1",
    communityId: "com6",
    likes: ["me", "d2", "d4", "d6", "d7", "d11", "d12", "d15"],
    comments: [
      {
        id: "c11",
        authorId: "me",
        content: "Already registered! Can't wait.",
        createdAt: "2026-03-09T16:00:00Z",
      },
      {
        id: "c12",
        authorId: "d3",
        content: "Denver represent!! See you all there 🏔️",
        createdAt: "2026-03-09T17:15:00Z",
      },
    ],
    createdAt: "2026-03-09T15:00:00Z",
  },
  {
    id: "p8",
    authorId: "d9",
    content: "Just finished the London Westie Workshop Day and my brain is full. Three sessions, three instructors, completely different approaches to the same dance. Musicality, connection, styling — I need a week to process.",
    mediaUrl: "https://picsum.photos/seed/london_workshop/800/600",
    likes: ["d4", "d6", "d11", "d13"],
    comments: [
      {
        id: "c13",
        authorId: "d13",
        content: "London's scene has grown so much! Glad you got to experience it.",
        createdAt: "2026-03-08T20:00:00Z",
      },
    ],
    createdAt: "2026-03-08T19:00:00Z",
  },
  {
    id: "p9",
    authorId: "d10",
    content: "The WCS community in Paris is small but the warmth is enormous. Every Wednesday at Le Bal Blomet I feel at home. If you're ever in Paris, come dance with us — no matter your level.",
    likes: ["d7", "d8", "d13"],
    comments: [
      {
        id: "c14",
        authorId: "d7",
        content: "Adding this to my travel dance bucket list 🗼",
        createdAt: "2026-03-07T22:00:00Z",
      },
    ],
    createdAt: "2026-03-07T21:00:00Z",
  },
  {
    id: "p10",
    authorId: "d11",
    content: "Munich Swing Festival is shaping up to be the best yet. Tonhalle München is breathtaking and the dance floor is *chef's kiss*. See you all in May.",
    eventId: "4",
    communityId: "com1",
    mediaUrl: "https://picsum.photos/seed/munich_festival/800/500",
    likes: ["d4", "d8", "d12", "d13"],
    comments: [
      {
        id: "c15",
        authorId: "d12",
        content: "Flying in from Stockholm. Munich never disappoints.",
        createdAt: "2026-03-06T18:30:00Z",
      },
      {
        id: "c16",
        authorId: "d8",
        content: "European events have such a different energy. Love it.",
        createdAt: "2026-03-06T19:00:00Z",
      },
    ],
    createdAt: "2026-03-06T18:00:00Z",
  },
  {
    id: "p11",
    authorId: "d12",
    content: "Jack & Jill prelims energy is unmatched. The nerves, the excitement, the slightly too much coffee at 8am — and then you get on the floor and everything just disappears.",
    mediaUrl: "https://picsum.photos/seed/jj_prelims/800/600",
    communityId: "com5",
    likes: ["d2", "d4", "d8", "d11", "d15"],
    comments: [
      {
        id: "c17",
        authorId: "d2",
        content: "That feeling is why we do this whole thing.",
        createdAt: "2026-03-05T10:00:00Z",
      },
    ],
    createdAt: "2026-03-05T09:00:00Z",
  },
  {
    id: "p12",
    authorId: "d13",
    content: "Body movement workshop insight from yesterday: the hips don't lie, but they do take about 200 hours of practice to start telling the truth. Worth every minute.",
    likes: ["d9", "d11", "d12"],
    comments: [],
    createdAt: "2026-03-04T17:00:00Z",
  },
  {
    id: "p13",
    authorId: "d14",
    content: "Went to my first WCS social last week not knowing a single soul. Came back tonight and already felt like part of something. Is this what it's always like? Everyone is so welcoming.",
    likes: ["me", "d5", "d7", "d8", "d13"],
    comments: [
      {
        id: "c18",
        authorId: "d5",
        content: "Yes! This is why we dance. Welcome to the family 🕺",
        createdAt: "2026-03-03T22:15:00Z",
      },
      {
        id: "c19",
        authorId: "me",
        content: "WCS community is genuinely the best. Glad you found it!",
        createdAt: "2026-03-03T22:30:00Z",
      },
    ],
    createdAt: "2026-03-03T22:00:00Z",
  },
  {
    id: "p14",
    authorId: "d15",
    content: "Post-event existential dance crisis: you've just had the best weekend of dancing, driven home, and now the real world feels impossibly flat. The only cure is to find the next event.",
    likes: ["me", "d2", "d4", "d7", "d8"],
    comments: [
      {
        id: "c20",
        authorId: "d7",
        content: "Convention blues are real. Already looking at the next one 🫠",
        createdAt: "2026-03-02T19:00:00Z",
      },
    ],
    createdAt: "2026-03-02T18:00:00Z",
  },
  {
    id: "p15",
    authorId: "me",
    content: "Weekend intensive at Mission Dance with my partner. Anchor mechanics deep dive — we basically rebuilt everything from scratch. Painful, humbling, and absolutely necessary.",
    mediaUrl: "https://picsum.photos/seed/sf_intensive/800/600",
    likes: ["d2", "d4", "d8", "d15"],
    comments: [
      {
        id: "c21",
        authorId: "d15",
        content: "Mission Dance is so good for that. Let's compare notes this week!",
        createdAt: "2026-03-01T17:00:00Z",
      },
    ],
    createdAt: "2026-03-01T16:00:00Z",
  },
]
