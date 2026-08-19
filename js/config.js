/**
 * Configuración centralizada del Frontend de E-Com Agent.
 * Prioridades para la URL del Backend:
 * 1. Override manual en localStorage (permite cambiar la URL desde la UI sin redesplegar).
 * 2. Variable de entorno Vite (VITE_API_BASE_URL) para despliegues en Vercel, Netlify o Render.
 * 3. Fallback por defecto a servidor local (http://127.0.0.1:8000).
 */
export const CONFIG = {
  // 1. Obtener la variable de entorno Vite si está disponible
  ENV_API_BASE_URL: (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : "http://127.0.0.1:8000",

  /**
   * Obtiene la URL base configurada
   */
  getApiBaseUrl() {
    return localStorage.getItem("ECOM_API_URL") || this.ENV_API_BASE_URL;
  },

  /**
   * Permite actualizar la URL del backend dinámicamente desde la interfaz
   * @param {string} url - Nueva URL base del backend
   */
  setApiBaseUrl(url) {
    const cleanUrl = url.trim().replace(/\/+$/, "");
    localStorage.setItem("ECOM_API_URL", cleanUrl);
    return cleanUrl;
  }
};
