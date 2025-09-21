import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Yeh line add karein

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // <-- Yahan tailwindcss() add karein
})