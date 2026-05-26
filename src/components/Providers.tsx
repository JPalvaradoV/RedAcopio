'use client'

import { StoreProvider } from '@/lib/store'
import { AuthProvider, type AuthUser } from '@/contexts/AuthContext'
import type { CentroAcopio } from '@/lib/data'
import type { ReactNode } from 'react'

export default function Providers({
  children,
  initialCentros,
  user,
}: {
  children: ReactNode
  initialCentros: CentroAcopio[]
  user: AuthUser
}) {
  return (
    <AuthProvider user={user}>
      <StoreProvider initialCentros={initialCentros}>
        {children}
      </StoreProvider>
    </AuthProvider>
  )
}
