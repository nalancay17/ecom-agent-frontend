import { api } from "../api.js";

export function initPortalView(onClaimProcessed) {
  const form = document.getElementById("claim-form");
  const fileInput = document.getElementById("input-image");
  const previewImg = document.getElementById("image-preview");
  const dropzone = document.getElementById("dropzone");
  const submitBtn = document.getElementById("btn-submit-claim");

  // Manejo de Selección y Vista Previa de Imagen
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

  // Drag and Drop en Dropzone
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

  // Envío del Formulario al Backend (POST /api/v1/claims)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const orderId = document.getElementById("input-order-id").value.trim();
    const clientId = document.getElementById("input-client-id").value.trim();
    const description = document.getElementById("input-description").value.trim();
    const imageFile = fileInput.files[0];

    if (!imageFile) {
      alert("Por favor, seleccione una fotografía del producto.");
      return;
    }

    const formData = new FormData();
    formData.append("order_id", orderId);
    formData.append("client_id", clientId);
    formData.append("description", description);
    formData.append("image", imageFile);

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳ Procesando con LangGraph...</span>`;

    try {
      const response = await api.createClaim(formData);
      // Notificar a la app principal para mostrar la resolución
      if (onClaimProcessed) {
        onClaimProcessed(response);
      }
    } catch (error) {
      alert(`Error al procesar el reclamo: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Analizar Reclamación</span> <span>➔</span>`;
    }
  });
}
