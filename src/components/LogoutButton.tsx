'use client'

import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await supabaseBrowser.auth.signOut()
    router.push('/auth/login')
    router.refresh()
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
