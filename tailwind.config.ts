import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'glitch-1': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
        'glitch-2': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) reverse both infinite',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '33%': { transform: 'translate(-2px, 2px)' },
          '66%': { transform: 'translate(2px, -2px)' },
        },
        'pulse-slow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.5), 0 4px 6px -2px rgba(239, 68, 68, 0.3)'
          },
          '50%': { 
            opacity: '0.9',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.7), 0 10px 10px -5px rgba(239, 68, 68, 0.5)'
          },
        },
      },
    },
  },
};

export default config;
