'use client'

import { useState } from 'react'
import type { Categoria, NecesidadUrgente } from '@/lib/data'

interface Props {
  onClose: () => void
  onGuardar: (necesidad: Omit<NecesidadUrgente, 'id'>) => Promise<void>
}

const categorias: { value: Categoria; label: string; icon: string }[] = [
  { value: 'agua', label: 'Agua', icon: '💧' },
  { value: 'alimentos', label: 'Alimentos', icon: '🥫' },
  { value: 'ropa', label: 'Ropa', icon: '👕' },
  { value: 'medicamentos', label: 'Medicamentos', icon: '💊' },
  { value: 'higiene', label: 'Higiene', icon: '🧴' },
  { value: 'herramientas', label: 'Herramientas', icon: '🔧' },
]

export default function ModalPedidoEmergencia({ onClose, onGuardar }: Props) {
  const [categoria, setCategoria] = useState<Categoria | ''>('')
  const [descripcion, setDescripcion] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [urgencia, setUrgencia] = useState<'alta' | 'media' | 'baja'>('alta')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!categoria) {
      setError('Selecciona una categoría para el recurso.')
      return
    }
    if (descripcion.trim().length < 5) {
      setError('Describe el recurso con al menos 5 caracteres.')
      return
    }
    if (!cantidad.trim()) {
      setError('Indica la cantidad aproximada que necesitas.')
      return
    }

    await onGuardar({
      categoria: categoria as Categoria,
      descripcion: descripcion.trim(),
      cantidad: cantidad.trim(),
      urgencia,
      fechaPublicacion: new Date().toISOString(),
    })
    setEnviado(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md modal-enter">
        {/* Cabecera roja — emergencia */}
        <div className="bg-ch-red px-6 py-4 rounded-t-lg flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">🚨 Pedido de emergencia</h2>
            <p className="text-red-200 text-sm mt-0.5">Publicar necesidad urgente de recursos</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white text-2xl leading-none mt-0.5"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {!enviado ? (
            <form onSubmit={handleSubmit} noValidate>
              {/* Nivel de urgencia */}
              <fieldset className="mb-5">
                <legend className="text-sm font-semibold text-ch-dark mb-2">
                  Nivel de urgencia
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['alta', 'media', 'baja'] as const).map((u) => (
                    <label
                      key={u}
                      className={`flex items-center justify-center gap-1.5 p-2.5 rounded border-2 cursor-pointer text-sm font-semibold capitalize transition-colors
                        ${urgencia === u
                          ? u === 'alta'
                            ? 'border-ch-red bg-red-50 text-ch-red'
                            : u === 'media'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-ch-gray-text hover:border-gray-400'
                        }`}
                    >
                      <input
                        type="radio"
                        name="urgencia"
                        value={u}
                        checked={urgencia === u}
                        onChange={() => setUrgencia(u)}
                        className="sr-only"
                      />
                      {u === 'alta' ? '🔴' : u === 'media' ? '🟡' : '🟢'} {u}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Categoría */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ch-dark mb-2">
                  Categoría del recurso <span className="text-ch-red">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categorias.map((c) => (
                    <label
                      key={c.value}
                      className={`flex flex-col items-center p-2.5 rounded border-2 cursor-pointer text-xs font-medium transition-colors
                        ${categoria === c.value
                          ? 'border-ch-blue bg-blue-50 text-ch-blue'
                          : 'border-gray-200 text-ch-gray-text hover:border-ch-blue'
                        }`}
                    >
                      <input
                        type="radio"
                        name="categoria"
                        value={c.value}
                        checked={categoria === c.value}
                        onChange={() => setCategoria(c.value)}
                        className="sr-only"
                      />
                      <span className="text-xl mb-0.5">{c.icon}</span>
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ch-dark mb-1" htmlFor="descripcion-pedido">
                  Descripción del recurso <span className="text-ch-red">*</span>
                </label>
                <input
                  id="descripcion-pedido"
                  type="text"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder="Ej: Bidones de agua potable de 20 litros"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                />
              </div>

              {/* Cantidad */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-ch-dark mb-1" htmlFor="cantidad-pedido">
                  Cantidad requerida <span className="text-ch-red">*</span>
                </label>
                <input
                  id="cantidad-pedido"
                  type="text"
                  value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                  placeholder="Ej: 200 unidades, 50 kg, Lo que sea posible"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                />
              </div>

              {error && (
                <p className="text-ch-red text-sm bg-red-50 border border-red-100 rounded px-3 py-2 mb-3">
                  ⚠️ {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-ch-gray-text hover:bg-gray-50 font-semibold text-sm py-2.5 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-ch-red hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded transition-colors"
                >
                  🚨 Publicar pedido
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-bold text-ch-dark text-lg mb-2">¡Pedido publicado!</h3>
              <p className="text-ch-gray-text text-sm mb-6">
                Tu alerta de emergencia ya es visible para todos los donantes en la página de inicio.
              </p>
              <button
                onClick={onClose}
                className="bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 px-6 rounded transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
