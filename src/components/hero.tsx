import type { EventType } from "@/data/mock-events"
import { EVENT_TYPE_LABELS } from "@/data/mock-events"

const EVENT_TYPES: EventType[] = [
  "party",
  "intensive",
  "workshop",
  "class",
  "festival",
]

const TYPE_STYLES: Record<
  EventType,
  { dot: string; active: string; inactive: string }
> = {
  party: {
    dot: "bg-violet-400",
    active:
      "bg-violet-400/15 text-violet-700 ring-1 ring-inset ring-violet-400/40 dark:bg-violet-400/20 dark:text-violet-300 dark:ring-violet-400/30",
    inactive:
      "bg-violet-400/8 text-violet-500 hover:bg-violet-400/12 hover:text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
  },
  intensive: {
    dot: "bg-orange-400",
    active:
      "bg-orange-400/15 text-orange-700 ring-1 ring-inset ring-orange-400/40 dark:bg-orange-400/20 dark:text-orange-300 dark:ring-orange-400/30",
    inactive:
      "bg-orange-400/8 text-orange-500 hover:bg-orange-400/12 hover:text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
  },
  workshop: {
    dot: "bg-yellow-400",
    active:
      "bg-yellow-400/15 text-yellow-700 ring-1 ring-inset ring-yellow-400/40 dark:bg-yellow-400/20 dark:text-yellow-300 dark:ring-yellow-400/30",
    inactive:
      "bg-yellow-400/8 text-yellow-500 hover:bg-yellow-400/12 hover:text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
  },
  class: {
    dot: "bg-emerald-400",
    active:
      "bg-emerald-400/15 text-emerald-700 ring-1 ring-inset ring-emerald-400/40 dark:bg-emerald-400/20 dark:text-emerald-300 dark:ring-emerald-400/30",
    inactive:
      "bg-emerald-400/8 text-emerald-500 hover:bg-emerald-400/12 hover:text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  festival: {
    dot: "bg-sky-400",
    active:
      "bg-sky-400/15 text-sky-700 ring-1 ring-inset ring-sky-400/40 dark:bg-sky-400/20 dark:text-sky-300 dark:ring-sky-400/30",
    inactive:
      "bg-sky-400/8 text-sky-500 hover:bg-sky-400/12 hover:text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
  },
}

interface HeroProps {
  activeTypes: Set<EventType>
  onActiveTypesChange: (types: Set<EventType>) => void
}

export function Hero({ activeTypes, onActiveTypesChange }: HeroProps) {
  const anyActive = activeTypes.size > 0

  function handleChipClick(type: EventType) {
    const next = new Set(activeTypes)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    onActiveTypesChange(next)
  }

  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-8 text-center sm:py-10">
        <h1 className="text-[1.85rem] font-bold leading-tight tracking-tight sm:text-[2.4rem]">
          Your West Coast Swing Community.
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          Find your next event and connect with other dancers worldwide.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EVENT_TYPES.map((type) => {
            const styles = TYPE_STYLES[type]
            const isActive = activeTypes.has(type)
            const isDimmed = anyActive && !isActive

            return (
              <button
                key={type}
                onClick={() => handleChipClick(type)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-150 ${
                  isActive ? styles.active : styles.inactive
                } ${isDimmed ? "opacity-50" : ""}`}
              >
                <span
                  className={`size-1.5 shrink-0 rounded-full ${styles.dot}`}
                />
                {EVENT_TYPE_LABELS[type]}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
