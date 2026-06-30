'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export interface AuthUser {
  id: string
  nombre: string
  role: 'usuario' | 'admin' | 'plataforma'
}

const AuthContext = createContext<AuthUser | null>(null)

export function AuthProvider({ children, user }: { children: ReactNode; user: AuthUser | null }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuthOptional(): AuthUser | null {
  return useContext(AuthContext)
}

export function useAuth(): AuthUser {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider con usuario autenticado')
  return ctx
}
