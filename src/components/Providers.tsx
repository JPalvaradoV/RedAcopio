'use client'

import { StoreProvider } from '@/lib/store'
import type { CentroAcopio } from '@/lib/data'
import { ReactNode } from 'react'

export default function Providers({
  children,
  initialCentros,
}: {
  children: ReactNode
  initialCentros: CentroAcopio[]
}) {
  return <StoreProvider initialCentros={initialCentros}>{children}</StoreProvider>
}
