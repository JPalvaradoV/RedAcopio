'use client'

import { useState } from 'react'
import type { CentroAcopio } from '@/lib/data'
import { useStore } from '@/lib/store'
import { useAuthOptional } from '@/contexts/AuthContext'

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

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFecha(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

export default function ModalDetalleCentro({ centro, onClose }: Props) {
  const { agregarComentario } = useStore()
  const user = useAuthOptional()

  const comentarios = centro.comentarios
  const ratingPromedio = centro.rating

  // Formulario comentario
  const [estrellaHover, setEstrellaHover] = useState(0)
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState(0)
  const [nombreUsuario, setNombreUsuario] = useState(user?.nombre ?? '')
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  // Formulario voluntario
  const [showVolForm, setShowVolForm] = useState(false)
  const [volNombre, setVolNombre] = useState(user?.nombre ?? '')
  const [volRut, setVolRut] = useState('')
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([])
  const [volEnviado, setVolEnviado] = useState(false)
  const [volError, setVolError] = useState('')
  const [volLoading, setVolLoading] = useState(false)

  function toggleDia(dia: string) {
    setDiasSeleccionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    )
  }

  async function handleEnviarComentario(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (estrellasSeleccionadas === 0) { setError('Selecciona una puntuación de 1 a 5 estrellas.'); return }
    if (!nombreUsuario.trim()) { setError('Ingresa tu nombre o apodo.'); return }
    if (texto.trim().length < 10) { setError('El comentario debe tener al menos 10 caracteres.'); return }

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

  async function handleInscribirVoluntario(e: React.FormEvent) {
    e.preventDefault()
    setVolError('')
    if (!volNombre.trim()) { setVolError('Ingresa tu nombre.'); return }

    const disponibilidad = diasSeleccionados.length > 0 ? diasSeleccionados.join(', ') : null

    setVolLoading(true)
    const res = await fetch('/api/voluntarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        centroId: centro.id,
        nombre: volNombre.trim(),
        rut: volRut.trim() || null,
        disponibilidad,
      }),
    })
    const json = await res.json()
    setVolLoading(false)
    if (!res.ok) { setVolError(json.error ?? 'Error al inscribirse.'); return }
    setVolEnviado(true)
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

          {/* Stock disponible */}
          <section>
            <h3 className="font-bold text-ch-dark mb-3 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
              📦 Stock disponible
            </h3>
            {centro.stock.length === 0 ? (
              <p className="text-sm text-ch-gray-text italic">Este centro no ha registrado su stock actual.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-ch-gray text-ch-gray-text text-xs uppercase tracking-wide">
                      <th className="text-left px-3 py-2 rounded-tl font-semibold">Categoría</th>
                      <th className="text-left px-3 py-2 font-semibold">Artículo</th>
                      <th className="text-right px-3 py-2 rounded-tr font-semibold">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centro.stock.map((s, i) => (
                      <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-ch-gray-text capitalize">{s.categoria}</td>
                        <td className="px-3 py-2 font-medium text-ch-dark">{s.nombreItem}</td>
                        <td className="px-3 py-2 text-right text-ch-dark">{s.cantidad} {s.unidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Voluntarios */}
          <section>
            <h3 className="font-bold text-ch-dark mb-3 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
              🤝 Ser voluntario
            </h3>
            {!user ? (
              <div className="border border-gray-200 rounded p-4 text-center">
                <p className="text-ch-gray-text text-sm mb-3">Inicia sesión para inscribirte como voluntario en este centro.</p>
                <a
                  href="/auth/login"
                  className="inline-block bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2 px-4 rounded transition-colors"
                >
                  Iniciar sesión
                </a>
              </div>
            ) : volEnviado ? (
              <div className="text-center border border-green-200 bg-green-50 rounded p-4">
                <p className="text-green-800 font-semibold mb-1">✅ ¡Inscripción enviada!</p>
                <p className="text-green-700 text-sm">El administrador del centro revisará tu solicitud.</p>
              </div>
            ) : !showVolForm ? (
              <button
                onClick={() => setShowVolForm(true)}
                className="w-full border-2 border-dashed border-ch-blue text-ch-blue font-semibold text-sm py-3 rounded hover:bg-blue-50 transition-colors"
              >
                + Quiero ser voluntario en este centro
              </button>
            ) : (
              <form onSubmit={handleInscribirVoluntario} noValidate className="border border-gray-200 rounded p-4 space-y-3">
                <h4 className="font-semibold text-ch-dark text-sm">Inscripción como voluntario</h4>

                <div>
                  <label className="block text-sm text-ch-gray-text mb-1">Nombre completo <span className="text-ch-red">*</span></label>
                  <input
                    type="text"
                    value={volNombre}
                    onChange={e => setVolNombre(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm text-ch-gray-text mb-1">RUT / Pasaporte</label>
                  <input
                    type="text"
                    value={volRut}
                    onChange={e => setVolRut(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm text-ch-gray-text mb-2">Días disponibles</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DIAS_SEMANA.map(dia => (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => toggleDia(dia)}
                        className={`text-xs py-1.5 px-1 rounded border font-medium transition-colors ${
                          diasSeleccionados.includes(dia)
                            ? 'bg-ch-blue border-ch-blue text-white'
                            : 'border-gray-300 text-ch-gray-text hover:border-ch-blue'
                        }`}
                      >
                        {dia.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {diasSeleccionados.length > 0 && (
                    <p className="text-xs text-ch-gray-text mt-1.5">{diasSeleccionados.join(', ')}</p>
                  )}
                </div>

                {volError && (
                  <p className="text-ch-red text-xs bg-red-50 border border-red-100 rounded px-3 py-2">⚠️ {volError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={volLoading}
                    className="flex-1 bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 rounded transition-colors disabled:opacity-60"
                  >
                    {volLoading ? 'Enviando...' : 'Inscribirme'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVolForm(false)}
                    className="px-4 border border-gray-300 text-ch-gray-text text-sm rounded hover:bg-ch-gray transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Comentarios y puntuación */}
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

            {!user ? (
              <div className="border border-gray-200 rounded p-4 text-center">
                <p className="text-2xl mb-2">🔒</p>
                <p className="font-semibold text-ch-dark text-sm mb-1">Inicia sesión para comentar</p>
                <p className="text-ch-gray-text text-xs mb-4">Comparte tu experiencia con este centro.</p>
                <div className="flex gap-2">
                  <a href="/auth/login" className="flex-1 bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2 rounded transition-colors text-center">
                    Iniciar sesión
                  </a>
                  <a href="/auth/register" className="flex-1 border border-ch-blue text-ch-blue hover:bg-ch-gray font-semibold text-sm py-2 rounded transition-colors text-center">
                    Crear cuenta
                  </a>
                </div>
              </div>
            ) : !enviado ? (
              <form onSubmit={handleEnviarComentario} noValidate className="border border-gray-200 rounded p-4">
                <h4 className="font-semibold text-ch-dark text-sm mb-3">Dejar un comentario</h4>

                <div className="mb-3">
                  <label className="block text-sm text-ch-gray-text mb-1.5">
                    Tu puntuación <span className="text-ch-red">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`star text-3xl leading-none ${n <= (estrellaHover || estrellasSeleccionadas) ? 'text-yellow-400' : 'text-gray-300'}`}
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

                <button type="submit" className="w-full bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 rounded transition-colors">
                  Publicar comentario
                </button>
              </form>
            ) : (
              <div className="text-center border border-green-200 bg-green-50 rounded p-4">
                <p className="text-green-800 font-semibold mb-1">✅ ¡Comentario publicado!</p>
                <p className="text-green-700 text-sm mb-3">Tu opinión ya es visible en la parte superior.</p>
                <button onClick={resetForm} className="text-ch-blue text-sm font-medium hover:underline">
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
