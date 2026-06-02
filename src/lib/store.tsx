'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { CentroAcopio, NecesidadUrgente, Comentario, Donacion, StockItem } from './data'

interface StoreContextType {
  centros: CentroAcopio[]
  agregarNecesidad: (centroId: string, nueva: Omit<NecesidadUrgente, 'id'>) => Promise<void>
  eliminarNecesidad: (centroId: string, necesidadId: string) => Promise<void>
  agregarComentario: (centroId: string, comentario: Omit<Comentario, 'id'>) => Promise<void>
  agregarDonacion: (centroId: string, donacion: Omit<Donacion, 'id'>) => Promise<void>
  agregarStock: (centroId: string, item: Omit<StockItem, 'id' | 'updatedAt'>) => Promise<void>
  eliminarStock: (centroId: string, stockId: string) => Promise<void>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({
  children,
  initialCentros,
}: {
  children: ReactNode
  initialCentros: CentroAcopio[]
}) {
  const [centros, setCentros] = useState<CentroAcopio[]>(initialCentros)

  async function agregarNecesidad(centroId: string, nueva: Omit<NecesidadUrgente, 'id'>) {
    const res = await fetch('/api/necesidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centroId, ...nueva }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)

    const conId: NecesidadUrgente = {
      ...nueva,
      id: json.id,
      fechaPublicacion: json.fecha_publicacion,
    }
    setCentros(prev =>
      prev.map(c =>
        c.id === centroId
          ? { ...c, necesidadesUrgentes: [conId, ...c.necesidadesUrgentes] }
          : c
      )
    )
  }

  async function eliminarNecesidad(centroId: string, necesidadId: string) {
    const res = await fetch(`/api/necesidades/${necesidadId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar')

    setCentros(prev =>
      prev.map(c =>
        c.id === centroId
          ? { ...c, necesidadesUrgentes: c.necesidadesUrgentes.filter(n => n.id !== necesidadId) }
          : c
      )
    )
  }

  async function agregarComentario(centroId: string, comentario: Omit<Comentario, 'id'>) {
    const res = await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centroId, ...comentario }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)

    const conId: Comentario = { ...comentario, id: json.id, fecha: json.fecha }
    setCentros(prev =>
      prev.map(c => {
        if (c.id !== centroId) return c
        const nuevos = [conId, ...c.comentarios]
        const nuevoRating =
          Math.round(
            (nuevos.reduce((s, cm) => s + cm.estrellas, 0) / nuevos.length) * 10
          ) / 10
        return { ...c, comentarios: nuevos, totalComentarios: nuevos.length, rating: nuevoRating }
      })
    )
  }

  async function agregarDonacion(centroId: string, donacion: Omit<Donacion, 'id'>) {
    const res = await fetch('/api/donaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centroId, ...donacion }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)

    const conId: Donacion = { ...donacion, id: json.id, fecha: json.fecha }
    setCentros(prev =>
      prev.map(c =>
        c.id === centroId ? { ...c, donaciones: [conId, ...c.donaciones] } : c
      )
    )
  }

  async function agregarStock(centroId: string, item: Omit<StockItem, 'id' | 'updatedAt'>) {
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centroId, ...item }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)

    const conId: StockItem = { ...item, id: json.id, updatedAt: json.updated_at }
    setCentros(prev =>
      prev.map(c =>
        c.id === centroId ? { ...c, stock: [...c.stock, conId] } : c
      )
    )
  }

  async function eliminarStock(centroId: string, stockId: string) {
    const res = await fetch(`/api/stock/${stockId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar item de stock')

    setCentros(prev =>
      prev.map(c =>
        c.id === centroId
          ? { ...c, stock: c.stock.filter(s => s.id !== stockId) }
          : c
      )
    )
  }

  return (
    <StoreContext.Provider
      value={{ centros, agregarNecesidad, eliminarNecesidad, agregarComentario, agregarDonacion, agregarStock, eliminarStock }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}
