'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

type Role = 'usuario' | 'admin'

export default function RegisterPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Datos personales
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Datos del centro (solo admins)
  const [centroNombre, setCentroNombre] = useState('')
  const [centroDir, setCentroDir] = useState('')
  const [centroComuna, setCentroComuna] = useState('')
  const [centroRegion, setCentroRegion] = useState('')
  const [centroTel, setCentroTel] = useState('')
  const [centroEmail, setCentroEmail] = useState('')
  const [centroDesc, setCentroDesc] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!role) { setError('Selecciona un tipo de cuenta.'); return }
    if (!nombre.trim()) { setError('Ingresa tu nombre completo.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (role === 'admin') {
      if (!centroNombre.trim()) { setError('Ingresa el nombre del centro.'); return }
      if (!centroDir.trim()) { setError('Ingresa la dirección del centro.'); return }
      if (!centroComuna.trim()) { setError('Ingresa la comuna del centro.'); return }
      if (!centroRegion.trim()) { setError('Ingresa la región del centro.'); return }
      if (!centroTel.trim()) { setError('Ingresa el teléfono del centro.'); return }
      if (!centroEmail.trim()) { setError('Ingresa el email del centro.'); return }
    }

    setLoading(true)

    const { data, error: signUpError } = await supabaseBrowser.auth.signUp({ email, password })
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Error al crear la cuenta.')
      setLoading(false)
      return
    }

    const userId = data.user.id

    const { error: profileError } = await supabaseBrowser
      .from('profiles')
      .insert({ id: userId, nombre: nombre.trim(), role })

    if (profileError) {
      setError(`Error al guardar el perfil: ${profileError.message}`)
      setLoading(false)
      return
    }

    if (role === 'admin') {
      const { error: centroError } = await supabaseBrowser
        .from('centros')
        .insert({
          nombre: centroNombre.trim(),
          direccion: centroDir.trim(),
          comuna: centroComuna.trim(),
          region: centroRegion.trim(),
          administrador: nombre.trim(),
          telefono: centroTel.trim(),
          email: centroEmail.trim(),
          descripcion: centroDesc.trim() || `Centro de acopio administrado por ${nombre.trim()}.`,
          activo: true,
          admin_id: userId,
        })

      if (centroError) {
        setError(`Error al crear el centro: ${centroError.message}`)
        setLoading(false)
        return
      }
    }

    window.location.href = '/'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 my-4">
      <h1 className="text-2xl font-bold text-ch-dark mb-1">Crear cuenta</h1>
      <p className="text-ch-gray-text text-sm mb-6">Únete a la Red de Acopio Chile</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Tipo de cuenta */}
        <div>
          <p className="text-sm font-semibold text-ch-dark mb-2">¿Cómo quieres participar?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('usuario')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                role === 'usuario'
                  ? 'border-ch-blue bg-blue-50'
                  : 'border-gray-200 hover:border-ch-blue'
              }`}
            >
              <div className="text-2xl mb-1">💙</div>
              <p className="font-bold text-ch-dark text-sm">Soy donante</p>
              <p className="text-xs text-ch-gray-text mt-0.5">Quiero donar y dejar reseñas</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                role === 'admin'
                  ? 'border-ch-blue bg-blue-50'
                  : 'border-gray-200 hover:border-ch-blue'
              }`}
            >
              <div className="text-2xl mb-1">🏛️</div>
              <p className="font-bold text-ch-dark text-sm">Soy administrador</p>
              <p className="text-xs text-ch-gray-text mt-0.5">Gestiono un centro de acopio</p>
            </button>
          </div>
        </div>

        {/* Datos personales */}
        {role && (
          <>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-ch-gray-text uppercase tracking-wide mb-3">
                Datos personales
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-ch-dark mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: María González"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ch-dark mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.cl"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ch-dark mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                </div>
              </div>
            </div>

            {/* Datos del centro — solo admins */}
            {role === 'admin' && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-ch-gray-text uppercase tracking-wide mb-3">
                  Datos de tu centro de acopio
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-ch-dark mb-1">
                      Nombre del centro
                    </label>
                    <input
                      type="text"
                      value={centroNombre}
                      onChange={e => setCentroNombre(e.target.value)}
                      placeholder="Ej: Centro de Acopio Sector Norte"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ch-dark mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={centroDir}
                      onChange={e => setCentroDir(e.target.value)}
                      placeholder="Ej: Av. Los Libertadores 1250"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-ch-dark mb-1">
                        Comuna
                      </label>
                      <input
                        type="text"
                        value={centroComuna}
                        onChange={e => setCentroComuna(e.target.value)}
                        placeholder="Ej: Quilicura"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ch-dark mb-1">
                        Región
                      </label>
                      <input
                        type="text"
                        value={centroRegion}
                        onChange={e => setCentroRegion(e.target.value)}
                        placeholder="Ej: Metropolitana"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-ch-dark mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={centroTel}
                        onChange={e => setCentroTel(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ch-dark mb-1">
                        Email del centro
                      </label>
                      <input
                        type="email"
                        value={centroEmail}
                        onChange={e => setCentroEmail(e.target.value)}
                        placeholder="centro@mail.cl"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ch-dark mb-1">
                      Descripción <span className="text-ch-gray-text font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={centroDesc}
                      onChange={e => setCentroDesc(e.target.value)}
                      placeholder="Describe brevemente tu centro y a quién atiende..."
                      rows={2}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-ch-red text-sm bg-red-50 border border-red-100 rounded px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ch-blue hover:bg-ch-blue-hover text-white font-bold py-3 rounded transition-colors disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : role === 'admin' ? 'Crear cuenta y centro' : 'Crear cuenta'}
            </button>
          </>
        )}
      </form>

      <p className="text-center text-sm text-ch-gray-text mt-6">
        ¿Ya tienes cuenta?{' '}
        <a href="/auth/login" className="text-ch-blue font-semibold hover:underline">
          Inicia sesión
        </a>
      </p>
    </div>
  )
}
