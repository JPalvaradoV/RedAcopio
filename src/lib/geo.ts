import type { CentroAcopio } from './data'

// Geocodificación aproximada por comuna/región para Chile.
// Evita depender de columnas lat/lng en la BD: si un centro no trae
// coordenadas, las derivamos de su comuna (o región como respaldo).

function normalizar(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Centroides aproximados de regiones (respaldo cuando no se conoce la comuna)
const REGION_COORDS: Record<string, [number, number]> = {
  'arica y parinacota': [-18.4783, -70.3126],
  tarapaca: [-20.2133, -70.1503],
  antofagasta: [-23.6509, -70.3975],
  atacama: [-27.3668, -70.3314],
  coquimbo: [-29.9533, -71.3436],
  valparaiso: [-33.0472, -71.6127],
  metropolitana: [-33.4489, -70.6693],
  'metropolitana de santiago': [-33.4489, -70.6693],
  rm: [-33.4489, -70.6693],
  ohiggins: [-34.1708, -70.7444],
  "o'higgins": [-34.1708, -70.7444],
  "libertador general bernardo o'higgins": [-34.1708, -70.7444],
  maule: [-35.4264, -71.6554],
  nuble: [-36.6063, -72.1033],
  biobio: [-36.8201, -73.0444],
  araucania: [-38.7359, -72.5904],
  'la araucania': [-38.7359, -72.5904],
  'los rios': [-39.8142, -73.2459],
  'los lagos': [-41.4693, -72.9424],
  aysen: [-45.5712, -72.0685],
  'aysen del general carlos ibanez del campo': [-45.5712, -72.0685],
  magallanes: [-53.1638, -70.9171],
  'magallanes y de la antartica chilena': [-53.1638, -70.9171],
}

// Coordenadas aproximadas de comunas frecuentes
const COMUNA_COORDS: Record<string, [number, number]> = {
  // Región Metropolitana
  santiago: [-33.4489, -70.6693],
  providencia: [-33.4314, -70.6093],
  'las condes': [-33.4083, -70.5676],
  nunoa: [-33.4569, -70.5994],
  maipu: [-33.5167, -70.7667],
  'puente alto': [-33.6116, -70.5756],
  'la florida': [-33.5226, -70.5996],
  quilicura: [-33.3672, -70.7290],
  renca: [-33.4044, -70.7286],
  'estacion central': [-33.4606, -70.6790],
  recoleta: [-33.4097, -70.6404],
  independencia: [-33.4172, -70.6669],
  pudahuel: [-33.4413, -70.7622],
  penalolen: [-33.4863, -70.5447],
  'san bernardo': [-33.5920, -70.6990],
  'la pintana': [-33.5833, -70.6333],
  conchali: [-33.3833, -70.6750],
  'el bosque': [-33.5667, -70.6750],
  cerrillos: [-33.4969, -70.7167],
  vitacura: [-33.3833, -70.5667],
  'lo barnechea': [-33.3500, -70.5167],
  colina: [-33.2017, -70.6753],
  melipilla: [-33.6883, -71.2153],
  talagante: [-33.6647, -70.9281],

  // Valparaíso
  valparaiso: [-33.0472, -71.6127],
  'vina del mar': [-33.0246, -71.5518],
  quilpue: [-33.0469, -71.4419],
  'villa alemana': [-33.0422, -71.3739],
  quillota: [-32.8814, -71.2489],
  'san antonio': [-33.5928, -71.6056],
  'los andes': [-32.8336, -70.5983],
  'san felipe': [-32.7500, -70.7250],

  // Biobío / Ñuble
  concepcion: [-36.8201, -73.0444],
  talcahuano: [-36.7167, -73.1167],
  'san pedro de la paz': [-36.8420, -73.1080],
  chiguayante: [-36.9264, -73.0289],
  coronel: [-37.0306, -73.1331],
  'los angeles': [-37.4697, -72.3536],
  chillan: [-36.6063, -72.1033],

  // Otras capitales regionales
  arica: [-18.4783, -70.3126],
  iquique: [-20.2133, -70.1503],
  'alto hospicio': [-20.2500, -70.1000],
  antofagasta: [-23.6509, -70.3975],
  calama: [-22.4667, -68.9333],
  copiapo: [-27.3668, -70.3314],
  'la serena': [-29.9027, -71.2519],
  coquimbo: [-29.9533, -71.3436],
  ovalle: [-30.6010, -71.1990],
  rancagua: [-34.1708, -70.7444],
  talca: [-35.4264, -71.6554],
  curico: [-34.9854, -71.2394],
  temuco: [-38.7359, -72.5904],
  'padre las casas': [-38.7667, -72.6000],
  valdivia: [-39.8142, -73.2459],
  'puerto montt': [-41.4693, -72.9424],
  osorno: [-40.5725, -73.1356],
  'puerto varas': [-41.3195, -72.9854],
  castro: [-42.4827, -73.7626],
  coyhaique: [-45.5712, -72.0685],
  'punta arenas': [-53.1638, -70.9171],
}

const DEFAULT_COORDS: [number, number] = [-33.4489, -70.6693] // Santiago

// Desplazamiento determinístico pequeño basado en el id, para que centros
// de la misma comuna no queden exactamente encima.
function jitter(id: string): [number, number] {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 100000
  }
  const dLat = ((h % 100) / 100 - 0.5) * 0.04 // ±0.02°
  const dLng = (((Math.floor(h / 100)) % 100) / 100 - 0.5) * 0.04
  return [dLat, dLng]
}

export function getCentroCoords(centro: CentroAcopio): [number, number] {
  const comuna = normalizar(centro.comuna)
  const region = normalizar(centro.region)
  const base =
    COMUNA_COORDS[comuna] ??
    REGION_COORDS[region] ??
    DEFAULT_COORDS
  const [dLat, dLng] = jitter(centro.id)
  return [base[0] + dLat, base[1] + dLng]
}

// Nivel de urgencia máximo del centro, para colorear el pin.
export function nivelUrgenciaCentro(centro: CentroAcopio): 'alta' | 'media' | 'baja' | 'ninguna' {
  const us = centro.necesidadesUrgentes
  if (us.some(n => n.urgencia === 'alta')) return 'alta'
  if (us.some(n => n.urgencia === 'media')) return 'media'
  if (us.some(n => n.urgencia === 'baja')) return 'baja'
  return 'ninguna'
}

export const COLOR_URGENCIA: Record<string, string> = {
  alta: '#C0392B',
  media: '#B7950B',
  baja: '#1E8449',
  ninguna: '#5A6472',
}
