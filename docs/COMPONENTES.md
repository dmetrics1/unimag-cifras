# Catálogo de componentes de UI

> Proyecto **Unimagdalena en Cifras** · Tablero de indicadores por factor (serie 2020–2025).
> Referencia técnica de todos los componentes de interfaz: qué son, dónde viven y cómo se comportan.

Este documento está pensado para un desarrollador que llega nuevo al proyecto. Describe **cada componente visible** del tablero, verificando las clases y funciones reales contra el código fuente:

- `index.html` — cascarón estático (sidebar, header móvil, contenedores de página, overlays).
- `assets/js/app.js` — toda la lógica y casi todo el marcado dinámico (se inyecta con `innerHTML`).
- `assets/css/tokens.css` — tokens de diseño y estilos de todos los componentes.

**Convención importante del proyecto:** el HTML de `index.html` es mínimo. La mayor parte de la interfaz (hero, tarjetas, gráficos, KPIs, tabla, modal) **no existe en el HTML**; la generan funciones `render*()` de `app.js` escribiendo cadenas de HTML dentro de contenedores vacíos (`#inicioContent`, `#content`, `#datosContent`, `#metodologiaContent`). Si buscas una clase y no la encuentras en `index.html`, búscala en la función `render*` correspondiente.

### Enlaces relacionados

- [Arquitectura general](ARQUITECTURA.md)
- [Sistema de estilos y tokens](ESTILOS.md)
- [Lógica JavaScript](JAVASCRIPT.md)
- [Comportamiento responsivo](RESPONSIVE.md)
- [Guía del desarrollador](GUIA_DESARROLLADOR.md)

### Tokens y constantes transversales

Colores de datos definidos como constantes en `app.js` (no como variables CSS), reutilizados en todos los gráficos:

| Constante JS | Valor | Uso |
|---|---|---|
| `ACCENT` | `#0183EF` | Serie **Unimagdalena** (línea/barra azul, punto inicial de sparkline) |
| `GOLD` | `#FF9400` | **Punto final** de la serie (círculo naranja) |
| `NACIONAL` | `#8295AB` | Serie **Nacional** (línea gris punteada en gráficos duales) |

Los tokens de color, tipografía, radios y sombras de la UI viven en `:root` de `tokens.css` (`--brand-primary`, `--brand-accent`, `--font-display`, `--radius`, `--shadow`, etc.). Ver [ESTILOS.md](ESTILOS.md).

---

## 1. Sidebar (escritorio)

**Propósito.** Barra de navegación lateral fija (menú principal de 4 páginas) e identidad institucional. Es el componente de navegación primario en pantallas ≥ 920 px.

**Estructura HTML (en `index.html`).**

```html
<aside class="sidebar" id="sidebar" role="navigation" aria-label="Navegación principal">
  <div class="sb-brand">
    <div class="sb-logo"><img src="assets/img/escudo-unimagdalena.png" alt="…"></div>
    <div class="sb-title">UNIMAGDALENA<span>Indicadores por Factor</span></div>
    <button class="sb-toggle" id="sbToggle" type="button" aria-label="Contraer menú" title="Contraer menú">…</button>
  </div>
  <div class="sb-label">Menú</div>
  <nav class="nav nav--pages" id="pageNav"> … 4× .nav__item … </nav>
  <div class="sb-foot"><b>Unimagdalena en Cifras</b><br>Serie 2020–2025 · Oficina de Planeación</div>
</aside>
```

**Dónde se genera.** Estático en `index.html` (líneas 28–59). No se re-renderiza por JS.

**Estilos clave.** `.sidebar` es `position: fixed` con gradiente azul profundo (`#001D39 → #00294B`), `border-radius: 26px` y márgenes de 24 px (queda "flotando"). Ancho vía token `--sidebar-w: 248px`. La `.content` se separa con `margin-left: 296px`.

**Comportamiento / interacción.**
- **Colapsar:** el botón `.sb-toggle` (#sbToggle) alterna la clase `.is-collapsed` sobre `.layout` mediante `setSidebarCollapsed(on)`. En estado colapsado la sidebar baja a `72px`, se ocultan `.sb-title`, `.sb-label` y `.sb-foot`, y los `.nav__item` se centran sin texto. El estado se **persiste en `localStorage`** (clave `sbCollapsed`) y se restaura en `wireEvents()`.
- El icono del botón es un SVG de "panel lateral" (rectángulo con divisoria).

**Dependencias.** `setSidebarCollapsed()`, `wireEvents()` (cablea el click y lee `localStorage`). Contiene el componente **Navegación (#4)**. En móvil este mismo `<aside>` se transforma en **Drawer (#3)**.

---

## 2. Mobile Header

**Propósito.** Encabezado superior fijo exclusivo de móvil/tablet (< 920 px) con marca y botón hamburguesa. En escritorio está oculto.

**Estructura HTML (en `index.html`).**

```html
<header class="mobile-header">
  <div class="mh-brand">
    <div class="mh-logo"><img src="…" alt="…"></div>
    <div class="mh-title">UNIMAGDALENA<span>Indicadores por Factor</span></div>
  </div>
  <button class="mb-menu-btn" id="mbMenuBtn" type="button"
          aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="sidebar">
    <svg …>…</svg> <!-- 3 líneas: hamburguesa -->
  </button>
</header>
```

**Dónde se genera.** Estático en `index.html` (líneas 16–24).

**Estilos clave.** `.mobile-header` y `.sb-overlay` tienen `display: none !important` por defecto; **solo se activan** dentro de `@media (max-width: 919px)` (que impone `display: flex !important`). Es `position: sticky; top: 0`, mismo gradiente azul que la sidebar, respeta el *safe-area* superior con `var(--sat)`.

**Comportamiento / interacción.** El botón `.mb-menu-btn` (#mbMenuBtn) abre/cierra el drawer vía `toggleMobileMenu()` (cableado en `wireEvents()`). Su `aria-expanded` se sincroniza en `openMobileMenu()` / `closeMobileMenu()`.

**Dependencias.** `toggleMobileMenu()`, `openMobileMenu()`, `closeMobileMenu()`. Actúa sobre el **Drawer (#3)**.

---

## 3. Drawer + Overlay móvil

**Propósito.** En móvil, la misma `.sidebar` se convierte en un panel deslizante (drawer) que entra desde la izquierda, con un fondo oscurecido (backdrop) que la cubre.

**Estructura HTML.** Reutiliza `<aside class="sidebar" id="sidebar">` (#1). El backdrop es un div propio, estático en `index.html`:

```html
<div class="sb-overlay" id="sbOverlay" aria-hidden="true"></div>
```

**Dónde se genera.** El drawer es la sidebar de `index.html`; el estado abierto/cerrado lo controla JS con clases.

**Estilos clave.**
- En `@media (max-width: 919px)`: `.sidebar` pasa a `transform: translateX(-100%)` (fuera de pantalla), ancho `min(290px, 86vw)`, sin bordes redondeados. La clase `.is-open` la trae con `transform: translateX(0)` (transición `.28s`).
- `.sb-overlay` es `position: fixed; inset: 0` con `rgba(0,20,40,.5)` y `backdrop-filter: blur(2px)`; oculto por defecto, visible con `.is-active`.
- En el drawer el botón `.sb-toggle` se oculta (`display: none !important`).

**Comportamiento / interacción.**
- `openMobileMenu()` añade `.is-open` a la sidebar, `.is-active` al overlay, `aria-expanded="true"` al botón hamburguesa y `.no-scroll` al `<body>`.
- `closeMobileMenu()` revierte todo lo anterior.
- `toggleMobileMenu()` alterna según si `.sidebar` tiene `.is-open`.
- Se cierra: al hacer click en el overlay (`sbOv.onclick = closeMobileMenu`), con **Escape** (listener global de teclado), y **automáticamente al navegar** (`showPage()` llama `closeMobileMenu()`).

**Dependencias.** `openMobileMenu/closeMobileMenu/toggleMobileMenu`, `wireEvents()`, `showPage()`. Elementos: `#sidebar`, `#sbOverlay`, `#mbMenuBtn`.

---

## 4. Navegación (menú de páginas)

**Propósito.** Los 4 accesos a las páginas del tablero: Inicio, Factores, Datos, Metodología.

**Estructura HTML (en `index.html`, dentro de `#pageNav`).**

```html
<nav class="nav nav--pages" id="pageNav">
  <button class="nav__item" data-page="inicio" title="Inicio">
    <span class="nav__ico" aria-hidden="true"><svg>…</svg></span>
    <span class="nav__txt">Inicio</span>
  </button>
  <!-- factores · datos · metodologia (idéntica estructura) -->
</nav>
```

Cada ítem es un `<button>` con `data-page` (uno de `inicio | factores | datos | metodologia`), un icono `.nav__ico` (SVG inline) y una etiqueta `.nav__txt`.

**Dónde se genera.** Estático en `index.html` (líneas 39–56).

**Estilos clave.** `.nav__item` es fila flex de alto mínimo 44 px. Estado activo `.nav__item.is-active`: fondo `rgba(1,131,239,.18)`, texto blanco y `box-shadow` interior azul. Al colapsar la sidebar, `.nav__txt` se oculta y el ítem se centra.

**Comportamiento / interacción.**
- En `wireEvents()`, cada ítem hace `location.hash = '/' + b.dataset.page`. La navegación es por **hash routing**: `hashchange → router() → showPage()`.
- `showPage(page)` marca el `.page` correspondiente con `.is-active` y sincroniza `.nav__item.is-active` comparando `dataset.page` con la página actual.

**Dependencias.** `showPage()`, `router()`, `wireEvents()`. Array `PAGES = ['inicio','factores','metodologia','datos']`.

---

## 5. Hero de Inicio

**Propósito.** Portada de la página Inicio: banda azul de bienvenida con llamados a la acción, más 3 tarjetas-resumen con las cifras globales del tablero.

**Estructura HTML (generada por `renderInicio()`).** Dos bloques dentro de `#inicioContent`:

```html
<div class="ih-hero">
  <span class="ih-pill">2020–2025</span>
  <h1 class="ih-title">UNIMAGDALENA<br>EN CIFRAS</h1>
  <div class="ih-sub">Indicadores por factor</div>
  <p class="ih-desc">…<b>universidad de resultados e impactos</b>.</p>
  <div class="ih-actions">
    <button class="ih-btn ih-btn--primary" id="ihFactores">Explorar factores</button>
    <button class="ih-btn ih-btn--ghost" id="ihMetodo">Ver metodología</button>
  </div>
</div>
<div class="ih-tiles">
  <!-- 3× .ih-tile -->
  <div class="ih-tile" style="--stripe:#0183EF">
    <div class="ih-tile__top">
      <span class="ih-tile__ico" style="--ibg:…;--ic:…"><svg>…</svg></span>
      <span class="ih-tile__label">Factores</span>
    </div>
    <b class="ih-tile__num">12</b>
    <span class="ih-tile__desc">Factores del modelo de acreditación</span>
  </div>
</div>
```

**Dónde se genera.** Función `renderInicio()` en `app.js`. Las 3 tarjetas se producen con el helper local `tile(stripe, ico, ibg, ic, label, num, desc)`.

**Estilos clave.**
- `.ih-hero`: gradiente azul, `min-height: 320px`, círculo decorativo con `::after`.
- `.ih-btn--primary`: verde lima `#A5CA00`; `.ih-btn--ghost`: translúcido con borde.
- `.ih-tiles`: grid de 3 columnas con `margin-top: -58px` (las tarjetas **cabalgan** sobre el hero). Cada `.ih-tile` lleva una franja de color superior vía `border-top: 3px solid var(--stripe)`; el icono usa `--ibg` (fondo) y `--ic` (color) inyectados inline.

**Comportamiento / interacción.** Los dos botones navegan por hash: `#ihFactores → #/factores`, `#ihMetodo → #/metodologia`.

**Datos que muestra.** `DB.factors.length` (Factores), suma de indicadores de todos los factores (Indicadores) y `YEARS.length` años (Periodo). Iconos vía `svgIco('mstack' | 'mhist' | 'mcal')`.

**Dependencias.** `renderInicio()`, `svgIco()`, `ICO`, datos globales `DB` y `YEARS`.

---

## 6. Tarjetas de factor (Metodología)

**Propósito.** Rejilla de 12 tarjetas, una por factor de acreditación; cada una abre el modal de detalle del factor.

**Estructura HTML (generada por `renderMetodologia()`).**

```html
<div class="pt-grid pt-grid--flow">
  <button class="pt-card" data-i="0" style="--fc:#0A4174">
    <span class="pt-card__ico"><svg>…</svg></span>
    <span class="pt-card__num">01</span>
    <span class="pt-card__name">Identidad institucional</span>
    <span class="pt-card__cnt">N indicadores</span>
    <span class="pt-card__go"><svg>…</svg></span>
  </button>
  <!-- … 12 en total … -->
</div>
```

**Dónde se genera.** Función `renderMetodologia()`, iterando el array `FACTORES_INFO`. El contenedor va dentro de `.doc.doc--fill` junto a un `.doc-hero` de título.

**Estilos clave.** `.pt-card` toma su color de acento del custom property `--fc` (inyectado inline por factor). En hover: se eleva (`translateY(-4px)`), aparece la barra lateral `::before`, el icono invierte a fondo sólido y el chevron `.pt-card__go` se desliza. En `.doc--fill` la grilla `.pt-grid--flow` es 4×3 en escritorio y llena la pantalla (regla "sin scroll").

**Comportamiento / interacción.** Cada `.pt-card` tiene `data-i` (índice del factor). En `renderMetodologia()` se cablea `c.onclick = () => openFactorPanel(+c.dataset.i)`, que abre el **Modal de factor (#12)**.

**Datos.** `FACTORES_INFO` — array de 12 objetos `{n, ico, color, short, desc}` definido en `app.js`. El conteo de indicadores (`.pt-card__cnt`) se lee de `DB.factors[i].indicators.length`.

**Dependencias.** `renderMetodologia()`, `openFactorPanel()`, `svgIco()`, `FACTORES_INFO`, `DB`.

---

## 7. Filtros (dropdown personalizado)

**Propósito.** Selector desplegable accesible y a medida (no un `<select>` nativo), usado para filtrar por factor/indicador.

**Estructura HTML (generada por `makeDropdown()`).** El contenedor `.dd` existe vacío en el HTML (o se crea en el marcado de la página) y `makeDropdown` inyecta:

```html
<div class="dd" id="ddFactor">
  <button type="button" class="dd__btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="…">
    <span class="dd__val"></span>
    <svg class="dd__chev" …><path d="m6 9 6 6 6-6"/></svg>
  </button>
  <div class="dd__menu" role="listbox" hidden>
    <!-- N× <div class="dd__opt" role="option" data-i="…" aria-selected> -->
  </div>
</div>
```

**Dónde se genera.** Fábrica `makeDropdown(root, labelId, onSelect)` en `app.js`. Instancias:
- **Factores:** `#ddFactor` (elegir factor) y `#ddInd` (elegir indicador) — contenedores en `index.html`, instanciados en `wireEvents()`.
- **Datos:** `#ddDatos` (filtrar por factor) — instanciado dentro de `renderDatos()`.

**Estilos clave.** `.dd` es `position: relative`. `.dd__btn` con foco/abierto: borde azul y halo (`box-shadow`). El chevron `.dd__chev` rota 180° cuando `aria-expanded="true"`. `.dd__menu` es panel absoluto con sombra; `.dd__opt.is-sel` marca la opción elegida con un `✓` (`::after`) y `.dd__opt.is-active` resalta la opción bajo teclado.

**Comportamiento / interacción.**
- **Ratón:** click en el botón abre/cierra; click en una opción llama `choose(i)`.
- **Teclado:** ↑/↓ abren el menú o mueven el resaltado (`activeIdx`); Enter/Espacio abren o confirman; Escape cierra.
- **Cierre por fuera:** listeners `mousedown`/`touchstart` en captura cierran si el click cae fuera de `root`.
- **Auto-volteo:** al abrir, si el menú se saldría por la derecha (`getBoundingClientRect().right > innerWidth - 8`) se ancla a la derecha en vez de a la izquierda.
- **Tooltip:** el valor seleccionado y cada opción llevan `title` (útil con texto truncado por elipsis).

**API expuesta.** El objeto devuelto tiene `setItems(items, sel)` (rellena opciones y marca la seleccionada) y `close()`. El callback `onSelect(i)` recibe el índice elegido.

**Dependencias.** `makeDropdown()`, `escHtml()`. Consumidores: `renderFactores()` (`ddFactor.setItems`, `ddInd.setItems`), `renderDatos()`.

---

## 8. Gráficos SVG

**Propósito.** Visualización de la serie temporal 2020–2025 del indicador activo, dibujada como SVG a mano (sin librerías) y **responsiva** vía `ResizeObserver`.

**Estructura HTML (dentro de `renderContent()`).**

```html
<div class="fx-chart">
  <div class="fx-chart__head">
    <span class="fx-chart__title">Nombre del indicador</span>
    <!-- Solo si el indicador es dual: -->
    <div class="fx-legend">
      <span class="fx-leg"><i style="background:#0183EF"></i>Unimagdalena</span>
      <span class="fx-leg"><i style="background:#8295AB"></i>Nacional</span>
    </div>
  </div>
  <div class="chart-host" id="chartHost"></div>
</div>
```

**Dónde se genera.** El contenedor lo escribe `renderContent()`. El SVG lo monta `mountChart(host, ind, years)`, que decide el tipo según `ind.chart`:
- `buildLineSVG(ind, years, w, h)` — gráfico de **línea** (por defecto), con área degradada, puntos etiquetados y punto final en `GOLD`. Si el indicador es dual dibuja además la serie nacional como línea gris punteada (`stroke-dasharray`).
- `buildBarSVG(ind, years, w, h)` — gráfico de **barras** (cuando `ind.chart === 'barras'`); la última barra se pinta en azul oscuro `#004A87`.
- `chartFrame(w, h, mn, mx, pct, pad)` — helper compartido que dibuja la grilla horizontal y las etiquetas del eje Y.

> Nota: `bigChart()` y `sparkline()` también existen en `app.js` como generadores SVG, pero **no** los usa el flujo de páginas actual (son utilidades de tarjeta/modal heredadas).

**Estilos clave.** `.fx-chart` es tarjeta blanca flexible (`flex: 7` frente a los KPIs). `.chart-host` ocupa el alto disponible (`height: 100%`, `min-height: 220px`) y su SVG hijo se estira al 100%. `.fx-chart__head` separa título y leyenda con línea inferior. La leyenda `.fx-legend` / `.fx-leg` solo aparece en indicadores duales.

**Comportamiento / interacción.** `mountChart()` dibuja de inmediato y crea un `ResizeObserver` (`chartRO`) sobre el host que **re-dibuja** el SVG en cada cambio de tamaño, recalculando *paddings* y tamaños de fuente según el ancho (`w < 420` reduce escalas). Solo hay un `chartRO` vivo a la vez (se hace `disconnect()` antes de reobservar).

**Colores.** `ACCENT` (#0183EF) serie Unimagdalena; `GOLD` (#FF9400) punto final; `NACIONAL` (#8295AB) serie nacional punteada.

**Dependencias.** `renderContent()`, `mountChart()`, `buildLineSVG()`, `buildBarSVG()`, `chartFrame()`, `fmt()`, `firstVal/lastVal`. Datos: `ind.values`, `ind.values_ref`, `ind.dual`, `ind.chart`, `ind.pct` y `YEARS`. La serie nacional se acopla en `mergeNacional()` durante el arranque.

---

## 9. KPIs

**Propósito.** Dos tarjetas de cifra clave junto al gráfico: valor final (último año con dato) y valor inicial (punto de partida), con la variación entre ambos.

**Estructura HTML (dentro de `renderContent()`).**

```html
<div class="fx-kpis">
  <div class="fx-kpi fx-kpi--final">
    <span class="fx-kpi__eyebrow">Valor final</span>
    <b class="fx-kpi__val">…</b>
    <span class="fx-kpi__year">2025</span>
    <span class="fx-kpi__delta up">▲ +12.3% <em>vs 2020</em></span>
  </div>
  <div class="fx-kpi fx-kpi--start">
    <span class="fx-kpi__eyebrow">Valor inicial</span>
    <b class="fx-kpi__val">…</b>
    <span class="fx-kpi__year">2020</span>
    <span class="fx-kpi__tag">Punto de partida</span>
  </div>
</div>
```

**Dónde se genera.** Función `renderContent()`.

**Estilos clave.** `.fx-kpi--final` lleva filete izquierdo azul (`border-left: 3px solid var(--brand-accent)`); `.fx-kpi--start`, filete verde (`var(--pos)`). El valor `.fx-kpi__val` usa el tamaño fluido `--fluid-kpi-value`. El delta cambia de color según dirección: `.up` verde, `.down` rojo, `.flat` gris. El `.fx-kpi__tag` es una píldora verde con punto.

**Comportamiento / interacción.** No interactivos: son de solo lectura. Los valores y la variación los calculan `firstVal()`, `lastVal()` y `trend()` sobre `ind.values`; la flecha (`▲/▼/▬`) y la clase (`up/down/flat`) salen de `trend().dir`. Formato con `fmt(v, ind.pct)`.

**Dependencias.** `renderContent()`, `firstVal()`, `lastVal()`, `trend()`, `fmt()`. Datos: `currentInd().values`, `ind.pct`, `YEARS`.

---

## 10. Tabla de Datos

**Propósito.** Página Datos: tabla completa de todos los indicadores × años, con buscador, filtro por factor, contador y descargas.

**Estructura HTML (generada por `renderDatos()`, dentro de `#datosContent`).**

```html
<div class="datos-head">
  <div><div class="eyebrow">Datos</div><h2>Tabla completa de indicadores</h2><p>…</p></div>
  <div class="datos-dl">
    <a class="btn-dl btn-dl--primary" href="data/datos_indicadores.json" download>…JSON</a>
    <button class="btn-dl" id="dlCsv" type="button">…CSV</button>
  </div>
</div>
<div class="dz-controls">
  <div class="search dz-search"><svg>…</svg><input id="datosQ" placeholder="Buscar indicador o factor…"></div>
  <span id="ddDatosLbl" class="sr-only">Filtrar por factor</span>
  <div class="dd dz-dd" id="ddDatos"></div>
</div>
<div class="dz-table-wrap">
  <table class="dz-tbl">
    <thead><tr><th class="dz-fac">Fac.</th><th class="dz-name">Indicador</th> …<th class="dz-yr dz-yr--last">2025</th></tr></thead>
    <tbody>
      <tr>
        <td class="dz-fac">01</td>
        <td class="dz-name"><button class="dz-link" data-fi="0" data-ii="0">…</button></td>
        <td class="dz-yr">…</td> … <td class="dz-yr dz-yr--last">…</td>
      </tr>
    </tbody>
  </table>
</div>
<div class="dz-count">Mostrando N de M</div>
```

**Dónde se genera.** Función `renderDatos()`. Se re-renderiza completa en cada cambio de búsqueda o filtro.

**Estilos clave.**
- `.dz-table-wrap`: contenedor con `overflow: auto` y `max-height` calculado (scroll interno).
- `.dz-tbl thead th`: **encabezado fijo** (`position: sticky; top: 0`), fondo `#EEF3F8`.
- Filas **zebra** (`tbody tr:nth-child(even)`) y hover.
- Columnas: `.dz-fac` (número de factor), `.dz-name` (indicador), `.dz-yr` (año) y `.dz-yr--last` (último año, resaltado). Valores nulos → `.dz-na` con "—".
- Botones de descarga `.btn-dl` y `.btn-dl--primary` (JSON, en azul sólido).

**Comportamiento / interacción.**
- **Buscar:** input `#datosQ` actualiza `datosQuery` y re-renderiza; se preserva el foco y la posición del cursor tras el re-render.
- **Filtrar por factor:** dropdown `#ddDatos` (instancia de `makeDropdown`, ver #7) con "Todos los factores" + los 12 factores; fija `datosFactor` y re-renderiza.
- **Descargas:** el enlace JSON apunta a `data/datos_indicadores.json`; el botón CSV llama `downloadCSV()`, que arma un CSV con `;`, BOM UTF-8 y coma decimal, y lo descarga como `unimagdalena_indicadores_2020-2025.csv`.
- **Ir a Factores:** click en `.dz-link` fija `curFactor`/`curInd` desde `data-fi`/`data-ii` y navega a `#/factores`.

**Dependencias.** `renderDatos()`, `makeDropdown()`, `downloadCSV()`, `fmt()`, `escHtml()`, `svgIco()`. Estado de módulo: `datosQuery`, `datosFactor`. Datos: `DB.factors`, `YEARS`.

---

## 11. Banda de Factores

**Propósito.** Cabecera de la página Factores: banda azul con el nombre del factor activo, más la barra de filtros que "flota" sobre ella.

**Estructura HTML (estática en `index.html`; el texto lo rellena `renderFactores()`).**

```html
<div class="fx-head">
  <div class="fx-band">
    <div class="eyebrow" id="fEyebrow">Factor 1</div>
    <h2 id="fTitle"></h2>
    <p id="fSub"></p>
  </div>
  <div class="fx-filters">
    <div class="fx-field">
      <label id="ddFactorLbl">Factor</label>
      <div class="dd" id="ddFactor"></div>
    </div>
    <div class="fx-field fx-field--grow">
      <label id="ddIndLbl">Indicador</label>
      <div class="dd dd--grow" id="ddInd"></div>
    </div>
  </div>
</div>
```

**Dónde se genera.** El marcado es estático (`index.html`, líneas 70–86); `renderFactores()` rellena `#fEyebrow`, `#fTitle`, `#fSub` y llama `ddFactor.setItems(...)` / `ddInd.setItems(...)`.

**Estilos clave.** `.fx-band`: gradiente azul con `border-radius: var(--band-radius)` y padding inferior amplio. `.fx-filters`: tarjeta blanca con `margin: -26px 24px 0` (queda montada **−26 px** sobre la banda), `z-index: 2`. `.fx-field + .fx-field` añade un separador vertical entre los dos filtros; `.fx-field--grow`/`.dd--grow` hacen que el selector de indicador ocupe el espacio restante.

**Comportamiento / interacción.** Contiene los dos dropdowns de filtro (#7). Cambiar de factor reinicia el indicador a 0 y re-renderiza; cambiar de indicador re-renderiza solo el contenido (`renderContent`).

**Dependencias.** `renderFactores()`, `renderContent()`, `makeDropdown()`. Datos: `currentFactor()`, `DB.factors`, `YEARS`.

---

## 12. Modal de factor

**Propósito.** Ventana modal grande con la ficha oficial del factor (definición y características de alta calidad del CNA) y un CTA para saltar a sus indicadores. Se abre desde las tarjetas de Metodología (#6).

**Estructura HTML (generada por `openFactorPanel(i)`).** El overlay y el panel se crean vacíos al final de `renderMetodologia()`:

```html
<div class="pt-overlay" id="ptOverlay"></div>
<div class="fdlg" id="ptPanel" role="dialog" aria-modal="true" aria-hidden="true"></div>
```

`openFactorPanel(i)` inyecta dentro de `#ptPanel`:

```html
<div class="fdlg__head">
  <span class="fdlg__ico"><svg>…</svg></span>
  <div class="fdlg__titles">
    <span class="fdlg__eyebrow">Factor N · Acreditación institucional</span>
    <h2>Nombre corto del factor</h2>
  </div>
  <button class="fdlg__close" aria-label="Cerrar" onclick="closeFactorPanel()">&times;</button>
</div>
<div class="fdlg__body">
  <div class="fdlg__full">Nombre completo del factor</div>
  <p class="fdlg__def">Definición…</p>
  <!-- Características (si hay): -->
  <div class="fdlg__section">Características de alta calidad</div>
  <div class="fdlg__car">
    <div class="fdlg__car-h"><span class="fdlg__car-n">1</span><h4>Título</h4></div>
    <p>…</p><ul><li>…</li></ul>
  </div>
</div>
<div class="fdlg__foot">
  <span class="fdlg__src">Fuente: CNA · Lineamientos…</span>
  <button class="fdlg__cta" data-i="i">Ver los N indicadores del factor <svg>…</svg></button>
</div>
```

**Dónde se genera.** El overlay/panel vacíos: `renderMetodologia()`. El contenido: `openFactorPanel(i)`. Cierre: `closeFactorPanel()`.

**Estilos clave.** `.fdlg` es modal centrado (`position: fixed; top/left: 50%`, `transform: translate(-50%,-50%)`), aparece con `.show` (escala + opacidad). Toma su color de acento de `--fc` (fijado con `panel.style.setProperty('--fc', f.color)`), que tiñe la cabecera `.fdlg__head`, la numeración `.fdlg__car-n`, los viñetas y el botón `.fdlg__cta`. `.pt-overlay` es el backdrop con blur, visible con `.show`. Nota: `.fdlg`/`.modal` y `.pt-overlay`/`.overlay` comparten reglas base en `tokens.css`.

**Comportamiento / interacción.**
- **Abrir:** `openFactorPanel(i)` fija `--fc`, arma el HTML, cablea `.fdlg__cta` → `goToFactor(i)`, añade `.show` al overlay y al panel, `aria-hidden="false"` y `.no-scroll` al body.
- **Cerrar:** botón `×` (`onclick="closeFactorPanel()"`), click en el overlay (`ptOverlay.onclick = closeFactorPanel`) o **Escape** (listener global).
- **CTA:** "Ver los N indicadores del factor" ejecuta `goToFactor(i)` → fija `curFactor`, resetea `curInd` y navega a `#/factores`.

**Datos.** `FACTORES_INFO[i]` (icono, color, nombre corto, descripción de respaldo) y `DETALLE[f.n]` — ficha oficial cargada desde `data/factores_detalle.json` en `init()` (definición + `caracteristicas[]` con `{n, titulo, descripcion, aspectos[]}`). El nombre completo y el conteo salen de `DB.factors[i]`. Si no hay detalle, usa `f.desc` como texto de respaldo.

**Dependencias.** `openFactorPanel()`, `closeFactorPanel()`, `goToFactor()`, `svgIco()`, `escHtml()`, `renderMetodologia()`. Datos: `FACTORES_INFO`, `DETALLE`, `DB`.

---

## 13. Footer del sidebar

**Propósito.** Pie de la sidebar con el crédito institucional del tablero.

**Estructura HTML (estática en `index.html`).**

```html
<div class="sb-foot"><b>Unimagdalena en Cifras</b><br>Serie 2020–2025 · Oficina de Planeación</div>
```

**Dónde se genera.** Estático en `index.html` (línea 58).

**Estilos clave.** `.sb-foot`: `margin-top: auto` (lo empuja al fondo de la sidebar flex), borde superior sutil y texto tenue. `.sb-foot b` resalta el nombre del tablero.

**Comportamiento / interacción.** No interactivo. Se **oculta** cuando la sidebar está colapsada (`.layout.is-collapsed .sb-foot { display: none }`) y en el drawer móvil se muestra normalmente.

**Dependencias.** Ninguna funcional; su visibilidad depende del estado de colapso de la sidebar (#1).

---

## Mapa rápido componente → fuente

| # | Componente | Marcado | Función JS clave | Clase raíz |
|---|---|---|---|---|
| 1 | Sidebar | `index.html` | `setSidebarCollapsed()` | `.sidebar` |
| 2 | Mobile Header | `index.html` | `toggleMobileMenu()` | `.mobile-header` |
| 3 | Drawer + Overlay | `index.html` | `openMobileMenu/closeMobileMenu` | `.sidebar.is-open` / `.sb-overlay` |
| 4 | Navegación | `index.html` | `showPage()` / `router()` | `.nav--pages` / `.nav__item` |
| 5 | Hero de Inicio | JS | `renderInicio()` | `.ih-hero` / `.ih-tiles` |
| 6 | Tarjetas de factor | JS | `renderMetodologia()` | `.pt-card` |
| 7 | Dropdown de filtro | JS | `makeDropdown()` | `.dd` |
| 8 | Gráficos SVG | JS | `mountChart()` / `buildLineSVG()` / `buildBarSVG()` | `.fx-chart` / `.chart-host` |
| 9 | KPIs | JS | `renderContent()` | `.fx-kpis` / `.fx-kpi` |
| 10 | Tabla de Datos | JS | `renderDatos()` | `.dz-tbl` / `.dz-table-wrap` |
| 11 | Banda de Factores | `index.html` + JS | `renderFactores()` | `.fx-head` / `.fx-band` / `.fx-filters` |
| 12 | Modal de factor | JS | `openFactorPanel()` | `.fdlg` / `.pt-overlay` |
| 13 | Footer del sidebar | `index.html` | — | `.sb-foot` |
