/// <reference types="vite/client" />

/** Declaración de tipos para CSS Modules */
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
