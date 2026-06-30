import { NextResponse } from 'next/server'
import { requirePlataforma } from '@/lib/auth-guards'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

// Lista todos los centros activos con su estado de validación.
// Solo accesible para el administrador de plataforma.
export async function GET() {
  const guard = await requirePlataforma()
  if (guard.error) return guard.error

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('centros')
    .select('id, nombre, comuna, region, direccion, administrador, telefono, email, descripcion, estado, created_at')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
