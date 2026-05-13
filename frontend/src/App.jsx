import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import useAuthStore from './store/useAuthStore'
import userService from './services/userService'

export default function App() {
  const { isLoggedIn, enrichUser } = useAuthStore()

  // Hydrate user UUID from backend on every app load.
  // JWT only contains email (sub), not the UUID — we need the UUID
  // to correctly identify own messages in the chat (senderId is UUID).
  useEffect(() => {
    if (!isLoggedIn) return
    userService.getMe()
      .then((profile) => enrichUser(profile))
      .catch(() => {/* token expired — user stays on current page, logout on next auth-required action */})
  }, [isLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  return <AppRouter />
}
