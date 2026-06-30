'use client'

import { useEffect, useState } from 'react'
import { useAuthOptional } from '@/contexts/AuthContext'

interface CentroAdmin {
  id: string
  nombre: string
  comuna: string
  region: string
  direccion: string
  administrador: string
  telefono: string
  email: string
  descripcion: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at: string
}

const estadoBadge: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function formatFecha(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export default function AdminPage() {
  const user = useAuthOptional()
  const [centros, setCentros] = useState<CentroAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [accionId, setAccionId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'plataforma') { setLoading(false); return }
    fetch('/api/admin/centros')
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setCentros(data) : setCentros([]))
      .catch(() => setCentros([]))
      .finally(() => setLoading(false))
  }, [user?.role])

  async function cambiarEstado(id: string, estado: 'aprobado' | 'rechazado') {
    setAccionId(id)
    try {
      const res = await fetch(`/api/admin/centros/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      })
      if (res.ok) {
        setCentros(prev => prev.map(c => c.id === id ? { ...c, estado } : c))
      }
    } finally {
      setAccionId(null)
    }
  }

  if (user?.role !== 'plataforma') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-ch-gray-text">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-semibold text-ch-dark mb-1">Acceso restringido</p>
        <p className="text-sm">Esta sección es solo para administradores de plataforma.</p>
      </div>
    )
  }

  const pendientes = centros.filter(c => c.estado === 'pendiente')
  const procesados = centros.filter(c => c.estado !== 'pendiente')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-ch-gray-text mb-6">
        <a href="/" className="hover:text-ch-blue hover:underline">Inicio</a>
        <span className="mx-2">›</span>
        <span className="text-ch-dark font-medium">Validación de centros</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ch-dark">Validación de centros</h1>
        <p className="text-ch-gray-text text-sm mt-1">
          Revisa y aprueba los centros registrados antes de que aparezcan públicamente en la plataforma.
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendientes.length}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Pendientes</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{centros.filter(c => c.estado === 'aprobado').length}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Aprobados</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-ch-red">{centros.filter(c => c.estado === 'rechazado').length}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Rechazados</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-ch-gray-text text-sm">Cargando centros...</div>
      ) : (
        <>
          {/* Pendientes */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-ch-dark mb-4">
              Pendientes de validación
              {pendientes.length > 0 && (
                <span className="ml-2 text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  {pendientes.length}
                </span>
              )}
            </h2>

            {pendientes.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-10 text-center text-ch-gray-text">
                <p className="text-3xl mb-3">✅</p>
                <p className="font-semibold text-ch-dark mb-1">No hay centros pendientes</p>
                <p className="text-sm">Todos los centros registrados ya fueron revisados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendientes.map(c => (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-ch-dark">{c.nombre}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge[c.estado]}`}>
                            Pendiente
                          </span>
                        </div>
                        <p className="text-sm text-ch-gray-text">📍 {c.direccion}, {c.comuna}, {c.region}</p>
                        <p className="text-sm text-ch-gray-text">👤 {c.administrador}</p>
                        <p className="text-sm text-ch-gray-text">📞 {c.telefono} · ✉️ {c.email}</p>
                        {c.descripcion && (
                          <p className="text-sm text-ch-gray-text mt-2 italic">{`“${c.descripcion}”`}</p>
                        )}
                        <p className="text-xs text-ch-gray-text mt-2">Registrado: {formatFecha(c.created_at)}</p>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => cambiarEstado(c.id, 'aprobado')}
                          disabled={accionId === c.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2 px-4 rounded transition-colors disabled:opacity-60"
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          onClick={() => cambiarEstado(c.id, 'rechazado')}
                          disabled={accionId === c.id}
                          className="flex-1 border border-red-300 text-ch-red hover:bg-red-50 font-semibold text-sm py-2 px-4 rounded transition-colors disabled:opacity-60"
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Procesados */}
          {procesados.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-ch-dark mb-4">Centros revisados</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-ch-gray">
                    <tr className="text-ch-gray-text text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-3 font-semibold">Centro</th>
                      <th className="text-left px-4 py-3 font-semibold">Ubicación</th>
                      <th className="text-left px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {procesados.map((c, i) => (
                      <tr key={c.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 font-medium text-ch-dark">{c.nombre}</td>
                        <td className="px-4 py-3 text-ch-gray-text">{c.comuna}, {c.region}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge[c.estado]}`}>
                            {c.estado.charAt(0).toUpperCase() + c.estado.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.estado === 'rechazado' ? (
                            <button
                              onClick={() => cambiarEstado(c.id, 'aprobado')}
                              disabled={accionId === c.id}
                              className="text-xs text-green-700 border border-green-200 hover:bg-green-50 px-2.5 py-1 rounded transition-colors disabled:opacity-60"
                            >
                              Aprobar
                            </button>
                          ) : (
                            <button
                              onClick={() => cambiarEstado(c.id, 'rechazado')}
                              disabled={accionId === c.id}
                              className="text-xs text-ch-red border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded transition-colors disabled:opacity-60"
                            >
                              Rechazar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
