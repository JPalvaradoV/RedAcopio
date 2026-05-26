'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export interface AuthUser {
  id: string
  nombre: string
  role: 'usuario' | 'admin'
}

const AuthContext = createContext<AuthUser | null>(null)

export function AuthProvider({ children, user }: { children: ReactNode; user: AuthUser }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
