/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'app-bg': '#93d1ff',
        'primary': {
          'blue': '#1E3A8A',
          'light': '#3B82F6',
          'mid': '#2563EB',
          'dark': '#1D4ED8',
          'accent': '#60A5FA',
        },
        'sidebar': {
          'bg': '#0D0D0D',
          'gradient-top': '#1A1A1A',
          'gradient-bottom': '#0A0A0A',
        },
        'text': {
          'primary': '#FFFFFF',
          'secondary': '#D1D5DB',
        },
        'border': {
          'subtle': '#374151',
        },
      },
      fontFamily: {
        'atkinson': ['Atkinson Hyperlegible', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #60A5FA 0%, #1D4ED8 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)',
        'gradient-dashboard': 'linear-gradient(135deg, #2563EB 0%, #0D0D0D 100%)',
        'gradient-dashboard-hover': 'linear-gradient(135deg, #3B82F6 0%, #1A1A1A 100%)',
        'gradient-hero': 'linear-gradient(135deg, hsl(220 30% 5%), hsl(217 91% 15%))',
        'gradient-card': 'linear-gradient(180deg, hsl(0 0% 100%), hsl(220 20% 98%))',
      },
      boxShadow: {
        'shadow-card': '0 10px 40px -10px hsl(217 91% 50% / 0.15)',
        'shadow-hover': '0 20px 60px -10px hsl(217 91% 50% / 0.25)',
        'shadow-glow': '0 0 40px hsl(217 91% 50% / 0.2)',
        'button-hover': '0 4px 12px rgba(59, 130, 246, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
      },
      transitionProperty: {
        'smooth': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
