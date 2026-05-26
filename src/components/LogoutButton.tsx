'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'

export default function LogoutButton() {
  async function handleLogout() {
    await supabaseBrowser.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="text-blue-200 hover:text-white text-xs font-medium hover:underline transition-colors"
      aria-label="Cerrar sesión"
    >
      Salir
    </button>
  )
}
