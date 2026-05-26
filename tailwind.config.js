/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ch: {
          blue:    '#003B8E',   // azul institucional ChileAtiende
          'blue-light': '#0056B3',
          'blue-hover': '#00297A',
          red:     '#C0392B',   // rojo alertas/urgencia
          'red-light': '#E74C3C',
          gray:    '#F4F6F8',   // fondo gris muy claro
          'gray-mid': '#E8ECF0',
          'gray-text': '#5A6472',
          dark:    '#1A2633',
        },
      },
      fontFamily: {
        sans: ['var(--font-roboto)', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
