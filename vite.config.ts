import * as z from 'zod/mini'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const enabledSchema = z.stringbool()

const devFlagsSchema = z.object({
  BASE_URL: z.prefault(z.url(), 'http://localhost:4004'),
  PORT: z.prefault(z.string(), '4004'),
  VITE_SERVER_PORT: z.prefault(z.string(), '3355'),
  VITE_DEVTOOLS: z.prefault(enabledSchema, 'false'),
  VITE_FORWARD_CONSOLE: z.prefault(enabledSchema, 'false')
})

export default defineConfig(config => {
  const env = loadEnv(config.mode, process.cwd(), '')

  const { data: devFlags, success, error } = devFlagsSchema.safeParse(env)
  if (!success) throw new Error(`Invalid dev flags - ${z.prettifyError(error)}`)

  const devtools = config.mode !== 'production' && devFlags.VITE_DEVTOOLS

  const allowedHosts: Array<string> = []
  const allowedHost = URL.parse(devFlags.BASE_URL)
  if (allowedHost?.hostname) allowedHosts.push(allowedHost.hostname)

  const baseUrl = config.mode === 'production' ? '' : devFlags.BASE_URL

  return {
    devtools,
    resolve: { tsconfigPaths: true },
    plugins: [react(), tailwindcss()],
    define: {
      __BASE_URL__: JSON.stringify(baseUrl)
    },
    server: {
      allowedHosts,
      port: Number(devFlags.VITE_SERVER_PORT),
      forwardConsole: devFlags.VITE_FORWARD_CONSOLE,
      proxy: {
        '/api': {
          changeOrigin: true,
          target: `http://localhost:${devFlags.PORT}`
        }
      }
    }
  }
})
