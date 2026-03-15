import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router"
import { MOCK_DANCERS } from "@/data/mock-social"
import { MOCK_COLLECTIVES } from "@/data/mock-collectives"
import { MOCK_COMMUNITIES, COMMUNITY_TYPE_LABELS } from "@/data/mock-communities"
import { MOCK_EVENTS } from "@/data/mock-events"
import { COLLECTIVE_TYPE_LABELS } from "@/data/mock-collectives"

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

type ResultKind = "person" | "collective" | "community" | "event"

interface SearchResult {
  kind: ResultKind
  id: string
  title: string
  subtitle: string
  href: string
  avatar?: string
}

const KIND_LABELS: Record<ResultKind, string> = {
  person: "Person",
  collective: "Collective",
  community: "Community",
  event: "Event",
}

const KIND_COLORS: Record<ResultKind, string> = {
  person: "#5A9CB5",
  collective: "#FAAC68",
  community: "#FACE68",
  event: "#FA6868",
}

function search(query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  MOCK_DANCERS.filter((d) => d.id !== "me")
    .filter((d) => d.name.toLowerCase().includes(q) || d.username.toLowerCase().includes(q) || d.location.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((d) =>
      results.push({
        kind: "person",
        id: d.id,
        title: d.name,
        subtitle: d.location,
        href: `/profile/${d.username}`,
        avatar: d.avatar,
      })
    )

  MOCK_COLLECTIVES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.handle.includes(q)
  )
    .slice(0, 3)
    .forEach((c) =>
      results.push({
        kind: "collective",
        id: c.id,
        title: c.name,
        subtitle: `${COLLECTIVE_TYPE_LABELS[c.type]} · ${c.location}`,
        href: `/collective/${c.handle}`,
        avatar: c.avatar,
      })
    )

  MOCK_COMMUNITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.handle.includes(q) || c.description.toLowerCase().includes(q)
  )
    .slice(0, 3)
    .forEach((c) =>
      results.push({
        kind: "community",
        id: c.id,
        title: c.name,
        subtitle: `${COMMUNITY_TYPE_LABELS[c.type]} · ${c.memberCount.toLocaleString()} members`,
        href: `/community/${c.handle}`,
      })
    )

  MOCK_EVENTS.filter(
    (e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q)
  )
    .slice(0, 3)
    .forEach((e) =>
      results.push({
        kind: "event",
        id: e.id,
        title: e.title,
        subtitle: `${new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${e.location}`,
        href: `/events/${e.id}`,
      })
    )

  return results
}

// Group results by kind
function groupResults(results: SearchResult[]): { kind: ResultKind; items: SearchResult[] }[] {
  const order: ResultKind[] = ["person", "collective", "community", "event"]
  return order
    .map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.items.length > 0)
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = search(query)
  const groups = groupResults(results)

  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (!open) onClose() // toggle — parent handles open
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  const handleSelect = useCallback(
    (href: string) => {
      navigate(href)
      onClose()
    },
    [navigate, onClose]
  )

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-20 z-50 w-full max-w-lg -translate-x-1/2 px-4">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-2xl shadow-black/10">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="size-4 shrink-0 text-muted-foreground"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="9" cy="9" r="5.5" />
              <path d="M15 15l3 3" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search people, collectives, communities, events…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden shrink-0 rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>

          {/* Results */}
          {query.trim() === "" ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                Search across people, collectives, communities, and events.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                No results for <span className="font-medium text-foreground">"{query}"</span>
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto py-2">
              {groups.map((group) => (
                <div key={group.kind} className="mb-1">
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: `${KIND_COLORS[group.kind]}20`,
                        color: KIND_COLORS[group.kind],
                      }}
                    >
                      {KIND_LABELS[group.kind]}
                    </span>
                  </div>
                  {group.items.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result.href)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      {result.avatar ? (
                        <img
                          src={result.avatar}
                          alt={result.title}
                          className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border"
                        />
                      ) : (
                        <div
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                          style={{ backgroundColor: KIND_COLORS[group.kind] }}
                        >
                          {result.title[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{result.title}</p>
                        <p className="text-[12px] text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="size-3.5 shrink-0 text-muted-foreground/50"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
