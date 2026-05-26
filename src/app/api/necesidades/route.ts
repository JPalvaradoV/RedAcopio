import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const body = await req.json()
  const { centroId, categoria, descripcion, cantidad, urgencia } = body

  const { data, error } = await supabase
    .from('necesidades_urgentes')
    .insert({ centro_id: centroId, categoria, descripcion, cantidad, urgencia, fecha_publicacion: new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, fecha_publicacion: data.fecha_publicacion })
}
