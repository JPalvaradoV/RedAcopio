import { supabase } from './supabase'
import type { CentroAcopio } from './data'

export async function getCentros(): Promise<CentroAcopio[]> {
  const { data, error } = await supabase
    .from('centros')
    .select(`
      *,
      necesidades_urgentes(*),
      comentarios(*),
      donaciones(*)
    `)
    .eq('activo', true)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map((row) => {
    const comentarios = row.comentarios ?? []
    const rating =
      comentarios.length > 0
        ? Math.round(
            (comentarios.reduce((s: number, c: { estrellas: number }) => s + c.estrellas, 0) /
              comentarios.length) *
              10
          ) / 10
        : 0

    return {
      id: row.id,
      nombre: row.nombre,
      direccion: row.direccion,
      comuna: row.comuna,
      region: row.region,
      administrador: row.administrador,
      telefono: row.telefono,
      email: row.email,
      descripcion: row.descripcion,
      activo: row.activo,
      necesidadesUrgentes: (row.necesidades_urgentes ?? []).map(
        (n: {
          id: string
          categoria: string
          descripcion: string
          cantidad: string
          urgencia: string
          fecha_publicacion: string
        }) => ({
          id: n.id,
          categoria: n.categoria,
          descripcion: n.descripcion,
          cantidad: n.cantidad,
          urgencia: n.urgencia,
          fechaPublicacion: n.fecha_publicacion,
        })
      ),
      comentarios: comentarios.map(
        (c: { id: string; usuario: string; texto: string; estrellas: number; fecha: string }) => ({
          id: c.id,
          usuario: c.usuario,
          texto: c.texto,
          estrellas: c.estrellas,
          fecha: c.fecha,
        })
      ),
      donaciones: (row.donaciones ?? []).map(
        (d: { id: string; donante: string; monto: number; fecha: string }) => ({
          id: d.id,
          donante: d.donante,
          monto: d.monto,
          fecha: d.fecha,
        })
      ),
      rating,
      totalComentarios: comentarios.length,
    }
  })
}
