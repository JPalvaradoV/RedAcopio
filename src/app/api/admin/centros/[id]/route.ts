import { NextRequest, NextResponse } from 'next/server'
import { requirePlataforma } from '@/lib/auth-guards'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const ESTADOS_VALIDOS = ['pendiente', 'aprobado', 'rechazado'] as const

// Aprueba o rechaza un centro. Solo el administrador de plataforma.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePlataforma()
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const estado = body?.estado

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin.from('centros').update({ estado }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, estado })
}
