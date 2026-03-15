import { useState, useRef, useMemo } from "react"
import { useParams, useLocation, Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_EVENTS } from "@/data/mock-events"
import { MOCK_TICKET_DATA } from "@/data/mock-tickets"
import type { EventTicketData, PricingTier } from "@/data/mock-tickets"

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentTier(tiers: PricingTier[]): PricingTier {
  const now = new Date()
  for (const tier of tiers) {
    if (!tier.endsAt || new Date(tier.endsAt) > now) return tier
  }
  return tiers[tiers.length - 1]
}

function fmt(price: number, currency: string): string {
  const sym = { USD: "$", EUR: "€", GBP: "£" }[currency] ?? `${currency} `
  return `${sym}${price}`
}

// ── Booking state ─────────────────────────────────────────────────────────────

interface Booking {
  passId: string | null
  role: "leader" | "follower" | null
  partnerMode: "with-partner" | "solo-waitlist" | null
  partnerName: string
  partnerEmail: string
  addOnIds: string[]
}

const EMPTY: Booking = {
  passId: null,
  role: null,
  partnerMode: null,
  partnerName: "",
  partnerEmail: "",
  addOnIds: [],
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function RadioDot({ active }: { active: boolean }) {
  return (
    <div
      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        active ? "border-foreground bg-foreground" : "border-muted-foreground/35"
      }`}
    >
      {active && <div className="size-1.5 rounded-full bg-background" />}
    </div>
  )
}

function SectionDone({
  n,
  title,
  summary,
  onEdit,
}: {
  n: number
  title: string
  summary: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3.5">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary">
        <svg
          viewBox="0 0 14 14"
          fill="none"
          className="size-3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11.5 3.5L5.5 10 2.5 7" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {n}. {title}
        </p>
        <p className="truncate text-sm font-medium">{summary}</p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 text-[12px] font-medium text-primary underline underline-offset-2 transition-opacity hover:opacity-70"
      >
        Edit
      </button>
    </div>
  )
}

function SectionCard({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground">
          <span className="text-[11px] font-bold text-background">{n}</span>
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

// ── Section 1: Pass ───────────────────────────────────────────────────────────

function PassSection({
  data,
  booking,
  onSelect,
}: {
  data: EventTicketData
  booking: Booking
  onSelect: (passId: string) => void
}) {
  return (
    <SectionCard n={1} title="Choose your pass">
      <div className="space-y-2.5">
        {data.passes.map((pass) => {
          const tier = getCurrentTier(pass.tiers)
          const futureTiers = pass.tiers.filter((t) => t.id !== tier.id)
          const selected = booking.passId === pass.id

          return (
            <button
              key={pass.id}
              onClick={() => onSelect(pass.id)}
              className={`w-full rounded-xl border text-left transition-all ${
                selected
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/60 hover:border-foreground/20 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <RadioDot active={selected} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-sm font-semibold">{pass.name}</span>
                      {pass.recommended && (
                        <span className="ml-2 text-[10px] font-semibold text-primary">
                          ★ Most popular
                        </span>
                      )}
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {pass.tagline}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold tabular-nums">
                        {fmt(tier.price, pass.currency)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{tier.label}</p>
                    </div>
                  </div>

                  {/* Expanded includes when selected */}
                  {selected && (
                    <div className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
                      {pass.includes.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <svg
                            viewBox="0 0 14 14"
                            fill="none"
                            className="mt-0.5 size-3 shrink-0 text-primary"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11.5 3.5L5.5 10 2.5 7" />
                          </svg>
                          <span className="text-[12px] text-foreground">{item}</span>
                        </div>
                      ))}
                      {futureTiers.length > 0 && (
                        <p className="pt-1 text-[11px] text-muted-foreground">
                          Then:{" "}
                          {futureTiers
                            .map(
                              (t) =>
                                `${fmt(t.price, pass.currency)} ${t.label.toLowerCase()}`,
                            )
                            .join(" · ")}
                        </p>
                      )}
                      {pass.spotsLeft !== undefined && pass.spotsLeft <= 60 && (
                        <p className="text-[11px] font-medium text-orange-500">
                          ⚡ {pass.spotsLeft} spots remaining
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ── Section 2: Role & Partner ────────────────────────────────────────────────

function RoleSection({
  booking,
  onUpdate,
  onConfirm,
}: {
  booking: Booking
  onUpdate: (patch: Partial<Booking>) => void
  onConfirm: () => void
}) {
  const valid =
    booking.role !== null &&
    booking.partnerMode !== null &&
    (booking.partnerMode !== "with-partner" || booking.partnerName.trim() !== "")

  return (
    <SectionCard n={2} title="Your role & partner">
      <div className="space-y-6">
        {/* Role */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            I'll be dancing as
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {(["leader", "follower"] as const).map((r) => (
              <button
                key={r}
                onClick={() => onUpdate({ role: r })}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-4 text-center transition-all ${
                  booking.role === r
                    ? "bg-foreground text-background"
                    : "border border-border hover:border-foreground/25"
                }`}
              >
                <span className="text-sm font-semibold capitalize">{r}</span>
                <span
                  className={`text-[11px] leading-snug ${
                    booking.role === r ? "text-background/65" : "text-muted-foreground"
                  }`}
                >
                  {r === "leader" ? "Guide the connection" : "Interpret & respond"}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/55">
            Both roles are equally valued.
          </p>
        </div>

        {/* Partner */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Are you coming with a partner?
          </p>
          <div className="space-y-2">
            {/* With partner */}
            <button
              onClick={() => onUpdate({ partnerMode: "with-partner" })}
              className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                booking.partnerMode === "with-partner"
                  ? "border-foreground bg-muted/30"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <RadioDot active={booking.partnerMode === "with-partner"} />
              <div>
                <p className="text-sm font-medium">Yes, I have a partner</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Enter their name so we can confirm the pairing.
                </p>
              </div>
            </button>

            {/* Partner fields — inline expansion */}
            {booking.partnerMode === "with-partner" && (
              <div className="space-y-2 px-1 pb-1">
                <Input
                  placeholder="Partner's full name"
                  value={booking.partnerName}
                  onChange={(e) => onUpdate({ partnerName: e.target.value })}
                  className="text-sm"
                  autoFocus
                />
                <Input
                  placeholder="Partner's email — optional, for their confirmation"
                  value={booking.partnerEmail}
                  onChange={(e) => onUpdate({ partnerEmail: e.target.value })}
                  className="text-sm"
                />
              </div>
            )}

            {/* Solo / waitlist */}
            <button
              onClick={() => onUpdate({ partnerMode: "solo-waitlist" })}
              className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                booking.partnerMode === "solo-waitlist"
                  ? "border-foreground bg-muted/30"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <RadioDot active={booking.partnerMode === "solo-waitlist"} />
              <div>
                <p className="text-sm font-medium">No — match me with a partner</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  You'll join our partner pool. We'll introduce you by email at least
                  48 hours before the event.
                </p>
              </div>
            </button>
          </div>
        </div>

        <Button className="w-full" disabled={!valid} onClick={onConfirm}>
          Continue
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="ml-1.5 size-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
        </Button>
      </div>
    </SectionCard>
  )
}

// ── Section 3: Add-ons ────────────────────────────────────────────────────────

function AddOnsSection({
  data,
  booking,
  onToggle,
  onConfirm,
}: {
  data: EventTicketData
  booking: Booking
  onToggle: (id: string) => void
  onConfirm: () => void
}) {
  const selectedCount = booking.addOnIds.length
  const selectedTotal = data.addOns
    .filter((a) => booking.addOnIds.includes(a.id))
    .reduce((s, a) => s + a.price, 0)

  return (
    <SectionCard n={3} title="Add-ons & extras">
      <div className="space-y-4">
        <p className="text-[13px] text-muted-foreground">
          Optional. Skip by clicking Continue if you don't need anything extra.
        </p>

        <div className="space-y-2">
          {data.addOns.map((addOn) => {
            const selected = booking.addOnIds.includes(addOn.id)
            return (
              <button
                key={addOn.id}
                onClick={() => onToggle(addOn.id)}
                disabled={addOn.soldOut}
                className={`w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? "border-foreground bg-muted/30"
                    : addOn.soldOut
                    ? "cursor-not-allowed border-border/30 opacity-40"
                    : "border-border hover:border-foreground/20"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded transition-colors ${
                    selected ? "bg-foreground" : "border border-muted-foreground/30"
                  }`}
                >
                  {selected && (
                    <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{addOn.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {addOn.description}
                  </p>
                  {addOn.spotsLeft !== undefined && addOn.spotsLeft <= 8 && (
                    <p className="mt-1 text-[11px] font-medium text-orange-500">
                      ⚡ {addOn.spotsLeft} spots left
                    </p>
                  )}
                </div>

                <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                  +{fmt(addOn.price, addOn.currency)}
                </span>
              </button>
            )
          })}
        </div>

        {selectedCount > 0 && (
          <p className="text-[12px] text-muted-foreground">
            {selectedCount} add-on{selectedCount > 1 ? "s" : ""} selected ·{" "}
            <span className="font-semibold">+{fmt(selectedTotal, data.currency)}</span>
          </p>
        )}

        <Button className="w-full" onClick={onConfirm}>
          Continue
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="ml-1.5 size-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M10 4v12M4 10l6 6 6-6" />
          </svg>
        </Button>
      </div>
    </SectionCard>
  )
}

// ── Section 4: Review ─────────────────────────────────────────────────────────

function ReviewSection({
  data,
  booking,
  onSubmit,
}: {
  data: EventTicketData
  booking: Booking
  onSubmit: () => void
}) {
  const selectedPass = data.passes.find((p) => p.id === booking.passId)!
  const currentTier = getCurrentTier(selectedPass.tiers)
  const selectedAddOns = data.addOns.filter((a) => booking.addOnIds.includes(a.id))
  const total = currentTier.price + selectedAddOns.reduce((s, a) => s + a.price, 0)
  const partnerLine =
    booking.partnerMode === "with-partner"
      ? booking.partnerName
      : "Waitlist — we'll match you"

  return (
    <SectionCard n={4} title="Review & complete">
      <div className="space-y-4">
        {/* Summary table */}
        <div className="divide-y divide-border/60 rounded-xl border border-border/60 overflow-hidden">
          {/* Pass */}
          <div className="flex items-start justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{selectedPass.name}</p>
              <p className="text-[12px] text-muted-foreground">{currentTier.label}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {fmt(currentTier.price, data.currency)}
            </span>
          </div>

          {/* Role + partner */}
          <div className="bg-muted/20 px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{booking.role}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Partner</span>
              <span className="font-medium">{partnerLine}</span>
            </div>
          </div>

          {/* Add-ons */}
          {selectedAddOns.length > 0 && (
            <div className="px-4 py-3 space-y-1.5">
              {selectedAddOns.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{a.name}</span>
                  <span className="tabular-nums">+{fmt(a.price, a.currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-xl font-bold tabular-nums">
              {fmt(total, data.currency)}
            </span>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={onSubmit}>
          Complete Registration
        </Button>

        <p className="text-center text-[11px] text-muted-foreground/60">
          Free cancellation up to 48 hours before the event starts. No hidden fees.
        </p>
      </div>
    </SectionCard>
  )
}

// ── Section 5: Confirmed ──────────────────────────────────────────────────────

function ConfirmedSection({
  data,
  booking,
  eventTitle,
}: {
  data: EventTicketData
  booking: Booking
  eventTitle: string
}) {
  const selectedPass = data.passes.find((p) => p.id === booking.passId)!
  const currentTier = getCurrentTier(selectedPass.tiers)
  const selectedAddOns = data.addOns.filter((a) => booking.addOnIds.includes(a.id))
  const total = currentTier.price + selectedAddOns.reduce((s, a) => s + a.price, 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
      <div className="flex flex-col items-center px-6 pb-8 pt-8 text-center">
        {/* Check */}
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/15">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-6 text-primary"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-lg font-bold">You're registered!</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Your spot at {eventTitle} is confirmed.
          {booking.partnerMode === "solo-waitlist" &&
            " We'll match you with a partner and reach out at least 48 hours before the event."}
        </p>
      </div>

      <div className="mx-5 mb-5 divide-y divide-border/60 rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="flex justify-between px-4 py-2.5 text-[13px]">
          <span className="text-muted-foreground">Pass</span>
          <span className="font-medium">{selectedPass.name}</span>
        </div>
        <div className="flex justify-between px-4 py-2.5 text-[13px]">
          <span className="text-muted-foreground">Role</span>
          <span className="font-medium capitalize">{booking.role}</span>
        </div>
        {booking.partnerMode === "with-partner" && booking.partnerName && (
          <div className="flex justify-between px-4 py-2.5 text-[13px]">
            <span className="text-muted-foreground">Partner</span>
            <span className="font-medium">{booking.partnerName}</span>
          </div>
        )}
        {selectedAddOns.length > 0 && (
          <div className="flex justify-between px-4 py-2.5 text-[13px]">
            <span className="text-muted-foreground">Add-ons</span>
            <span className="font-medium">
              {selectedAddOns.map((a) => a.name).join(", ")}
            </span>
          </div>
        )}
        <div className="flex justify-between px-4 py-2.5 text-[13px]">
          <span className="text-muted-foreground">Total paid</span>
          <span className="font-bold tabular-nums">{fmt(total, data.currency)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function EventRegisterPage() {
  const { id } = useParams()
  const { state } = useLocation()

  const event = useMemo(() => MOCK_EVENTS.find((e) => e.id === id), [id])
  const data = id ? MOCK_TICKET_DATA[id] : undefined

  const [booking, setBooking] = useState<Booking>(() => ({
    ...EMPTY,
    passId: state?.passId ?? null,
  }))

  // Section visibility flags
  const [roleConfirmed, setRoleConfirmed] = useState(false)
  const [addOnsConfirmed, setAddOnsConfirmed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Scroll refs (scroll-mt-4 so the section header isn't flush against the nav)
  const roleSectionRef = useRef<HTMLDivElement>(null)
  const addonsSectionRef = useRef<HTMLDivElement>(null)
  const reviewSectionRef = useRef<HTMLDivElement>(null)
  const confirmedRef = useRef<HTMLDivElement>(null)

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 80)
  }

  function selectPass(passId: string) {
    setBooking({ ...EMPTY, passId })
    setRoleConfirmed(false)
    setAddOnsConfirmed(false)
    scrollTo(roleSectionRef)
  }

  function editPass() {
    setBooking(EMPTY)
    setRoleConfirmed(false)
    setAddOnsConfirmed(false)
  }

  function confirmRole() {
    setRoleConfirmed(true)
    scrollTo(addonsSectionRef)
  }

  function editRole() {
    setRoleConfirmed(false)
    setAddOnsConfirmed(false)
  }

  function confirmAddOns() {
    setAddOnsConfirmed(true)
    scrollTo(reviewSectionRef)
  }

  function editAddOns() {
    setAddOnsConfirmed(false)
  }

  function submitRegistration() {
    setSubmitted(true)
    scrollTo(confirmedRef)
  }

  if (!event || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    )
  }

  const selectedPass = data.passes.find((p) => p.id === booking.passId)
  const passCurrentTier = selectedPass ? getCurrentTier(selectedPass.tiers) : null

  const roleSummary = booking.role
    ? `${booking.role.charAt(0).toUpperCase() + booking.role.slice(1)} · ${
        booking.partnerMode === "with-partner"
          ? booking.partnerName || "Partner TBD"
          : "Partner pool"
      }`
    : ""

  const addOnsSummary =
    booking.addOnIds.length > 0
      ? data.addOns
          .filter((a) => booking.addOnIds.includes(a.id))
          .map((a) => a.name)
          .join(", ")
      : "No add-ons"

  const passSelected = booking.passId !== null

  return (
    <>
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        {/* Back nav */}
        <Link
          to={`/events/${id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to event
        </Link>

        {/* Event context header */}
        <div className="mb-8">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Registration
          </p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{event.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.venue} · {event.location}
          </p>
        </div>

        {/* Early bird alert */}
        {passCurrentTier?.endsAt &&
          (() => {
            const days = Math.ceil(
              (new Date(passCurrentTier.endsAt).getTime() - Date.now()) / 86400000,
            )
            return days > 0 && days <= 14 ? (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-400/8">
                <span className="text-base">⚡</span>
                <p className="text-[13px] font-medium text-amber-800 dark:text-amber-400">
                  Early bird pricing ends in{" "}
                  <span className="font-semibold">{days} {days === 1 ? "day" : "days"}</span>.
                </p>
              </div>
            ) : null
          })()}

        {/* ── Flow sections ── */}
        <div className="space-y-3">

          {/* 1 · Pass */}
          {passSelected ? (
            <SectionDone
              n={1}
              title="Pass"
              summary={`${selectedPass?.name} · ${passCurrentTier ? fmt(passCurrentTier.price, data.currency) : ""} ${passCurrentTier?.label ?? ""}`}
              onEdit={editPass}
            />
          ) : (
            <PassSection data={data} booking={booking} onSelect={selectPass} />
          )}

          {/* 2 · Role & Partner */}
          {passSelected && (
            <div ref={roleSectionRef} className="scroll-mt-4">
              {roleConfirmed ? (
                <SectionDone
                  n={2}
                  title="Role & Partner"
                  summary={roleSummary}
                  onEdit={editRole}
                />
              ) : (
                <RoleSection
                  booking={booking}
                  onUpdate={(patch) => setBooking((b) => ({ ...b, ...patch }))}
                  onConfirm={confirmRole}
                />
              )}
            </div>
          )}

          {/* 3 · Add-ons */}
          {passSelected && roleConfirmed && (
            <div ref={addonsSectionRef} className="scroll-mt-4">
              {addOnsConfirmed ? (
                <SectionDone
                  n={3}
                  title="Add-ons"
                  summary={addOnsSummary}
                  onEdit={editAddOns}
                />
              ) : (
                <AddOnsSection
                  data={data}
                  booking={booking}
                  onToggle={(aid) =>
                    setBooking((b) => ({
                      ...b,
                      addOnIds: b.addOnIds.includes(aid)
                        ? b.addOnIds.filter((x) => x !== aid)
                        : [...b.addOnIds, aid],
                    }))
                  }
                  onConfirm={confirmAddOns}
                />
              )}
            </div>
          )}

          {/* 4 · Review */}
          {passSelected && roleConfirmed && addOnsConfirmed && !submitted && (
            <div ref={reviewSectionRef} className="scroll-mt-4">
              <ReviewSection
                data={data}
                booking={booking}
                onSubmit={submitRegistration}
              />
            </div>
          )}

          {/* 5 · Confirmed */}
          {submitted && (
            <div ref={confirmedRef} className="scroll-mt-4">
              <ConfirmedSection
                data={data}
                booking={booking}
                eventTitle={event.title}
              />
            </div>
          )}
        </div>

        {/* Bottom padding so the last section isn't flush against the footer */}
        <div className="h-12" />
      </div>
    </>
  )
}
