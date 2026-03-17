import type { EventType } from "@/data/mock-events"
import type { DateRange } from "react-day-picker"

// ── Haversine distance (km) ──────────────────────────────────────────────────

export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Type accent colors ───────────────────────────────────────────────────────

export const TYPE_COLORS: Record<EventType, string> = {
  party: "#a78bfa",
  intensive: "#fb923c",
  workshop: "#facc15",
  class: "#34d399",
  festival: "#38bdf8",
}

export const TYPE_ACCENTS: Record<
  EventType,
  { stripe: string; badge: string; dot: string }
> = {
  party: {
    stripe: "bg-violet-400",
    badge:
      "bg-violet-400/15 text-violet-700 dark:bg-violet-400/20 dark:text-violet-400",
    dot: "bg-violet-400",
  },
  intensive: {
    stripe: "bg-orange-400",
    badge:
      "bg-orange-400/15 text-orange-700 dark:bg-orange-400/20 dark:text-orange-400",
    dot: "bg-orange-400",
  },
  workshop: {
    stripe: "bg-yellow-400",
    badge:
      "bg-yellow-400/20 text-yellow-700 dark:bg-yellow-400/20 dark:text-yellow-400",
    dot: "bg-yellow-400",
  },
  class: {
    stripe: "bg-emerald-400",
    badge:
      "bg-emerald-400/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-400",
    dot: "bg-emerald-400",
  },
  festival: {
    stripe: "bg-sky-400",
    badge:
      "bg-sky-400/15 text-sky-700 dark:bg-sky-400/20 dark:text-sky-400",
    dot: "bg-sky-400",
  },
}

export const TYPE_DOTS: Record<EventType, string> = {
  party: "bg-violet-400",
  intensive: "bg-orange-400",
  workshop: "bg-yellow-400",
  class: "bg-emerald-400",
  festival: "bg-sky-400",
}

// ── Date formatting ──────────────────────────────────────────────────────────

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatEventDateRange(
  dateStr: string,
  endDateStr?: string,
): string {
  const month = formatDateShort(dateStr)
  if (!endDateStr) return month

  const date = new Date(dateStr + "T00:00:00")
  const endDate = new Date(endDateStr + "T00:00:00")
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" })
  const startMonth = date.toLocaleDateString("en-US", { month: "short" })

  if (startMonth === endMonth)
    return `${startMonth} ${date.getDate()}–${endDate.getDate()}`
  return `${month} – ${formatDateShort(endDateStr)}`
}

export function formatDateRangeLabel(range: DateRange | undefined): string {
  if (!range?.from) return "Any date"
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (!range.to || range.from.toDateString() === range.to.toDateString())
    return fmt(range.from)
  if (
    range.from.getFullYear() === range.to.getFullYear() &&
    range.from.getMonth() === range.to.getMonth()
  ) {
    return `${range.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${range.to.getDate()}`
  }
  return `${fmt(range.from)} – ${fmt(range.to)}`
}

// ── Continent lookup ─────────────────────────────────────────────────────────

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  US: "North America",
  CA: "North America",
  MX: "North America",
  BR: "South America",
  AR: "South America",
  DE: "Europe",
  FR: "Europe",
  GB: "Europe",
  UK: "Europe",
  NL: "Europe",
  SE: "Europe",
  ES: "Europe",
  IT: "Europe",
  AT: "Europe",
  CH: "Europe",
  PL: "Europe",
  NO: "Europe",
  DK: "Europe",
  FI: "Europe",
  BE: "Europe",
  PT: "Europe",
  CZ: "Europe",
  IE: "Europe",
  AU: "Oceania",
  NZ: "Oceania",
  JP: "Asia",
  KR: "Asia",
  CN: "Asia",
  SG: "Asia",
  TH: "Asia",
  ZA: "Africa",
}

export function getContinent(country: string): string {
  return COUNTRY_TO_CONTINENT[country] ?? ""
}
