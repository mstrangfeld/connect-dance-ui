import { Link } from "react-router"

export function CreateEventCTA() {
  return (
    <Link
      to="/create"
      className="group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 text-center transition-all duration-200 hover:border-primary/40 hover:bg-primary/3 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:border-primary/40 dark:hover:bg-primary/5"
    >
      {/* Icon */}
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-primary/10 dark:bg-slate-800 dark:group-hover:bg-primary/15">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5 text-slate-400 transition-colors group-hover:text-primary dark:text-slate-500"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </div>

      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Your event here
      </p>
      <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Hosting a social, workshop, or festival? Reach dancers everywhere.
      </p>

      <span className="mt-4 inline-flex items-center rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        List your event
      </span>
    </Link>
  )
}
