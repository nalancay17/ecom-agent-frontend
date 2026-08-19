/**
 * Cliente de API Documentado para E-Com Agent Backend.
 * Encapsula la comunicación HTTP con los endpoints del backend FastAPI.
 */
import { CONFIG } from "./config.js";

class ApiClient {
  /**
   * Helper genérico para realizar peticiones HTTP
   */
  async request(endpoint, options = {}) {
    const baseUrl = CONFIG.getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorDetail = data?.detail || `Error HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorDetail);
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // =========================================================================
  // 1. ENDPOINT: Creación de Reclamos (Flujo Agéntico LangGraph)
  // Método: POST /api/v1/claims
  // =========================================================================
  /**
   * Envía un reclamo con evidencia visual para ser procesado por el orquestador LangGraph.
   * Ejecuta: Visión (Gemini) + Riesgo (Memoria Episódica) + RAG (Memoria Semántica) + Guardrails + Logística.
   * 
   * @param {FormData} formData - Debe contener: client_id, order_id, description, image (File)
   * @returns {Promise<Object>} Resultado de la resolución agéntica, score compuesto y análisis detallado.
   */
  async createClaim(formData) {
    return this.request("/api/v1/claims", {
      method: "POST",
      body: formData
    });
  }

  // =========================================================================
  // 2. ENDPOINT: Cola de Reclamos Pendientes de Human-In-The-Loop (HITL)
  // Método: GET /api/v1/claims/pending
  // =========================================================================
  /**
   * Recupera la lista de reclamos que superaron los guardrails de autonomía
   * (ej. montos > $100k, riesgo de fraude o dudas de calidad) y requieren auditoría humana.
   * 
   * @returns {Promise<Array<Object>>} Lista de casos pendientes para el panel del supervisor.
   */
  async getPendingClaims() {
    return this.request("/api/v1/claims/pending", {
      method: "GET"
    });
  }

  // =========================================================================
  // 3. ENDPOINT: Resolución Humana de un Reclamo (Supervisor Action)
  // Método: POST /api/v1/claims/{claim_id}/resolve
  // =========================================================================
  /**
   * Permite al supervisor humano emitir el veredicto final sobre un caso en cola HITL.
   * Si se aprueba, el backend dispara la generación de la guía logística inversa (Andreani).
   * 
   * @param {string} claimId - Identificador único del reclamo (ej: CLM-INIT-HITL-003)
   * @param {string} decision - 'APPROVED_BY_HUMAN' o 'REJECTED_BY_HUMAN'
   * @param {string} reviewerNotes - Justificación y fundamentación del operador
   * @returns {Promise<Object>} Confirmación de resolución con datos de tracking actualizados.
   */
  async resolveClaim(claimId, decision, reviewerNotes) {
    return this.request(`/api/v1/claims/${encodeURIComponent(claimId)}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        decision: decision,
        reviewer_notes: reviewerNotes
      })
    });
  }

  // =========================================================================
  // 4. ENDPOINT: Consulta de Estado de un Reclamo por ID
  // Método: GET /api/v1/claims/{claim_id}
  // =========================================================================
  /**
   * Consulta los detalles completos, estado de resolución, score y etiqueta logística de un reclamo.
   * Utilizado en el Portal del Cliente y en la vista de Auditoría individual.
   * 
   * @param {string} claimId - Identificador del reclamo
   * @returns {Promise<Object>} Detalle completo del reclamo y de la orden asociada.
   */
  async getClaimStatus(claimId) {
    return this.request(`/api/v1/claims/${encodeURIComponent(claimId)}`, {
      method: "GET"
    });
  }

  // =========================================================================
  // 5. ENDPOINT: Métricas de Observabilidad del Dashboard
  // Método: GET /api/v1/claims/metrics
  // =========================================================================
  /**
   * Obtiene las métricas en tiempo real de rendimiento del sistema:
   * Tasa de autonomía (%), total de reclamos, casos derivados a HITL y score promedio.
   * 
   * @returns {Promise<Object>} Métricas calculadas para el dashboard del supervisor.
   */
  async getMetrics() {
    return this.request("/api/v1/claims/metrics", {
      method: "GET"
    });
  }

  // =========================================================================
  // 6. ENDPOINT: Health Check de la API
  // Método: GET /
  // =========================================================================
  /**
   * Verifica la conectividad con el servidor Backend.
   * 
   * @returns {Promise<Object>} Estado de disponibilidad del servicio.
   */
  async checkHealth() {
    return this.request("/", {
      method: "GET"
    });
  }
}

export const api = new ApiClient();
