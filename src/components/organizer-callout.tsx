import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Ticket01Icon,
  CreditCardIcon,
  Megaphone01Icon,
  TimeScheduleIcon,
  Analytics01Icon,
  UserListIcon,
  Camera01Icon,
  QrCodeScanIcon,
} from "@hugeicons/core-free-icons"

const features = [
  {
    icon: Ticket01Icon,
    title: "Flexible Ticket Management",
    description:
      "Early bird tiers, role-based pricing, comp tickets, and door sales — all configured in minutes.",
    accent: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    icon: CreditCardIcon,
    title: "Payments, Handled for You",
    description:
      "We process payments and manage payouts. No Stripe integration, no spreadsheet reconciliation, no chasing invoices.",
    accent: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: Megaphone01Icon,
    title: "Attendee Communication",
    description:
      "Announcements, schedule updates, and post-event wrap-ups — reach your entire community before, during, and after.",
    accent: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: TimeScheduleIcon,
    title: "Visual Schedule Builder",
    description:
      "Build beautiful, shareable programs with drag-and-drop tracks, rooms, and instructors. Publish instantly.",
    accent: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Analytics01Icon,
    title: "Live Registration Dashboard",
    description:
      "Real-time view of registrations, pre-reg pools, waitlists, and payment status — all in one place.",
    accent: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: UserListIcon,
    title: "Smart Waitlist",
    description:
      "Auto-promote when spots open, set capacity rules by role or level, and notify dancers the moment space becomes available.",
    accent: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    icon: Camera01Icon,
    title: "Photographer Marketplace",
    description:
      "Photographers share event photos directly on the platform. Dancers purchase shots of themselves — a new revenue stream at no extra effort.",
    accent: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: QrCodeScanIcon,
    title: "QR Check-in & Door Management",
    description:
      "Staff scan tickets at the door, track live headcount, and export door lists — with role-based access for volunteers.",
    accent: "text-teal-400",
    bg: "bg-teal-400/10",
  },
]

export function OrganizerCallout() {
  return (
    <section className="border-t border-border/50 bg-slate-50/50 py-20 dark:bg-slate-800/20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase">
              For organizers
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              The only platform your event needs.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              From the first registration to the last photo sale — connect.dance handles the
              operational complexity so you can focus on creating unforgettable events for{" "}
              <span className="text-foreground font-medium">45K+ dancers</span> in our community.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button size="sm" asChild>
              <Link to="/list-event">List your event</Link>
            </Button>
            <Button variant="outline" size="sm">Learn more</Button>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-primary/5"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${f.bg}`}>
                <HugeiconsIcon
                  icon={f.icon}
                  strokeWidth={1.5}
                  className={`size-5 ${f.accent}`}
                />
              </div>
              <h3 className="text-[13px] font-semibold">{f.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary features strip */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Also included
          </span>
          {[
            "Event series & season passes",
            "Custom registration forms",
            "Skill level & role distribution insights",
            "Embeddable widgets for your own site",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className="size-1 rounded-full bg-primary/50" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
