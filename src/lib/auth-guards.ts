import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from './supabase-server'

// Verifica que el usuario autenticado tenga rol 'plataforma'.
// Devuelve { user } si está autorizado, o { error } con la respuesta HTTP lista.
export async function requirePlataforma(): Promise<
  { user: { id: string }; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 }) }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'plataforma') {
    return { error: NextResponse.json({ error: 'No autorizado.' }, { status: 403 }) }
  }
  return { user: { id: user.id } }
}
