import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const body = await req.json()
  const { centroId, categoria, nombreItem, cantidad, unidad } = body

  const { data, error } = await supabase
    .from('stock')
    .insert({
      centro_id: centroId,
      categoria,
      nombre_item: nombreItem,
      cantidad,
      unidad: unidad || 'unidades',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, updated_at: data.updated_at })
}
