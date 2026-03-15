import { useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EVENT_TYPE_LABELS } from "@/data/mock-events"
import type { EventType } from "@/data/mock-events"

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface TicketTier {
  id: string
  name: string
  price: string
  description: string
  onSale: boolean
}

interface ScheduleBlock {
  id: string
  startTime: string
  endTime: string
  title: string
  note: string
}

// ---------------------------------------------------------------------------
// Type accent maps
// ---------------------------------------------------------------------------

const TYPE_CHIP_SELECTED: Record<EventType, string> = {
  party:     "bg-violet-400/15 text-violet-700 ring-1 ring-inset ring-violet-400/40",
  intensive: "bg-orange-400/15 text-orange-700 ring-1 ring-inset ring-orange-400/40",
  workshop:  "bg-yellow-400/15 text-yellow-700 ring-1 ring-inset ring-yellow-400/40",
  class:     "bg-emerald-400/15 text-emerald-700 ring-1 ring-inset ring-emerald-400/40",
  festival:  "bg-sky-400/15 text-sky-700 ring-1 ring-inset ring-sky-400/40",
}

const TYPE_CHIP_UNSELECTED: Record<EventType, string> = {
  party:     "bg-violet-400/8 text-violet-500 hover:bg-violet-400/12",
  intensive: "bg-orange-400/8 text-orange-500 hover:bg-orange-400/12",
  workshop:  "bg-yellow-400/8 text-yellow-500 hover:bg-yellow-400/12",
  class:     "bg-emerald-400/8 text-emerald-500 hover:bg-emerald-400/12",
  festival:  "bg-sky-400/8 text-sky-500 hover:bg-sky-400/12",
}

const TYPE_DOT: Record<EventType, string> = {
  party:     "bg-violet-400",
  intensive: "bg-orange-400",
  workshop:  "bg-yellow-400",
  class:     "bg-emerald-400",
  festival:  "bg-sky-400",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return Math.random().toString(36).slice(2)
}

// ---------------------------------------------------------------------------
// Small reusable components
// ---------------------------------------------------------------------------

/** Custom toggle pill — accessible, smooth slide */
interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  size?: "md" | "sm"
  "aria-label"?: string
}

function Toggle({ checked, onChange, id, size = "md", "aria-label": ariaLabel }: ToggleProps) {
  const isSm = size === "sm"
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "relative shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        isSm ? "h-5 w-9" : "h-6 w-11",
        checked ? "bg-primary" : "bg-border",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 rounded-full bg-white shadow-sm transition-transform duration-200",
          isSm ? "size-4" : "size-5",
          isSm
            ? (checked ? "translate-x-4" : "translate-x-0.5")
            : (checked ? "translate-x-[22px]" : "translate-x-0.5"),
        ].join(" ")}
      />
    </button>
  )
}

/** Shared textarea styling */
const textareaClass =
  "w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground/40 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/50 resize-none"

/** Section shell */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border/60 p-5 space-y-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Field label */
function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium">
      {children}
    </label>
  )
}

// ---------------------------------------------------------------------------
// Icons (inline SVG — no external dep)
// ---------------------------------------------------------------------------

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3 text-muted-foreground/40" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function IconChevronUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-8 text-muted-foreground/25" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-8 text-muted-foreground/25" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Empty state component
// ---------------------------------------------------------------------------

function EmptyState({
  icon,
  title,
  subtitle,
  onAdd,
  addLabel,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onAdd: () => void
  addLabel: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 p-8 text-center">
      {icon}
      <div>
        <p className="text-sm font-medium text-foreground/80">{title}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground/60">{subtitle}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <IconPlus />
        {addLabel}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export function ListEventPage() {
  // Event type
  const [primaryType, setPrimaryType] = useState<EventType | "">("")
  const [secondaryTypes, setSecondaryTypes] = useState<Set<EventType>>(new Set())

  // Basic info
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [level, setLevel] = useState("")
  const [isWsdc, setIsWsdc] = useState(false)

  // Date & time
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("")

  // Location
  const [venue, setVenue] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")

  // Tickets
  const [tickets, setTickets] = useState<TicketTier[]>([])

  // Schedule
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([])

  // ---------------------------------------------------------------------------
  // Derived helpers
  // ---------------------------------------------------------------------------

  const allTypes = Object.keys(EVENT_TYPE_LABELS) as EventType[]

  function toggleSecondaryType(t: EventType) {
    setSecondaryTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) {
        next.delete(t)
      } else {
        next.add(t)
      }
      return next
    })
  }

  function handlePrimaryTypeSelect(t: EventType) {
    setPrimaryType((prev) => {
      if (prev === t) return ""
      // Remove from secondary if it becomes primary
      setSecondaryTypes((prevSec) => {
        const next = new Set(prevSec)
        next.delete(t)
        return next
      })
      return t
    })
  }

  // ---------------------------------------------------------------------------
  // Ticket helpers
  // ---------------------------------------------------------------------------

  function addTicket() {
    setTickets((prev) => [
      ...prev,
      { id: generateId(), name: "", price: "", description: "", onSale: true },
    ])
  }

  function removeTicket(id: string) {
    setTickets((prev) => prev.filter((t) => t.id !== id))
  }

  function updateTicket(id: string, patch: Partial<TicketTier>) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function moveTicket(index: number, dir: -1 | 1) {
    setTickets((prev) => {
      const next = [...prev]
      const swap = index + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[index], next[swap]] = [next[swap], next[index]]
      return next
    })
  }

  // ---------------------------------------------------------------------------
  // Schedule helpers
  // ---------------------------------------------------------------------------

  function addBlock() {
    setSchedule((prev) => [
      ...prev,
      { id: generateId(), startTime: "", endTime: "", title: "", note: "" },
    ])
  }

  function removeBlock(id: string) {
    setSchedule((prev) => prev.filter((b) => b.id !== id))
  }

  function updateBlock(id: string, patch: Partial<ScheduleBlock>) {
    setSchedule((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function moveBlock(index: number, dir: -1 | 1) {
    setSchedule((prev) => {
      const next = [...prev]
      const swap = index + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[index], next[swap]] = [next[swap], next[index]]
      return next
    })
  }

  // ---------------------------------------------------------------------------
  // Level options
  // ---------------------------------------------------------------------------

  const LEVELS = ["All Levels", "Beginner", "Intermediate", "Intermediate+", "Advanced"]

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight />
        <span className="text-foreground">List an event</span>
      </nav>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">List your event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reach thousands of West Coast Swing dancers. Fill in the details below to get started.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Section: Event type                                                 */}
        {/* ------------------------------------------------------------------ */}
        <Section title="Event type">
          {/* Primary type chips */}
          <div>
            <Label>Primary type</Label>
            <div className="flex flex-wrap gap-2">
              {allTypes.map((t) => {
                const selected = primaryType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handlePrimaryTypeSelect(t)}
                    className={[
                      "inline-flex items-center gap-2 rounded-lg py-2.5 px-4 text-sm font-medium transition-colors cursor-pointer",
                      selected ? TYPE_CHIP_SELECTED[t] : TYPE_CHIP_UNSELECTED[t],
                    ].join(" ")}
                  >
                    <span className={`size-2 rounded-full shrink-0 ${TYPE_DOT[t]}`} />
                    {EVENT_TYPE_LABELS[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Secondary type chips — exclude current primary */}
          <div>
            <p className="mb-2 text-[12px] font-medium text-muted-foreground/70">
              Also includes{" "}
              <span className="font-normal text-muted-foreground/50">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allTypes
                .filter((t) => t !== primaryType)
                .map((t) => {
                  const selected = secondaryTypes.has(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleSecondaryType(t)}
                      className={[
                        "inline-flex items-center gap-1.5 rounded-md py-1 px-3 text-[12px] font-medium transition-colors cursor-pointer",
                        selected ? TYPE_CHIP_SELECTED[t] : TYPE_CHIP_UNSELECTED[t],
                      ].join(" ")}
                    >
                      <span className={`size-1.5 rounded-full shrink-0 ${TYPE_DOT[t]}`} />
                      {EVENT_TYPE_LABELS[t]}
                    </button>
                  )
                })}
            </div>
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Event details                                              */}
        {/* ------------------------------------------------------------------ */}
        <Section title="Event details">
          {/* Event name */}
          <div>
            <Label htmlFor="title">Event name</Label>
            <Input
              id="title"
              placeholder="e.g. Swingtime in the Rockies"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Tell dancers what to expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={textareaClass}
            />
          </div>

          {/* Dance level — pill button group */}
          <div>
            <Label>Dance level</Label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => {
                const selected = level === l
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(selected ? "" : l)}
                    className={[
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                      selected
                        ? "bg-foreground text-background"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
          </div>

          {/* WSDC toggle */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <div>
              <label htmlFor="wsdc-toggle" className="text-sm font-medium cursor-pointer">
                WSDC Points Event
              </label>
              <p className="text-[12px] text-muted-foreground/60">
                This event awards WSDC points
              </p>
            </div>
            <Toggle
              id="wsdc-toggle"
              checked={isWsdc}
              onChange={setIsWsdc}
              aria-label="Toggle WSDC points event"
            />
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Date & time                                                */}
        {/* ------------------------------------------------------------------ */}
        <Section title="Date & time">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">
                End date{" "}
                <span className="font-normal text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="sm:w-1/2">
            <Label htmlFor="startTime">Start time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Location                                                   */}
        {/* ------------------------------------------------------------------ */}
        <Section title="Location">
          <div>
            <Label htmlFor="venue">Venue name</Label>
            <Input
              id="venue"
              placeholder="e.g. The Norse Hall"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City / Region</Label>
            <Input
              id="city"
              placeholder="e.g. Portland, OR"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Tickets                                                    */}
        {/* ------------------------------------------------------------------ */}
        <Section title="Tickets">
          {/* Section header row */}
          <div className="-mt-1 flex items-center justify-between">
            <span className="text-[13px] font-medium text-foreground/80">Ticket tiers</span>
            {tickets.length > 0 && (
              <Button type="button" variant="outline" size="xs" onClick={addTicket}>
                <IconPlus />
                Add ticket
              </Button>
            )}
          </div>

          {/* Empty state */}
          {tickets.length === 0 && (
            <EmptyState
              icon={<IconCalendar />}
              title="No tickets yet"
              subtitle="Add your first ticket tier — Early Bird, General, VIP..."
              onAdd={addTicket}
              addLabel="Add ticket"
            />
          )}

          {/* Ticket cards */}
          <div className="space-y-3">
            {tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
              >
                {/* Header row: reorder + name + on-sale + delete */}
                <div className="flex items-center gap-2">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label="Move ticket up"
                      disabled={index === 0}
                      onClick={() => moveTicket(index, -1)}
                      className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-25 transition-colors"
                    >
                      <IconChevronUp />
                    </button>
                    <button
                      type="button"
                      aria-label="Move ticket down"
                      disabled={index === tickets.length - 1}
                      onClick={() => moveTicket(index, 1)}
                      className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-25 transition-colors"
                    >
                      <IconChevronDown />
                    </button>
                  </div>

                  {/* Tier name */}
                  <input
                    type="text"
                    aria-label="Ticket name"
                    placeholder="Ticket name"
                    value={ticket.name}
                    onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />

                  {/* On-sale toggle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-muted-foreground/60 select-none">
                      {ticket.onSale ? "On sale" : "Hidden"}
                    </span>
                    <Toggle
                      checked={ticket.onSale}
                      onChange={(v) => updateTicket(ticket.id, { onSale: v })}
                      size="sm"
                      aria-label={`Toggle sale status for ${ticket.name || "ticket"}`}
                    />
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    aria-label="Remove ticket tier"
                    onClick={() => removeTicket(ticket.id)}
                    className="ml-1 shrink-0 rounded p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <IconX />
                  </button>
                </div>

                {/* Price row */}
                <div>
                  <label
                    htmlFor={`ticket-price-${ticket.id}`}
                    className="mb-1.5 block text-[12px] font-medium text-muted-foreground/70"
                  >
                    Price
                  </label>
                  <div className="flex h-9 overflow-hidden rounded-lg border border-input">
                    <span className="flex items-center bg-muted/40 px-2.5 text-sm text-muted-foreground select-none border-r border-input">
                      $
                    </span>
                    <input
                      id={`ticket-price-${ticket.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={ticket.price}
                      onChange={(e) => updateTicket(ticket.id, { price: e.target.value })}
                      className="min-w-0 flex-1 bg-input/30 px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground/40 focus:outline-none focus:ring-[3px] focus:ring-ring/50"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground/50">Enter 0 for free</p>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor={`ticket-desc-${ticket.id}`}
                    className="mb-1.5 block text-[12px] font-medium text-muted-foreground/70"
                  >
                    Description{" "}
                    <span className="font-normal text-muted-foreground/40">(optional)</span>
                  </label>
                  <textarea
                    id={`ticket-desc-${ticket.id}`}
                    rows={2}
                    placeholder="Optional description..."
                    value={ticket.description}
                    onChange={(e) => updateTicket(ticket.id, { description: e.target.value })}
                    className={textareaClass}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add more button — only when tickets exist */}
          {tickets.length > 0 && (
            <button
              type="button"
              onClick={addTicket}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 py-2.5 text-[13px] text-muted-foreground/60 hover:border-border hover:text-muted-foreground transition-colors"
            >
              <IconPlus />
              Add another tier
            </button>
          )}
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* Section: Schedule                                                   */}
        {/* ------------------------------------------------------------------ */}
        <Section title="Schedule">
          {/* Section header row */}
          <div className="-mt-1 flex items-center justify-between">
            <span className="text-[13px] font-medium text-foreground/80">Schedule blocks</span>
            {schedule.length > 0 && (
              <Button type="button" variant="outline" size="xs" onClick={addBlock}>
                <IconPlus />
                Add block
              </Button>
            )}
          </div>

          {/* Empty state */}
          {schedule.length === 0 && (
            <EmptyState
              icon={<IconClock />}
              title="No schedule yet"
              subtitle="Map out your event — workshops, socials, competitions..."
              onAdd={addBlock}
              addLabel="Add block"
            />
          )}

          {/* Schedule block cards */}
          <div className="space-y-3">
            {schedule.map((block, index) => (
              <div
                key={block.id}
                className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
              >
                {/* Top row: reorder + times + title + delete */}
                <div className="flex items-center gap-2">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label="Move block up"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, -1)}
                      className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-25 transition-colors"
                    >
                      <IconChevronUp />
                    </button>
                    <button
                      type="button"
                      aria-label="Move block down"
                      disabled={index === schedule.length - 1}
                      onClick={() => moveBlock(index, 1)}
                      className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-25 transition-colors"
                    >
                      <IconChevronDown />
                    </button>
                  </div>

                  {/* Time range — compact inline */}
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="time"
                      aria-label="Block start time"
                      value={block.startTime}
                      onChange={(e) => updateBlock(block.id, { startTime: e.target.value })}
                      className="w-[6.5rem] rounded-md border border-input bg-input/30 px-2 py-1 text-[12px] text-muted-foreground transition-colors focus:outline-none focus:ring-[3px] focus:ring-ring/50"
                    />
                    <span className="text-[11px] text-muted-foreground/40">–</span>
                    <input
                      type="time"
                      aria-label="Block end time"
                      value={block.endTime}
                      onChange={(e) => updateBlock(block.id, { endTime: e.target.value })}
                      className="w-[6.5rem] rounded-md border border-input bg-input/30 px-2 py-1 text-[12px] text-muted-foreground transition-colors focus:outline-none focus:ring-[3px] focus:ring-ring/50"
                    />
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    aria-label="Block title"
                    placeholder="Block title"
                    value={block.title}
                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />

                  {/* Delete */}
                  <button
                    type="button"
                    aria-label="Remove schedule block"
                    onClick={() => removeBlock(block.id)}
                    className="ml-1 shrink-0 rounded p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <IconX />
                  </button>
                </div>

                {/* Note */}
                <textarea
                  rows={2}
                  aria-label="Block note"
                  placeholder="Optional note..."
                  value={block.note}
                  onChange={(e) => updateBlock(block.id, { note: e.target.value })}
                  className={textareaClass}
                />
              </div>
            ))}
          </div>

          {/* Add more button — only when schedule has items */}
          {schedule.length > 0 && (
            <button
              type="button"
              onClick={addBlock}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 py-2.5 text-[13px] text-muted-foreground/60 hover:border-border hover:text-muted-foreground transition-colors"
            >
              <IconPlus />
              Add another block
            </button>
          )}
        </Section>

        {/* ------------------------------------------------------------------ */}
        {/* Form footer                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-6">
          <p className="text-[11px] text-muted-foreground/60">
            Your event will be reviewed before publishing.
          </p>
          <Button type="submit">Submit event</Button>
        </div>
      </form>
    </div>
  )
}
