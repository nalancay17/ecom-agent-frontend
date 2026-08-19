/**
 * Sistema de Notificaciones Toast para feedback visual sin bloquear la interfaz.
 */
export function showToast(message, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  
  let bg = "#0f172a";
  let icon = "ℹ️";
  if (type === "success") {
    bg = "#065f46";
    icon = "✅";
  } else if (type === "error") {
    bg = "#991b1b";
    icon = "❌";
  } else if (type === "warning") {
    bg = "#92400e";
    icon = "⚠️";
  }

  toast.style.cssText = `
    background-color: ${bg};
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
    font-size: 13px;
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: toastSlideIn 0.3s ease;
  `;

  toast.innerHTML = `<span>${icon}</span><span style="flex-grow: 1;">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastSlideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
