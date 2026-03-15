import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router"
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleMobileLogout = () => {
    logout()
    setMobileOpen(false)
    navigate("/")
  }

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
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

        {isLoggedIn ? (
          <>
            {/* Logged-in desktop nav */}
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
          <div className="ml-auto flex items-center gap-2">
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

        {/* Mobile hamburger — only shown when logged in */}
        <button
          className={`flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:hidden ${isLoggedIn ? "" : "hidden"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M4 8h16" />
                <path d="M4 16h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background px-6 pb-4 md:hidden">
          <div className="flex flex-col gap-0.5 pt-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" asChild>
                  <Link to="/my-events" onClick={() => setMobileOpen(false)}>My Events</Link>
                </Button>
                <div className="my-2 h-px bg-border/60" />
                <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" onClick={handleMobileLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link to="/sign-in" onClick={() => setMobileOpen(false)}>Sign in</Link>
                </Button>
                <Button size="sm" className="mt-1 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                  <Link to="/list-event" onClick={() => setMobileOpen(false)}>List an event</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

    </nav>
  )
}
