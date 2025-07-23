import { useCallback } from "react"
import { useSessionStore } from "../store"
import { User } from "@/features/users"
import { Session } from "../services/Session"

export const useSession = () => {
  const user = useSessionStore(state => state.user)
  const updateSession = useCallback((u: User) => Session.update(u), [])
  const clearSession = useCallback(() => Session.clear(), [])
  return { user, updateSession, clearSession }
}
