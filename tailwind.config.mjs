/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}'],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en el estudio: azules "voz/lenguaje" + cálidos de acento.
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec6ff',
          400: '#59a6ff',
          500: '#3385fb',
          600: '#1f66f0',
          700: '#1a51dd',
          800: '#1c43b3',
          900: '#1d3c8d',
          950: '#152657',
        },
        accent: {
          400: '#ff9d5c',
          500: '#ff7a2f',
          600: '#f45f12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
