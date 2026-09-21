/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "apple-bg": "#f5f5f7",
        "apple-surface": "#ffffff",
        "apple-text": "#1d1d1f",
        "apple-text-secondary": "#86868b",
        "apple-blue": "#0066cc",
        "apple-green": "#34c759",
        "apple-red": "#ff3b30",
        "apple-border": "#e5e5ea",
        "apple-hover": "#f2f2f7",
        
        // Retain original keys mapped to the new minimal aesthetic so we don't break everything instantly
        "primary": "#1d1d1f",
        "secondary": "#0066cc",
        "tertiary": "#86868b",
        "background": "#f5f5f7",
        "surface": "#ffffff",
        "surface-container": "#f5f5f7",
        "surface-container-low": "#ffffff",
        "surface-container-highest": "#e5e5ea",
        "on-surface": "#1d1d1f",
        "on-surface-variant": "#86868b",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "error": "#ff3b30",
        "outline": "#e5e5ea",
        "outline-variant": "#d1d1d6",
        "primary-container": "#f5f5f7",
        "on-primary-container": "#1d1d1f",
        "secondary-container": "#e8f0fe",
        "on-secondary-container": "#0066cc",
        "whatsapp": "#34c759"
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "full": "9999px"
      },
      boxShadow: {
        "apple": "0 4px 24px rgba(0, 0, 0, 0.04)",
        "apple-hover": "0 8px 32px rgba(0, 0, 0, 0.08)",
        "apple-sm": "0 2px 12px rgba(0, 0, 0, 0.03)"
      },
      spacing: {
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        "margin": "2rem",
        "gutter": "1.25rem",
        "space-sm": "0.5rem",
        "space-xs": "0.25rem"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        "display": ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      },
      fontSize: {
        "label-md": ["0.8125rem", { lineHeight: "1.25rem", fontWeight: "500" }],
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "500" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "body-md": ["0.9375rem", { lineHeight: "1.375rem", fontWeight: "400" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "headline-sm": ["1.25rem", { lineHeight: "1.5rem", fontWeight: "600", letterSpacing: "-0.015em" }],
        "headline-md": ["1.5rem", { lineHeight: "1.75rem", fontWeight: "600", letterSpacing: "-0.02em" }],
        "headline-lg": ["2rem", { lineHeight: "2.25rem", fontWeight: "600", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "3.25rem", fontWeight: "700", letterSpacing: "-0.03em" }]
      }
    }
  },
  plugins: []
}
