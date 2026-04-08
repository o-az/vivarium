/// <reference types="vite/client" />

interface EnvironmentVariables {
  readonly PORT: string
  readonly VITE_SERVER_PORT: string
}

// Node.js `process.env` auto-completion
declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}

// Bun/vite `import.meta.env` auto-completion
interface ImportMetaEnv extends EnvironmentVariables {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __BASE_URL__: string
