import { createContext, useContext, useState, type ReactNode } from "react"

export type DancerLevel = "Newcomer" | "Novice" | "Intermediate" | "Advanced" | "All-Star"

export interface CurrentUser {
  id: string
  name: string
  username: string
  avatar: string
  level: DancerLevel
  location: string
  followingCount: number
  followersCount: number
  postsCount: number
  eventsAttended: number
  bio: string
}

interface AuthContextType {
  isLoggedIn: boolean
  currentUser: CurrentUser | null
  login: () => void
  logout: () => void
  attendingEventIds: string[]
  toggleAttending: (eventId: string) => void
}

const MOCK_CURRENT_USER: CurrentUser = {
  id: "me",
  name: "Alex Rivera",
  username: "alexdances",
  avatar: "https://picsum.photos/seed/alexrivera99/200/200",
  level: "Advanced",
  location: "San Francisco, CA",
  followingCount: 84,
  followersCount: 127,
  postsCount: 23,
  eventsAttended: 41,
  bio: "WCS dancer based in SF. Chasing points, finding flow. Instructor at Bay Area WCS.",
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("connect_dance_auth") === "true"
  })

  const [attendingEventIds, setAttendingEventIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("connect_dance_attending") ?? "[]")
    } catch {
      return []
    }
  })

  const login = () => {
    localStorage.setItem("connect_dance_auth", "true")
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("connect_dance_auth")
    setIsLoggedIn(false)
  }

  const toggleAttending = (eventId: string) => {
    setAttendingEventIds((prev) => {
      const next = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
      localStorage.setItem("connect_dance_attending", JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser: isLoggedIn ? MOCK_CURRENT_USER : null,
        login,
        logout,
        attendingEventIds,
        toggleAttending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
