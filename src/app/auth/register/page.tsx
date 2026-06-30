'use client'

import { useState, useMemo } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { NOMBRES_REGIONES, getComunasByRegion } from '@/lib/chile-geo'

type Role = 'usuario' | 'admin'

export default function RegisterPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [centroEnviado, setCentroEnviado] = useState(false)

  // Datos personales
  const [nombre, setNombre] = useState('')
  const [rut, setRut] = useState('')
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

  const comunasDisponibles = useMemo(() => getComunasByRegion(centroRegion), [centroRegion])

  function handleCambiarRegion(nueva: string) {
    setCentroRegion(nueva)
    setCentroComuna('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/
    if (!role) { setError('Selecciona un tipo de cuenta.'); return }
    if (!nombre.trim()) { setError('Ingresa tu nombre completo.'); return }
    if (!rut.trim()) { setError('Ingresa tu RUT.'); return }
    if (!rutRegex.test(rut.trim())) { setError('El RUT debe tener el formato XX.XXX.XXX-X (ej: 12.345.678-9).'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (role === 'admin') {
      if (!centroNombre.trim()) { setError('Ingresa el nombre del centro.'); return }
      if (!centroDir.trim()) { setError('Ingresa la dirección del centro.'); return }
      if (!centroRegion) { setError('Selecciona la región del centro.'); return }
      if (!centroComuna) { setError('Selecciona la comuna del centro.'); return }
      if (!centroTel.trim()) { setError('Ingresa el teléfono del centro.'); return }
      if (!centroEmail.trim()) { setError('Ingresa el email del centro.'); return }
    }

    setLoading(true)

    // Registro server-side (evita problemas de red del browser con Supabase)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        nombre: nombre.trim(),
        rut: rut.trim(),
        role,
        ...(role === 'admin' && {
          centro: {
            nombre: centroNombre.trim(),
            direccion: centroDir.trim(),
            comuna: centroComuna,
            region: centroRegion,
            telefono: centroTel.trim(),
            email: centroEmail.trim(),
            descripcion: centroDesc.trim(),
          },
        }),
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Error al crear la cuenta.')
      setLoading(false)
      return
    }

    // Cuenta creada — iniciar sesión automáticamente
    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      // Cuenta creada pero no se pudo iniciar sesión desde el browser
      // Redirigir al login con mensaje
      window.location.href = '/auth/login?registered=1'
      return
    }

    if (role === 'admin') {
      setCentroEnviado(true)
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  if (centroEnviado) {
    return (
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 my-4 text-center">
        <div className="text-5xl mb-4">🕓</div>
        <h1 className="text-2xl font-bold text-ch-dark mb-2">Centro registrado</h1>
        <p className="text-ch-gray-text text-sm mb-6">
          Tu cuenta fue creada y tu centro <strong>{centroNombre.trim()}</strong> quedó{' '}
          <strong>pendiente de validación</strong>. Un administrador de la plataforma lo revisará
          antes de que aparezca públicamente. Mientras tanto puedes gestionarlo desde{' '}
          <strong>Mi Centro</strong>.
        </p>
        <a
          href="/"
          className="inline-block bg-ch-blue hover:bg-ch-blue-hover text-white font-bold py-3 px-6 rounded transition-colors text-sm"
        >
          Ir al inicio
        </a>
      </div>
    )
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
                role === 'usuario' ? 'border-ch-blue bg-blue-50' : 'border-gray-200 hover:border-ch-blue'
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
                role === 'admin' ? 'border-ch-blue bg-blue-50' : 'border-gray-200 hover:border-ch-blue'
              }`}
            >
              <div className="text-2xl mb-1">🏛️</div>
              <p className="font-bold text-ch-dark text-sm">Soy administrador</p>
              <p className="text-xs text-ch-gray-text mt-0.5">Gestiono un centro de acopio</p>
            </button>
          </div>
        </div>

        {role && (
          <>
            {/* Datos personales */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-ch-gray-text uppercase tracking-wide mb-3">
                Datos personales
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-ch-dark mb-1">Nombre completo</label>
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
                    RUT <span className="text-ch-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={rut}
                    onChange={e => setRut(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                  <p className="text-xs text-ch-gray-text mt-0.5">Formato: 12.345.678-9</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ch-dark mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.cl"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ch-dark mb-1">Contraseña</label>
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
                    <label className="block text-sm font-semibold text-ch-dark mb-1">Nombre del centro</label>
                    <input
                      type="text"
                      value={centroNombre}
                      onChange={e => setCentroNombre(e.target.value)}
                      placeholder="Ej: Centro de Acopio Sector Norte"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ch-dark mb-1">Dirección</label>
                    <input
                      type="text"
                      value={centroDir}
                      onChange={e => setCentroDir(e.target.value)}
                      placeholder="Ej: Av. Los Libertadores 1250"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ch-dark mb-1">Región</label>
                    <select
                      value={centroRegion}
                      onChange={e => handleCambiarRegion(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                    >
                      <option value="">Selecciona una región...</option>
                      {NOMBRES_REGIONES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ch-dark mb-1">Comuna</label>
                    <select
                      value={centroComuna}
                      onChange={e => setCentroComuna(e.target.value)}
                      disabled={!centroRegion}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue disabled:bg-gray-100 disabled:text-ch-gray-text disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {centroRegion ? 'Selecciona una comuna...' : 'Primero selecciona una región'}
                      </option>
                      {comunasDisponibles.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-ch-dark mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={centroTel}
                        onChange={e => setCentroTel(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ch-dark mb-1">Email del centro</label>
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
