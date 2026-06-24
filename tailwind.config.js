/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sun: {
          yellow: '#FFD06B',
          peach: '#FF9E5E',
          pink: '#FF6F91',
          action: '#FF6B35',
        },
        cream: '#FFF8F0',
        cocoa: '#3A2A20',
        taupe: '#9C8579',
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(255, 110, 90, 0.35)',
        glass: '0 8px 32px rgba(170, 90, 40, 0.12)',
      },
      backgroundImage: {
        'sun-gradient': 'linear-gradient(135deg, #FFD06B 0%, #FF9E5E 50%, #FF6F91 100%)',
        'sun-soft': 'linear-gradient(160deg, #FFF4E3 0%, #FFE8D6 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pop-in': 'pop-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
