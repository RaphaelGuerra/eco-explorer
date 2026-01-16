import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const GH_PAGES_BASE = '/eco-explorer/'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? GH_PAGES_BASE : '/',
}))
