// ============================================================
// TIPOS
// ============================================================

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
  tipo: 'economica' | 'material'
  monto?: number
  descripcion?: string
  fecha: string
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
  rating: number
  totalComentarios: number
  activo: boolean
}

// ============================================================
// DATOS MOCK
// ============================================================

export const centrosData: CentroAcopio[] = [
  {
    id: 'c1',
    nombre: 'Centro de Acopio Sector Norte',
    direccion: 'Av. Los Libertadores 1250',
    comuna: 'Quilicura',
    region: 'Metropolitana',
    administrador: 'María González Rojas',
    telefono: '+56 9 8765 4321',
    email: 'norte@acopio.cl',
    descripcion: 'Centro principal de recepción para el sector norte de Santiago. Coordinamos con juntas de vecinos y municipalidad.',
    necesidadesUrgentes: [
      {
        id: 'n1',
        categoria: 'agua',
        descripcion: 'Bidones de agua potable 20 litros',
        cantidad: '200 unidades',
        urgencia: 'alta',
        fechaPublicacion: '2025-05-10T09:00:00',
      },
      {
        id: 'n2',
        categoria: 'medicamentos',
        descripcion: 'Paracetamol 500mg, vendas elásticas, suero oral',
        cantidad: 'Lo que sea posible',
        urgencia: 'alta',
        fechaPublicacion: '2025-05-10T10:30:00',
      },
      {
        id: 'n3',
        categoria: 'ropa',
        descripcion: 'Ropa de abrigo talla adulto y niño',
        cantidad: '100 prendas',
        urgencia: 'media',
        fechaPublicacion: '2025-05-09T15:00:00',
      },
    ],
    comentarios: [
      {
        id: 'cm1',
        usuario: 'Pedro Soto',
        texto: 'Muy bien organizado. El personal es amable y orientan muy bien sobre qué donar.',
        estrellas: 5,
        fecha: '2025-05-09T14:00:00',
      },
      {
        id: 'cm2',
        usuario: 'Ana Muñoz',
        texto: 'Llegué con ropa y me indicaron exactamente qué faltaba. Buena coordinación.',
        estrellas: 4,
        fecha: '2025-05-08T11:30:00',
      },
    ],
    donaciones: [
      { id: 'd1', donante: 'Juan Pérez', tipo: 'economica', monto: 50000, fecha: '2025-05-10T08:00:00' },
      { id: 'd2', donante: 'Empresa XYZ', tipo: 'material', descripcion: '50 frazadas', fecha: '2025-05-09T16:00:00' },
    ],
    rating: 4.5,
    totalComentarios: 2,
    activo: true,
  },
  {
    id: 'c2',
    nombre: 'Centro Comunitario Sur Solidario',
    direccion: 'Calle Pedro Aguirre Cerda 340',
    comuna: 'La Pintana',
    region: 'Metropolitana',
    administrador: 'Carlos Fuentes Vega',
    telefono: '+56 9 7654 3210',
    email: 'sursolidario@acopio.cl',
    descripcion: 'Atendemos principalmente a familias de La Pintana y zonas aledañas. Contamos con bodega amplia.',
    necesidadesUrgentes: [
      {
        id: 'n4',
        categoria: 'alimentos',
        descripcion: 'Arroz, fideos, aceite, legumbres no perecibles',
        cantidad: '500 kg en total',
        urgencia: 'alta',
        fechaPublicacion: '2025-05-10T08:00:00',
      },
      {
        id: 'n5',
        categoria: 'higiene',
        descripcion: 'Pañales talla M y G, toallitas húmedas',
        cantidad: '50 paquetes',
        urgencia: 'alta',
        fechaPublicacion: '2025-05-10T09:45:00',
      },
    ],
    comentarios: [
      {
        id: 'cm3',
        usuario: 'Rosa Díaz',
        texto: 'El centro está muy bien gestionado. Saben exactamente qué necesitan y lo comunican claramente.',
        estrellas: 5,
        fecha: '2025-05-10T07:00:00',
      },
    ],
    donaciones: [
      { id: 'd3', donante: 'Anónimo', tipo: 'economica', monto: 20000, fecha: '2025-05-10T07:30:00' },
    ],
    rating: 5,
    totalComentarios: 1,
    activo: true,
  },
  {
    id: 'c3',
    nombre: 'Punto de Acopio Poniente',
    direccion: 'Pasaje Los Aromos 55',
    comuna: 'Pudahuel',
    region: 'Metropolitana',
    administrador: 'Luisa Contreras Mena',
    telefono: '+56 9 6543 2109',
    email: 'poniente@acopio.cl',
    descripcion: 'Punto de acopio habilitado para la emergencia. Recibimos donaciones de lunes a domingo.',
    necesidadesUrgentes: [
      {
        id: 'n6',
        categoria: 'herramientas',
        descripcion: 'Palas, escobas, baldes para limpieza',
        cantidad: '30 unidades de c/u',
        urgencia: 'media',
        fechaPublicacion: '2025-05-09T12:00:00',
      },
    ],
    comentarios: [],
    donaciones: [],
    rating: 0,
    totalComentarios: 0,
    activo: true,
  },
]

// ============================================================
// SESIÓN SIMULADA — el centro logueado
// En un sistema real esto vendría de la auth
// ============================================================
export const centroLogueado: CentroAcopio = centrosData[0]
