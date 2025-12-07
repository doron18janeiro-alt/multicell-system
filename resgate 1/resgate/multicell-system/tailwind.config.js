export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: '#ffd900',
        deep: '#050509',
        panel: '#0d0f1a',
        glass: 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 25px rgba(255, 217, 0, 0.45)',
        soft: '0 12px 40px rgba(0, 0, 0, 0.7)',
      },
      backdropBlur: {
        glass: '18px',
      },
    },
  },
  plugins: [],
}
