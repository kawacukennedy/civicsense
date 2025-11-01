/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1363DF',
        accent: '#F7B267',
        success: '#17A673',
        danger: '#E63946',
        bg: '#F8FAFF',
        muted: '#6B7280',
        card_bg: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      borderRadius: {
        DEFAULT: '12px',
      },
      boxShadow: {
        DEFAULT: '0 6px 20px rgba(12,17,43,0.06)',
      },
    },
  },
  plugins: [],
}