'use client'

import { useState } from 'react'
import type { CentroAcopio } from '@/lib/data'
import { useStore } from '@/lib/store'

interface Props {
  centro: CentroAcopio
  onClose: () => void
}

export default function ModalDonacion({ centro, onClose }: Props) {
  const { agregarDonacion } = useStore()
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('Por favor ingresa tu nombre o escribe "Anónimo".')
      return
    }
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      setError('Ingresa un monto válido mayor a $0.')
      return
    }

    await agregarDonacion(centro.id, {
      donante: nombre.trim(),
      monto: Number(monto),
      fecha: new Date().toISOString(),
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
        {/* Cabecera del modal */}
        <div className="bg-ch-blue px-6 py-4 rounded-t-lg flex items-start justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">💙 Donación por transferencia</h2>
            <p className="text-blue-200 text-sm mt-0.5">{centro.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white text-2xl leading-none mt-0.5"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {!enviado ? (
            <form onSubmit={handleSubmit} noValidate>
              {/* Nombre */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ch-dark mb-1" htmlFor="nombre-donante">
                  Tu nombre <span className="text-ch-gray-text font-normal">(o escribe "Anónimo")</span>
                </label>
                <input
                  id="nombre-donante"
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                />
              </div>

              {/* Monto */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ch-dark mb-1" htmlFor="monto">
                  Monto a comprometer (CLP)
                </label>
                <div className="flex items-center border border-gray-300 rounded focus-within:border-ch-blue focus-within:ring-1 focus-within:ring-ch-blue">
                  <span className="px-3 text-ch-gray-text text-sm border-r border-gray-300 bg-gray-50 py-2 rounded-l">$</span>
                  <input
                    id="monto"
                    type="number"
                    min="1"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder="10000"
                    className="flex-1 px-3 py-2 text-sm focus:outline-none rounded-r"
                  />
                </div>
                <p className="text-xs text-ch-gray-text mt-1">
                  El centro te contactará para coordinar la transferencia.
                </p>
              </div>

              {/* Necesidades urgentes como referencia */}
              {centro.necesidadesUrgentes.length > 0 && (
                <div className="mb-4 bg-red-50 border border-red-100 rounded p-3">
                  <p className="text-xs font-semibold text-ch-red mb-1.5">🚨 Necesidades urgentes del centro</p>
                  <ul className="text-xs text-red-800 space-y-0.5">
                    {centro.necesidadesUrgentes
                      .filter(n => n.urgencia === 'alta')
                      .map(n => (
                        <li key={n.id}>· {n.descripcion} ({n.cantidad})</li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-ch-red text-sm bg-red-50 border border-red-100 rounded px-3 py-2 mb-3">
                  ⚠️ {error}
                </p>
              )}

              {/* Botones */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-ch-gray-text hover:bg-gray-50 font-semibold text-sm py-2.5 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 rounded transition-colors"
                >
                  Comprometer donación
                </button>
              </div>
            </form>
          ) : (
            /* Estado de éxito */
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-bold text-ch-dark text-lg mb-2">¡Gracias por tu apoyo!</h3>
              <p className="text-ch-gray-text text-sm mb-1">
                Tu compromiso de donación ha sido registrado.
              </p>
              <p className="text-ch-gray-text text-sm mb-6">
                El equipo de <strong>{centro.nombre}</strong> se pondrá en contacto contigo para coordinar la transferencia.
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
