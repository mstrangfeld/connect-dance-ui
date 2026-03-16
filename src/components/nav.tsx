import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router"
import { useAuth } from "@/context/auth"

function UserMenu() {
  const { currentUser, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate("/")
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full transition-all hover:ring-2 hover:ring-primary/20"
        aria-label="User menu"
      >
        <img
          src={currentUser?.avatar}
          alt={currentUser?.name}
          className="size-8 rounded-full object-cover ring-1 ring-border"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border/60 bg-popover shadow-lg shadow-black/5 py-1 z-50">
          <div className="px-3 py-2 border-b border-border/40">
            <p className="text-[13px] font-semibold text-foreground truncate">{currentUser?.name}</p>
            <p className="text-[12px] text-muted-foreground truncate">@{currentUser?.username}</p>
          </div>
          <div className="py-1">
            <Link
              to="/my-events"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-4 text-muted-foreground" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <path d="M5 1.5v3M11 1.5v3M2 7h12" strokeLinecap="round" />
              </svg>
              My Events
            </Link>
            <Link
              to="/list-event"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-4 text-muted-foreground" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <path d="M5 1.5v3M11 1.5v3M2 7h12" strokeLinecap="round" />
                <path d="M8 10v3M6.5 11.5h3" strokeLinecap="round" />
              </svg>
              List an event
            </Link>
          </div>
          <div className="border-t border-border/40 py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] text-foreground hover:bg-muted transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="size-4 text-muted-foreground" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2.5H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10.5 11l3-3.5-3-3.5M13.5 7.5H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Nav() {
  const { isLoggedIn } = useAuth()

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl hidden md:block">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <svg viewBox="0 0 28 28" fill="none" className="size-6">
            <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
            <path d="M9 14c0-2.76 2.24-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" />
            <path d="M19 14c0 2.76-2.24 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" />
            <circle cx="14" cy="14" r="1.5" fill="currentColor" className="text-primary" />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            connect<span className="text-primary">.dance</span>
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        {isLoggedIn ? (
          <>
            <div className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground" asChild>
                <Link to="/my-events">My Events</Link>
              </Button>
            </div>
            <div className="ml-auto hidden items-center gap-3 md:flex">
              <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground" asChild>
                <Link to="/list-event">List your event</Link>
              </Button>
              <UserMenu />
            </div>
          </>
        ) : (
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground" asChild>
              <Link to="/list-event">List your event</Link>
            </Button>
            <Button
              size="sm"
              className="border border-primary/20 bg-primary text-primary-foreground text-[13px] hover:bg-primary/90 shadow-sm shadow-primary/10"
              asChild
            >
              <Link to="/sign-in">Sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

export function MobileBottomNav() {
  const { isLoggedIn, currentUser } = useAuth()
  const location = useLocation()
  const pathname = location.pathname

  const isActive = (path: string) => pathname === path || (path !== "/events" && pathname.startsWith(path))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">

        {/* Explore */}
        <Link
          to="/events"
          className={`flex flex-col items-center gap-1 min-w-[72px] py-1 transition-colors ${
            isActive("/events") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth={isActive("/events") ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-[10px] font-medium">Explore</span>
        </Link>

        {/* My Events */}
        <Link
          to="/my-events"
          className={`flex flex-col items-center gap-1 min-w-[72px] py-1 transition-colors ${
            isActive("/my-events") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth={isActive("/my-events") ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M8 2v4M16 2v4M3 10h18" />
          </svg>
          <span className="text-[10px] font-medium">My Events</span>
        </Link>

        {/* Profile / Sign in */}
        {isLoggedIn ? (
          <Link
            to="/account"
            className={`flex flex-col items-center gap-1 min-w-[72px] py-1 transition-colors ${
              isActive("/account") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className={`size-6 rounded-full object-cover ring-1 ${isActive("/account") ? "ring-primary" : "ring-border"}`}
              />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth={isActive("/account") ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        ) : (
          <Link
            to="/sign-in"
            className={`flex flex-col items-center gap-1 min-w-[72px] py-1 transition-colors ${
              isActive("/sign-in") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth={isActive("/sign-in") ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="text-[10px] font-medium">Sign in</span>
          </Link>
        )}

      </div>
    </nav>
  )
}
