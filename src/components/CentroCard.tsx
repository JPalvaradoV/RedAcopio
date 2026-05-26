'use client'

import { useState } from 'react'
import type { CentroAcopio } from '@/lib/data'
import ModalDonacion from './ModalDonacion'
import ModalDetalleCentro from './ModalDetalleCentro'

interface Props {
  centro: CentroAcopio
}

const categoriaLabel: Record<string, string> = {
  agua: '💧 Agua',
  alimentos: '🥫 Alimentos',
  ropa: '👕 Ropa',
  medicamentos: '💊 Medicamentos',
  higiene: '🧴 Higiene',
  herramientas: '🔧 Herramientas',
}

function Estrellas({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'text-xl' : 'text-base'
  return (
    <span className={sz}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function CentroCard({ centro }: Props) {
  const [showDonacion, setShowDonacion] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)

  const urgentesAltas = centro.necesidadesUrgentes.filter(n => n.urgencia === 'alta')

  return (
    <>
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Franja de alerta si hay necesidades urgentes */}
        {urgentesAltas.length > 0 && (
          <div className="bg-ch-red text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-2">
            <span>🚨</span>
            <span>ALERTA: {urgentesAltas.length} necesidad{urgentesAltas.length > 1 ? 'es urgentes' : ' urgente'}</span>
          </div>
        )}

        <div className="p-5">
          {/* Cabecera */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="font-bold text-ch-dark text-lg leading-tight">{centro.nombre}</h2>
              <p className="text-ch-gray-text text-sm mt-0.5">
                📍 {centro.direccion}, {centro.comuna}
              </p>
            </div>
            <span className="shrink-0 bg-ch-gray text-ch-blue text-xs font-semibold px-2.5 py-1 rounded-full border border-ch-gray-mid">
              Activo
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <Estrellas rating={centro.rating} />
            <span className="text-sm text-ch-gray-text">
              {centro.rating > 0
                ? `${centro.rating.toFixed(1)} · ${centro.totalComentarios} comentario${centro.totalComentarios !== 1 ? 's' : ''}`
                : 'Sin calificaciones aún'}
            </span>
          </div>

          {/* Necesidades urgentes (primeras 2) */}
          {centro.necesidadesUrgentes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-ch-gray-text uppercase tracking-wide mb-2">
                Necesidades urgentes
              </p>
              <ul className="space-y-1.5">
                {centro.necesidadesUrgentes.slice(0, 2).map((n) => (
                  <li key={n.id} className="flex items-center gap-2 text-sm">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full badge-${n.urgencia}`}>
                      {n.urgencia.toUpperCase()}
                    </span>
                    <span className="text-ch-gray-text">
                      {categoriaLabel[n.categoria]} · {n.descripcion}
                    </span>
                  </li>
                ))}
                {centro.necesidadesUrgentes.length > 2 && (
                  <li className="text-xs text-ch-blue font-medium">
                    + {centro.necesidadesUrgentes.length - 2} más...
                  </li>
                )}
              </ul>
            </div>
          )}

          {centro.necesidadesUrgentes.length === 0 && (
            <p className="text-sm text-ch-gray-text mb-4 italic">
              Sin alertas activas en este momento.
            </p>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {/* Historia 2: Donación directa desde el home */}
            <button
              onClick={() => setShowDonacion(true)}
              className="flex-1 bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 px-4 rounded transition-colors"
            >
              💙 Donar a este centro
            </button>
            <button
              onClick={() => setShowDetalle(true)}
              className="flex-1 border border-ch-blue text-ch-blue hover:bg-ch-gray font-semibold text-sm py-2.5 px-4 rounded transition-colors"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </article>

      {/* Modal de donación (Historia 2) */}
      {showDonacion && (
        <ModalDonacion centro={centro} onClose={() => setShowDonacion(false)} />
      )}

      {/* Modal de detalle con comentarios (Historia 3) */}
      {showDetalle && (
        <ModalDetalleCentro centro={centro} onClose={() => setShowDetalle(false)} />
      )}
    </>
  )
}
