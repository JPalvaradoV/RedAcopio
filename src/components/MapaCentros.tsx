'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { CentroAcopio } from '@/lib/data'
import { getCentroCoords, nivelUrgenciaCentro, COLOR_URGENCIA } from '@/lib/geo'

const urgenciaLabel: Record<string, string> = {
  alta: 'Urgencia alta',
  media: 'Urgencia media',
  baja: 'Urgencia baja',
  ninguna: 'Sin alertas',
}

function pinIcon(color: string, pulse: boolean) {
  const html = `
    <div style="position:relative;width:26px;height:36px;">
      <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 0C5.82 0 0 5.82 0 13c0 9.25 13 23 13 23s13-13.75 13-23C26 5.82 20.18 0 13 0z" fill="${color}"/>
        <circle cx="13" cy="13" r="5" fill="white"/>
      </svg>
      ${pulse ? `<span style="position:absolute;top:8px;left:8px;width:10px;height:10px;border-radius:9999px;background:${color};opacity:.55;animation:pulsePin 1.4s ease-out infinite;"></span>` : ''}
    </div>`
  return L.divIcon({
    html,
    className: 'pin-centro',
    iconSize: [26, 36],
    iconAnchor: [13, 36],
    popupAnchor: [0, -34],
  })
}

export default function MapaCentros({ centros }: { centros: CentroAcopio[] }) {
  return (
    <MapContainer
      center={[-35.5, -71.5]}
      zoom={5}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {centros.map(centro => {
        const nivel = nivelUrgenciaCentro(centro)
        const color = COLOR_URGENCIA[nivel]
        const [lat, lng] = getCentroCoords(centro)
        return (
          <Marker key={centro.id} position={[lat, lng]} icon={pinIcon(color, nivel === 'alta')}>
            <Popup>
              <div style={{ minWidth: 190 }}>
                <p style={{ fontWeight: 700, color: '#1A2633', margin: '0 0 2px' }}>{centro.nombre}</p>
                <p style={{ fontSize: 12, color: '#5A6472', margin: '0 0 6px' }}>
                  📍 {centro.comuna}, {centro.region}
                </p>
                <p style={{ fontSize: 12, margin: '0 0 6px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9999, background: color, marginRight: 6 }} />
                  {urgenciaLabel[nivel]}
                  {centro.necesidadesUrgentes.length > 0
                    ? ` · ${centro.necesidadesUrgentes.length} necesidad${centro.necesidadesUrgentes.length !== 1 ? 'es' : ''}`
                    : ''}
                </p>
                <a
                  href={`/?centro=${centro.id}`}
                  style={{ fontSize: 12, color: '#003B8E', fontWeight: 600, textDecoration: 'none' }}
                >
                  Ver centro →
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
