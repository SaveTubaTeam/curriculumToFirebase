import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from "dotenv"

dotenv.config(); //to configure dotenv

//env variables: https://vitejs.dev/guide/env-and-mode 
// Note how .env variables as accessed as import.meta.env.VITE_ENVIRONMENT_VARIABLE
// Also note how self-defined .env variables are prefixed with VITE_

//config: https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
})
