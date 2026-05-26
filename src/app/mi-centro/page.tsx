'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { type NecesidadUrgente } from '@/lib/data'
import ModalPedidoEmergencia from '@/components/ModalPedidoEmergencia'

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
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${d.getDate()} de ${MESES[d.getMonth()]}, ${h}:${m}`
}

export default function MiCentroPage() {
  const { centros, agregarNecesidad, eliminarNecesidad } = useStore()
  const [showModal, setShowModal] = useState(false)

  const centroLogueado = centros[0]
  const necesidades = centroLogueado?.necesidadesUrgentes ?? []

  async function handleGuardar(nueva: Omit<NecesidadUrgente, 'id'>) {
    if (!centroLogueado) return
    await agregarNecesidad(centroLogueado.id, nueva)
  }

  async function handleEliminar(id: string) {
    if (!centroLogueado) return
    await eliminarNecesidad(centroLogueado.id, id)
  }

  const urgentesAltas = necesidades.filter(n => n.urgencia === 'alta')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-ch-gray-text mb-6">
        <a href="/" className="hover:text-ch-blue hover:underline">Inicio</a>
        <span className="mx-2">›</span>
        <span className="text-ch-dark font-medium">Mi Centro</span>
      </nav>

      {/* Cabecera del panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block" />
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Centro activo</span>
          </div>
          <h1 className="text-2xl font-bold text-ch-dark">{centroLogueado.nombre}</h1>
          <p className="text-ch-gray-text text-sm mt-1">
            📍 {centroLogueado.direccion}, {centroLogueado.comuna}, Región {centroLogueado.region}
          </p>
          <p className="text-ch-gray-text text-sm mt-0.5">
            👤 Administrador: <strong>{centroLogueado.administrador}</strong>
          </p>
          <p className="text-ch-gray-text text-sm mt-0.5">
            📞 {centroLogueado.telefono} · ✉️ {centroLogueado.email}
          </p>
        </div>

        {/* Historia 1: Botón principal de pedido de emergencia */}
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 bg-ch-red hover:bg-red-700 text-white font-bold py-3 px-5 rounded flex items-center gap-2 transition-colors text-sm"
        >
          🚨 Publicar pedido de emergencia
        </button>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-ch-blue">{necesidades.length}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Alertas activas</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-ch-red">{urgentesAltas.length}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Urgentes altas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-ch-blue">{centroLogueado.donaciones.length}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Donaciones recibidas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-ch-blue">
            {centroLogueado.rating > 0 ? `${centroLogueado.rating}★` : '—'}
          </p>
          <p className="text-xs text-ch-gray-text mt-0.5">Calificación</p>
        </div>
      </div>

      {/* Lista de necesidades/pedidos publicados */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ch-dark">Pedidos de emergencia publicados</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-ch-blue font-semibold hover:underline"
          >
            + Publicar nuevo
          </button>
        </div>

        {necesidades.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-10 text-center text-ch-gray-text">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-semibold text-ch-dark mb-1">No hay pedidos publicados</p>
            <p className="text-sm mb-4">Publica un pedido de emergencia cuando necesites recursos urgentes.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-ch-red hover:bg-red-700 text-white font-semibold text-sm py-2.5 px-5 rounded transition-colors"
            >
              🚨 Publicar primer pedido
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {necesidades.map((n) => (
              <li
                key={n.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full badge-${n.urgencia}`}>
                    {n.urgencia.toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-ch-dark text-sm">
                      {categoriaLabel[n.categoria]} · {n.descripcion}
                    </p>
                    <p className="text-xs text-ch-gray-text mt-0.5">
                      Cantidad: {n.cantidad} · Publicado: {formatFecha(n.fechaPublicacion)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEliminar(n.id)}
                  className="shrink-0 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded transition-colors"
                  aria-label="Eliminar pedido"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal Historia 1 */}
      {showModal && (
        <ModalPedidoEmergencia
          onClose={() => setShowModal(false)}
          onGuardar={async (nueva) => {
            await handleGuardar(nueva)
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
