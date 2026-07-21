# Decisiones de Arquitectura (ADR) — Unimagdalena en Cifras

Este documento recopila las **Architecture Decision Records (ADR)** del proyecto
*Unimagdalena en Cifras*, el tablero estático de indicadores institucionales de la
Universidad del Magdalena (12 factores de acreditación, serie 2020–2025).

## ¿Qué es un ADR?

Un **ADR (Architecture Decision Record)** es un registro breve y fechado de una
decisión técnica significativa: por qué se tomó, en qué contexto y con qué
consecuencias. La idea no es documentar todo el código, sino dejar rastro de las
decisiones que serían costosas de revertir o difíciles de entender más adelante
por alguien que no estuvo en la conversación original.

Un ADR es **inmutable**: una vez aceptado, no se edita para cambiar de rumbo. Si
una decisión se revierte, se escribe un ADR nuevo que la reemplace (con estado
*Reemplazada por ADR-XXX*), preservando la historia.

Estados posibles: `Propuesta` · `Aceptada` · `Reemplazada` · `Obsoleta`.

## Cómo agregar un ADR nuevo

1. Toma el **siguiente número** consecutivo (si el último es ADR-012, el nuevo es
   ADR-013).
2. Usa **exactamente el mismo formato** que los ADR de este documento:
   - **Estado**
   - **Contexto** — el problema o la situación que obliga a decidir.
   - **Decisión** — qué se decidió, en presente.
   - **Consecuencias** — ventajas y trade-offs (lo bueno y lo que se paga a cambio).
   - **Alternativas consideradas** — qué se evaluó y por qué se descartó.
3. Regístralo en el **índice** de abajo.
4. Sé honesto con los trade-offs: un ADR sin desventajas suele ser un ADR
   incompleto.

## Documentos relacionados

- [Arquitectura general](../ARQUITECTURA.md)
- [Estrategia responsiva](../RESPONSIVE.md)
- [Guía del desarrollador](../GUIA_DESARROLLADOR.md)
- [README del proyecto](../../README.md)

---

## Índice de ADRs

| #   | Título                                                                 | Estado   |
| --- | ---------------------------------------------------------------------- | -------- |
| [ADR-001](#adr-001-html--css--javascript-vanilla-sin-framework) | HTML + CSS + JavaScript vanilla (sin framework) | Aceptada |
| [ADR-002](#adr-002-sin-proceso-de-build-sin-bundler-sin-npm) | Sin proceso de build / sin bundler / sin npm | Aceptada |
| [ADR-003](#adr-003-gráficos-en-svg-generados-por-javascript-sin-librería) | Gráficos en SVG generados por JavaScript (sin librería) | Aceptada |
| [ADR-004](#adr-004-datos-en-json-desacoplado-del-diseño-generado-desde-excel-con-python) | Datos en JSON desacoplado, generado desde Excel con Python | Aceptada |
| [ADR-005](#adr-005-los-campos-chart-y-dual-no-los-genera-el-pipeline) | Los campos `chart`/`dual` no los genera el pipeline | Aceptada |
| [ADR-006](#adr-006-enrutado-por-hash-en-una-spa-de-una-sola-página) | Enrutado por hash (`#/página`) en una SPA | Aceptada |
| [ADR-007](#adr-007-estrategia-css-desktop-first-con-un-único-breakpoint-móvil) | CSS Desktop-first con un único breakpoint móvil | Aceptada |
| [ADR-008](#adr-008-sistema-de-diseño-con-custom-properties-tokens-en-un-solo-archivo) | Sistema de diseño con Custom Properties (tokens) | Aceptada |
| [ADR-009](#adr-009-sidebar-fijo-colapsable-que-se-transforma-en-drawer-móvil) | Sidebar fijo colapsable que se transforma en drawer móvil | Aceptada |
| [ADR-010](#adr-010-fusión-en-runtime-de-los-comparativos-nacional-mergenacional) | Fusión en runtime de los comparativos "Nacional" (mergeNacional) | Aceptada |
| [ADR-011](#adr-011-despliegue-en-github-pages-vía-github-actions) | Despliegue en GitHub Pages vía GitHub Actions | Aceptada |
| [ADR-012](#adr-012-accesibilidad-y-rendimiento-como-principios-transversales) | Accesibilidad y rendimiento como principios transversales | Aceptada |

---

### ADR-001: HTML + CSS + JavaScript vanilla (sin framework)

- **Estado:** Aceptada
- **Contexto:** *Unimagdalena en Cifras* es un tablero institucional que debe
  ser **durable en el tiempo** y **mantenible por perfiles no especializados**
  (personal de la Oficina de Planeación, practicantes, futuros contratistas), no
  necesariamente por un equipo de front-end. Un framework (React, Vue, Angular)
  ata el proyecto a un ecosistema que evoluciona rápido, exige una cadena de
  build y obliga a mantener dependencias al día para no acumular vulnerabilidades.
  El alcance real es acotado: cuatro páginas (`inicio`, `factores`, `metodología`,
  `datos`), una tabla y gráficos sencillos sobre una serie 2020–2025.
- **Decisión:** Construir todo el tablero con **HTML, CSS y JavaScript vanilla**,
  sin framework de UI. La lógica vive en un único `assets/js/app.js`, los estilos
  en `assets/css/tokens.css` y la estructura en `index.html`.
- **Consecuencias:**
  - *A favor:* cero dependencias de framework; carga rápida (el navegador ejecuta
    el código tal cual); se sirve directamente en cualquier hosting estático; el
    código es legible por cualquiera que sepa HTML/JS básico; sin riesgo de que el
    proyecto "caduque" cuando una versión mayor del framework rompa la anterior.
  - *En contra:* no hay ecosistema de componentes reutilizables; todo se
    construye a mano (dropdowns, modales, drawer, gráficos); el renderizado usa
    concatenación de strings HTML (`innerHTML`), que a mayor escala sería más
    difícil de mantener que un sistema de componentes con estado.
- **Alternativas consideradas:**
  - *React/Vue/Svelte:* descartados por sobredimensionar el problema, introducir
    cadena de build (ADR-002) y comprometer la durabilidad y la mantenibilidad por
    perfiles no especializados.
  - *Web Components nativos:* aportaban encapsulamiento, pero añadían complejidad
    conceptual sin beneficio claro para un tablero de este tamaño.

---

### ADR-002: Sin proceso de build / sin bundler / sin npm

- **Estado:** Aceptada
- **Contexto:** Una cadena de build (Webpack, Vite, Rollup, `npm install`)
  introduce un `node_modules`, un `package-lock.json`, versiones de herramientas y
  un paso de compilación que hay que ejecutar y mantener. Para un sitio que se
  actualiza sobre todo por **datos** (no por código) y que debe poder editar
  cualquiera, ese andamiaje es una carga permanente y un punto de fallo.
- **Decisión:** **No usar bundler ni npm.** Los archivos se sirven **tal cual**:
  `index.html` enlaza directamente `assets/css/tokens.css` y `assets/js/app.js`.
  El único requisito para desarrollo local es un servidor HTTP estático
  (`python -m http.server 8000`, o los scripts `abrir_local.bat` /
  `abrir_local.sh`), necesario porque el tablero carga los datos con `fetch`
  (ver ADR-004) y el navegador bloquea `fetch` sobre `file://`.
- **Consecuencias:**
  - *A favor:* no hay paso de compilación que pueda romperse; lo que está en el
    repositorio es exactamente lo que se despliega; el onboarding es trivial
    ("abre el proyecto con un servidor local"); despliegue directo en Pages sin
    configuración de build.
  - *En contra:* sin transpilación, el JavaScript debe escribirse en sintaxis que
    los navegadores objetivo entiendan directamente; sin minificación ni
    tree-shaking automáticos; sin gestión de dependencias vía npm (las pocas
    dependencias externas —fuentes de Google— se cargan por `<link>`).
- **Alternativas consideradas:**
  - *Vite / bundler ligero:* aportaba HMR y minificación, pero a cambio de la
    misma carga de mantenimiento que se quería evitar.
  - *CDN de librerías con `<script>`:* se evita depender de terceros en tiempo de
    ejecución; ver también ADR-003 y ADR-012.

---

### ADR-003: Gráficos en SVG generados por JavaScript (sin librería)

- **Estado:** Aceptada
- **Contexto:** El tablero necesita gráficos de **línea** y de **barras** (más
  sparklines en las tarjetas y un gráfico grande de detalle). Las librerías tipo
  Chart.js o D3 resuelven esto, pero añaden una dependencia externa (peso,
  versiones, superficie de seguridad) y, sobre todo, entregan una estética
  genérica que hay que "domar" para respetar la identidad institucional (paleta de
  azules, tipografías Outfit/Inter, etiquetas de valor sobre cada punto).
- **Decisión:** Implementar un **motor de gráficos propio en SVG generado por
  JavaScript**. Las funciones `buildLineSVG()`, `buildBarSVG()`, `sparkline()` y
  `bigChart()` en `app.js` construyen el SVG como string a partir de los valores
  del indicador. `chartFrame()` comparte ejes y grilla entre línea y barras.
- **Consecuencias:**
  - *A favor:* **control total** del resultado visual (colores institucionales,
    punto final dorado, etiquetas, línea de referencia punteada); **cero
    dependencias** y funcionamiento offline; el SVG **escala nítido** en cualquier
    densidad de pantalla y se **redibuja con `ResizeObserver`** (`mountChart`) para
    adaptarse al contenedor, incluso ajustando tamaños de fuente según el ancho.
  - *En contra:* hay que **mantener el motor a mano**; funcionalidades que una
    librería trae de fábrica (tooltips interactivos, ejes logarítmicos,
    animaciones, leyendas complejas) tendrían que programarse; el conocimiento del
    motor vive en el código del proyecto, no en documentación de un tercero.
- **Alternativas consideradas:**
  - *Chart.js:* rápido de integrar, pero dependencia externa y estética que había
    que sobrescribir; contradice ADR-002 (introduciría gestión de dependencias) o
    ADR-003 (CDN en runtime).
  - *D3.js:* potente pero excesivo para dos tipos de gráfico; curva de aprendizaje
    alta para quien deba mantenerlo.
  - *`<canvas>`:* descartado frente a SVG por ser rasterizado (no escala nítido) y
    menos accesible/inspeccionable que el DOM SVG.

---

### ADR-004: Datos en JSON desacoplado del diseño, generado desde Excel con Python

- **Estado:** Aceptada
- **Contexto:** La **Oficina de Planeación** mantiene la información en un Excel
  (`data/Matriz_indicadores_por_factor.xlsx`, hoja `Matriz Indicadores`). El
  tablero, en cambio, necesita un formato apto para el navegador. Mezclar los
  datos dentro del HTML/JS obligaría a editar código cada vez que cambien las
  cifras, algo inviable para un equipo no técnico.
- **Decisión:** **Separar datos de presentación.** Un script Python
  (`scripts/generar_json.py`, con `openpyxl`) lee el Excel y produce
  `data/datos_indicadores.json`, que el tablero consume con `fetch`. El flujo es:

  ```
  Excel → scripts/generar_json.py → data/datos_indicadores.json → index.html
  ```

  El script normaliza los valores: textos como `No Aplica`, `ND`, `No Disponible`
  o celdas vacías se convierten a `null` (la serie salta ese año en el gráfico), y
  detecta indicadores de tipo porcentaje por palabras clave (`CLAVES_PCT`) para
  marcarlos con `pct: true`.
- **Consecuencias:**
  - *A favor:* actualizar los datos = **editar el Excel + correr el script**, sin
    tocar HTML ni CSS; la lógica de limpieza y formato está centralizada y es
    auditable; el Excel de trabajo puede permanecer local y fuera del control de
    versiones (está en `.gitignore`), versionándose solo el JSON resultante.
  - *En contra:* hay un **paso manual** de regeneración (quien actualiza debe
    tener Python y `openpyxl`, y recordar ejecutar el script); si el Excel cambia
    de estructura (nombre de hoja, orden de columnas), el script debe ajustarse;
    la clasificación de porcentajes depende de una lista de palabras clave que hay
    que mantener.
- **Alternativas consideradas:**
  - *Datos incrustados en el JS:* descartado por acoplar datos y código y obligar
    a intervención técnica en cada actualización.
  - *Leer el `.xlsx` directamente en el navegador (SheetJS):* añadía una
    dependencia pesada en runtime y exponía el Excel completo al cliente; el
    preprocesado en Python es más limpio y controlado.
  - *Base de datos / API:* innecesario para un dataset pequeño y estático; rompería
    la naturaleza de sitio estático (ADR-011).

---

### ADR-005: Los campos `chart` y `dual` no los genera el pipeline

- **Estado:** Aceptada
- **Contexto:** Cada indicador puede necesitar un **tipo de gráfico** distinto
  (línea o barras) y algunos son **comparativos duales** (serie Unimagdalena vs.
  Nacional). Esa intención de visualización no está en la matriz de datos: se
  extrajo de los **gráficos del documento Word oficial** de autoevaluación, donde
  cada indicador ya tenía una representación decidida. El script
  `generar_json.py` solo produce, por indicador, `name`, `values` y `pct` — no
  emite `chart` ni `dual`.
- **Decisión:** Mantener la metainformación de visualización (`chart`, `dual`)
  **aparte del pipeline**, aplicada al JSON de forma independiente (por ejemplo,
  desde un `tipos_grafico.json` / edición posterior), y resolver el resto en
  runtime: `mergeNacional()` fija `dual` y `chart:'linea'` a los pares con serie
  Nacional (ver ADR-010), y `mountChart()` lee `ind.chart==='barras'` para decidir
  entre `buildBarSVG` y `buildLineSVG`.
- **Consecuencias:**
  - *A favor:* respeta la decisión de visualización tomada en el documento oficial
    sin forzarla dentro de la matriz de datos, que se mantiene "limpia" (solo
    cifras); permitió avanzar sin rediseñar el Excel ni el script.
  - *En contra (deuda técnica):* estos campos **se pierden si se regenera el JSON**
    desde el Excel, porque el script los sobrescribe y no los conoce; hay que
    reaplicarlos tras cada regeneración. Es un punto frágil del flujo de
    actualización.
- **Alternativas consideradas:**
  - *Añadir columnas `chart`/`dual` al Excel e integrarlas al pipeline:* es la
    **mejora futura recomendada** (haría el JSON reproducible de una sola pasada),
    pero exigía tocar la matriz oficial y el script; se pospuso.
  - *Codificar el tipo de gráfico dentro de `app.js` por nombre de indicador:*
    descartado por acoplar datos y lógica y volverse inmanejable con muchos
    indicadores.
- **Nota:** marcado explícitamente como **deuda técnica**; integrar `chart`/`dual`
  al pipeline es una mejora pendiente.

---

### ADR-006: Enrutado por hash (`#/página`) en una SPA de una sola página

- **Estado:** Aceptada
- **Contexto:** El tablero es una **SPA**: un solo `index.html` con cuatro
  secciones (`inicio`, `factores`, `metodología`, `datos`) que se muestran u
  ocultan por CSS. Se despliega como **sitio estático en GitHub Pages bajo un
  subpath** (`usuario.github.io/NOMBRE-REPO/`), **sin servidor** que pueda
  reescribir rutas. Un enrutado por *path* (`/factores`) exigiría configuración de
  servidor (fallback a `index.html`) que Pages no ofrece de forma sencilla.
- **Decisión:** Usar **enrutado por hash**. La función `router()` lee
  `location.hash` (`#/factores`), y `showPage()` activa la sección correspondiente
  alternando la clase `.is-active`. La navegación (`wireEvents`) simplemente asigna
  `location.hash = '/' + página`, y un listener de `hashchange` reacciona.
- **Consecuencias:**
  - *A favor:* funciona **sin configuración de servidor** y **sin recargar** la
    página; las URLs son compartibles y navegables con atrás/adelante del
    navegador; encaja perfecto con el subpath de Pages y con la ausencia de build
    (ADR-002).
  - *En contra:* las URLs llevan `#` (menos "limpias" que rutas reales); el
    enrutado por hash no es ideal para SEO profundo (irrelevante aquí, es un
    tablero interno); no hay carga diferida por página (todo el HTML/JS se entrega
    de una vez, aceptable por el tamaño).
- **Alternativas consideradas:**
  - *History API (`pushState`) con rutas limpias:* requería reescritura en el
    servidor o un `404.html` de redirección; complejidad innecesaria para Pages.
  - *Páginas HTML separadas:* multiplicaba el marcado repetido (sidebar, header) y
    provocaba recargas completas al navegar.

---

### ADR-007: Estrategia CSS Desktop-first con un único breakpoint móvil

- **Estado:** Aceptada
- **Contexto:** El diseño de **escritorio** del tablero ya estaba **aprobado y
  validado** por la institución (layout de sidebar fija, páginas que "llenan la
  pantalla" sin scroll, hero, tarjetas KPI). Un intento previo de reescribir en
  *Mobile-first* canónico **había roto el escritorio**. La prioridad era **no
  degradar** lo que ya estaba aceptado.
- **Decisión:** Adoptar una estrategia **Desktop-first**: el CSS base
  (`tokens.css`) describe el escritorio **al 100% idéntico** al aprobado, y la
  adaptación móvil se concentra en **un único breakpoint** `@media (max-width:
  919px)` (con dos ajustes menores por rango, 480–919px y 576–919px, para columnas
  de tarjetas). Bajo 920px se activan el header móvil y el drawer, se apila el
  layout, se desactiva el modo "llenar pantalla" y los gráficos toman alto fijo.
- **Consecuencias:**
  - *A favor:* **garantiza que el escritorio no se degrade** (es la base intacta);
    la adaptación móvil queda localizada y fácil de auditar en un solo bloque; el
    breakpoint 919/920 separa con claridad "escritorio" de "tablet/móvil".
  - *En contra (trade-off honesto):* **no es Mobile-first canónico**; conceptualmente
    se construye "de grande a pequeño", lo que la ortodoxia responsiva desaconseja;
    algunas reglas móviles necesitan `!important` para sobrescribir la base de
    escritorio. Es una decisión pragmática, no doctrinaria.
- **Alternativas consideradas:**
  - *Mobile-first canónico:* teóricamente preferible, pero **ya había roto el
    escritorio aprobado**; el costo/riesgo de reescribir superaba el beneficio.
  - *Dos hojas de estilo separadas (desktop/mobile):* duplicaba mantenimiento y
    complicaba mantener la coherencia de tokens.

---

### ADR-008: Sistema de diseño con Custom Properties (tokens) en un solo archivo

- **Estado:** Aceptada
- **Contexto:** El tablero debe respetar la **identidad visual institucional**
  (paleta de azules de la Universidad, verde/naranja semánticos, tipografías
  Outfit + Inter) de forma consistente en todas las páginas y componentes.
  Repetir valores de color y tipografía por todo el CSS haría inconsistente y
  costoso cualquier ajuste de marca.
- **Decisión:** Centralizar el sistema de diseño en **Custom Properties de CSS
  (tokens)** declaradas en `:root` dentro de un único `tokens.css`: colores de
  marca (`--brand-primary`, `--brand-accent`, `--brand-deep`…), semántica de datos
  (`--pos`, `--neg`, `--ref`), neutros, tipografías (`--font-display`,
  `--font-body`), radios, sombras, dimensiones de layout (`--sidebar-w`,
  `--content-max`) y una **escala fluida** con `clamp()` (`--fluid-gap`,
  `--fluid-kpi-value`…) para la regla "sin scroll".
- **Consecuencias:**
  - *A favor:* un cambio de color o tipografía institucional se hace en **un solo
    lugar**; garantiza coherencia visual; las variables documentan la intención
    (comentarios junto a cada token); la escala fluida con `clamp()` adapta
    tamaños al viewport sin más media queries.
  - *En contra:* algunos colores de los gráficos SVG están **duplicados como
    constantes en `app.js`** (`ACCENT`, `GOLD`, `NACIONAL`) porque el SVG se genera
    en JS y no lee variables CSS directamente; hay que mantenerlos sincronizados
    con los tokens.
- **Alternativas consideradas:**
  - *Preprocesador (Sass/Less) con variables:* aportaba variables, pero exigía un
    paso de compilación (contradice ADR-002); las Custom Properties nativas son
    en vivo y no requieren build.
  - *Colores literales repetidos:* descartado por inmantenible e inconsistente.

---

### ADR-009: Sidebar fijo colapsable que se transforma en drawer móvil

- **Estado:** Aceptada
- **Contexto:** La navegación entre las cuatro páginas debe estar siempre
  disponible y ser reconocible como patrón institucional. En escritorio hay
  espacio para una barra lateral persistente; en móvil ese espacio es escaso y la
  barra lateral estorbaría el contenido.
- **Decisión:** Implementar un **sidebar fijo** en escritorio, **colapsable** a un
  riel de iconos (72px) mediante `.layout.is-collapsed`, cuyo estado se **persiste
  en `localStorage`** (`sbCollapsed`) para recordarlo entre visitas. Bajo 920px el
  mismo sidebar se convierte en un **drawer** deslizante (`.sidebar.is-open`) con
  backdrop (`.sb-overlay`) y se añade un **header con botón hamburguesa**
  (`.mobile-header`). El drawer se cierra automáticamente al navegar, con la tecla
  `Escape` o al tocar el backdrop; mientras está abierto se bloquea el scroll del
  cuerpo (`body.no-scroll`).
- **Consecuencias:**
  - *A favor:* patrón de navegación familiar y responsivo con **una sola pieza de
    marcado** reutilizada en ambos contextos; el estado de colapso persistente
    respeta la preferencia del usuario; buen uso del espacio en cada tamaño de
    pantalla.
  - *En contra:* la lógica de apertura/cierre (drawer, overlay, hamburguesa,
    colapso, `localStorage`) se maneja a mano en `app.js` (`openMobileMenu`,
    `closeMobileMenu`, `setSidebarCollapsed`); son varios estados que deben
    mantenerse coherentes.
- **Alternativas consideradas:**
  - *Navegación superior horizontal:* peor aprovechamiento vertical y menos
    escalable si crecieran las secciones.
  - *Dos componentes de navegación separados (uno desktop, uno mobile):* más
    marcado duplicado; se prefirió transformar el mismo elemento por CSS.

---

### ADR-010: Fusión en runtime de los comparativos "Nacional" (mergeNacional)

- **Estado:** Aceptada
- **Contexto:** La matriz de datos trae los comparativos nacionales como **filas
  separadas**, nombradas `"<Indicador> (Nacional)"`, junto a la fila del indicador
  base de Unimagdalena. Mostrarlas como indicadores independientes duplicaría
  entradas y ocultaría que son la **línea de comparación** del mismo indicador.
- **Decisión:** **Fusionar en runtime** cada par. La función `mergeNacional()`, al
  arrancar, detecta las filas cuyo nombre coincide con
  `/^(.+?)\s*\(Nacional\)\s*$/i`, toma sus valores y los adjunta al indicador base
  como `values_ref`, marcándolo `dual = true` y `chart = 'linea'`; luego elimina la
  fila "(Nacional)" de la lista. El gráfico de línea (`buildLineSVG`) dibuja
  entonces la serie Nacional como **línea punteada gris** con su leyenda. Resultado:
  se muestran **87 indicadores** aunque la matriz traiga **92 filas**.
- **Consecuencias:**
  - *A favor:* la comparación Unimagdalena vs. Nacional aparece **en un solo
    gráfico** y con una sola entrada en las listas; los datos de origen siguen
    siendo filas planas simples de mantener en el Excel (no requiere estructura
    anidada); la asociación se resuelve por convención de nombres, transparente
    para quien edita.
  - *En contra:* depende de una **convención estricta de nombres** (`(Nacional)`
    exacto): un typo o un espacio de más rompe la fusión y la fila aparecería
    suelta; la lógica de emparejamiento vive solo en el código.
- **Alternativas consideradas:**
  - *Estructurar el JSON con series anidadas desde el pipeline:* más robusto, pero
    exigía cambiar el formato del Excel y el script (ver ADR-004/005); se prefirió
    resolverlo en runtime sin tocar el flujo de datos.
  - *Mostrar "(Nacional)" como indicadores separados:* descartado por duplicar
    entradas y perder el sentido comparativo.

---

### ADR-011: Despliegue en GitHub Pages vía GitHub Actions

- **Estado:** Aceptada
- **Contexto:** El tablero es un **sitio estático** (ADR-001, ADR-002) que necesita
  un hosting **gratuito, sencillo y estable**, sin servidor de aplicación. El
  código ya vive en un repositorio Git.
- **Decisión:** Desplegar en **GitHub Pages** mediante un **workflow estático de
  GitHub Actions**. Todas las rutas del proyecto son **relativas** (`assets/…`,
  `data/…`) para funcionar correctamente bajo el **subpath** de Pages
  (`usuario.github.io/NOMBRE-REPO/`). Un archivo **`.nojekyll`** en la raíz evita
  el procesamiento con Jekyll (que podría ignorar ciertos archivos/carpetas).
- **Consecuencias:**
  - *A favor:* hosting **gratuito** y sin infraestructura que administrar;
    despliegue automático en cada push; encaja con el enrutado por hash (ADR-006),
    que no necesita reescritura de rutas; publicación reproducible desde el propio
    repositorio.
  - *En contra:* atado al subpath de Pages, lo que **obliga a mantener todas las
    rutas relativas** (una ruta absoluta `/assets/...` rompería en producción);
    sin backend, cualquier funcionalidad dinámica futura requeriría otra solución.
- **Alternativas consideradas:**
  - *Netlify / Vercel:* ofrecen más (funciones, previews), pero **innecesarios**
    para este alcance puramente estático; añadirían una plataforma externa sin
    beneficio real.
  - *Servidor propio institucional:* mayor costo y mantenimiento para algo que
    Pages resuelve gratis.

---

### ADR-012: Accesibilidad y rendimiento como principios transversales

- **Estado:** Aceptada
- **Contexto:** Al ser un tablero **institucional público**, debe ser usable con
  teclado y lectores de pantalla, cómodo en dispositivos táctiles y de carga
  ligera, sin depender de una librería que "resuelva" la accesibilidad por él.
- **Decisión:** Tratar **accesibilidad y rendimiento como principios
  transversales**, aplicados directamente en el marcado y los estilos:
  - **Roles y ARIA:** `role="navigation"`/`role="dialog"`/`role="listbox"`,
    `aria-modal`, `aria-expanded`, `aria-labelledby`, `aria-hidden`,
    `aria-controls`; utilidades `.sr-only` para etiquetas solo para lectores.
  - **Foco visible:** `:focus-visible` con contorno de marca en botones, enlaces e
    inputs; navegación por teclado en los dropdowns (flechas, Enter, Escape) y
    cierre global con `Escape`.
  - **Áreas táctiles ≥ 44px:** `min-height: 44px` en ítems de navegación y
    controles, siguiendo las guías de tamaño de objetivo táctil.
  - **`prefers-reduced-motion`:** se anulan transiciones y animaciones para quien
    lo solicite.
  - **Fuentes con `display: swap`** y `preconnect` a Google Fonts para no bloquear
    el render.
  - **Datos frescos:** `fetch(..., {cache: 'no-cache'})` para servir siempre la
    última versión del JSON, con manejo de error visible si la carga falla.
  - **Áreas seguras:** variables `env(safe-area-inset-*)` para respetar los
    *notches* en móvil.
- **Consecuencias:**
  - *A favor:* el tablero es navegable por teclado y más amigable con lectores de
    pantalla; respeta preferencias de movimiento del sistema; carga rápido y
    muestra siempre datos actualizados; buena experiencia táctil.
  - *En contra:* la accesibilidad es **responsabilidad manual y continua** (cada
    componente nuevo debe cablear sus roles/ARIA/foco a mano); `cache: 'no-cache'`
    evita servir datos viejos pero renuncia al beneficio de caché para ese
    recurso; sin auditoría automatizada, hay que verificar la accesibilidad al
    agregar componentes.
- **Alternativas consideradas:**
  - *Librería de componentes accesibles:* habría traído ARIA "de fábrica", pero
    introduce dependencia y contradice ADR-001/ADR-002.
  - *Ignorar `prefers-reduced-motion` / caché por defecto:* descartado por peor
    accesibilidad y riesgo de mostrar datos desactualizados.
