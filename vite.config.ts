import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';

dotenv.config();

const portStr = process.env.PORT;

const port: number = portStr ? parseInt(portStr, 10) : 3000;

if (isNaN(port)) {
  throw new Error(`Invalid port number: ${portStr}`);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: port,
  },
})
