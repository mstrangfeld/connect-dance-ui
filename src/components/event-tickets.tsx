import { useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { MOCK_TICKET_DATA } from "@/data/mock-tickets"
import type { PricingTier, TicketPass, TicketAddOn } from "@/data/mock-tickets"

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentTier(tiers: PricingTier[]): PricingTier {
  const now = new Date()
  for (const tier of tiers) {
    if (!tier.endsAt || new Date(tier.endsAt) > now) return tier
  }
  return tiers[tiers.length - 1]
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function fmt(price: number, currency: string): string {
  const sym = { USD: "$", EUR: "€", GBP: "£" }[currency] ?? `${currency} `
  return `${sym}${price}`
}

// ── Pass Card ─────────────────────────────────────────────────────────────────

function PassCard({
  pass,
  eventId,
}: {
  pass: TicketPass
  eventId: string
}) {
  const navigate = useNavigate()
  const currentTier = getCurrentTier(pass.tiers)
  const futureTiers = pass.tiers.filter((t) => t.id !== currentTier.id)
  const daysLeft = currentTier.endsAt ? daysUntil(currentTier.endsAt) : null

  function handleSelect() {
    navigate(`/events/${eventId}/register`, { state: { passId: pass.id } })
  }

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
        pass.recommended
          ? "border-primary/40 ring-1 ring-primary/20 shadow-sm"
          : "border-border/60"
      }`}
    >
      {pass.recommended && (
        <div className="mb-4 flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <svg viewBox="0 0 12 12" fill="currentColor" className="size-2.5">
              <path d="M6 1l1.2 3.6H11L8.1 6.8l1.2 3.6L6 8.2l-3.3 2.2 1.2-3.6L1 4.6h3.8z" />
            </svg>
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-base font-bold">{pass.name}</h3>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{pass.tagline}</p>
      </div>

      <ul className="mb-6 flex-1 space-y-1.5">
        {pass.includes.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px]">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="mt-0.5 size-3.5 shrink-0 text-primary"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 4L6 11 3 8" />
            </svg>
            <span className="text-foreground">{item}</span>
          </li>
        ))}
      </ul>

      {pass.spotsLeft !== undefined && pass.spotsLeft <= 60 && (
        <p className="mb-3 text-[11px] font-medium text-orange-500">
          ⚡ {pass.spotsLeft} spots left
        </p>
      )}

      <div className="mb-5 border-t border-border/50 pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">
            {fmt(currentTier.price, pass.currency)}
          </span>
          <span className="text-[12px] text-muted-foreground">{currentTier.label}</span>
        </div>
        {daysLeft !== null && daysLeft > 0 && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {daysLeft === 1 ? "Last day!" : `${daysLeft} days left`}
          </p>
        )}
        {futureTiers.length > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            then{" "}
            {futureTiers
              .map((t) => `${fmt(t.price, pass.currency)} ${t.label.toLowerCase()}`)
              .join(" · ")}
          </p>
        )}
      </div>

      <Button
        variant={pass.recommended ? "default" : "outline"}
        className="w-full"
        disabled={pass.soldOut}
        onClick={handleSelect}
      >
        {pass.soldOut ? "Sold Out" : `Select ${pass.name}`}
      </Button>
    </div>
  )
}

// ── Add-on info card ──────────────────────────────────────────────────────────

function AddOnInfoCard({ addOn }: { addOn: TicketAddOn }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border/60 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{addOn.name}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{addOn.description}</p>
        {addOn.spotsLeft !== undefined && (
          <p
            className={`mt-1.5 text-[11px] font-medium ${
              addOn.spotsLeft <= 6 ? "text-orange-500" : "text-muted-foreground"
            }`}
          >
            {addOn.spotsLeft <= 6 ? "⚡ " : ""}
            {addOn.spotsLeft} spots left
          </p>
        )}
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums">
        {fmt(addOn.price, addOn.currency)}
      </span>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function EventTickets({
  eventId,
  eventTitle: _eventTitle,
}: {
  eventId: string
  eventTitle: string
}) {
  const data = MOCK_TICKET_DATA[eventId]

  const urgency = useMemo(() => {
    if (!data) return null
    for (const pass of data.passes) {
      const tier = getCurrentTier(pass.tiers)
      if (tier.endsAt) {
        const days = daysUntil(tier.endsAt)
        if (days > 0 && days <= 14) {
          const maxSavings = pass.tiers[pass.tiers.length - 1].price - tier.price
          return { days, tier, maxSavings, currency: pass.currency }
        }
      }
    }
    return null
  }, [data])

  if (!data) return null

  return (
    <>
      {/* Urgency banner */}
      {urgency && urgency.maxSavings > 0 && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-400/8">
          <span className="text-base">⚡</span>
          <p className="text-[13px] font-medium text-amber-800 dark:text-amber-400">
            <span className="font-semibold">
              Early bird ends in {urgency.days} {urgency.days === 1 ? "day" : "days"}.
            </span>{" "}
            Save up to {fmt(urgency.maxSavings, urgency.currency)} by booking now.
          </p>
        </div>
      )}

      {/* Pass cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {data.passes.map((pass) => (
          <PassCard key={pass.id} pass={pass} eventId={eventId} />
        ))}
      </div>

      {/* Add-ons section */}
      {data.addOns.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-sm font-semibold">Add-ons & Extras</h3>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.addOns.map((addOn) => (
              <AddOnInfoCard key={addOn.id} addOn={addOn} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Add-ons can be selected during registration.
          </p>
        </div>
      )}
    </>
  )
}
