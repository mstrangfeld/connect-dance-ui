import { BrowserRouter, Routes, Route } from "react-router"
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

function AuthRoutes() {
  return (
    <div className="flex h-svh flex-col">
      <Nav />
      <div className="md:mt-14 flex min-h-0 flex-1 flex-col overflow-y-auto pb-16 md:pb-0">
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
      </div>
      <MobileBottomNav />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/connect-dance-ui">
        <AuthRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
