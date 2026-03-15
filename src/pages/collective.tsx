import { useState } from "react"
import { useParams, Link } from "react-router"
import { MOCK_COLLECTIVES, COLLECTIVE_TYPE_LABELS } from "@/data/mock-collectives"
import { MOCK_COMMUNITIES } from "@/data/mock-communities"
import { MOCK_DANCERS, MOCK_POSTS } from "@/data/mock-social"
import { MOCK_EVENTS } from "@/data/mock-events"
import { useAuth } from "@/context/auth"
import { formatDistanceToNow } from "date-fns"

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: "#5A9CB5",
  workshop: "#b89000",
  intensive: "#b85000",
  party: "#6b7280",
  class: "#6b7280",
}

type CollectiveTab = "Posts" | "Events" | "About"

// ─── Mini post card ──────────────────────────────────────────────────────────

function MiniPostCard({ post }: { post: ReturnType<typeof MOCK_POSTS.find> }) {
  if (!post) return null
  const [liked, setLiked] = useState(post.likes.includes("me"))
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const author = MOCK_DANCERS.find((d) => d.id === post.authorId)

  const toggleLike = () => {
    setLiked((v) => !v)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
  }

  return (
    <article className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-start gap-3 p-4 pb-3">
        <Link to={`/profile/${author?.username}`} className="shrink-0">
          <img src={author?.avatar} alt={author?.name} className="size-8 rounded-full object-cover ring-1 ring-border" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${author?.username}`}
            className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
          >
            {author?.name}
          </Link>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      {post.mediaUrl && (
        <div className="aspect-[16/9] overflow-hidden">
          <img src={post.mediaUrl} alt="" className="size-full object-cover" />
        </div>
      )}
      <div className="px-4 py-3">
        <p className="text-[13px] leading-relaxed text-foreground line-clamp-3">{post.content}</p>
        <div className="mt-2 flex items-center gap-1">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 text-[12px] font-medium transition-colors ${
              liked ? "text-[#FA6868]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M2.5 4.5a3 3 0 014.242 0L8 5.757l1.258-1.257a3 3 0 014.242 4.243L8 14.5l-5.5-5.757a3 3 0 010-4.243z" strokeLinejoin="round" />
            </svg>
            {likeCount}
          </button>
          <span className="ml-2 text-[12px] text-muted-foreground">{post.comments.length} comments</span>
        </div>
      </div>
    </article>
  )
}

// ─── Events tab ───────────────────────────────────────────────────────────────

function EventsTab({ organizerName }: { organizerName: string }) {
  const events = MOCK_EVENTS.filter((e) => e.organizer === organizerName)
  if (events.length === 0) {
    return <p className="py-12 text-center text-[14px] text-muted-foreground">No events listed yet.</p>
  }
  return (
    <div className="space-y-3">
      {events.map((event) => {
        const typeColor = EVENT_TYPE_COLORS[event.type] ?? "#6b7280"
        const dateLabel = new Date(event.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        return (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="flex overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-border group"
          >
            <div className="w-1 shrink-0" style={{ backgroundColor: typeColor }} />
            <div className="flex flex-1 items-start gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
                    style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                  >
                    {event.type}
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{dateLabel} · {event.venue}, {event.location}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{event.attendees} attending · {event.price}</p>
              </div>
              <svg viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 mt-0.5 text-muted-foreground" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ─── About tab ────────────────────────────────────────────────────────────────

function AboutTab({ collectiveId }: { collectiveId: string }) {
  const collective = MOCK_COLLECTIVES.find((c) => c.id === collectiveId)
  if (!collective) return null
  const admins = MOCK_DANCERS.filter((d) => collective.admins.includes(d.id))
  const linkedCommunity = collective.communityHandle
    ? MOCK_COMMUNITIES.find((c) => c.handle === collective.communityHandle)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
        <p className="text-[14px] text-foreground leading-relaxed">{collective.description}</p>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Type</h3>
        <p className="text-[14px] text-foreground">{COLLECTIVE_TYPE_LABELS[collective.type]}</p>
      </div>
      {collective.website && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Website</h3>
          <a href={`https://${collective.website}`} className="text-[14px] text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            {collective.website}
          </a>
        </div>
      )}
      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Team</h3>
        <div className="space-y-2.5">
          {admins.map((admin) => (
            <Link key={admin.id} to={`/profile/${admin.username}`} className="flex items-center gap-3 group">
              <img src={admin.avatar} alt={admin.name} className="size-8 rounded-full object-cover ring-1 ring-border" />
              <div>
                <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">{admin.name}</p>
                <p className="text-[11px] text-muted-foreground">@{admin.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {linkedCommunity && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Community</h3>
          <Link
            to={`/community/${linkedCommunity.handle}`}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-border group"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary text-[14px] font-semibold shrink-0">
              {linkedCommunity.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {linkedCommunity.name}
              </p>
              <p className="text-[12px] text-muted-foreground">{linkedCommunity.memberCount.toLocaleString()} members</p>
            </div>
            <svg viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-muted-foreground" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      )}
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Founded</h3>
        <p className="text-[14px] text-foreground">{collective.foundedYear}</p>
      </div>
    </div>
  )
}

// ─── Collective page ──────────────────────────────────────────────────────────

export function CollectivePage() {
  const { handle } = useParams<{ handle: string }>()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<CollectiveTab>("Posts")
  const [isFollowing, setIsFollowing] = useState(false)

  const collective = MOCK_COLLECTIVES.find((c) => c.handle === handle)

  if (!collective) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Collective not found.</p>
      </div>
    )
  }

  const isAdmin = currentUser && collective.admins.includes(currentUser.id)
  const posts = MOCK_POSTS.filter((p) => collective.admins.includes(p.authorId)).slice(0, 6)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Cover */}
      <div className="h-36 md:h-48 w-full" style={{ background: collective.coverGradient }} />

      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="relative -mt-12 mb-6 flex items-end justify-between">
          <div className="size-24 rounded-2xl overflow-hidden ring-4 ring-background shadow-lg bg-card">
            <img src={collective.avatar} alt={collective.name} className="size-full object-cover" />
          </div>
          <div className="mb-1 flex gap-2">
            {isAdmin ? (
              <button className="rounded-lg border border-border/80 bg-card px-4 py-1.5 text-[13px] font-medium text-muted-foreground hover:border-border hover:text-foreground transition-colors">
                Manage
              </button>
            ) : (
              <button
                onClick={() => setIsFollowing((v) => !v)}
                className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all ${
                  isFollowing
                    ? "border border-border/80 bg-card text-muted-foreground hover:border-destructive hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Name + type */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{collective.name}</h1>
            <span className="rounded-full border border-border/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {COLLECTIVE_TYPE_LABELS[collective.type]}
            </span>
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">@{collective.handle}</p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 8.5a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {collective.location}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex gap-6 border-b border-border/50 pb-5">
          {[
            { label: "Posts", value: collective.postsCount },
            { label: "Events", value: collective.eventsOrganized },
            { label: "Since", value: collective.foundedYear },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[18px] font-bold tabular-nums text-foreground">{value}</p>
              <p className="text-[12px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border/50">
          {(["Posts", "Events", "About"] as CollectiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[13px] font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === "Posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="py-12 text-center text-[14px] text-muted-foreground">No posts yet.</p>
              ) : (
                posts.map((post) => <MiniPostCard key={post.id} post={post} />)
              )}
            </div>
          )}
          {activeTab === "Events" && <EventsTab organizerName={collective.name} />}
          {activeTab === "About" && <AboutTab collectiveId={collective.id} />}
        </div>
      </div>
    </div>
  )
}
