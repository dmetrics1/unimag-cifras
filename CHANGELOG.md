# Registro de cambios (CHANGELOG)

Todos los cambios relevantes de **Unimagdalena en Cifras** se documentan en este archivo.

El formato sigue la convención de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa versionado semántico aproximado (`MAYOR.MENOR.PARCHE`).

Tipos de cambio: **Añadido** (nuevas funcionalidades), **Cambiado** (cambios en
funcionalidad existente), **Corregido** (bugs), **Refactor** (reorganización sin
cambio funcional), **Responsive**, **Accesibilidad**, **Rendimiento**, **Docs**.

---

## [Sin publicar]

### Docs
- Documentación de calidad producción: `docs/ARQUITECTURA.md`, `docs/RESPONSIVE.md`,
  `docs/ESTILOS.md`, `docs/JAVASCRIPT.md`, `docs/COMPONENTES.md`,
  `docs/GUIA_DESARROLLADOR.md`, `docs/adr/README.md` (decisiones técnicas),
  este `CHANGELOG.md` y `README.md` actualizado. Diagramas en Mermaid.
- `EVIDENCIA_ESTRUCTURA_PROYECTO.md` reconciliado con el estado real (cifras corregidas:
  92 filas en el JSON → 87 indicadores mostrados tras fusionar los 5 pares "Nacional").

---

## [1.2.0] – 2026-07-21

### Responsive
- **Adaptación móvil completa** (`@media max-width:919px`) preservando el diseño de
  escritorio 100% idéntico como base (estrategia Desktop-first).
- **Header móvil** (`.mobile-header`) sticky con logo, título y botón hamburguesa.
- **Menú lateral como drawer** deslizable en móvil (`#sidebar.is-open`) con backdrop
  (`#sbOverlay.is-active`) y bloqueo de scroll (`body.no-scroll`).
- **KPIs lado a lado** en móvil (antes apilados), más compactos.
- **Gráfico con altura fija** (300px) en móvil; se desactiva el modo "llenar pantalla".
- **Grilla de Metodología** a 2 columnas en celular (3 en tablet).
- **Tabla de Datos** con scroll horizontal interno en móvil.
- **Tipografía fluida** con `clamp()`, **safe-areas** (`env(safe-area-inset-*)`,
  `viewport-fit=cover`) y **`100dvh`** para el alto dinámico del viewport.

### Corregido
- Restaurados los tipos de gráfico (`chart`/`dual`) que se habían perdido al regenerar
  el JSON; vuelven las **42 barras / 50 líneas / 10 series duales**.
- Restauradas las variables de escala fluida (`--fluid-gap`, `--fluid-card-pad`,
  `--fluid-kpi-value`) que se habían borrado del `:root`; los KPIs dejaron de quedar
  pegados al gráfico.
- Ajuste del título del sidebar para que no toque el botón de colapsar.

### Accesibilidad
- `@media (prefers-reduced-motion: reduce)`, áreas táctiles ≥44px, foco visible,
  roles y `aria-*` en la navegación y el header móvil.

---

## [1.1.0] – 2026-07-10

### Añadido
- **Página Metodología**: modal grande por factor con su **definición oficial** y
  **características de alta calidad** del CNA (`data/factores_detalle.json`,
  extraído de los Lineamientos de acreditación institucional).
- **Comparativos con el nivel Nacional**: 5 indicadores muestran su serie nacional como
  línea de referencia. La matriz los trae como filas "X (Nacional)" y `mergeNacional()`
  las fusiona en runtime (92 filas → **87 indicadores** mostrados).
- **Página Datos**: filtro por factor (dropdown), tabla completa con encabezado fijo,
  buscador y descarga en **JSON** y **CSV** (compatible con Excel).
- **Sidebar colapsable** en escritorio (248 ↔ 72px), con estado recordado en
  `localStorage` y botón con ícono de panel.
- **Despliegue automático** en GitHub Pages vía GitHub Actions
  (`.github/workflows/deploy-pages.yml`).

### Cambiado
- Alineación de la tabla de Datos (nombres a la izquierda, años a la derecha).

---

## [1.0.0] – 2026-07-10

### Añadido
- **Primer release**: tablero **Unimagdalena en Cifras**, indicadores institucionales
  por los 12 factores de acreditación, serie 2020–2025.
- Navegación de 4 páginas con enrutado por hash: **Inicio**, **Factores**,
  **Datos**, **Metodología**.
- **Motor de gráficos SVG** propio (sin librerías): línea con área y barras, elegidos por
  el campo `chart` de cada indicador; redibujo responsivo con `ResizeObserver`.
- **Dropdowns personalizados** (Factor → Indicador) que envuelven nombres largos.
- **KPIs** de valor final e inicial con variación del periodo.
- **Pipeline de datos** desacoplado: Excel → `scripts/generar_json.py` (Python +
  openpyxl) → `data/datos_indicadores.json` → `fetch()` en el cliente.
- Identidad visual institucional (azules Unimagdalena, tipografías Outfit + Inter).

---

## Cómo agregar una entrada

1. Añade tus cambios bajo **[Sin publicar]** mientras desarrollas, agrupados por tipo.
2. Al publicar una versión, renombra **[Sin publicar]** a `[X.Y.Z] – AAAA-MM-DD` y crea
   una nueva sección **[Sin publicar]** vacía arriba.
3. Sube el `MAYOR` en cambios incompatibles, `MENOR` en funcionalidades nuevas
   compatibles, y `PARCHE` en correcciones.
