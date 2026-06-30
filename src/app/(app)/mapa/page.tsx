'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useStore } from '@/lib/store'
import type { Categoria } from '@/lib/data'
import { nivelUrgenciaCentro, COLOR_URGENCIA } from '@/lib/geo'

const MapaCentros = dynamic(() => import('@/components/MapaCentros'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-ch-gray-text text-sm">
      Cargando mapa...
    </div>
  ),
})

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'agua', label: '💧 Agua' },
  { value: 'alimentos', label: '🥫 Alimentos' },
  { value: 'ropa', label: '👕 Ropa' },
  { value: 'medicamentos', label: '💊 Medicamentos' },
  { value: 'higiene', label: '🧴 Higiene' },
  { value: 'herramientas', label: '🔧 Herramientas' },
]

const URGENCIAS = [
  { value: 'alta', label: 'Alta', color: COLOR_URGENCIA.alta },
  { value: 'media', label: 'Media', color: COLOR_URGENCIA.media },
  { value: 'baja', label: 'Baja', color: COLOR_URGENCIA.baja },
] as const

export default function MapaPage() {
  const { centros } = useStore()
  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas')
  const [urgencia, setUrgencia] = useState<'alta' | 'media' | 'baja' | 'todas'>('todas')

  const visibles = useMemo(() => {
    return centros.filter(c => {
      if (c.estado !== 'aprobado') return false
      if (categoria !== 'todas' && !c.necesidadesUrgentes.some(n => n.categoria === categoria)) {
        return false
      }
      if (urgencia !== 'todas' && nivelUrgenciaCentro(c) !== urgencia) {
        return false
      }
      return true
    })
  }, [centros, categoria, urgencia])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-ch-dark">Mapa de centros de acopio</h1>
        <p className="text-ch-gray-text text-sm mt-1">
          Ubicación de los centros activos. El color del pin indica la urgencia más alta de cada centro.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-ch-gray-text mb-1.5">Tipo de necesidad</label>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value as Categoria | 'todas')}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
          >
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-ch-gray-text mb-1.5">Nivel de urgencia</label>
          <select
            value={urgencia}
            onChange={e => setUrgencia(e.target.value as 'alta' | 'media' | 'baja' | 'todas')}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
          >
            <option value="todas">Todas las urgencias</option>
            {URGENCIAS.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-ch-gray-text whitespace-nowrap">
          <span className="font-bold text-ch-blue">{visibles.length}</span> centro{visibles.length !== 1 ? 's' : ''} en el mapa
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-ch-gray-text">
        {URGENCIAS.map(u => (
          <span key={u.value} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: u.color }} />
            Urgencia {u.label.toLowerCase()}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COLOR_URGENCIA.ninguna }} />
          Sin alertas
        </span>
      </div>

      {/* Mapa */}
      <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm" style={{ height: '70vh' }}>
        <MapaCentros centros={visibles} />
      </div>
    </div>
  )
}
