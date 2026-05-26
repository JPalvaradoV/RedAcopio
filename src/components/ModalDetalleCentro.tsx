'use client'

import { useState } from 'react'
import type { CentroAcopio } from '@/lib/data'
import { useStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  centro: CentroAcopio
  onClose: () => void
}

const categoriaLabel: Record<string, string> = {
  agua: '💧 Agua',
  alimentos: '🥫 Alimentos',
  ropa: '👕 Ropa',
  medicamentos: '💊 Medicamentos',
  higiene: '🧴 Higiene',
  herramientas: '🔧 Herramientas',
}

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFecha(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

export default function ModalDetalleCentro({ centro, onClose }: Props) {
  const { agregarComentario } = useStore()
  const { nombre: nombreAuth } = useAuth()

  const comentarios = centro.comentarios
  const ratingPromedio = centro.rating

  // Formulario de nuevo comentario
  const [estrellaHover, setEstrellaHover] = useState(0)
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState(0)
  const [nombreUsuario, setNombreUsuario] = useState(nombreAuth)
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleEnviarComentario(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (estrellasSeleccionadas === 0) {
      setError('Selecciona una puntuación de 1 a 5 estrellas.')
      return
    }
    if (!nombreUsuario.trim()) {
      setError('Ingresa tu nombre o apodo.')
      return
    }
    if (texto.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres.')
      return
    }

    await agregarComentario(centro.id, {
      usuario: nombreUsuario.trim(),
      texto: texto.trim(),
      estrellas: estrellasSeleccionadas,
      fecha: new Date().toISOString(),
    })
    setEnviado(true)
  }

  function resetForm() {
    setEnviado(false)
    setEstrellasSeleccionadas(0)
    setEstrellaHover(0)
    setNombreUsuario('')
    setTexto('')
    setError('')
  }


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col modal-enter">
        {/* Cabecera */}
        <div className="bg-ch-blue px-6 py-4 rounded-t-lg flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">{centro.nombre}</h2>
            <p className="text-blue-200 text-sm mt-0.5">📍 {centro.direccion}, {centro.comuna}</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white text-2xl leading-none mt-0.5"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Info rápida */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-ch-gray rounded p-3">
              <p className="text-xs text-ch-gray-text font-semibold uppercase tracking-wide mb-0.5">Administrador</p>
              <p className="text-ch-dark font-medium">{centro.administrador}</p>
            </div>
            <div className="bg-ch-gray rounded p-3">
              <p className="text-xs text-ch-gray-text font-semibold uppercase tracking-wide mb-0.5">Contacto</p>
              <p className="text-ch-dark font-medium">{centro.telefono}</p>
            </div>
          </div>

          {/* Necesidades urgentes */}
          {centro.necesidadesUrgentes.length > 0 && (
            <section>
              <h3 className="font-bold text-ch-dark mb-3 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
                🚨 Necesidades activas
              </h3>
              <ul className="space-y-2">
                {centro.necesidadesUrgentes.map((n) => (
                  <li key={n.id} className="flex items-start gap-2.5 text-sm">
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full badge-${n.urgencia} mt-0.5`}>
                      {n.urgencia.toUpperCase()}
                    </span>
                    <div>
                      <span className="font-medium text-ch-dark">{categoriaLabel[n.categoria]}</span>
                      <span className="text-ch-gray-text"> · {n.descripcion}</span>
                      <span className="text-ch-gray-text block text-xs">{n.cantidad}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ——— Historia 3: Comentarios y puntuación ——— */}
          <section>
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
              <h3 className="font-bold text-ch-dark text-sm uppercase tracking-wide">
                ⭐ Calificaciones y comentarios
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 text-lg">
                  {[1,2,3,4,5].map(n => (
                    <span key={n}>{n <= Math.round(ratingPromedio) ? '★' : '☆'}</span>
                  ))}
                </span>
                <span className="text-sm text-ch-gray-text">
                  {ratingPromedio > 0 ? ratingPromedio.toFixed(1) : '—'}
                  {' '}({comentarios.length})
                </span>
              </div>
            </div>

            {/* Lista de comentarios */}
            {comentarios.length === 0 ? (
              <p className="text-sm text-ch-gray-text italic mb-4">
                Aún no hay comentarios. ¡Sé el primero en calificar este centro!
              </p>
            ) : (
              <ul className="space-y-3 mb-5">
                {comentarios.map((c) => (
                  <li key={c.id} className="bg-ch-gray rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-ch-dark text-sm">{c.usuario}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">
                          {[1,2,3,4,5].map(n => (
                            <span key={n}>{n <= c.estrellas ? '★' : '☆'}</span>
                          ))}
                        </span>
                        <span className="text-xs text-ch-gray-text">{formatFecha(c.fecha)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-ch-gray-text">{c.texto}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Formulario de nuevo comentario */}
            {!enviado ? (
              <form onSubmit={handleEnviarComentario} noValidate className="border border-gray-200 rounded p-4">
                <h4 className="font-semibold text-ch-dark text-sm mb-3">Dejar un comentario</h4>

                {/* Estrellas interactivas */}
                <div className="mb-3">
                  <label className="block text-sm text-ch-gray-text mb-1.5">
                    Tu puntuación <span className="text-ch-red">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`star text-3xl leading-none ${
                          n <= (estrellaHover || estrellasSeleccionadas)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        onMouseEnter={() => setEstrellaHover(n)}
                        onMouseLeave={() => setEstrellaHover(0)}
                        onClick={() => setEstrellasSeleccionadas(n)}
                        aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                    {estrellasSeleccionadas > 0 && (
                      <span className="text-sm text-ch-gray-text ml-2 self-center">
                        {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][estrellasSeleccionadas]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nombre */}
                <div className="mb-3">
                  <label className="block text-sm text-ch-gray-text mb-1" htmlFor="nombre-comentario">
                    Tu nombre <span className="text-ch-red">*</span>
                  </label>
                  <input
                    id="nombre-comentario"
                    type="text"
                    value={nombreUsuario}
                    onChange={e => setNombreUsuario(e.target.value)}
                    placeholder="Ej: Rosa Díaz"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                </div>

                {/* Texto */}
                <div className="mb-3">
                  <label className="block text-sm text-ch-gray-text mb-1" htmlFor="texto-comentario">
                    Comentario <span className="text-ch-red">*</span>
                  </label>
                  <textarea
                    id="texto-comentario"
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    placeholder="Comparte tu experiencia con este centro de acopio..."
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue resize-none"
                  />
                </div>

                {error && (
                  <p className="text-ch-red text-xs bg-red-50 border border-red-100 rounded px-3 py-2 mb-3">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 rounded transition-colors"
                >
                  Publicar comentario
                </button>
              </form>
            ) : (
              <div className="text-center border border-green-200 bg-green-50 rounded p-4">
                <p className="text-green-800 font-semibold mb-1">✅ ¡Comentario publicado!</p>
                <p className="text-green-700 text-sm mb-3">Tu opinión ya es visible en la parte superior.</p>
                <button
                  onClick={resetForm}
                  className="text-ch-blue text-sm font-medium hover:underline"
                >
                  Agregar otro comentario
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
