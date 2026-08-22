# E-Com Agent — Frontend (Portal, Dashboard y Centro de Resolución)

Interfaz web para **E-Com Agent**: sistema multi-agente de gestión de devoluciones y reclamos de postventa. Proyecto Final de Ciclo del curso *Inteligencia Artificial Aplicada a Organizaciones* — UTN FRBA / EPIData (Agosto 2026).

**🌐 App en Producción:** [`https://ecom-agent-frontend-woad.vercel.app`](https://ecom-agent-frontend-woad.vercel.app)  
**⚙️ Backend API:** [`https://ecom-agent-backend.vercel.app`](https://ecom-agent-backend.vercel.app)

---

## Vistas de la Aplicación

La app es una **Single Page Application (SPA)** con 3 vistas principales, sin framework pesado (Vanilla JS + Vite):

### Vista 1 — Portal de Entrada

El punto de ingreso del cliente para radicar un reclamo.

- Formulario con número de pedido, ID de cliente y descripción del problema
- Zona de carga de evidencia fotográfica con Drag & Drop y vista previa
- **4 casos de prueba precargados** (botones de acceso rápido)
- Panel lateral con el progreso en tiempo real de los 5 pasos del agente
- Panel de políticas corporativas (resumen de las 4 cláusulas de devolución)

### Vista 2 — Centro de Orquestación y Supervisión (Dashboard)

Panel de control para el supervisor / administrador del sistema.

- **3 tarjetas de métricas** en tiempo real: total de reclamos, tasa de autonomía (%), score promedio de confianza IA
- **Cola Human-In-The-Loop (HITL):** lista de casos pausados por el sistema que esperan decisión humana, con el motivo de pausa detallado
- **Tabla de todos los reclamos** procesados: estado, confianza, cliente, acceso a auditoría
- **Panel de Capas de Memoria:** visualización de las 4 memorias del sistema (Trabajo, Episódica, Semántica, Procedimental)
- **Traza de razonamiento en vivo** (terminal de logs del sistema)
- Botón "Actualizar Métricas" para refrescar manualmente

### Vista 3 — Centro de Resolución y Auditoría

Vista detallada de cada reclamo para auditoría y resolución HITL.

- Score de confianza compuesto visual (gráfico circular)
- Resultado del **Análisis Visual de Gemini** (¿daño detectado? ¿coincide con el relato?)
- **Cita textual de la cláusula del Manual de Políticas** recuperada por RAG
- **Panel de Decisión del Supervisor (HITL):** campo de justificación obligatoria + botones Aprobar / Rechazar
- Búsqueda de reclamos por ID

---

## Estructura del Proyecto

```
ecom-agent-frontend/
├── index.html                  # Punto de entrada de la SPA
├── css/
│   └── styles.css              # Estilos globales (diseño, variables CSS, responsive)
├── js/
│   ├── app.js                  # Router de la SPA: manejo de navegación entre vistas
│   ├── config.js               # Configuración: getApiBaseUrl() con fallback a localStorage
│   ├── api.js                  # Capa de acceso a datos: todos los fetch al backend
│   ├── views/
│   │   ├── portalView.js       # Vista 1: Portal de Entrada (formulario + polling)
│   │   ├── dashboardView.js    # Vista 2: Dashboard de Orquestación (métricas + HITL)
│   │   └── resolutionView.js   # Vista 3: Centro de Resolución y Auditoría
│   └── utils/
│       └── toast.js            # Notificaciones toast (éxito / error / info)
├── vite.config.js              # Configuración de Vite (dev server + build)
├── vercel.json                 # Reescritura de rutas SPA para Vercel
├── package.json                # Dependencias y scripts npm
├── .env.example                # Variables de entorno requeridas
└── .gitignore
```

---

## Endpoints del Backend Consumidos

Todos los llamados al backend están encapsulados en [`js/api.js`](js/api.js):

| Método | Endpoint | Función en `api.js` | Descripción |
|:---|:---|:---|:---|
| `POST` | `/api/v1/claims` | `api.createClaim(formData)` | Envía el formulario multipart (foto + datos) y dispara el flujo LangGraph |
| `GET` | `/api/v1/claims` | `api.getAllClaims()` | Lista todos los reclamos procesados |
| `GET` | `/api/v1/claims/pending` | `api.getPendingClaims()` | Recupera los reclamos en cola HITL que esperan supervisión humana |
| `GET` | `/api/v1/claims/metrics` | `api.getMetrics()` | Métricas del sistema (tasa de autonomía, score promedio, totales) |
| `GET` | `/api/v1/claims/{id}` | `api.getClaimStatus(id)` | Detalle completo de un reclamo: análisis de cada agente + decisión final |
| `PATCH` | `/api/v1/claims/{id}/review` | `api.resolveClaim(id, dec, notes)` | Envía la decisión del supervisor HITL (`APPROVED_BY_HUMAN` / `REJECTED_BY_HUMAN`) |
| `GET` | `/` | `api.checkHealth()` | Health check para validar conectividad con el backend |

---

## Ejecución Local

### Con Vite (recomendado, con hot reload)

```bash
git clone https://github.com/nalancay17/ecom-agent-frontend.git
cd ecom-agent-frontend

npm install
```

Crear el archivo `.env`:
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La app abre en `http://localhost:5173`.

> **Nota:** para usar la app completa necesitás tener el [backend](https://github.com/nalancay17/ecom-agent-backend) corriendo en `http://localhost:8000`.`.


---

## Despliegue en Vercel

El `vercel.json` ya está configurado con reescritura de rutas para la SPA (evita errores 404 en navegación directa).

```bash
npm i -g vercel
vercel --prod
```

En el Dashboard de Vercel → Settings → Environment Variables, agregar:

| Variable | Valor |
|:---|:---|
| `VITE_API_BASE_URL` | `https://ecom-agent-backend.vercel.app` |

> La variable debe estar configurada **antes** del build. Vite la compila directamente en el bundle estático.

---

## 🧪 Casos de Prueba Predefinidos

La vista del Portal incluye 4 botones de carga rápida para demostración:

| Caso | Pedido | Producto | Resultado Esperado |
|:---|:---|:---|:---|
| 🎧 **Caso 1: Auto ($45k)** | `ORD-1001` | Auriculares Bluetooth | ✅ Aprobado autónomamente — garantía técnica |
| 🖥️ **Caso 2: Monto ($180k)** | `ORD-1002` | Monitor Samsung 27″ | ⏸️ Derivado a HITL — monto supera umbral |
| 🧴 **Caso 3: Higiene** | `ORD-1003` | Pack Cremas Hidratantes | ❌ Rechazado — categoría excluida por política |
| 👟 **Caso 4: Vencido** | `ORD-1004` | Zapatillas Running | ❌ Rechazado — plazo de devolución vencido |

Para cada caso: cargá cualquier imagen (PNG/JPG) como evidencia, o usá un preset de muestra que genera el formulario automáticamente.

---

## Tecnologías

| Tecnología | Uso |
|:---|:---|
| **Vanilla JavaScript ES2022** | Lógica de la SPA sin framework (módulos ES, async/await, fetch API) |
| **Vite 5** | Bundler y servidor de desarrollo con hot reload |
| **CSS3 (Variables + Grid + Flexbox)** | Sistema de diseño responsivo con variables CSS custom |
| **HTML5** | Estructura semántica, drag & drop nativo, FileReader API |
| **Vercel** | Despliegue estático con reescritura de rutas SPA |

---

## Contexto Académico

**Curso:** Inteligencia Artificial Aplicada a Organizaciones  
**Institución:** UTN FRBA — EPIData  
**Alumno:** Nicolás J. Alancay Albelo  
**Fecha:** Agosto 2026  
**Video de demostración:** [Google Drive](https://drive.google.com/file/d/1CMw5ksuJKoXbSfBc0NDPdnOtLc-zUa4j/view?usp=sharing)
