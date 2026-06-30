'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import type { Categoria } from '@/lib/data'
import CentroCard from '@/components/CentroCard'
import ModalDetalleCentro from '@/components/ModalDetalleCentro'

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'agua', label: '💧 Agua' },
  { value: 'alimentos', label: '🥫 Alimentos' },
  { value: 'ropa', label: '👕 Ropa' },
  { value: 'medicamentos', label: '💊 Medicamentos' },
  { value: 'higiene', label: '🧴 Higiene' },
  { value: 'herramientas', label: '🔧 Herramientas' },
]

// Abre el detalle de un centro cuando se llega con ?centro=<id> (p.ej. desde el mapa)
function DeepLinkDetalle() {
  const { centros } = useStore()
  const params = useSearchParams()
  const centroId = params.get('centro')
  const [cerrado, setCerrado] = useState(false)

  const centro = centroId ? centros.find(c => c.id === centroId) : undefined
  if (!centro || cerrado) return null
  return <ModalDetalleCentro centro={centro} onClose={() => setCerrado(true)} />
}

export default function HomePage() {
  const { centros } = useStore()
  const [busqueda, setBusqueda] = useState('')
  const [region, setRegion] = useState('todas')
  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas')
  const [urgencia, setUrgencia] = useState<'alta' | 'media' | 'baja' | 'todas'>('todas')

  const publicos = useMemo(() => centros.filter(c => c.estado === 'aprobado'), [centros])

  const regiones = useMemo(
    () => Array.from(new Set(publicos.map(c => c.region).filter(Boolean))).sort(),
    [publicos]
  )

  const centrosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return publicos.filter(c => {
      const matchTexto =
        c.nombre.toLowerCase().includes(q) || c.comuna.toLowerCase().includes(q)
      const matchRegion = region === 'todas' || c.region === region
      const matchCategoria =
        categoria === 'todas' || c.necesidadesUrgentes.some(n => n.categoria === categoria)
      const matchUrgencia =
        urgencia === 'todas' || c.necesidadesUrgentes.some(n => n.urgencia === urgencia)
      return matchTexto && matchRegion && matchCategoria && matchUrgencia
    })
  }, [publicos, busqueda, region, categoria, urgencia])

  const totalUrgentes = publicos.reduce(
    (sum, c) => sum + c.necesidadesUrgentes.filter(n => n.urgencia === 'alta').length,
    0
  )

  const hayFiltros = region !== 'todas' || categoria !== 'todas' || urgencia !== 'todas' || busqueda !== ''

  function limpiarFiltros() {
    setBusqueda('')
    setRegion('todas')
    setCategoria('todas')
    setUrgencia('todas')
  }

  return (
    <>
      <Suspense fallback={null}>
        <DeepLinkDetalle />
      </Suspense>

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
              <a
                href="/mapa"
                className="border border-white text-white font-bold py-3 px-6 rounded text-sm hover:bg-white hover:bg-opacity-10 transition-colors text-center"
              >
                🗺️ Ver en el mapa
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
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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

        {/* Filtros (Historia 6) */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-ch-gray-text mb-1.5">Región</label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
            >
              <option value="todas">Todas las regiones</option>
              {regiones.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-ch-gray-text mb-1.5">Tipo de necesidad</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value as Categoria | 'todas')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-ch-gray-text mb-1.5">Urgencia</label>
            <select
              value={urgencia}
              onChange={e => setUrgencia(e.target.value as 'alta' | 'media' | 'baja' | 'todas')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
            >
              <option value="todas">Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-ch-blue font-semibold hover:underline whitespace-nowrap px-2 py-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grilla de centros */}
        {centrosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-ch-gray-text">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No se encontraron centros</p>
            <p className="text-sm">Prueba ajustando los filtros o la búsqueda.</p>
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
            <p className="text-2xl font-bold text-ch-blue">{publicos.length}</p>
            <p className="text-ch-gray-text">Centros activos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ch-red">{totalUrgentes}</p>
            <p className="text-ch-gray-text">Alertas urgentes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ch-blue">
              {publicos.reduce((sum, c) => sum + c.donaciones.length, 0)}
            </p>
            <p className="text-ch-gray-text">Donaciones coordinadas</p>
          </div>
        </div>
      </div>
    </>
  )
}
