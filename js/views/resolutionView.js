import { api } from "../api.js";
import { showToast } from "../utils/toast.js";

export function initResolutionView(onClaimResolved) {
  const emptyState = document.getElementById("resolution-empty-state");
  const contentState = document.getElementById("resolution-content");

  const titleLabel = document.getElementById("resolution-claim-id-label");
  const statusBadge = document.getElementById("res-badge-status");
  const resTitle = document.getElementById("res-title");
  const resMessage = document.getElementById("res-message");
  const statusCard = document.getElementById("resolution-status-card");

  const scoreCircle = document.getElementById("res-score-circle");
  const scoreNumber = document.getElementById("res-score-number");

  const visionDamaged = document.getElementById("res-vision-damaged");
  const visionMatch = document.getElementById("res-vision-match");
  const visionDesc = document.getElementById("res-vision-desc");

  const ragClause = document.getElementById("res-rag-clause");
  const ragCitation = document.getElementById("res-rag-citation");

  const logisticsBox = document.getElementById("res-logistics-box");
  const trackingNumberEl = document.getElementById("res-tracking-number");
  const btnLabel = document.getElementById("res-btn-label");
  const btnPrintCase = document.getElementById("btn-print-case");

  const modalLabelPreview = document.getElementById("modal-label-preview");
  const labelClientName = document.getElementById("label-client-name");
  const labelTrackingCode = document.getElementById("label-tracking-code");

  const hitlActionPanel = document.getElementById("hitl-action-panel");
  const hitlReasonsText = document.getElementById("hitl-reasons-text");
  const inputNotes = document.getElementById("input-supervisor-notes");
  const btnApprove = document.getElementById("btn-hitl-approve");
  const btnReject = document.getElementById("btn-hitl-reject");

  const inputLookupId = document.getElementById("input-lookup-claim-id");
  const btnLookup = document.getElementById("btn-lookup-claim");

  let currentClaimData = null;

  /**
   * Renderiza los datos completos de un reclamo en la vista de auditoría
   */
  function displayClaim(claimData) {
    if (!claimData) {
      emptyState.style.display = "block";
      contentState.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    contentState.style.display = "block";

    currentClaimData = claimData;
    titleLabel.textContent = `Auditoría del Caso #${claimData.claim_id}`;

    // 1. Estado y Estilos de Badge
    const status = claimData.status || "PENDING";
    statusBadge.textContent = status;

    if (status.includes("APPROVED")) {
      statusBadge.className = "status-badge status-approved";
      statusCard.style.borderLeftColor = "var(--success)";
      resTitle.textContent = "Devolución Aprobada";
    } else if (status.includes("HITL") || status.includes("PENDING")) {
      statusBadge.className = "status-badge status-hitl";
      statusCard.style.borderLeftColor = "var(--warning)";
      resTitle.textContent = "Reclamo Derivado a Supervisión Humana (HITL)";
    } else {
      statusBadge.className = "status-badge status-rejected";
      statusCard.style.borderLeftColor = "var(--danger)";
      resTitle.textContent = "Reclamo Rechazado por Políticas";
    }

    resMessage.textContent = claimData.message || "Resolución procesada por el sistema agéntico.";

    // 2. Score Compuesto
    const score = claimData.composite_score !== undefined ? claimData.composite_score : (claimData.confidence || 0.0);
    const scorePct = Math.round(score * 100);
    scoreCircle.style.setProperty("--score-pct", scorePct);
    scoreNumber.textContent = score.toFixed(2);

    // 3. Análisis Visual
    const vision = claimData.analysis || claimData.visual_analysis || {};
    visionDamaged.textContent = vision.is_product_damaged ? "Sí, confirmado" : "No detectado";
    visionMatch.textContent = vision.matches_user_claim ? "Sí, coincide" : "No coincide";
    visionDesc.textContent = vision.damage_description || "Sin descripción de daño.";

    // 4. Memoria Semántica (RAG)
    const policy = claimData.policy_review || {};
    ragClause.textContent = policy.applied_clause || "Artículo General de Políticas";
    ragCitation.textContent = policy.clause_citation ? `"${policy.clause_citation}"` : "Cita estándar de políticas de postventa.";

    // 5. Logística Inversa (si existe guía generada)
    const tracking = claimData.tracking_number || claimData.action_details?.logistics?.tracking_number;

    if (tracking) {
      logisticsBox.style.display = "block";
      trackingNumberEl.textContent = tracking;
      labelClientName.textContent = claimData.client_name || claimData.client_id || "Cliente";
      labelTrackingCode.textContent = tracking;
    } else {
      logisticsBox.style.display = "none";
    }

    // 6. Panel de Intervención Humana (si requiere HITL y no está resuelto)
    if (claimData.requires_hitl && !claimData.resolved_at) {
      hitlActionPanel.style.display = "block";
      const reasons = claimData.hitl_reasons ? (Array.isArray(claimData.hitl_reasons) ? claimData.hitl_reasons.join(" | ") : claimData.hitl_reasons) : "Monto o riesgo que supera los umbrales de autonomía.";
      hitlReasonsText.innerHTML = `<strong>Motivo de Intervención:</strong> ${reasons}`;
      inputNotes.value = "";
    } else {
      hitlActionPanel.style.display = "none";
    }
  }

  // Abrir Modal de Etiqueta
  if (btnLabel) {
    btnLabel.addEventListener("click", () => {
      if (modalLabelPreview) {
        modalLabelPreview.showModal();
      }
    });
  }

  // Imprimir Caso
  if (btnPrintCase) {
    btnPrintCase.addEventListener("click", () => {
      window.print();
    });
  }

  // Búsqueda Manual por ID (GET /api/v1/claims/{id})
  async function lookupClaim(claimId) {
    if (!claimId) return;
    try {
      btnLookup.disabled = true;
      btnLookup.textContent = "Buscando...";
      const data = await api.getClaimStatus(claimId);
      displayClaim(data);
      showToast(`Caso #${claimId} recuperado de la base de datos`, "info", 2500);
    } catch (error) {
      showToast(`No se encontró el reclamo #${claimId}: ${error.message}`, "error", 4000);
    } finally {
      btnLookup.disabled = false;
      btnLookup.textContent = "Buscar";
    }
  }

  btnLookup.addEventListener("click", () => {
    lookupClaim(inputLookupId.value.trim());
  });

  // Acciones de Resolución del Supervisor (POST /api/v1/claims/{id}/resolve)
  btnApprove.addEventListener("click", async () => {
    const notes = inputNotes.value.trim() || "Aprobado tras auditoría del supervisor humano.";
    const claimId = currentClaimData?.claim_id;
    try {
      btnApprove.disabled = true;
      const res = await api.resolveClaim(claimId, "APPROVED_BY_HUMAN", notes);
      showToast(`✅ Reclamo #${claimId} aprobado. Guía generada: ${res.resolution?.tracking_number}`, "success", 4500);
      await lookupClaim(claimId);
      if (onClaimResolved) onClaimResolved();
    } catch (error) {
      showToast(`Error al aprobar: ${error.message}`, "error", 4500);
    } finally {
      btnApprove.disabled = false;
    }
  });

  btnReject.addEventListener("click", async () => {
    const notes = inputNotes.value.trim() || "Rechazado por incumplimiento de términos tras auditoría humana.";
    const claimId = currentClaimData?.claim_id;
    try {
      btnReject.disabled = true;
      await api.resolveClaim(claimId, "REJECTED_BY_HUMAN", notes);
      showToast(`❌ Reclamo #${claimId} rechazado formalmente.`, "warning", 4000);
      await lookupClaim(claimId);
      if (onClaimResolved) onClaimResolved();
    } catch (error) {
      showToast(`Error al rechazar: ${error.message}`, "error", 4500);
    } finally {
      btnReject.disabled = false;
    }
  });

  return {
    displayClaim,
    lookupClaim
  };
}
