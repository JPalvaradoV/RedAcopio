export type Categoria = 'agua' | 'alimentos' | 'ropa' | 'medicamentos' | 'higiene' | 'herramientas'

export interface NecesidadUrgente {
  id: string
  categoria: Categoria
  descripcion: string
  cantidad: string
  urgencia: 'alta' | 'media' | 'baja'
  fechaPublicacion: string
}

export interface Comentario {
  id: string
  usuario: string
  texto: string
  estrellas: number
  fecha: string
}

export interface Donacion {
  id: string
  donante: string
  monto: number
  fecha: string
}

export interface StockItem {
  id: string
  categoria: string
  nombreItem: string
  cantidad: number
  unidad: string
  updatedAt: string
}

export interface Voluntario {
  id: string
  user_id: string | null
  nombre: string
  rut: string | null
  email: string | null
  disponibilidad: string | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  created_at: string
}

export interface CentroAcopio {
  id: string
  nombre: string
  direccion: string
  comuna: string
  region: string
  administrador: string
  telefono: string
  email: string
  descripcion: string
  necesidadesUrgentes: NecesidadUrgente[]
  comentarios: Comentario[]
  donaciones: Donacion[]
  stock: StockItem[]
  rating: number
  totalComentarios: number
  activo: boolean
  adminId?: string
}
