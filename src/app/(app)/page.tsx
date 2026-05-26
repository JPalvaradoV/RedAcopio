'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import CentroCard from '@/components/CentroCard'

export default function HomePage() {
  const { centros } = useStore()
  const [busqueda, setBusqueda] = useState('')

  const centrosFiltrados = centros.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.comuna.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalUrgentes = centros.reduce(
    (sum, c) => sum + c.necesidadesUrgentes.filter(n => n.urgencia === 'alta').length,
    0
  )

  return (
    <>
      {/* Hero institucional */}
      <section className="bg-ch-blue text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-2 h-2 bg-ch-red rounded-full animate-pulse inline-block" />
              {totalUrgentes} necesidades urgentes activas
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
              Red de Acopio Chile
            </h1>
            <p className="text-blue-100 text-lg mb-6 leading-relaxed">
              Conectamos centros de acopio con donantes durante emergencias. 
              Apoya directamente donde más se necesita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#centros"
                className="bg-white text-ch-blue font-bold py-3 px-6 rounded text-sm hover:bg-blue-50 transition-colors text-center"
              >
                Ver centros de acopio →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de alerta si hay necesidades urgentes */}
      {totalUrgentes > 0 && (
        <div className="bg-red-50 border-b-2 border-ch-red">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-ch-red text-xl">🚨</span>
            <p className="text-ch-red text-sm font-semibold">
              Alerta activa: {totalUrgentes} centro{totalUrgentes !== 1 ? 's tienen' : ' tiene'} necesidades críticas en este momento. Revisa las tarjetas a continuación.
            </p>
          </div>
        </div>
      )}

      {/* Cuerpo principal */}
      <div className="max-w-6xl mx-auto px-4 py-8" id="centros">
        {/* Buscador */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-xl font-bold text-ch-dark">
            Centros de acopio activos
            <span className="ml-2 text-sm font-normal text-ch-gray-text">({centrosFiltrados.length})</span>
          </h2>
          <input
            type="search"
            placeholder="Buscar por nombre o comuna..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
          />
        </div>

        {/* Grilla de centros */}
        {centrosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-ch-gray-text">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No se encontraron centros</p>
            <p className="text-sm">Intenta con otro nombre o comuna.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {centrosFiltrados.map(centro => (
              <CentroCard key={centro.id} centro={centro} />
            ))}
          </div>
        )}

        {/* Info institucional al pie */}
        <div className="mt-10 bg-white border border-gray-200 rounded-lg p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-2xl font-bold text-ch-blue">{centros.length}</p>
            <p className="text-ch-gray-text">Centros activos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ch-red">{totalUrgentes}</p>
            <p className="text-ch-gray-text">Alertas urgentes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ch-blue">
              {centros.reduce((sum, c) => sum + c.donaciones.length, 0)}
            </p>
            <p className="text-ch-gray-text">Donaciones coordinadas</p>
          </div>
        </div>
      </div>
    </>
  )
}
