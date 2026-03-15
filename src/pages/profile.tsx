import { useState } from "react"
import { useParams, Link } from "react-router"
import { MOCK_DANCERS, MOCK_POSTS } from "@/data/mock-social"
import { MOCK_EVENTS } from "@/data/mock-events"
import { useAuth } from "@/context/auth"
import { formatDistanceToNow } from "date-fns"

// ─── Level badge ──────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<string, { bg: string; color: string; gradient: string }> = {
  Newcomer: {
    bg: "rgba(148,163,184,0.12)",
    color: "#64748b",
    gradient: "linear-gradient(135deg, oklch(0.945 0.003 250) 0%, oklch(0.96 0.003 250) 100%)",
  },
  Novice: {
    bg: "rgba(250,206,104,0.18)",
    color: "#8a6000",
    gradient: "linear-gradient(135deg, #fdf6dc 0%, #fffbf0 100%)",
  },
  Intermediate: {
    bg: "rgba(250,172,104,0.18)",
    color: "#8a4400",
    gradient: "linear-gradient(135deg, #fdf0e0 0%, #fffaf5 100%)",
  },
  Advanced: {
    bg: "rgba(90,156,181,0.18)",
    color: "#1e6680",
    gradient: "linear-gradient(135deg, #e0f0f8 0%, #f5fbff 100%)",
  },
  "All-Star": {
    bg: "rgba(250,104,104,0.18)",
    color: "#c01818",
    gradient: "linear-gradient(135deg, #fde8e8 0%, #fff5f5 100%)",
  },
}

// ─── Event type colors ────────────────────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: "#5A9CB5",
  workshop: "#b89000",
  intensive: "#b85000",
  party: "#6b7280",
  class: "#6b7280",
}

// ─── Post thumbnail grid ──────────────────────────────────────────────────────

function PostsGrid({ dancerId }: { dancerId: string }) {
  const posts = MOCK_POSTS.filter((p) => p.authorId === dancerId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[14px] text-muted-foreground">No posts yet.</p>
      </div>
    )
  }

  const expandedPost = posts.find((p) => p.id === expandedId)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-muted text-left transition-all hover:ring-2 hover:ring-primary/30"
          >
            {post.mediaUrl ? (
              <img
                src={post.mediaUrl}
                alt=""
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="size-full flex items-center justify-center p-4 bg-muted/60">
                <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-4">{post.content}</p>
              </div>
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-foreground/0 transition-all group-hover:bg-foreground/10" />
            <div className="absolute bottom-2 left-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white">
                <svg viewBox="0 0 16 16" fill="currentColor" className="size-3">
                  <path d="M1.5 4.5A3.5 3.5 0 018 2.35 3.5 3.5 0 0114.5 4.5c0 3.5-6.5 9-6.5 9s-6.5-5.5-6.5-9z" />
                </svg>
                {post.likes.length}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded post */}
      {expandedPost && (
        <div className="mt-4 rounded-xl border border-border/60 bg-card p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[14px] leading-relaxed text-foreground">{expandedPost.content}</p>
          {expandedPost.mediaUrl && (
            <img
              src={expandedPost.mediaUrl}
              alt=""
              className="mt-3 w-full rounded-lg object-cover max-h-80"
            />
          )}
          <p className="mt-2 text-[12px] text-muted-foreground">
            {expandedPost.likes.length} likes · {expandedPost.comments.length} comments ·{" "}
            {formatDistanceToNow(new Date(expandedPost.createdAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Events tab ───────────────────────────────────────────────────────────────

function EventsTab({ dancerId }: { dancerId: string }) {
  const attendingEventIds = ["1", "4", "10", "22"].slice(0, dancerId === "me" ? 4 : 2)
  const events = MOCK_EVENTS.filter((e) => attendingEventIds.includes(e.id))

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
            <div className="flex flex-1 items-start gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
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
                <p className="mt-0.5 text-[13px] text-muted-foreground">{dateLabel}</p>
                <p className="text-[13px] text-muted-foreground">{event.venue}, {event.location}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground">{event.attendees} attending</span>
                  <span className="text-[12px] font-medium" style={{ color: typeColor }}>{event.price}</span>
                </div>
              </div>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="size-4 shrink-0 text-muted-foreground mt-0.5"
                stroke="currentColor"
                strokeWidth="1.5"
              >
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

function AboutTab({ dancerId }: { dancerId: string }) {
  const dancer = dancerId === "me"
    ? MOCK_DANCERS[0]
    : MOCK_DANCERS.find((d) => d.id === dancerId)

  if (!dancer) return null

  const danceStyles = ["West Coast Swing", "Blues", "Fusion"]
  const studioName = {
    "me": "Bay Area WCS",
    "d2": "SoCal WCS",
    "d4": "PDX Swing",
  }[dancerId] ?? "Local WCS Community"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Bio</h3>
        <p className="text-[14px] text-foreground leading-relaxed">{dancer.bio}</p>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Dance styles</h3>
        <div className="flex flex-wrap gap-2">
          {danceStyles.map((style) => (
            <span
              key={style}
              className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[13px] text-foreground"
            >
              {style}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Division</h3>
        <p className="text-[14px] text-foreground">{dancer.level}</p>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Home community
        </h3>
        <p className="text-[14px] text-foreground">{studioName}</p>
        <p className="text-[13px] text-muted-foreground">{dancer.location}</p>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Member since</h3>
        <p className="text-[14px] text-foreground">January 2024</p>
      </div>
    </div>
  )
}

// ─── Profile page ─────────────────────────────────────────────────────────────

type ProfileTab = "Posts" | "Events" | "About"

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>("Posts")
  const [isFollowing, setIsFollowing] = useState(false)

  const isOwnProfile = username === "me" || username === currentUser?.username

  const dancer = isOwnProfile
    ? MOCK_DANCERS[0]
    : MOCK_DANCERS.find((d) => d.username === username)

  if (!dancer) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Dancer not found.</p>
      </div>
    )
  }

  const levelStyle = LEVEL_STYLES[dancer.level] ?? LEVEL_STYLES["Newcomer"]
  const dancerId = isOwnProfile ? "me" : dancer.id

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Cover */}
      <div
        className="h-36 md:h-48 w-full"
        style={{ background: levelStyle.gradient }}
      />

      {/* Profile header */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative -mt-12 mb-6 flex items-end justify-between">
          <div
            className="size-24 rounded-2xl p-0.5 shadow-md"
            style={{
              background:
                dancer.level === "All-Star"
                  ? "linear-gradient(135deg, #FA6868 0%, #FAAC68 100%)"
                  : dancer.level === "Advanced"
                  ? "linear-gradient(135deg, #5A9CB5 0%, #FACE68 100%)"
                  : levelStyle.gradient,
            }}
          >
            <img
              src={dancer.avatar}
              alt={dancer.name}
              className="size-full rounded-[14px] object-cover ring-2 ring-background"
            />
          </div>

          {isOwnProfile ? (
            <button className="mb-1 rounded-lg border border-border/80 bg-card px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground">
              Edit profile
            </button>
          ) : (
            <div className="mb-1 flex gap-2">
              <button className="rounded-lg border border-border/60 bg-card px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground">
                Message
              </button>
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
            </div>
          )}
        </div>

        {/* Name + info */}
        <div className="mb-5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{dancer.name}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">@{dancer.username}</p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <svg viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 8.5a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {dancer.location}
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-6 flex gap-6 border-b border-border/50 pb-5">
          {[
            { label: "Posts", value: dancer.postsCount },
            { label: "Events", value: dancer.eventsAttended },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[18px] font-bold tabular-nums text-foreground">{value}</p>
              <p className="text-[12px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border/50">
          {(["Posts", "Events", "About"] as ProfileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[13px] font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-12">
          {activeTab === "Posts" && <PostsGrid dancerId={dancerId} />}
          {activeTab === "Events" && <EventsTab dancerId={dancerId} />}
          {activeTab === "About" && <AboutTab dancerId={dancerId} />}
        </div>
      </div>
    </div>
  )
}
