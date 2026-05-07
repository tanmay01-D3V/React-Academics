import { useEffect, useMemo, useState } from "react"
import Navbar from "./components/navbar"
import History from "./pages/History"
import Home from "./pages/Home"
import Planner from "./pages/Planner"
import Profile from "./pages/Profile"

const routes = [
  { path: "#/", label: "Home", component: Home },
  { path: "#/planner", label: "Planner", component: Planner },
  { path: "#/history", label: "History", component: History },
  { path: "#/profile", label: "Profile", component: Profile },
]

const getCurrentPath = () => {
  const path = window.location.hash || "#/"
  return routes.some((route) => route.path === path) ? path : "#/"
}

const App = () => {
  const [activePath, setActivePath] = useState(getCurrentPath)

  useEffect(() => {
    const handleHashChange = () => setActivePath(getCurrentPath())

    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/")
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const ActivePage = useMemo(
    () => routes.find((route) => route.path === activePath)?.component || Home,
    [activePath]
  )

  return (
    <div className="min-h-screen bg-[#FCFCF7] text-gray-900">
      <Navbar navItems={routes} activePath={activePath} />
      <main className="w-full">
        <ActivePage />
      </main>
    </div>
  )
}

export default App
