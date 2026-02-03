/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Parchment & Paper
        parchment: {
          light: '#f5e6c8',
          DEFAULT: '#e8d4a8',
          dark: '#d4c090',
          aged: '#c4a86c',
        },
        // Leather & Wood
        leather: {
          light: '#a0522d',
          DEFAULT: '#8b4513',
          dark: '#5d2e0c',
        },
        wood: {
          light: '#b8860b',
          DEFAULT: '#8b6914',
          dark: '#5c4a1f',
          plank: '#6b4423',
        },
        // Nature
        forest: {
          light: '#4a7c23',
          DEFAULT: '#2d5016',
          dark: '#1a3009',
          meadow: '#7cb342',
        },
        water: {
          light: '#5cacee',
          DEFAULT: '#3a7ca5',
          dark: '#1a3a5c',
          deep: '#0d2137',
        },
        mountain: {
          snow: '#e8e8e8',
          rock: '#6b6b6b',
          stone: '#4a4a4a',
          dark: '#2d2d2d',
        },
        desert: {
          sand: '#d4a574',
          dune: '#c4915c',
          DEFAULT: '#b8860b',
        },
        swamp: {
          light: '#6b8e23',
          DEFAULT: '#556b2f',
          dark: '#3d4f22',
          murky: '#2f4f2f',
        },
        // Accents
        gold: {
          light: '#ffd700',
          DEFAULT: '#c9a227',
          dark: '#8b7500',
          antique: '#cfb53b',
        },
        blood: {
          light: '#dc143c',
          DEFAULT: '#8b0000',
          dark: '#4a0000',
        },
        royal: {
          purple: '#4b0082',
          blue: '#1a3a5c',
          red: '#8b0000',
        },
        // UI
        ink: {
          light: '#4a4a4a',
          DEFAULT: '#2d2d2d',
          dark: '#1a1a1a',
        },
      },
      fontFamily: {
        medieval: ['MedievalSharp', 'cursive'],
        cinzel: ['Cinzel', 'serif'],
        fell: ['IM Fell English', 'serif'],
      },
      boxShadow: {
        'parchment': '0 4px 6px -1px rgba(139, 69, 19, 0.3), 0 2px 4px -2px rgba(139, 69, 19, 0.2)',
        'embossed': 'inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(255, 255, 255, 0.1)',
        'medieval': '0 8px 16px -4px rgba(0, 0, 0, 0.5), 0 4px 8px -4px rgba(0, 0, 0, 0.3)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
