'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { centrosData, type CentroAcopio, type NecesidadUrgente, type Comentario, type Donacion } from './data'

interface StoreContextType {
  centros: CentroAcopio[]
  agregarNecesidad: (centroId: string, nueva: NecesidadUrgente) => void
  eliminarNecesidad: (centroId: string, necesidadId: string) => void
  agregarComentario: (centroId: string, comentario: Comentario) => void
  agregarDonacion: (centroId: string, donacion: Donacion) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [centros, setCentros] = useState<CentroAcopio[]>(centrosData)

  function agregarNecesidad(centroId: string, nueva: NecesidadUrgente) {
    setCentros(prev => prev.map(c =>
      c.id === centroId
        ? { ...c, necesidadesUrgentes: [nueva, ...c.necesidadesUrgentes] }
        : c
    ))
  }

  function eliminarNecesidad(centroId: string, necesidadId: string) {
    setCentros(prev => prev.map(c =>
      c.id === centroId
        ? { ...c, necesidadesUrgentes: c.necesidadesUrgentes.filter(n => n.id !== necesidadId) }
        : c
    ))
  }

  function agregarComentario(centroId: string, comentario: Comentario) {
    setCentros(prev => prev.map(c => {
      if (c.id !== centroId) return c
      const nuevosComentarios = [comentario, ...c.comentarios]
      const nuevoRating = nuevosComentarios.reduce((sum, cm) => sum + cm.estrellas, 0) / nuevosComentarios.length
      return { ...c, comentarios: nuevosComentarios, totalComentarios: nuevosComentarios.length, rating: Math.round(nuevoRating * 10) / 10 }
    }))
  }

  function agregarDonacion(centroId: string, donacion: Donacion) {
    setCentros(prev => prev.map(c =>
      c.id === centroId
        ? { ...c, donaciones: [donacion, ...c.donaciones] }
        : c
    ))
  }

  return (
    <StoreContext.Provider value={{ centros, agregarNecesidad, eliminarNecesidad, agregarComentario, agregarDonacion }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}
