import { useState } from "react"
import { Link } from "react-router"
import { useAuth } from "@/context/auth"
import { MOCK_DANCERS, MOCK_POSTS, type MockPost } from "@/data/mock-social"
import { MOCK_EVENTS } from "@/data/mock-events"
import { MOCK_COMMUNITIES } from "@/data/mock-communities"
import { formatDistanceToNow } from "date-fns"

// ─── Event type colors ────────────────────────────────────────────────────────

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: "#5A9CB5",
  workshop: "#b89000",
  intensive: "#b85000",
  party: "#6b7280",
  class: "#6b7280",
}

// ─── Time format ─────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ""
  }
}

// ─── Post composer ────────────────────────────────────────────────────────────

function PostComposer() {
  const { currentUser } = useAuth()
  const [text, setText] = useState("")

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex gap-3">
        <div className="size-9 shrink-0 rounded-full overflow-hidden bg-muted">
          <img src={currentUser?.avatar} alt={currentUser?.name} className="size-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            className="w-full resize-none rounded-lg bg-muted/50 px-3 py-2.5 text-[14px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all min-h-[72px]"
            placeholder="Share a dance moment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1">
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="16" height="12" rx="2" />
                  <circle cx="7" cy="8.5" r="1.5" />
                  <path d="M2 13.5l4-4 3 3 3-3 4 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Photo
              </button>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5">
                  <path
                    d="M3 6a2 2 0 012-2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
                    strokeLinejoin="round"
                  />
                  <path d="M14 8.5l3-2v7l-3-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Video
              </button>
              <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 2a6 6 0 110 12A6 6 0 0110 2z" />
                  <path d="M10 8v4M10 8a2 2 0 100-4 2 2 0 000 4z" strokeLinecap="round" />
                </svg>
                Event
              </button>
            </div>
            <button
              disabled={!text.trim()}
              className="rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Event snippet ────────────────────────────────────────────────────────────

function EventSnippet({ eventId }: { eventId: string }) {
  const event = MOCK_EVENTS.find((e) => e.id === eventId)
  if (!event) return null

  const typeColor = EVENT_TYPE_COLORS[event.type] ?? "#6b7280"
  const dateLabel = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Link
      to={`/events/${event.id}`}
      className="mt-3 flex overflow-hidden rounded-lg border border-border/60 bg-muted/30 transition-colors hover:bg-muted/60"
    >
      <div className="w-1 shrink-0" style={{ backgroundColor: typeColor }} />
      <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{event.title}</p>
          <p className="text-[12px] text-muted-foreground">
            {dateLabel} · {event.location}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
            style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
          >
            {event.type}
          </span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="size-3.5 text-muted-foreground"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: MockPost }) {
  const [liked, setLiked] = useState(post.likes.includes("me"))
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")

  const author = MOCK_DANCERS.find((d) => d.id === post.authorId)
  const { currentUser } = useAuth()
  if (!author) return null

  const toggleLike = () => {
    setLiked((v) => !v)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
  }

  const commentAuthors = (id: string) => MOCK_DANCERS.find((d) => d.id === id)

  return (
    <article className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Author row */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <Link to={`/profile/${author.username}`} className="shrink-0">
          <img src={author.avatar} alt={author.name} className="size-9 rounded-full object-cover ring-1 ring-border" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${author.username}`}
              className="text-[14px] font-semibold text-foreground hover:text-primary transition-colors"
            >
              {author.name}
            </Link>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[12px] text-muted-foreground">{timeAgo(post.createdAt)}</p>
            {post.communityId && (() => {
              const community = MOCK_COMMUNITIES.find((c) => c.id === post.communityId)
              return community ? (
                <>
                  <span className="text-[12px] text-muted-foreground/50">·</span>
                  <Link
                    to={`/community/${community.handle}`}
                    className="text-[12px] text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {community.name}
                  </Link>
                </>
              ) : null
            })()}
          </div>
        </div>
        <button className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <circle cx="10" cy="5" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="10" cy="15" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4">
        <p className="text-[14px] leading-relaxed text-foreground">{post.content}</p>
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className="mt-3 aspect-[4/3] overflow-hidden">
          <img src={post.mediaUrl} alt="" className="size-full object-cover" />
        </div>
      )}

      {/* Event snippet */}
      {post.eventId && (
        <div className="px-4">
          <EventSnippet eventId={post.eventId} />
        </div>
      )}

      {/* Interaction bar */}
      <div className="flex items-center gap-1 px-4 py-3 mt-1">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all ${
            liked ? "text-[#FA6868]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <svg
            viewBox="0 0 20 20"
            className="size-4"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M2 8.5A6.5 6.5 0 018.5 2h3A6.5 6.5 0 0118 8.5v.25A6.5 6.5 0 0111.5 15h-.5l-3.5 3v-3H8.5A6.5 6.5 0 012 8.75V8.5z"
              strokeLinejoin="round"
            />
          </svg>
          {post.comments.length > 0 && <span>{post.comments.length}</span>}
        </button>

        <button className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 10l-5-5v3C6 8.5 4 12 3 17c2.5-3 5-4.5 9-4.5V15l5-5z" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border/50 px-4 py-3 space-y-3">
          {post.comments.map((comment) => {
            const commentAuthor = commentAuthors(comment.authorId)
            return (
              <div key={comment.id} className="flex gap-2.5">
                <img
                  src={commentAuthor?.avatar}
                  alt={commentAuthor?.name}
                  className="size-7 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl bg-muted/60 px-3 py-2">
                    <p className="text-[12px] font-semibold text-foreground">{commentAuthor?.name}</p>
                    <p className="text-[13px] text-foreground/90">{comment.content}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground px-1">{timeAgo(comment.createdAt)}</p>
                </div>
              </div>
            )
          })}

          {/* Add comment */}
          <div className="flex gap-2.5">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="size-7 rounded-full object-cover shrink-0 mt-0.5"
            />
            <div className="flex-1 flex gap-2">
              <input
                className="flex-1 min-w-0 rounded-full bg-muted/60 px-3 py-1.5 text-[13px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Write a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              {newComment.trim() && (
                <button
                  onClick={() => setNewComment("")}
                  className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

// ─── Upcoming events sidebar widget ──────────────────────────────────────────

function UpcomingEventsWidget() {
  const upcoming = MOCK_EVENTS.filter((e) => e.date >= "2026-03-15").slice(0, 4)

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-foreground">Connections are attending</h3>
        <Link to="/events" className="text-[12px] text-primary hover:text-primary/80 transition-colors">
          See all
        </Link>
      </div>
      <div className="space-y-3">
        {upcoming.map((event) => {
          const typeColor = EVENT_TYPE_COLORS[event.type] ?? "#6b7280"
          const dateLabel = new Date(event.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          return (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="flex gap-3 group"
            >
              <div
                className="w-0.5 shrink-0 rounded-full"
                style={{ backgroundColor: typeColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {event.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {dateLabel} · {event.city}
                </p>
                <div className="mt-1 flex -space-x-1.5">
                  {MOCK_DANCERS.slice(0, 3).map((d) => (
                    <img
                      key={d.id}
                      src={d.avatar}
                      alt={d.name}
                      className="size-5 rounded-full object-cover ring-1 ring-background"
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-2 self-center">
                    +{Math.floor(Math.random() * 30) + 5} going
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Suggested dancers sidebar widget ────────────────────────────────────────

function SuggestedDancersWidget() {
  const [followed, setFollowed] = useState<Set<string>>(new Set())
  const suggestions = MOCK_DANCERS.filter(
    (d) => d.id !== "me" && !["d2", "d4", "d6", "d8", "d9"].includes(d.id)
  ).slice(0, 4)

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-foreground">Suggested dancers</h3>
        <Link to="/discover" className="text-[12px] text-primary hover:text-primary/80 transition-colors">
          See all
        </Link>
      </div>
      <div className="space-y-3">
        {suggestions.map((dancer) => (
          <div key={dancer.id} className="flex items-center gap-2.5">
            <Link to={`/profile/${dancer.username}`} className="shrink-0">
              <img
                src={dancer.avatar}
                alt={dancer.name}
                className="size-8 rounded-full object-cover ring-1 ring-border"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                to={`/profile/${dancer.username}`}
                className="block text-[13px] font-medium text-foreground hover:text-primary transition-colors truncate"
              >
                {dancer.name}
              </Link>
              <span className="text-[11px] text-muted-foreground truncate">{dancer.location}</span>
            </div>
            <button
              onClick={() =>
                setFollowed((prev) => {
                  const next = new Set(prev)
                  next.has(dancer.id) ? next.delete(dancer.id) : next.add(dancer.id)
                  return next
                })
              }
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
                followed.has(dancer.id)
                  ? "bg-muted text-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {followed.has(dancer.id) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feed page ────────────────────────────────────────────────────────────────

export function FeedPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex gap-6">
          {/* Main feed */}
          <main className="flex-1 min-w-0 space-y-4">
            <PostComposer />
            {MOCK_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </main>

          {/* Sidebar */}
          <aside className="w-72 shrink-0 hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <UpcomingEventsWidget />
              <SuggestedDancersWidget />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
