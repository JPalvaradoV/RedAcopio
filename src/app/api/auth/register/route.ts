import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const { email, password, nombre, rut, role, centro } = body

  if (!email || !password || !nombre || !role) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  // Crear usuario en Auth (email auto-confirmado, sin correo de verificación)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    const msg = authError.message.includes('already registered')
      ? 'Ya existe una cuenta con ese correo.'
      : authError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const userId = authData.user.id

  // Insertar perfil
  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: userId, nombre: nombre.trim(), role, rut: rut?.trim() || null })

  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Error al guardar el perfil.' }, { status: 500 })
  }

  // Si es admin, insertar centro
  if (role === 'admin') {
    if (!centro) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Faltan los datos del centro.' }, { status: 400 })
    }

    const { error: centroError } = await admin.from('centros').insert({
      nombre: centro.nombre.trim(),
      direccion: centro.direccion.trim(),
      comuna: centro.comuna,
      region: centro.region,
      administrador: nombre.trim(),
      telefono: centro.telefono.trim(),
      email: centro.email.trim(),
      descripcion: centro.descripcion?.trim() || `Centro de acopio administrado por ${nombre.trim()}.`,
      activo: true,
      estado: 'pendiente',
      admin_id: userId,
    })

    if (centroError) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Error al crear el centro.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, role })
}
