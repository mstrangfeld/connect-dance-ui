import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import type { ReactNode } from "react"
import { Nav } from "@/components/nav"
import { HomePage } from "@/pages/home"
import { EventsPage } from "@/pages/events"
import { EventDetailPage } from "@/pages/event-detail"
import { EventRegisterPage } from "@/pages/event-register"
import { SignInPage } from "@/pages/sign-in"
import { SignUpPage } from "@/pages/sign-up"
import { ListEventPage } from "@/pages/list-event"
import { MyEventsPage } from "@/pages/my-events"
import { AuthProvider, useAuth } from "@/context/auth"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/sign-in" replace />
  return <>{children}</>
}

function AuthRoutes() {
  return (
    <div className="flex h-svh flex-col">
      <Nav />
      <div className="mt-14 flex min-h-0 flex-1 flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/register" element={<EventRegisterPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/list-event" element={<ListEventPage />} />
          <Route
            path="/my-events"
            element={
              <ProtectedRoute>
                <MyEventsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
