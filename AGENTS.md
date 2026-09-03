# AGENTS.md

## Convenciones del proyecto

### Iconos
- **NO usar emojis** en la UI. Reemplazarlos siempre por iconos de **Bootstrap Icons** (`<i class="bi bi-nombre_icono"></i>`, vía CDN jsDelivr en `index.html`), usada en el sidebar, botones y páginas.
- El **sidebar** usa iconos **bootstrap-icons** (`bi bi-*`, vía CDN jsDelivr en index.html) por compatibilidad con sus estilos.
- El tamaño base `.bi` se ajusta por página en su propio SCSS (`.menu-fijo .bi` a 34px global en `styles.scss`).
- Mapeos comunes: `☰`/menú → `bi-list`, `🔍` → `bi-search`, `✏️`/`✎` → `bi-pencil`, `⛔` → `bi-slash-circle`, `👁` → `bi-eye`, paginación → `bi-chevron-left`/`bi-chevron-right`, `📁` → `bi-folder2-open`, `🏗️` → `bi-tools`, `📦` → `bi-box-seam`, `👷` → `bi-person-workspace`, `📈` → `bi-graph-up-arrow`, `✚` → `bi-plus`, `🗑/eliminar` → `bi-trash`, `✕/cerrar` → `bi-x`, `⚠️` → `bi-exclamation-triangle`, `🕐` → `bi-clock`, `✓` → `bi-check-circle`.

### Build y validación
- `ng build` y `tsc --noEmit` en `frontend/optiobra/`; el build debe quedar verde.
- Budgets ajustados en `angular.json`: `initial` 1.5MB/2MB y `optimization.fonts.inline:false` (el budget default de fonts inline no es válido en esta versión).
- Git: NO commitear `.pyc`, `pnpm-lock.yaml`, `.env.bak`. Rama de trabajo: `development-merged` (push a `SrGokuto/optiobra`).
