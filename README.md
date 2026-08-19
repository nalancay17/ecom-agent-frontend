# E-Com Agent — Frontend (Portal & Dashboard de Postventa)

Frontend interactivo para **E-Com Agent: Sistema Multi-Agente de Gestión de Devoluciones y Reclamos**, diseñado bajo los lineamientos y wireframes del proyecto académico UTN-FRBA / EPIData.

---

## 🎨 Vistas Implementadas

La aplicación es una Single Page Application (SPA) modular estructurada en 3 vistas principales:

1. **📥 Portal de Entrada (Cliente):**
   - Formulario de radicación de reclamo con número de pedido, identificación de cliente y descripción.
   - Zona interactiva de carga y vista previa de evidencia fotográfica (Drag & Drop).
   - Panel de consulta rápida de políticas corporativas.
2. **📊 Centro de Orquestación y Supervisión (Dashboard Admin):**
   - Tarjetas de métricas de rendimiento y tasa de automatización (`GET /api/v1/claims/metrics`).
   - **Cola Human-In-The-Loop (HITL):** Lista de casos que superaron los guardrails de autonomía (`GET /api/v1/claims/pending`) con botón directo de auditoría.
   - Visualización del estado de las 4 capas de memoria (Trabajo, Episódica, Semántica y Procedimental).
3. **✅ Centro de Resolución y Auditoría:**
   - Auditoría detallada de cada caso (`GET /api/v1/claims/{id}`).
   - Indicador de Score Compuesto explicable (35% Visión + 35% RAG + 20% Riesgo + 10% Trust).
   - Panel de intervención humana con acciones de **Aprobar** (genera guía de logística inversa con Andreani) y **Rechazar** (`POST /api/v1/claims/{id}/resolve`).

---

## 🔌 Documentación de Endpoints del Backend Consumidos

Todos los endpoints están encapsulados y documentados en [`js/api.js`](js/api.js):

| Método | Endpoint | Función en `api.js` | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/claims` | `api.createClaim(formData)` | Envía el formulario multipart con la foto para disparar el flujo LangGraph. |
| `GET` | `/api/v1/claims/pending` | `api.getPendingClaims()` | Recupera los reclamos derivados a supervisión humana (HITL). |
| `POST` | `/api/v1/claims/{id}/resolve` | `api.resolveClaim(id, dec, notes)` | Envía la resolución del supervisor humano (`APPROVED_BY_HUMAN` / `REJECTED_BY_HUMAN`). |
| `GET` | `/api/v1/claims/{id}` | `api.getClaimStatus(id)` | Consulta el detalle completo y guía logística de un reclamo por su código. |
| `GET` | `/api/v1/claims/metrics` | `api.getMetrics()` | Devuelve métricas calculadas (tasa de autonomía %, total reclamos, score promedio). |
| `GET` | `/` | `api.checkHealth()` | Health check para validar conectividad con el backend. |

---

## 🚀 Cómo Ejecutar Localmente

### Opción A: Con Node / Vite (Recomendado)
```bash
cd ecom-agent-frontend
npm install
npm run dev
```
La aplicación abrirá en `http://localhost:5173`.

### Opción B: Sin Node (Con Servidor HTTP de Python)
```bash
cd ecom-agent-frontend
python3 -m http.server 3000
```
La aplicación abrirá en `http://localhost:3000`.

---

## ☁️ Despliegue en la Nube (Gratuito para Evaluación Académica)

Al ser una SPA estática liviana y modular, puede desplegarse en segundos en cualquiera de las siguientes plataformas:

### 1. Vercel / Netlify
1. Conecta tu repositorio de GitHub a **Vercel** o **Netlify**.
2. Selecciona la carpeta `ecom-agent-frontend` como raíz del proyecto.
3. Despliega con 1 clic.
4. En la interfaz web, haz clic en el botón de estado del backend (esquina inferior izquierda) e ingresa la URL de tu backend en Render (ej. `https://ecom-agent-backend.onrender.com`).

### 2. Render (Static Site)
1. En Render, crea un **New Static Site**.
2. Directorio raíz: `ecom-agent-frontend`.
3. Build command: `npm run build` (o dejar vacío).
4. Publish directory: `.` (o `dist`).
