import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión para inscribirte.' }, { status: 401 })

  const body = await req.json()
  const { centroId, nombre, rut, disponibilidad } = body

  const { data, error } = await supabase
    .from('voluntarios')
    .insert({
      centro_id: centroId,
      user_id: user.id,
      nombre,
      rut: rut || null,
      disponibilidad: disponibilidad || null,
      estado: 'pendiente',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const centroId = req.nextUrl.searchParams.get('centroId')
  if (!centroId) return NextResponse.json({ error: 'centroId requerido' }, { status: 400 })

  const { data, error } = await supabase
    .from('voluntarios')
    .select('*')
    .eq('centro_id', centroId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
