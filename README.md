# Red de Acopio MVP — Guía de instalación y uso

## ¿Qué implementa este MVP?

| Historia | Ubicación en la app |
|----------|-------------------|
| **H1: Pedidos de emergencia** | Página `/mi-centro` → botón rojo "Publicar pedido de emergencia" |
| **H2: Donación directa desde el home** | Página `/` → botón "Donar a este centro" en cada tarjeta |
| **H3: Comentarios y puntuación** | Botón "Ver detalles" en cada tarjeta → sección de estrellas y comentarios |

## Requisitos

- **Node.js 18 o superior** — verifica con `node -v`
- **npm** (viene con Node.js)

## Instalación y ejecución local

```bash
# 1. Entra a la carpeta del proyecto
cd acopio-mvp

# 2. Instala las dependencias
npm install

# 3. Levanta el servidor de desarrollo
npm run dev
```

Luego abre tu navegador en **http://localhost:3000**

## Estructura del proyecto

```
acopio-mvp/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Header, footer, estilos globales
│   │   ├── page.tsx            ← Página de inicio (Historia 2)
│   │   ├── globals.css         ← Colores ChileAtiende + Tailwind
│   │   └── mi-centro/
│   │       └── page.tsx        ← Panel del centro (Historia 1)
│   ├── components/
│   │   ├── CentroCard.tsx      ← Tarjeta de centro con botones
│   │   ├── ModalDonacion.tsx   ← Modal de donación (Historia 2)
│   │   ├── ModalDetalleCentro.tsx ← Detalle + comentarios (Historia 3)
│   │   └── ModalPedidoEmergencia.tsx ← Pedido urgente (Historia 1)
│   └── lib/
│       └── data.ts             ← Mock data de 3 centros de acopio
├── tailwind.config.js          ← Paleta de colores ChileAtiende
├── package.json
└── README.md
```

## Datos simulados

El archivo `src/lib/data.ts` contiene 3 centros de acopio con:
- Necesidades urgentes por categoría
- Comentarios y puntuaciones de ejemplo
- Historial de donaciones

La "sesión simulada" está en la variable `centroLogueado` del mismo archivo (apunta al primer centro). En el header aparece como sesión activa.

## Notas para el proyecto

- Los datos son **en memoria**: al recargar la página vuelven al estado inicial del mock.
- El login es **simulado**: no hay autenticación real, el header muestra directamente al administrador del primer centro.
- Para conectar una base de datos real en iteraciones futuras, se recomienda **Supabase** con Row Level Security.
