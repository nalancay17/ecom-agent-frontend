import { api } from "../api.js";
import { showToast } from "../utils/toast.js";

export function initPortalView(onClaimProcessed) {
  const form = document.getElementById("claim-form");
  const orderInput = document.getElementById("input-order-id");
  const clientInput = document.getElementById("input-client-id");
  const descInput = document.getElementById("input-description");
  const fileInput = document.getElementById("input-image");
  const previewImg = document.getElementById("image-preview");
  const dropzone = document.getElementById("dropzone");
  const submitBtn = document.getElementById("btn-submit-claim");

  // --- 1. Generador de Imagen de Prueba (Canvas) para Pruebas Rápidas ---
  function createSampleImageBlob(text = "E-Com Evidence") {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    
    // Fondo y marco
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 400, 300);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 380, 280);
    
    // Texto
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EVIDENCIA DE PRUEBA", 200, 130);
    
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText(text, 200, 170);
    
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(new File([blob], "evidencia_muestra.jpg", { type: "image/jpeg" }));
      }, "image/jpeg");
    });
  }

  // --- 3. Presets / Casos de Prueba Rápidos ---
  const presets = {
    caso1: {
      orderId: "ORD-1002",
      clientId: "CLI-123",
      desc: "El auricular izquierdo no enciende ni toma carga en el estuche tras sacarlo de la caja.",
      label: "Auriculares BT (Auto-Aprobación)"
    },
    caso2: {
      orderId: "ORD-1001",
      clientId: "CLI-123",
      desc: "La pantalla del monitor presenta una fisura interna y líneas verticales al encenderlo.",
      label: "Monitor $180k (HITL por Monto)"
    },
    caso3: {
      orderId: "ORD-1003",
      clientId: "CLI-789",
      desc: "El talle del boxer de algodón me queda chico y quiero devolverlo para cambiarlo de talle.",
      label: "Boxer Algodón (Guardrail Higiene)"
    },
    caso4: {
      orderId: "ORD-1005",
      clientId: "CLI-123",
      desc: "El reloj dejó de responder la pantalla táctil tras varios meses de uso.",
      label: "Smartwatch (Garantía Vencida)"
    }
  };

  // Botones de presets en el DOM
  document.querySelectorAll(".btn-preset").forEach(btn => {
    btn.addEventListener("click", async () => {
      const presetKey = btn.getAttribute("data-preset");
      const data = presets[presetKey];
      if (!data) return;

      orderInput.value = data.orderId;
      clientInput.value = data.clientId;
      descInput.value = data.desc;

      // Generar y cargar imagen de prueba automáticamente
      const sampleFile = await createSampleImageBlob(`${data.orderId} - ${data.label}`);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(sampleFile);
      fileInput.files = dataTransfer.files;

      previewImg.src = URL.createObjectURL(sampleFile);
      previewImg.style.display = "block";

      showToast(`Caso cargado: ${data.label}`, "info", 2500);
    });
  });

  // --- 4. Vista Previa de Archivo ---
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // Drag and drop
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--primary)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "var(--border-color)";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--border-color)";
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event("change"));
    }
  });

  // --- 5. Envío de Formulario (POST /api/v1/claims) ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const orderId = orderInput.value.trim();
    const clientId = clientInput.value.trim();
    const description = descInput.value.trim();
    let imageFile = fileInput.files[0];

    if (!imageFile) {
      imageFile = await createSampleImageBlob(`Reclamo: ${orderId}`);
    }

    const formData = new FormData();
    formData.append("order_id", orderId);
    formData.append("client_id", clientId);
    formData.append("description", description);
    formData.append("image", imageFile);

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳ Ejecutando LangGraph (Visión + RAG + Riesgo)...</span>`;

    try {
      const response = await api.createClaim(formData);
      showToast(`Reclamo ${response.claim_id} procesado con estado: ${response.status}`, "success", 4000);

      if (onClaimProcessed) {
        onClaimProcessed(response);
      }
    } catch (error) {
      showToast(`Error: ${error.message}`, "error", 5000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Analizar Reclamación</span> <span>➔</span>`;
    }
  });
}
