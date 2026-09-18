/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFEA',
          300: '#ECE4DC',
          400: '#DFD5C8',
          500: '#C8BBAA',
        },
        lavender: {
          50: '#FAF7FD',
          100: '#F3ECF8',
          200: '#EADDF2',
          300: '#DBC5EB',
          400: '#C1A2D6',
          500: '#9E77BA',
          600: '#7E6390',
          700: '#644D73',
          800: '#4B3857',
        },
        mutedTeal: {
          50: '#F2F8F8',
          100: '#E3EFEF',
          200: '#C7DFDE',
          500: '#457B79',
          600: '#3D706E',
          700: '#2F5957',
          800: '#234442',
        },
        salmon: {
          50: '#FFF7F5',
          100: '#FCEEEA',
          200: '#F8DBD4',
          300: '#F2BDB3',
          400: '#E48F82',
          700: '#BA5344',
          800: '#943D30',
        },
        editorial: {
          text: '#2D2A26',
          muted: '#78726A',
          faint: '#A69F96',
          border: '#EAE4DC',
          card: '#FAF7F2',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Lora', 'Georgia', 'serif'],
        display: ['Newsreader', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
