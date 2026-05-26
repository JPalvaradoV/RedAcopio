import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import { getCentros } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Red de Acopio — Emergencias Chile',
  description: 'Plataforma de coordinación de centros de acopio para situaciones de emergencia.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const centros = await getCentros()

  return (
    <html lang="es">
      <body>
        {/* Barra roja institucional arriba del todo */}
        <div className="barra-institucional" />

        {/* Header institucional estilo ChileAtiende */}
        <header className="bg-ch-blue shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo / Nombre */}
            <div className="flex items-center gap-3">
              {/* Escudo simple SVG */}
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="4" fill="white" fillOpacity="0.15"/>
                <path d="M18 5L7 10V18C7 24.08 11.84 29.76 18 31C24.16 29.76 29 24.08 29 18V10L18 5Z" fill="white" fillOpacity="0.9"/>
                <path d="M15 18L17 20L21 16" stroke="#003B8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="text-white font-bold text-lg leading-tight">Red de Acopio</p>
                <p className="text-blue-200 text-xs">Coordinación de Emergencias · Chile</p>
              </div>
            </div>

            {/* Sesión simulada — muestra como si estuvieras logueado */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-white text-sm font-medium">
                  {centros[0]?.nombre ?? 'Centro de Acopio'}
                </span>
                <span className="text-blue-200 text-xs">Sesión activa · Administrador</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-sm">
                {centros[0]?.administrador?.slice(0, 2).toUpperCase() ?? 'AD'}
              </div>
            </div>
          </div>

          {/* Navegación institucional */}
          <nav className="bg-ch-blue-hover border-t border-blue-800">
            <div className="max-w-6xl mx-auto px-4">
              <ul className="flex gap-0 text-sm">
                <li>
                  <a href="/" className="block px-4 py-2.5 text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors font-medium">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="/mi-centro" className="block px-4 py-2.5 text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors font-medium">
                    Mi Centro
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        {/* Contenido principal */}
        <main className="min-h-screen">
          <Providers initialCentros={centros}>{children}</Providers>
        </main>

        {/* Footer institucional */}
        <footer className="bg-ch-dark text-gray-400 text-sm mt-12">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <p className="text-white font-semibold mb-1">Red de Acopio Chile</p>
                <p>Plataforma de coordinación para situaciones de emergencia</p>
              </div>
              <div className="text-right">
                <p>Proyecto académico · Universidad</p>
                <p className="mt-1">MVP — Versión 0.1</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
