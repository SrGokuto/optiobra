# AGENTS.md

## Convenciones del proyecto

### Iconos
- **NO usar emojis** en la UI. Reemplazarlos siempre por iconos de la librería **Material Symbols Outlined** (`<span class="material-symbols-outlined">nombre_icono</span>`), cargada en `src/index.html`.
- La clase de utilidad `.material-symbols-outlined` está definida globalmente en `src/styles.scss` (fuente, tamaño 20px, ligas activas). `.menu-fijo .material-symbols-outlined` se ajusta a 34px.
- La fuente **Material Symbols Outlined se sirve localmente** vía el paquete npm `material-symbols` (NO CDN): se referencia `node_modules/material-symbols/outlined.css` en `angular.json` (bloque `styles` de build y serve); el woff2 (~3.9MB) se empaqueta en `dist/.../media/`.
- El **sidebar** usa iconos **bootstrap-icons** (`bi bi-*`, vía CDN jsDelivr en index.html) por compatibilidad con sus estilos; Material Symbols es la librería de iconos del resto de páginas y botones.
- Mapeos comunes: `☰`/menú → `menu`, `🔍` → `search`, `✏️`/`✎` → `edit`, `⛔` → `block`, `👁` → `visibility`, paginación → `chevron_left`/`chevron_right`, `📁` → `folder`, `🏗️` → `construction`, `📦` → `inventory_2`, `👷` → `engineering`, `📈` → `trending_up`.

### Build y validación
- `ng build` y `tsc --noEmit` en `frontend/optiobra/`; el build debe quedar verde.
- Budgets ajustados en `angular.json`: `initial` 1.5MB/2MB y `optimization.fonts.inline:false` (el budget default de fonts inline no es válido en esta versión).
- Git: NO commitear `.pyc`, `pnpm-lock.yaml`, `favicon.ico`, `.env.bak`. Rama de trabajo: `development-merged` (push a `SrGokuto/optiobra`).