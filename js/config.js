/**
 * Configuración centralizada del Frontend de E-Com Agent.
 * Permite alternar la URL base del Backend entre entorno Local y Despliegue Cloud (Render/Railway).
 */
export const CONFIG = {
  // URL por defecto del Backend (Localhost o Cloud)
  DEFAULT_API_BASE_URL: "http://127.0.0.1:8000",

  /**
   * Obtiene la URL base configurada (o almacenada en localStorage)
   */
  getApiBaseUrl() {
    return localStorage.getItem("ECOM_API_URL") || this.DEFAULT_API_BASE_URL;
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
