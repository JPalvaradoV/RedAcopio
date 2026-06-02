'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { type NecesidadUrgente, type StockItem, type Voluntario } from '@/lib/data'
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

const CATEGORIAS_STOCK = ['agua', 'alimentos', 'ropa', 'medicamentos', 'higiene', 'herramientas', 'mobiliario', 'otro']
const UNIDADES_STOCK = ['unidades', 'kg', 'litros', 'cajas', 'prendas', 'botellas', 'paquetes']

const estadoBadge: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

export default function MiCentroPage() {
  const { centros, agregarNecesidad, eliminarNecesidad, agregarStock, actualizarStock, eliminarStock } = useStore()
  const { id: userId, role } = useAuth()
  const [showModal, setShowModal] = useState(false)

  const centroLogueado = centros.find(c => c.adminId === userId)
  const necesidades = centroLogueado?.necesidadesUrgentes ?? []
  const stockItems: StockItem[] = centroLogueado?.stock ?? []

  // Stock form state
  const [showStockForm, setShowStockForm] = useState(false)
  const [stockCategoria, setStockCategoria] = useState('alimentos')
  const [stockNombreItem, setStockNombreItem] = useState('')
  const [stockCantidad, setStockCantidad] = useState(0)
  const [stockUnidad, setStockUnidad] = useState('unidades')
  const [stockLoading, setStockLoading] = useState(false)
  const [stockError, setStockError] = useState('')

  // Stock edición de cantidad
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editCantidad, setEditCantidad] = useState(0)
  const [editLoading, setEditLoading] = useState(false)

  // Voluntarios state
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([])
  const [volLoading, setVolLoading] = useState(false)

  useEffect(() => {
    if (!centroLogueado) return
    setVolLoading(true)
    fetch(`/api/voluntarios?centroId=${centroLogueado.id}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setVoluntarios(data) : setVoluntarios([]))
      .catch(() => setVoluntarios([]))
      .finally(() => setVolLoading(false))
  }, [centroLogueado?.id])

  if (role !== 'admin' || !centroLogueado) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-ch-gray-text">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-semibold text-ch-dark mb-1">Acceso restringido</p>
        <p className="text-sm">Esta sección es solo para administradores de centros.</p>
      </div>
    )
  }

  async function handleGuardar(nueva: Omit<NecesidadUrgente, 'id'>) {
    if (!centroLogueado) return
    await agregarNecesidad(centroLogueado.id, nueva)
  }

  async function handleEliminar(id: string) {
    if (!centroLogueado) return
    await eliminarNecesidad(centroLogueado.id, id)
  }

  async function handleAgregarStock(e: React.FormEvent) {
    e.preventDefault()
    setStockError('')
    if (!centroLogueado) return
    if (!stockNombreItem.trim()) { setStockError('Ingresa el nombre del artículo.'); return }
    if (stockCantidad <= 0) { setStockError('La cantidad debe ser mayor a 0.'); return }

    setStockLoading(true)
    try {
      await agregarStock(centroLogueado.id, {
        categoria: stockCategoria,
        nombreItem: stockNombreItem.trim(),
        cantidad: stockCantidad,
        unidad: stockUnidad,
      })
      setStockNombreItem('')
      setStockCantidad(0)
      setShowStockForm(false)
    } catch (err) {
      setStockError(err instanceof Error ? err.message : 'Error al agregar item.')
    } finally {
      setStockLoading(false)
    }
  }

  async function handleEliminarStock(stockId: string) {
    if (!centroLogueado) return
    await eliminarStock(centroLogueado.id, stockId)
  }

  async function handleGuardarCantidad(stockId: string) {
    if (!centroLogueado) return
    setEditLoading(true)
    try {
      await actualizarStock(centroLogueado.id, stockId, editCantidad)
      setEditingStockId(null)
    } finally {
      setEditLoading(false)
    }
  }

  async function handleCambiarEstadoVol(volId: string, estado: 'aprobado' | 'rechazado') {
    const res = await fetch(`/api/voluntarios/${volId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    if (res.ok) {
      setVoluntarios(prev => prev.map(v => v.id === volId ? { ...v, estado } : v))
    }
  }

  const urgentesAltas = necesidades.filter(n => n.urgencia === 'alta')
  const volPendientes = voluntarios.filter(v => v.estado === 'pendiente').length

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
          <p className="text-2xl font-bold text-ch-blue">{stockItems.length}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Items en stock</p>
        </div>
        <div className="bg-white border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{volPendientes}</p>
          <p className="text-xs text-ch-gray-text mt-0.5">Voluntarios pendientes</p>
        </div>
      </div>

      {/* Pedidos de emergencia */}
      <section className="mb-8">
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

      {/* Stock del centro */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ch-dark">📦 Stock del centro</h2>
          <button
            onClick={() => { setShowStockForm(true); setStockError('') }}
            className="text-sm text-ch-blue font-semibold hover:underline"
          >
            + Agregar item
          </button>
        </div>

        {showStockForm && (
          <form onSubmit={handleAgregarStock} noValidate className="bg-white border border-ch-blue border-opacity-40 rounded-lg p-5 mb-4">
            <p className="text-sm font-semibold text-ch-dark mb-3">Nuevo item de stock</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-ch-gray-text mb-1">Categoría</label>
                <select
                  value={stockCategoria}
                  onChange={e => setStockCategoria(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
                >
                  {CATEGORIAS_STOCK.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ch-gray-text mb-1">Artículo</label>
                <input
                  type="text"
                  value={stockNombreItem}
                  onChange={e => setStockNombreItem(e.target.value)}
                  placeholder="Ej: Agua mineral 500ml"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-ch-gray-text mb-1">Cantidad</label>
                <input
                  type="number"
                  min={0}
                  value={stockCantidad}
                  onChange={e => setStockCantidad(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ch-gray-text mb-1">Unidad</label>
                <select
                  value={stockUnidad}
                  onChange={e => setStockUnidad(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue"
                >
                  {UNIDADES_STOCK.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            {stockError && (
              <p className="text-ch-red text-xs bg-red-50 border border-red-100 rounded px-3 py-2 mb-3">⚠️ {stockError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={stockLoading}
                className="flex-1 bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 rounded transition-colors disabled:opacity-60"
              >
                {stockLoading ? 'Guardando...' : 'Guardar item'}
              </button>
              <button
                type="button"
                onClick={() => setShowStockForm(false)}
                className="px-4 border border-gray-300 text-ch-gray-text text-sm rounded hover:bg-ch-gray transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {stockItems.length === 0 && !showStockForm ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-ch-gray-text">
            <p className="text-3xl mb-3">📦</p>
            <p className="font-semibold text-ch-dark mb-1">Sin stock registrado</p>
            <p className="text-sm mb-4">Registra el inventario disponible para que los donantes sepan qué traer.</p>
            <button
              onClick={() => setShowStockForm(true)}
              className="bg-ch-blue hover:bg-ch-blue-hover text-white font-semibold text-sm py-2.5 px-5 rounded transition-colors"
            >
              + Agregar primer item
            </button>
          </div>
        ) : stockItems.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ch-gray">
                <tr className="text-ch-gray-text text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Categoría</th>
                  <th className="text-left px-4 py-3 font-semibold">Artículo</th>
                  <th className="text-right px-4 py-3 font-semibold">Cantidad</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((s, i) => (
                  <tr key={s.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 text-ch-gray-text capitalize">{s.categoria}</td>
                    <td className="px-4 py-3 font-medium text-ch-dark">{s.nombreItem}</td>
                    <td className="px-4 py-3 text-right text-ch-dark">
                      {editingStockId === s.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min={0}
                            value={editCantidad}
                            onChange={e => setEditCantidad(Number(e.target.value))}
                            className="w-20 border border-ch-blue rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-ch-blue"
                            autoFocus
                          />
                          <span className="text-ch-gray-text text-xs">{s.unidad}</span>
                        </div>
                      ) : (
                        <span>{s.cantidad} {s.unidad}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingStockId === s.id ? (
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleGuardarCantidad(s.id)}
                            disabled={editLoading}
                            className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2.5 py-1 rounded font-semibold transition-colors disabled:opacity-60"
                          >
                            {editLoading ? '...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="text-xs border border-gray-300 text-ch-gray-text px-2.5 py-1 rounded hover:bg-ch-gray transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => { setEditingStockId(s.id); setEditCantidad(s.cantidad) }}
                            className="text-xs text-ch-blue hover:text-ch-blue-hover border border-blue-200 hover:border-ch-blue px-2.5 py-1 rounded transition-colors"
                          >
                            Ajustar
                          </button>
                          <button
                            onClick={() => handleEliminarStock(s.id)}
                            className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Voluntarios */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-ch-dark mb-4">🤝 Voluntarios inscritos</h2>

        {volLoading ? (
          <div className="text-center py-8 text-ch-gray-text text-sm">Cargando voluntarios...</div>
        ) : voluntarios.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-ch-gray-text">
            <p className="text-3xl mb-3">🤝</p>
            <p className="font-semibold text-ch-dark mb-1">Sin voluntarios inscritos</p>
            <p className="text-sm">Los usuarios que se inscriban desde la vista pública aparecerán aquí.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ch-gray">
                <tr className="text-ch-gray-text text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold">RUT</th>
                  <th className="text-left px-4 py-3 font-semibold">Correo</th>
                  <th className="text-left px-4 py-3 font-semibold">Disponibilidad</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {voluntarios.map((v, i) => (
                  <tr key={v.id} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 font-medium text-ch-dark">{v.nombre}</td>
                    <td className="px-4 py-3 text-ch-gray-text font-mono text-xs">{v.rut ?? '—'}</td>
                    <td className="px-4 py-3 text-ch-gray-text text-xs">{v.email ?? '—'}</td>
                    <td className="px-4 py-3 text-ch-gray-text">{v.disponibilidad ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge[v.estado]}`}>
                        {v.estado.charAt(0).toUpperCase() + v.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.estado === 'pendiente' && (
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleCambiarEstadoVol(v.id, 'aprobado')}
                            className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2.5 py-1 rounded transition-colors font-semibold"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleCambiarEstadoVol(v.id, 'rechazado')}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1 rounded transition-colors font-semibold"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal pedido emergencia */}
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
