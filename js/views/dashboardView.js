import { api } from "../api.js";

export function initDashboardView(onSelectClaimToReview) {
  const refreshBtn = document.getElementById("btn-refresh-dashboard");
  const hitlQueueContainer = document.getElementById("hitl-queue-container");
  const hitlBadge = document.getElementById("hitl-badge");
  const dashboardHitlCount = document.getElementById("dashboard-hitl-count");

  const metricTotal = document.getElementById("metric-total");
  const metricAutomation = document.getElementById("metric-automation");
  const metricConfidence = document.getElementById("metric-confidence");

  async function loadDashboardData() {
    try {
      // 1. Cargar Métricas de Observabilidad (GET /api/v1/claims/metrics)
      const metrics = await api.getMetrics();
      metricTotal.textContent = metrics.total_claims || 0;
      metricAutomation.textContent = `${metrics.automation_rate_pct || 0}%`;
      metricConfidence.textContent = metrics.average_confidence_score?.toFixed(2) || "0.00";

      // 2. Cargar Cola HITL (GET /api/v1/claims/pending)
      const pendingClaims = await api.getPendingClaims();
      const count = pendingClaims.length;

      // Actualizar contadores
      dashboardHitlCount.textContent = count;
      if (count > 0) {
        hitlBadge.textContent = count;
        hitlBadge.style.display = "inline-block";
      } else {
        hitlBadge.style.display = "none";
      }

      // Renderizar tarjetas de la cola HITL
      if (count === 0) {
        hitlQueueContainer.innerHTML = `
          <div style="text-align: center; padding: 24px; color: var(--text-muted);">
            <div style="font-size: 28px; margin-bottom: 8px;">🎉</div>
            <p><strong>No hay reclamos pendientes de revisión humana.</strong></p>
            <p style="font-size: 12px;">Todos los casos fueron resueltos de forma autónoma.</p>
          </div>
        `;
        return;
      }

      hitlQueueContainer.innerHTML = pendingClaims.map(claim => `
        <div class="hitl-card">
          <div class="hitl-info">
            <h4>#${claim.claim_id} — ${claim.product_name}</h4>
            <div class="hitl-meta">
              <span>Cliente: <strong>${claim.client_name}</strong></span> • 
              <span>Monto: <strong>$${claim.price?.toLocaleString()}</strong></span>
            </div>
            <div style="margin-top: 6px; font-size: 12px; color: #92400e;">
              ⚠️ <strong>Motivo de Pausa:</strong> ${claim.hitl_reasons || 'Revisión por Guardrail'}
            </div>
          </div>
          <div>
            <button class="btn btn-primary btn-sm btn-review-claim" data-id="${claim.claim_id}">
              Revisar ➔
            </button>
          </div>
        </div>
      `).join("");

      // Asignar listeners a los botones de revisión
      hitlQueueContainer.querySelectorAll(".btn-review-claim").forEach(btn => {
        btn.addEventListener("click", () => {
          const claimId = btn.getAttribute("data-id");
          if (onSelectClaimToReview) {
            onSelectClaimToReview(claimId);
          }
        });
      });

    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      hitlQueueContainer.innerHTML = `
        <div style="color: var(--danger); font-size: 13px; padding: 12px;">
          Error al conectar con el servidor: ${error.message}
        </div>
      `;
    }
  }

  refreshBtn.addEventListener("click", loadDashboardData);

  return {
    loadDashboardData
  };
}
