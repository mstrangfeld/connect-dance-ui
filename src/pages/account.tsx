import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth"

export function AccountPage() {
  const { isLoggedIn, currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(currentUser?.name ?? "")
  const [saved, setSaved] = useState(false)

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="size-5 text-muted-foreground" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Sign in to view your profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and list events.
        </p>
        <Link
          to="/sign-in"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    )
  }

  const handleSave = (e: React.SyntheticEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">

      {/* Avatar + name header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="size-16 rounded-full object-cover ring-2 ring-border"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{currentUser.name}</h1>
          <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
        </div>
      </div>

      {/* Create event CTA */}
      <Link
        to="/list-event"
        className="mb-6 flex items-center gap-4 rounded-xl border border-border/60 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold">Create an event</p>
          <p className="text-[12px] text-muted-foreground">Reach dancers in your scene</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" className="size-4 text-muted-foreground/40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>

      {/* Settings form */}
      <section className="rounded-xl border border-border/60 p-5">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Account settings
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Profile picture */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Profile picture</label>
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="size-12 rounded-full object-cover ring-1 ring-border"
              />
              <button
                type="button"
                className="rounded-lg border border-border/60 px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="account-name" className="mb-1.5 block text-[13px] font-medium">
              Display name
            </label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false) }}
              placeholder="Your name"
            />
          </div>

          {/* Username (read-only) */}
          <div>
            <label htmlFor="account-username" className="mb-1.5 block text-[13px] font-medium">
              Username
            </label>
            <Input
              id="account-username"
              value={currentUser.username}
              readOnly
              className="opacity-60 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" size="sm" disabled={saved}>
              {saved ? (
                <>
                  <svg viewBox="0 0 16 16" fill="none" className="size-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 8l4 4 7-7" />
                  </svg>
                  Saved
                </>
              ) : "Save changes"}
            </Button>
          </div>
        </form>
      </section>

      {/* Sign out */}
      <div className="mt-6 border-t border-border/50 pt-6 pb-16 md:pb-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg viewBox="0 0 16 16" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2.5H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10.5 11l3-3.5-3-3.5M13.5 7.5H6" />
          </svg>
          Sign out
        </button>
      </div>

    </div>
  )
}
