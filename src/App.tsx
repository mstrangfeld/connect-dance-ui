import { useEffect } from "react"
import { BrowserRouter, Routes, Route, useLocation } from "react-router"
import { Nav, MobileBottomNav } from "@/components/nav"
import { HomePage } from "@/pages/home"
import { EventsPage } from "@/pages/events"
import { EventDetailPage } from "@/pages/event-detail"
import { EventRegisterPage } from "@/pages/event-register"
import { SignInPage } from "@/pages/sign-in"
import { SignUpPage } from "@/pages/sign-up"
import { ListEventPage } from "@/pages/list-event"
import { MyEventsPage } from "@/pages/my-events"
import { AccountPage } from "@/pages/account"
import { AuthProvider } from "@/context/auth"
import { ExploreStateProvider } from "@/context/explore-state"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Don't reset scroll for /events — it restores its own scroll position
    if (pathname === "/events") return
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <Nav />
      <main className="min-h-svh pt-0 pb-16 md:pt-14 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/register" element={<EventRegisterPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/list-event" element={<ListEventPage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </main>
      <MobileBottomNav />
    </>
  )
}

export function App() {
  return (
    <AuthProvider>
      <ExploreStateProvider>
        <BrowserRouter basename="/connect-dance-ui">
          <AppLayout />
        </BrowserRouter>
      </ExploreStateProvider>
    </AuthProvider>
  )
}

export default App
