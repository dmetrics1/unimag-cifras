# Sistema de estilos — "Unimagdalena en Cifras"

Guía del sistema CSS del tablero. Pensada para que una persona desarrolladora nueva entienda de dónde salen los colores, las medidas y los nombres de clase, y pueda extender el sistema sin romper la coherencia visual.

> **Regla de oro:** todos los valores de este documento están extraídos directamente de `assets/css/tokens.css`. Si vas a cambiar algo, edita ese archivo — no hay build, ni preprocesador, ni valores escondidos en otro lado.

Documentos relacionados:
- [Arquitectura general](./ARQUITECTURA.md)
- [Diseño responsivo](./RESPONSIVE.md)
- [Componentes](./COMPONENTES.md)
- [Guía del desarrollador](./GUIA_DESARROLLADOR.md)

---

## 1. Filosofía del sistema

El sistema visual se apoya en cuatro decisiones deliberadas:

1. **Un solo archivo CSS.** Toda la identidad visual y la interfaz viven en `assets/css/tokens.css` (~1.298 líneas). Se enlaza directamente desde `index.html`. No hay `styles/`, ni módulos, ni imports encadenados: un archivo, una fuente de verdad.
2. **CSS vanilla, sin build.** No hay Sass, Less, PostCSS, Tailwind ni ninguna herramienta de compilación. Lo que escribes es lo que el navegador ejecuta. Esto mantiene el proyecto trivial de servir (GitHub Pages) y sin dependencias que mantener.
3. **Tokens en `:root`.** El color, la tipografía, el radio, la sombra, el layout y las escalas fluidas se declaran como *custom properties* de CSS en `:root`. Los componentes consumen esas variables con `var(--token)`; casi nunca escriben un valor literal. Cambiar la identidad de marca es cambiar el `:root`.
4. **Desktop-first.** Las reglas base describen la experiencia de **escritorio**, que es la referencia canónica ("preservación 100% idéntica de escritorio"). La adaptación a móvil se hace **exclusivamente** dentro de `@media (max-width: 919px)`. Nunca al revés.

---

## 2. Organización del archivo

`tokens.css` está dividido en cuatro secciones, cada una marcada con un banner de comentario. Los rangos de línea son aproximados y sirven de mapa de navegación:

| # | Sección | Líneas aprox. | Contenido |
|---|---------|---------------|-----------|
| 1 | **TOKENS Y RESET BASE (ESCRITORIO ORIGINAL)** | 7 – 158 | El `:root` con todas las custom properties, el reset (`box-sizing`, márgenes), estilos base de `body`/`h1..h4`/`img`, `:focus-visible`, y el header móvil declarado (oculto en escritorio). |
| 2 | **LAYOUT Y SIDEBAR** | 160 – 391 | El shell de la app: `.sidebar`, marca, navegación (`.nav__*`), pie, colapso de sidebar en escritorio y el contenedor `.content`. |
| 3 | **VISTAS Y COMPONENTES** | 393 – 1099 | Todas las páginas: Inicio (`.ih-*`), Factores (`.fx-*`, `.dd*`), Portada/Metodología (`.pt-*`, `.doc*`), Modales (`.fdlg*`) y Datos (`.dz-*`). |
| 4 | **MEDIA QUERIES PARA ADAPTACIÓN MÓVIL (< 920px)** | 1100 – 1298 | Toda la lógica responsiva: drawer, columnas apiladas, desactivación del modo "llenar pantalla" y `prefers-reduced-motion`. |

**Consecuencia práctica:** una regla base y su adaptación móvil viven en secciones distintas del archivo. Al tocar un componente, revisa siempre ambas.

---

## 3. Catálogo de tokens (`:root`)

Todos los tokens siguientes están declarados en el `:root` (líneas 10–63). Valores literales, verificados.

### 3.1 Paleta institucional — Azules

| Token | Valor | Uso |
|-------|-------|-----|
| `--brand-primary` | `#004A87` | Azul base — estructura, nav, títulos |
| `--brand-primary-dark` | `#003A6B` | Texto sobre fondo claro, bordes; color de `h1..h4` |
| `--brand-deep` | `#00294B` | Hero oscuro, fondos profundos, sidebar |
| `--brand-mid` | `#005CAB` | Hover, series secundarias |
| `--brand-accent` | `#0183EF` | Serie UNIMAGDALENA en Datos, énfasis, links; color del `outline` de foco |

### 3.2 Semántica de datos

Colores con significado en las visualizaciones (no decorativos): comunican tendencia y referencia.

| Token | Valor | Uso |
|-------|-------|-----|
| `--ref` | `#FF9400` | Referencia / punto final de serie |
| `--ref-dark` | `#D17900` | Variante oscura de referencia |
| `--pos` | `#00A50B` | Mejora / tendencia al alza |
| `--pos-soft` | `#e8f6e9` | Fondo suave positivo |
| `--lime` | `#A5CA00` | Verde institucional secundario |
| `--neg` | `#D10500` | Caída / riesgo |
| `--neg-soft` | `#fbeaea` | Fondo suave negativo |

### 3.3 Neutros fríos

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#F7F9FB` | Fondo general azul-gris casi blanco |
| `--surface` | `#FFFFFF` | Superficie de tarjetas |
| `--surface-2` | `#EEF3F8` | Fondos suaves |
| `--border` | `#DCE5EE` | Bordes de tarjetas y separadores |
| `--text` | `#14243A` | Cuerpo (azul muy oscuro, no negro puro) |
| `--text-soft` | `#51637A` | Texto secundario |
| `--text-faint` | `#8295AB` | Captions / texto tenue |

### 3.4 Tipografía

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-display` | `'Outfit', system-ui, sans-serif` | Títulos (`h1..h4`), marca, cifras KPI |
| `--font-body` | `'Inter', system-ui, sans-serif` | Cuerpo de texto (aplicado a `body`) |

> Las familias `Outfit` e `Inter` se cargan desde **Google Fonts** en `index.html` (no vía `@import` en CSS). El fallback `system-ui` cubre el caso de que las fuentes no carguen.

### 3.5 Radio y sombra

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius` | `14px` | Radio de esquina estándar (tarjetas) |
| `--radius-sm` | `9px` | Radio pequeño (controles, chips) |
| `--shadow` | `0 1px 3px rgba(0,41,75,.06), 0 8px 24px rgba(0,41,75,.06)` | Sombra en reposo |
| `--shadow-hover` | `0 4px 12px rgba(0,41,75,.10), 0 16px 40px rgba(0,41,75,.10)` | Sombra al pasar el cursor |

Nota: las sombras usan azul institucional (`rgba(0,41,75,...)`), no negro, para integrarse con la paleta fría.

### 3.6 Layout y dimensiones

| Token | Valor | Uso |
|-------|-------|-----|
| `--sidebar-w` | `248px` | Ancho de la barra lateral en escritorio |
| `--content-max` | `1440px` | Ancho máximo del contenido |
| `--control-h` | `36px` | Altura de controles (botones, campos) |
| `--band-radius` | `18px` | Radio de las bandas/cabeceras de página |
| `--content-pad-y` | `94px` | Padding vertical del contenido |

### 3.7 Escala fluida (regla "sin scroll")

Estas variables usan `clamp()` para que las páginas que llenan la pantalla se ajusten con la altura del viewport (`vh`) sin provocar scroll.

| Token | Valor | Uso |
|-------|-------|-----|
| `--fluid-gap` | `clamp(18px, 2.4vh, 28px)` | Aire entre gráfico y KPIs / tarjetas |
| `--fluid-card-pad` | `clamp(8px, 1.4vh, 18px)` | Padding interior de tarjetas |
| `--fluid-kpi-value` | `clamp(1.35rem, 3.2vh, 2rem)` | Tamaño del número KPI (máx. 32px) |

### 3.8 Safe areas (dispositivos con notch)

Exponen los `env(safe-area-inset-*)` como tokens para reutilizarlos en paddings del header móvil y el drawer.

| Token | Valor | Uso |
|-------|-------|-----|
| `--sat` | `env(safe-area-inset-top, 0px)` | Margen seguro superior |
| `--sab` | `env(safe-area-inset-bottom, 0px)` | Margen seguro inferior |
| `--sal` | `env(safe-area-inset-left, 0px)` | Margen seguro izquierdo |
| `--sar` | `env(safe-area-inset-right, 0px)` | Margen seguro derecho |

---

## 4. Convenciones de nomenclatura de clases

El proyecto usa una convención **BEM-ish con prefijo por componente/vista**. La idea: el prefijo te dice *a qué componente pertenece* la clase con solo leerla, `__` marca un elemento hijo y `--` marca una variante.

### 4.1 Prefijos por componente/vista

| Prefijo | Componente / Vista | Ejemplos reales |
|---------|--------------------|-----------------|
| `sb-*` | Sidebar (escritorio) | `.sb-brand`, `.sb-logo`, `.sb-title`, `.sb-toggle`, `.sb-label`, `.sb-foot`, `.sb-overlay` |
| `mh-*` / `mb-*` | Header móvil (mobile header / bar) | `.mh-brand`, `.mh-logo`, `.mh-title` |
| `nav__*` | Menú de navegación | `.nav__item`, `.nav__ico`, `.nav__txt`, `.nav__cnt` |
| `fx-*` | Página **Factores** | `.fx-band`, `.fx-filters`, `.fx-field`, `.fx-view`, `.fx-chart`, `.fx-legend`, `.fx-kpis`, `.fx-kpi` |
| `dd` / `dd__*` | Dropdown personalizado | `.dd`, `.dd__btn`, `.dd__val`, `.dd__chev`, `.dd__menu`, `.dd__opt` |
| `ih-*` | Página **Inicio** (hero + tiles) | `.ih-hero`, `.ih-pill`, `.ih-title`, `.ih-actions`, `.ih-btn`, `.ih-tiles`, `.ih-tile` |
| `pt-*` | Tarjetas de factor + grilla (Metodología/Portada) | `.pt-grid`, `.pt-card` |
| `fdlg` / `fdlg__*` | Modal de factor (factor dialog) | `.fdlg`, `.fdlg__*` |
| `dz-*` | Página **Datos** (tabla) | `.dz-controls`, `.dz-dd`, `.dz-tbl` |
| `doc*` | Documento de Metodología | `.doc`, `.doc--fill` |
| `page` / `page-fill` | Contenedores de sección | `.page`, `.page.is-active`, `.page-fill` |

### 4.2 Elementos — `__`

Un doble guion bajo enlaza un elemento hijo con su bloque:

- `.nav__item`, `.nav__ico`, `.nav__txt`, `.nav__cnt` (elementos del menú)
- `.dd__btn`, `.dd__menu`, `.dd__opt`, `.dd__chev` (partes del dropdown)
- `.ih-tile__top`, `.ih-tile__ico`, `.ih-tile__label`, `.ih-tile__num`, `.ih-tile__desc` (partes de una tile)
- `.fx-chart__head`, `.fx-chart__title`, `.fx-kpi__val`, `.fx-kpi__delta`

### 4.3 Modificadores — `--`

Un doble guion marca una variante de la misma base:

- `.ih-btn--primary`, `.ih-btn--ghost` (variantes del botón del hero)
- `.fx-field--grow` (campo que se expande)
- `.dd--grow` (dropdown que se expande)
- `.fx-kpi--final` (KPI destacado)
- `.doc--fill`, `.pt-grid--flow` (variantes de layout)

### 4.4 Estados — `is-*`

Los estados dinámicos (los alterna el JavaScript en `assets/js/app.js`) usan el prefijo `is-`:

- `.page.is-active`, `.nav__item.is-active`
- `.sidebar.is-open`, `.sb-overlay.is-active`
- `.dd__opt.is-sel`, `.dd__opt.is-active`
- `.dd__btn[aria-expanded="true"]` (estado expresado también vía atributo ARIA)

---

## 5. Media queries (breakpoints)

La estrategia es **desktop-first**: las reglas base son escritorio y la adaptación desciende hacia móvil. El breakpoint principal es **920px** (expresado como `max-width: 919px`).

| Query | Qué ajusta |
|-------|------------|
| `@media (max-width: 919px)` | **Breakpoint principal.** Activa el header móvil (`.mobile-header`) y el overlay; convierte la sidebar en **drawer** deslizante (`position: fixed`, `translateX(-100%)`, se abre con `.is-open`); oculta el toggle de escritorio; el `.content` pasa a ancho completo; apila filtros, vistas y controles en columna; y **desactiva el modo "llenar pantalla"** (`.page-fill.is-active` vuelve a scroll normal, el gráfico toma `height: 300px` fijo). |
| `@media (min-width: 480px) and (max-width: 919px)` | Refinamiento tablet pequeño: acciones del hero en fila; `.pt-grid` a 2 columnas. |
| `@media (min-width: 576px) and (max-width: 919px)` | Refinamiento tablet: `.ih-tiles` a 3 columnas; `.fx-kpis` en fila; grilla de metodología a 3 columnas. |
| `@media (prefers-reduced-motion: reduce)` | Accesibilidad: desactiva `scroll-behavior` suave y reduce todas las transiciones/animaciones a `0.01ms`. |

> El detalle completo del comportamiento responsivo (drawer, orden de apilado, la regla "sin scroll") está en [RESPONSIVE.md](./RESPONSIVE.md).

---

## 6. Cómo extender el sistema

### 6.1 Agregar un token nuevo

1. Ve a la **Sección 1** (`:root`, líneas 10–63).
2. Colócalo en el **grupo correcto** (color, tipografía, radio/sombra, layout, fluidos). Respeta el orden existente.
3. Añade un comentario `/* ... */` que explique su propósito, como el resto.
4. Consúmelo siempre con `var(--tu-token)`.

```css
:root {
  /* --- Radio y sombra --- */
  --radius: 14px;
  --radius-sm: 9px;
  --radius-lg: 22px;   /* NUEVO: tarjetas destacadas / modales grandes */
}
```

### 6.2 Agregar un color

Un color de marca va con los **azules institucionales**; un color con significado va con la **semántica de datos**. No introduzcas literales sueltos en los componentes.

```css
:root {
  /* --- Semántica de datos --- */
  --neg: #D10500;
  --neg-soft: #fbeaea;
  --warn: #E8B500;        /* NUEVO: alerta / dato bajo umbral */
  --warn-soft: #fdf6e0;   /* NUEVO: fondo suave de alerta */
}
```

Luego, en el componente:

```css
.fx-kpi--warn { color: var(--warn); background: var(--warn-soft); }
```

### 6.3 Agregar un componente nuevo

1. **Elige un prefijo corto y único** que aún no exista (por ejemplo `tl-` para un "timeline"). Evita colisiones con los prefijos de la tabla §4.1.
2. **Ubícalo en la Sección 3 (VISTAS Y COMPONENTES)**, agrupado con su página; si es un componente transversal (como el dropdown), ponlo junto a componentes similares.
3. **Nombra con la convención:** bloque `.tl-*`, hijos con `__`, variantes con `--`, estados con `is-`.
4. **Usa solo tokens** para color, radio, sombra y medidas.
5. **Si necesita adaptación móvil**, añade sus reglas responsivas en la **Sección 4**, dentro de `@media (max-width: 919px)` — nunca junto a la regla base.

```css
/* Sección 3 — regla base (escritorio) */
.tl-track {
  display: flex;
  gap: var(--fluid-gap);
  padding: var(--fluid-card-pad);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.tl-item { color: var(--text-soft); }
.tl-item.is-active { color: var(--brand-accent); }
.tl-item--last { color: var(--ref); }   /* punto final de serie */

/* Sección 4 — adaptación móvil */
@media (max-width: 919px) {
  .tl-track { flex-direction: column; }
}
```

---

## 7. Buenas prácticas

- **Usa variables, no hardcodees.** Antes de escribir un color, medida, radio o sombra, busca si ya existe un token. Si el valor se va a repetir o representa identidad de marca, créalo como token en `:root`.
- **Respeta los prefijos.** Toda clase nueva pertenece a un componente; el prefijo lo debe delatar. No inventes nombres genéricos (`.box`, `.item`, `.blue`) que colisionen entre vistas.
- **`__` para hijos, `--` para variantes, `is-` para estados.** Mantén la gramática consistente para que el CSS sea legible sin abrir el HTML.
- **Escritorio es la base; móvil vive en la media query.** No escribas estilos móviles fuera de `@media (max-width: 919px)`. La experiencia de escritorio debe permanecer idéntica.
- **Coloca cada regla en su sección.** Tokens en la 1, layout en la 2, componentes en la 3, responsivo en la 4. El archivo solo se mantiene navegable si se respeta el mapa.
- **Sin literales de color en componentes.** Un `#0183EF` suelto en un `.fx-*` es deuda técnica: debería ser `var(--brand-accent)`.
- **Comenta el propósito, no la sintaxis.** Igual que el `:root` existente, cada token nuevo debería decir *para qué sirve*, no *qué es*.

---

*Fuente única de verdad: `assets/css/tokens.css`. Este documento describe el estado del archivo; si el CSS y el documento discrepan, gana el CSS — y este documento debe actualizarse.*
