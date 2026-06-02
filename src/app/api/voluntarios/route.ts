import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  // Validar auth con cliente normal
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión para inscribirte.' }, { status: 401 })

  const admin = createSupabaseAdminClient()

  // Verificar si ya está inscrito como voluntario en cualquier centro
  const { count } = await admin
    .from('voluntarios')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count > 0) {
    return NextResponse.json({ error: 'YA_VOLUNTARIO' }, { status: 409 })
  }

  const body = await req.json()
  const { centroId, nombre, disponibilidad } = body

  // Obtener RUT del perfil del usuario autenticado
  const { data: profile } = await supabase
    .from('profiles')
    .select('rut')
    .eq('id', user.id)
    .single()

  const { data, error } = await admin
    .from('voluntarios')
    .insert({
      centro_id: centroId,
      user_id: user.id,
      nombre,
      rut: profile?.rut ?? null,
      email: user.email ?? null,
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
