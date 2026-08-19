import { CONFIG } from "./config.js";
import { api } from "./api.js";
import { initPortalView } from "./views/portalView.js";
import { initDashboardView } from "./views/dashboardView.js";
import { initResolutionView } from "./views/resolutionView.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Elementos de Navegación
  const navItems = document.querySelectorAll(".nav-item");
  const viewSections = document.querySelectorAll(".view-section");

  const backendUrlLabel = document.getElementById("backend-url-label");
  const backendStatusDot = document.getElementById("backend-status-dot");
  const btnConfigApi = document.getElementById("btn-config-api");
  const modalApiConfig = document.getElementById("modal-api-config");
  const modalInputUrl = document.getElementById("modal-input-url");
  const modalBtnSave = document.getElementById("modal-btn-save");

  // 1. Configurar Navegación SPA
  function switchView(viewId) {
    viewSections.forEach(section => {
      section.classList.remove("active");
      if (section.id === viewId) {
        section.classList.add("active");
      }
    });

    navItems.forEach(item => {
      item.classList.remove("active");
      if (item.getAttribute("data-view") === viewId) {
        item.classList.add("active");
      }
    });

    // Cargar datos específicos al entrar a la vista
    if (viewId === "view-dashboard") {
      dashboardController.loadDashboardData();
    }
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetView = item.getAttribute("data-view");
      switchView(targetView);
    });
  });

  // 2. Controladores de Vistas
  const resolutionController = initResolutionView(() => {
    // Al resolver un caso HITL, actualizar contadores del dashboard
    dashboardController.loadDashboardData();
  });

  const dashboardController = initDashboardView((claimId) => {
    // Al hacer clic en "Revisar" desde la cola HITL, ir a resolución
    switchView("view-resolution");
    resolutionController.lookupClaim(claimId);
  });

  initPortalView((processedClaim) => {
    // Al procesar un reclamo desde el portal, mostrar la resolución inmediatamente
    switchView("view-resolution");
    resolutionController.displayClaim(processedClaim);
    dashboardController.loadDashboardData();
  });

  // 3. Verificación de Salud del Backend
  async function checkBackendStatus() {
    backendUrlLabel.textContent = CONFIG.getApiBaseUrl();
    try {
      await api.checkHealth();
      backendStatusDot.style.backgroundColor = "var(--success)";
      backendStatusDot.title = "Backend Conectado y Operativo";
    } catch {
      backendStatusDot.style.backgroundColor = "var(--danger)";
      backendStatusDot.title = "Backend Desconectado o Inalcanzable";
    }
  }

  // 4. Modal de Configuración de API URL
  btnConfigApi.addEventListener("click", () => {
    modalInputUrl.value = CONFIG.getApiBaseUrl();
    modalApiConfig.showModal();
  });

  modalBtnSave.addEventListener("click", () => {
    const newUrl = modalInputUrl.value;
    if (newUrl) {
      CONFIG.setApiBaseUrl(newUrl);
      modalApiConfig.close();
      checkBackendStatus();
      dashboardController.loadDashboardData();
    }
  });

  // Inicializar estado
  await checkBackendStatus();
  dashboardController.loadDashboardData();
});
