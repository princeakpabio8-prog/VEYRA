/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // VEYRA design tokens — warm ivory identity
        brand: {
          50:  "#f9f7f4",
          100: "#f0ede6",
          200: "#e0d9ce",
          300: "#c8bfb0",
          400: "#a89880",
          500: "#8a7660",  // warm accent
          600: "#6e5d49",
          700: "#574839",
          800: "#3d3229",
          900: "#27201a",
        },
        ivory: {
          DEFAULT: "#f5f0e8",  // warm ivory background
          warm:    "#ede8df",
          deep:    "#e5ddd0",
          card:    "#eee9e0",
        },
        ink: {
          DEFAULT:   "#141210",  // near-black
          secondary: "#6b6460",  // warm gray
          tertiary:  "#9e9690",  // muted warm gray
          disabled:  "#c4bdb6",
        },
        surface: {
          DEFAULT: "#f5f0e8",
          card:    "#eee9e0",
          border:  "#ddd6cc",
          subtle:  "#e8e2d8",
          muted:   "#ede8df",
        },
        success: "#2d6a4f",
        warning: "#b5640a",
        danger:  "#b91c1c",
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        sans:    ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "card":   "0 1px 3px 0 rgba(20,18,16,0.06), 0 1px 2px -1px rgba(20,18,16,0.04)",
        "card-md":"0 4px 12px 0 rgba(20,18,16,0.08), 0 2px 4px -1px rgba(20,18,16,0.04)",
        "float":  "0 8px 24px 0 rgba(20,18,16,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "waveform": {
          "0%, 100%": { scaleY: "0.4" },
          "50%":      { scaleY: "1" },
        },
      },
      animation: {
        "fade-up":  "fade-up 0.3s ease-out",
        "wave-1":   "waveform 1.2s ease-in-out infinite 0.0s",
        "wave-2":   "waveform 1.2s ease-in-out infinite 0.15s",
        "wave-3":   "waveform 1.2s ease-in-out infinite 0.3s",
        "wave-4":   "waveform 1.2s ease-in-out infinite 0.45s",
        "wave-5":   "waveform 1.2s ease-in-out infinite 0.6s",
        "wave-6":   "waveform 1.2s ease-in-out infinite 0.75s",
        "wave-7":   "waveform 1.2s ease-in-out infinite 0.9s",
        "wave-8":   "waveform 1.2s ease-in-out infinite 1.05s",
      },
    },
  },
  plugins: [],
};
