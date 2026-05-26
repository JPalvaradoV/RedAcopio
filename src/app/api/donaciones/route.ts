import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const body = await req.json()
  const { centroId, donante, monto } = body

  const { data, error } = await supabase
    .from('donaciones')
    .insert({ centro_id: centroId, donante, monto, fecha: new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, fecha: data.fecha })
}
