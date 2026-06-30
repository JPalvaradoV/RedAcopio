import { createSupabaseServerClient } from './supabase-server'
import type { CentroAcopio } from './data'

function transformCentro(row: Record<string, unknown>): CentroAcopio {
  const comentarios = (row.comentarios as Record<string, unknown>[] | null) ?? []
  const rating =
    comentarios.length > 0
      ? Math.round(
          (comentarios.reduce((s, c) => s + (c.estrellas as number), 0) / comentarios.length) * 10
        ) / 10
      : 0

  return {
    id: row.id as string,
    nombre: row.nombre as string,
    direccion: row.direccion as string,
    comuna: row.comuna as string,
    region: row.region as string,
    administrador: row.administrador as string,
    telefono: row.telefono as string,
    email: row.email as string,
    descripcion: row.descripcion as string,
    activo: row.activo as boolean,
    estado: ((row.estado as string | null) ?? 'aprobado') as 'pendiente' | 'aprobado' | 'rechazado',
    adminId: (row.admin_id as string | null) ?? undefined,
    necesidadesUrgentes: (
      (row.necesidades_urgentes as Record<string, unknown>[] | null) ?? []
    ).map((n) => ({
      id: n.id as string,
      categoria: n.categoria as import('./data').Categoria,
      descripcion: n.descripcion as string,
      cantidad: n.cantidad as string,
      urgencia: n.urgencia as 'alta' | 'media' | 'baja',
      fechaPublicacion: n.fecha_publicacion as string,
    })),
    comentarios: comentarios.map((c) => ({
      id: c.id as string,
      usuario: c.usuario as string,
      texto: c.texto as string,
      estrellas: c.estrellas as number,
      fecha: c.fecha as string,
    })),
    donaciones: (
      (row.donaciones as Record<string, unknown>[] | null) ?? []
    ).map((d) => ({
      id: d.id as string,
      donante: d.donante as string,
      monto: d.monto as number,
      fecha: d.fecha as string,
    })),
    stock: (
      (row.stock as Record<string, unknown>[] | null) ?? []
    ).map((s) => ({
      id: s.id as string,
      categoria: s.categoria as string,
      nombreItem: s.nombre_item as string,
      cantidad: s.cantidad as number,
      unidad: s.unidad as string,
      updatedAt: s.updated_at as string,
    })),
    rating,
    totalComentarios: comentarios.length,
  }
}

export async function getCentros(currentUserId?: string): Promise<CentroAcopio[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('centros')
    .select(`*, necesidades_urgentes(*), comentarios(*), donaciones(*), stock(*)`)
    .eq('activo', true)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  // Solo se exponen centros aprobados. El usuario también ve su propio centro
  // aunque esté pendiente, para poder gestionarlo en "Mi Centro".
  return data
    .map(transformCentro)
    .filter(
      c => c.estado === 'aprobado' || (currentUserId != null && c.adminId === currentUserId)
    )
}
