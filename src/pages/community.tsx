import { useState } from "react"
import { useParams, Link } from "react-router"
import {
  MOCK_COMMUNITIES,
  COMMUNITY_TYPE_LABELS,
  COMMUNITY_TYPE_COLORS,
} from "@/data/mock-communities"
import { MOCK_COLLECTIVES } from "@/data/mock-collectives"
import { MOCK_DANCERS, MOCK_POSTS } from "@/data/mock-social"
import { MOCK_EVENTS } from "@/data/mock-events"
import { useAuth } from "@/context/auth"
import { formatDistanceToNow } from "date-fns"

type CommunityTab = "Posts" | "Members" | "About"

// ─── Post card (community context) ───────────────────────────────────────────

function CommunityPostCard({
  post,
}: {
  post: (typeof MOCK_POSTS)[number]
}) {
  const [liked, setLiked] = useState(post.likes.includes("me"))
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [showComments, setShowComments] = useState(false)
  const author = MOCK_DANCERS.find((d) => d.id === post.authorId)

  if (!author) return null

  const toggleLike = () => {
    setLiked((v) => !v)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
  }

  return (
    <article className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <Link to={`/profile/${author.username}`} className="shrink-0">
          <img src={author.avatar} alt={author.name} className="size-9 rounded-full object-cover ring-1 ring-border" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${author.username}`}
            className="text-[14px] font-semibold text-foreground hover:text-primary transition-colors"
          >
            {author.name}
          </Link>
          <p className="text-[12px] text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {post.mediaUrl && (
        <div className="aspect-[4/3] overflow-hidden">
          <img src={post.mediaUrl} alt="" className="size-full object-cover" />
        </div>
      )}

      <div className="px-4 py-3">
        <p className="text-[14px] leading-relaxed text-foreground">{post.content}</p>
      </div>

      <div className="flex items-center gap-1 px-4 pb-3">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all ${
            liked ? "text-[#FA6868]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <svg viewBox="0 0 20 20" className="size-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" strokeLinejoin="round" />
          </svg>
          {likeCount > 0 && likeCount}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8.5A6.5 6.5 0 018.5 2h3A6.5 6.5 0 0118 8.5v.25A6.5 6.5 0 0111.5 15h-.5l-3.5 3v-3H8.5A6.5 6.5 0 012 8.75V8.5z" strokeLinejoin="round" />
          </svg>
          {post.comments.length > 0 && post.comments.length}
        </button>
      </div>

      {showComments && post.comments.length > 0 && (
        <div className="border-t border-border/50 px-4 py-3 space-y-3">
          {post.comments.map((comment) => {
            const ca = MOCK_DANCERS.find((d) => d.id === comment.authorId)
            return (
              <div key={comment.id} className="flex gap-2.5">
                <img src={ca?.avatar} alt={ca?.name} className="size-7 rounded-full object-cover shrink-0 mt-0.5" />
                <div className="rounded-xl bg-muted/60 px-3 py-2 flex-1">
                  <p className="text-[12px] font-semibold text-foreground">{ca?.name}</p>
                  <p className="text-[13px] text-foreground/90">{comment.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}

// ─── Post composer ────────────────────────────────────────────────────────────

function CommunityComposer({ communityName }: { communityName: string }) {
  const { currentUser } = useAuth()
  const [text, setText] = useState("")
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex gap-3">
        <img src={currentUser?.avatar} alt={currentUser?.name} className="size-9 shrink-0 rounded-full object-cover" />
        <div className="flex-1">
          <textarea
            className="w-full resize-none rounded-lg bg-muted/50 px-3 py-2.5 text-[14px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[72px]"
            placeholder={`Post to ${communityName}…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              disabled={!text.trim()}
              className="rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Members tab ──────────────────────────────────────────────────────────────

function MembersTab({ memberIds }: { memberIds: string[] }) {
  const members = MOCK_DANCERS.filter((d) => memberIds.includes(d.id))
  if (members.length === 0)
    return <p className="py-12 text-center text-[14px] text-muted-foreground">No members shown.</p>
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {members.map((m) => (
        <Link
          key={m.id}
          to={`/profile/${m.username}`}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-border group"
        >
          <img src={m.avatar} alt={m.name} className="size-10 rounded-full object-cover ring-1 ring-border shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {m.name}
            </p>
            <p className="text-[12px] text-muted-foreground truncate">{m.location}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ─── About tab ────────────────────────────────────────────────────────────────

function AboutTab({ communityId }: { communityId: string }) {
  const community = MOCK_COMMUNITIES.find((c) => c.id === communityId)
  if (!community) return null

  const linkedCollective = community.collectiveId
    ? MOCK_COLLECTIVES.find((c) => c.id === community.collectiveId)
    : null
  const linkedEvent = community.eventId ? MOCK_EVENTS.find((e) => e.id === community.eventId) : null
  const typeColor = COMMUNITY_TYPE_COLORS[community.type]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
        <p className="text-[14px] text-foreground leading-relaxed">{community.description}</p>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Type</h3>
        <span
          className="rounded-full px-2.5 py-1 text-[12px] font-medium"
          style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
        >
          {COMMUNITY_TYPE_LABELS[community.type]}
        </span>
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Visibility</h3>
        <p className="text-[14px] text-foreground">{community.isPublic ? "Public — anyone can join" : "Private"}</p>
      </div>
      {linkedCollective && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Managed by
          </h3>
          <Link
            to={`/collective/${linkedCollective.handle}`}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-border group"
          >
            <img src={linkedCollective.avatar} alt={linkedCollective.name} className="size-9 rounded-full object-cover ring-1 ring-border" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {linkedCollective.name}
              </p>
              <p className="text-[12px] text-muted-foreground">{linkedCollective.location}</p>
            </div>
          </Link>
        </div>
      )}
      {linkedEvent && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Event</h3>
          <Link
            to={`/events/${linkedEvent.id}`}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-border group"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-[#FA6868]/10 shrink-0">
              <svg viewBox="0 0 16 16" fill="none" className="size-4 text-[#FA6868]" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <path d="M5 1.5v3M11 1.5v3M2 7h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {linkedEvent.title}
              </p>
              <p className="text-[12px] text-muted-foreground">{linkedEvent.location}</p>
            </div>
          </Link>
        </div>
      )}
      <div>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Created</h3>
        <p className="text-[14px] text-foreground">
          {new Date(community.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  )
}

// ─── Community page ───────────────────────────────────────────────────────────

export function CommunityPage() {
  const { handle } = useParams<{ handle: string }>()
  const [activeTab, setActiveTab] = useState<CommunityTab>("Posts")
  const [joined, setJoined] = useState(false)

  const community = MOCK_COMMUNITIES.find((c) => c.handle === handle)

  if (!community) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Community not found.</p>
      </div>
    )
  }

  const typeColor = COMMUNITY_TYPE_COLORS[community.type]
  const posts = MOCK_POSTS.filter((p) => p.communityId === community.id)
  const memberCount = community.memberCount + (joined ? 1 : 0)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Cover */}
      <div
        className="h-32 md:h-44 w-full"
        style={{
          background: `linear-gradient(135deg, ${typeColor}40 0%, ${typeColor}18 100%)`,
        }}
      />

      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="relative -mt-8 mb-5 flex items-end justify-between">
          <div
            className="flex size-16 items-center justify-center rounded-2xl text-white text-2xl font-bold shadow-lg ring-4 ring-background"
            style={{ backgroundColor: typeColor }}
          >
            {community.name[0]}
          </div>
          <div className="mb-0.5">
            <button
              onClick={() => setJoined((v) => !v)}
              className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all ${
                joined
                  ? "border border-border/80 bg-card text-muted-foreground hover:border-destructive hover:text-destructive"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {joined ? "Joined" : "Join"}
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{community.name}</h1>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${typeColor}18`, color: typeColor }}
            >
              {COMMUNITY_TYPE_LABELS[community.type]}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground leading-relaxed max-w-xl">
            {community.description}
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">{memberCount.toLocaleString()}</span> members
          </p>
        </div>

        {/* Member avatars */}
        <div className="mb-6 flex -space-x-2 border-b border-border/50 pb-5">
          {MOCK_DANCERS.filter((d) => community.members.includes(d.id))
            .slice(0, 6)
            .map((d) => (
              <img key={d.id} src={d.avatar} alt={d.name} className="size-7 rounded-full object-cover ring-2 ring-background" />
            ))}
          {community.memberCount > 6 && (
            <div className="flex size-7 items-center justify-center rounded-full bg-muted ring-2 ring-background text-[10px] font-medium text-muted-foreground">
              +{(community.memberCount - 6).toLocaleString()}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border/50">
          {(["Posts", "Members", "About"] as CommunityTab[]).map((tab) => (
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
              <CommunityComposer communityName={community.name} />
              {posts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-muted-foreground">No posts in this community yet. Be the first.</p>
                </div>
              ) : (
                posts.map((post) => <CommunityPostCard key={post.id} post={post} />)
              )}
            </div>
          )}
          {activeTab === "Members" && <MembersTab memberIds={community.members} />}
          {activeTab === "About" && <AboutTab communityId={community.id} />}
        </div>
      </div>
    </div>
  )
}
