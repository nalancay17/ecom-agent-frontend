/**
 * Configuración centralizada del Frontend de E-Com Agent.
 * Sanitiza automáticamente cualquier barra final para evitar redirects 308.
 */
export const CONFIG = {
  ENV_API_BASE_URL: (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : "http://127.0.0.1:8000",

  /**
   * Obtiene la URL base configurada siempre limpia sin barra final
   */
  getApiBaseUrl() {
    const rawUrl = localStorage.getItem("ECOM_API_URL") || this.ENV_API_BASE_URL;
    return rawUrl.trim().replace(/\/+$/, "");
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
