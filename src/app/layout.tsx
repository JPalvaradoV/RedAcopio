import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Red de Acopio — Emergencias Chile',
  description: 'Plataforma de coordinación de centros de acopio para situaciones de emergencia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
