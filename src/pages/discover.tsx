import { useState, useMemo } from "react"
import { Link } from "react-router"
import { MOCK_DANCERS, MOCK_POSTS } from "@/data/mock-social"
import type { MockDancer } from "@/data/mock-social"
import { MOCK_COLLECTIVES, COLLECTIVE_TYPE_LABELS } from "@/data/mock-collectives"
import type { MockCollective } from "@/data/mock-collectives"
import { MOCK_COMMUNITIES, COMMUNITY_TYPE_LABELS, COMMUNITY_TYPE_COLORS } from "@/data/mock-communities"
import type { MockCommunity } from "@/data/mock-communities"
import { useAuth } from "@/context/auth"

type DiscoverTab = "People" | "Collectives" | "Communities"

// ─── Dancer card ─────────────────────────────────────────────────────────────

function DancerCard({ dancer }: { dancer: MockDancer }) {
  const [following, setFollowing] = useState(["d2", "d4", "d6", "d8", "d9"].includes(dancer.id))
  const recentPost = MOCK_POSTS.find((p) => p.authorId === dancer.id && p.mediaUrl)
  const mutualCount = dancer.followers.filter((id) =>
    MOCK_DANCERS.find((d) => d.id === id)?.following.includes("me")
  ).length

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden hover:border-border transition-all group">
      <div className="relative aspect-[16/7] overflow-hidden bg-muted">
        {recentPost?.mediaUrl ? (
          <img
            src={recentPost.mediaUrl}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full" style={{ background: "linear-gradient(135deg, rgba(148,163,184,0.12) 0%, rgba(148,163,184,0.04) 100%)" }} />
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${dancer.username}`} className="-mt-8 shrink-0 relative z-10">
            <img src={dancer.avatar} alt={dancer.name} className="size-12 rounded-full object-cover ring-2 ring-background" />
          </Link>
          <div className="flex-1 min-w-0 pt-0.5">
            <Link
              to={`/profile/${dancer.username}`}
              className="block text-[14px] font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {dancer.name}
            </Link>
            <p className="text-[12px] text-muted-foreground">@{dancer.username}</p>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{dancer.bio}</p>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 8.5a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{dancer.location}</span>
          {mutualCount > 0 && <><span className="text-border">·</span><span>{mutualCount} mutual</span></>}
        </div>
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <button
            onClick={() => setFollowing((v) => !v)}
            className={`flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all ${
              following
                ? "border border-border/80 bg-transparent text-muted-foreground hover:border-destructive hover:text-destructive"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
          <Link
            to={`/profile/${dancer.username}`}
            className="rounded-lg border border-border/60 px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:border-border hover:text-foreground transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Collective card ──────────────────────────────────────────────────────────

function CollectiveCard({ collective }: { collective: MockCollective }) {
  const [following, setFollowing] = useState(collective.followers.includes("me"))

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden hover:border-border transition-all group">
      <div className="h-20 overflow-hidden" style={{ background: collective.coverGradient }} />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <Link to={`/collective/${collective.handle}`} className="-mt-8 shrink-0 relative z-10">
            <img src={collective.avatar} alt={collective.name} className="size-12 rounded-xl object-cover ring-2 ring-background shadow-sm" />
          </Link>
          <div className="flex-1 min-w-0 pt-0.5">
            <Link
              to={`/collective/${collective.handle}`}
              className="block text-[14px] font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {collective.name}
            </Link>
            <span className="text-[11px] text-muted-foreground border border-border/60 rounded-full px-1.5 py-0.5">
              {COLLECTIVE_TYPE_LABELS[collective.type]}
            </span>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{collective.description}</p>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 8.5a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{collective.location}</span>
          <span className="text-border">·</span>
          <span>since {collective.foundedYear}</span>
        </div>
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <button
            onClick={() => setFollowing((v) => !v)}
            className={`flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all ${
              following
                ? "border border-border/80 bg-transparent text-muted-foreground hover:border-destructive hover:text-destructive"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
          <Link
            to={`/collective/${collective.handle}`}
            className="rounded-lg border border-border/60 px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:border-border hover:text-foreground transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Community card ───────────────────────────────────────────────────────────

function CommunityCard({ community }: { community: MockCommunity }) {
  const [joined, setJoined] = useState(community.members.includes("me"))
  const typeColor = COMMUNITY_TYPE_COLORS[community.type]
  const memberCount = community.memberCount + (joined ? 0 : 0) // already accounts for "me"

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden hover:border-border transition-all">
      <div className="h-2 w-full" style={{ backgroundColor: typeColor }} />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white text-lg font-bold"
            style={{ backgroundColor: typeColor }}
          >
            {community.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              to={`/community/${community.handle}`}
              className="block text-[14px] font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {community.name}
            </Link>
            <span
              className="text-[11px] font-medium rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
            >
              {COMMUNITY_TYPE_LABELS[community.type]}
            </span>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{community.description}</p>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <svg viewBox="0 0 20 20" fill="none" className="size-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM2 18a8 8 0 0116 0H2z" strokeLinecap="round" />
          </svg>
          <span>{memberCount.toLocaleString()} members</span>
        </div>
        <div className="flex items-center gap-2 pt-1 mt-auto">
          <button
            onClick={() => setJoined((v) => !v)}
            className={`flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all ${
              joined
                ? "border border-border/80 bg-transparent text-muted-foreground hover:border-destructive hover:text-destructive"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {joined ? "Joined" : "Join"}
          </button>
          <Link
            to={`/community/${community.handle}`}
            className="rounded-lg border border-border/60 px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:border-border hover:text-foreground transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Discover page ────────────────────────────────────────────────────────────

export function DiscoverPage() {
  useAuth()
  const [activeTab, setActiveTab] = useState<DiscoverTab>("People")
  const [search, setSearch] = useState("")

  const filteredDancers = useMemo(() => {
    let dancers = MOCK_DANCERS.filter((d) => d.id !== "me")
    if (search.trim()) {
      const q = search.toLowerCase()
      dancers = dancers.filter(
        (d) => d.name.toLowerCase().includes(q) || d.username.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
      )
    }
    return dancers
  }, [search])

  const filteredCollectives = useMemo(() => {
    if (!search.trim()) return MOCK_COLLECTIVES
    const q = search.toLowerCase()
    return MOCK_COLLECTIVES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.handle.includes(q)
    )
  }, [search])

  const filteredCommunities = useMemo(() => {
    if (!search.trim()) return MOCK_COMMUNITIES
    const q = search.toLowerCase()
    return MOCK_COMMUNITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.handle.includes(q) || c.description.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Discover</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Find dancers, collectives, and communities in the West Coast Swing world.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <svg viewBox="0 0 20 20" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="5.5" />
            <path d="M15 15l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card pl-10 pr-4 py-2.5 text-[14px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border/50">
          {(["People", "Collectives", "Communities"] as DiscoverTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearch("") }}
              className={`px-4 py-2 text-[13px] font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* People */}
        {activeTab === "People" && (
          filteredDancers.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-muted-foreground">No dancers found.</p>
          ) : (
            <>
              <p className="mb-4 text-[13px] text-muted-foreground">{filteredDancers.length} dancers</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredDancers.map((d) => <DancerCard key={d.id} dancer={d} />)}
              </div>
            </>
          )
        )}

        {/* Collectives */}
        {activeTab === "Collectives" && (
          filteredCollectives.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-muted-foreground">No collectives found.</p>
          ) : (
            <>
              <p className="mb-4 text-[13px] text-muted-foreground">{filteredCollectives.length} collectives</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCollectives.map((c) => <CollectiveCard key={c.id} collective={c} />)}
              </div>
            </>
          )
        )}

        {/* Communities */}
        {activeTab === "Communities" && (
          filteredCommunities.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-muted-foreground">No communities found.</p>
          ) : (
            <>
              <p className="mb-4 text-[13px] text-muted-foreground">{filteredCommunities.length} communities</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCommunities.map((c) => <CommunityCard key={c.id} community={c} />)}
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}
