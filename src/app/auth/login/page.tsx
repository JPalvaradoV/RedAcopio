'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

function LoginForm() {
  const params = useSearchParams()
  const recienRegistrado = params.get('registered') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    window.location.href = '/'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
      <h1 className="text-2xl font-bold text-ch-dark mb-1">Iniciar sesión</h1>
      <p className="text-ch-gray-text text-sm mb-6">Ingresa a tu cuenta de Red de Acopio</p>

      {recienRegistrado && (
        <div className="bg-green-50 border border-green-200 rounded px-3 py-2 mb-5 text-sm text-green-800">
          ✅ Cuenta creada. Ingresa con tu correo y contraseña para continuar.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-ch-dark mb-1" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.cl"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ch-dark mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-ch-blue focus:ring-1 focus:ring-ch-blue"
          />
        </div>

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
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="text-center text-sm text-ch-gray-text mt-6">
        ¿No tienes cuenta?{' '}
        <a href="/auth/register" className="text-ch-blue font-semibold hover:underline">
          Regístrate aquí
        </a>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
