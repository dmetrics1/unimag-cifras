# Guía del desarrollador — Unimagdalena en Cifras

Esta guía es para el desarrollador que **clona el repositorio por primera vez** y
debe mantenerlo sin ayuda del autor. Explica cómo arrancar el proyecto en local,
cómo se actualizan los datos, cómo se agregan indicadores/factores/años, dónde se
tocan los gráficos y los estilos, cómo se publica y qué convenciones seguir.

> **Qué es el proyecto.** Un tablero institucional 100 % **estático**
> (HTML + CSS + JavaScript *vanilla*, sin dependencias ni framework) que muestra
> los indicadores de la Universidad del Magdalena organizados por **factor de
> acreditación**, con su evolución **2020–2025**. La jerarquía es
> **Factor → Indicador**: cada factor agrupa varios indicadores y cada indicador
> tiene su propia serie temporal y su gráfico.

Documentos relacionados (rutas relativas a esta guía, dentro de `docs/`):

- [`ARQUITECTURA.md`](ARQUITECTURA.md) — estructura multipágina y decisiones de layout.
- [`RESPONSIVE.md`](RESPONSIVE.md) — comportamiento móvil y *breakpoints*.
- [`ESTILOS.md`](ESTILOS.md) — sistema de diseño y tokens CSS.
- [`JAVASCRIPT.md`](JAVASCRIPT.md) — lógica de `app.js`.
- [`COMPONENTES.md`](COMPONENTES.md) — patrón de componentes.
- [`PUBLICAR.md`](PUBLICAR.md) — publicación en GitHub Pages, paso a paso.
- [`adr/README.md`](adr/README.md) — registro de decisiones de arquitectura.
- [`../CHANGELOG.md`](../CHANGELOG.md) — historial de cambios.

---

## 1. Requisitos previos

| Herramienta | Para qué | Notas |
|---|---|---|
| **Python 3** | Levantar el servidor local y regenerar el JSON de datos | `python -m http.server` viene incluido; el pipeline de datos usa `openpyxl` (ver §5). |
| **Un navegador moderno** | Ver el tablero | Chrome, Edge, Firefox o Safari recientes. |
| **Git** | Versionar y publicar | Solo necesario para publicar en GitHub Pages (ver §13). |

No hay `npm install`, ni *build*, ni transpilación: el sitio se sirve tal cual.
La única dependencia de terceros es `openpyxl`, y **solo** se usa fuera del
navegador, cuando regeneras el JSON desde el Excel.

---

## 2. Cómo iniciar el proyecto en local

El tablero carga sus datos con `fetch('data/datos_indicadores.json')`. Por
seguridad, los navegadores **bloquean `fetch` sobre `file://`**, así que
**abrir `index.html` con doble clic no funciona**: verás el tablero vacío con el
mensaje "No se pudo cargar data/datos_indicadores.json". Hay que servirlo desde
un **servidor HTTP local**.

**Opción A — atajos incluidos (abren el navegador solos):**

- **Windows:** doble clic en `abrir_local.bat`
- **Mac / Linux:**
  ```bash
  ./abrir_local.sh
  ```

**Opción B — manual (cualquier sistema con Python), desde la raíz del repo:**

```bash
python -m http.server 8000
```

Luego abre <http://localhost:8000>.

> **Nota de caché.** El navegador cachea CSS y JS de forma agresiva. Si editaste
> `assets/css/tokens.css` o `assets/js/app.js` y no ves el cambio, recarga
> forzando la caché con **Ctrl+F5** (o Cmd+Shift+R en Mac). El `fetch` del JSON
> ya usa `{cache:'no-cache'}`, así que los datos sí se recargan solos.

---

## 3. Estructura mínima que debes conocer

```
unimagdalena_cifras_informe/
├── index.html                      # Cascarón: sidebar + 4 <section class="page"> vacías
├── assets/
│   ├── css/tokens.css              # Tokens (:root) + todos los estilos + media query móvil
│   ├── js/app.js                   # TODA la lógica: rutas, render, gráficos, modales
│   └── img/escudo-unimagdalena.png
├── data/
│   ├── datos_indicadores.json      # Datos que consume el tablero (GENERADO, versionado)
│   ├── factores_detalle.json       # Fichas CNA por factor (opcional, para el modal)
│   ├── tipos_grafico.json          # Respaldo de chart/dual por indicador (ver §5)
│   └── Matriz_indicadores_por_factor.xlsx   # Fuente de trabajo (LOCAL, NO versionada)
├── scripts/
│   └── generar_json.py             # Regenera datos_indicadores.json desde el Excel
├── docs/                           # Esta guía y el resto de la documentación
├── .github/workflows/deploy-pages.yml   # Despliegue automático a GitHub Pages
├── requirements.txt                # openpyxl>=3.1
├── abrir_local.bat / abrir_local.sh
└── .nojekyll                       # Evita el procesamiento con Jekyll en Pages
```

Las cuatro páginas (Inicio, Factores, Datos, Metodología) viven en `index.html`
como `<section class="page">` **vacías**; `app.js` las rellena en tiempo de
ejecución. Para el detalle de esta arquitectura multipágina, lee
[`ARQUITECTURA.md`](ARQUITECTURA.md).

**Regla de oro del flujo de datos** (diseño desacoplado):

```
Excel  →  scripts/generar_json.py  →  data/datos_indicadores.json  →  index.html
```

Nunca escribas datos a mano en el HTML ni en el CSS: los datos entran por el JSON.

---

## 4. Cómo actualizar los datos

Para cambiar valores de indicadores existentes (corregir una cifra, cargar el
dato de un año), el flujo es:

```
1. Edita  data/Matriz_indicadores_por_factor.xlsx
   (hoja "Matriz Indicadores")
                 │
                 ▼
2. pip install -r requirements.txt      (solo la primera vez)
   python scripts/generar_json.py       ──►  regenera data/datos_indicadores.json
                 │
                 ▼
3. Recarga el navegador con Ctrl+F5
```

La hoja **`Matriz Indicadores`** tiene exactamente estas columnas:

| N° Factor | Factor | Indicadores | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|---|

Reglas de limpieza que aplica `generar_json.py` al leer cada celda de año
(función `limpiar`):

- Número (int/float) → se conserva, redondeado a 6 decimales.
- Texto (`No Aplica`, `ND`, `No Disponible`, …), celda vacía o `NaN` → **`null`**.
  En el gráfico la serie **salta** ese año (no se dibuja punto ni barra).

No hace falta tocar HTML ni CSS: el tablero toma años, factores e indicadores
directamente del JSON, y ajusta ejes y tablas solo.

---

## 5. Cómo regenerar el JSON (y la advertencia crítica de `chart`/`dual`)

Comandos exactos, desde la raíz del repositorio:

```bash
pip install -r requirements.txt      # instala openpyxl (solo la primera vez)
python scripts/generar_json.py
```

Salida esperada en consola:

```
OK -> .../data/datos_indicadores.json
Factores: 12 | Indicadores: N
```

El script:
- Lee `data/Matriz_indicadores_por_factor.xlsx`, hoja `Matriz Indicadores`.
- Recorre los años de la lista `ANIOS = [2020, 2021, 2022, 2023, 2024, 2025]`.
- Marca un indicador como **porcentaje** (`"pct": true`, se muestra con `%`) si
  su nombre contiene alguna palabra clave de `CLAVES_PCT`:
  `porcentaje, tasa, nivel de satisfacción, aporte relativo, participación,
  absorción, selectividad, empleabilidad, deserción, graduación`.
- Escribe `data/datos_indicadores.json` **minificado** (`indent=None`).

Esquema de salida:

```json
{
  "years": [2020, 2021, 2022, 2023, 2024, 2025],
  "factors": [
    {
      "n": 1,
      "factor": "Identidad institucional",
      "indicators": [
        { "name": "Nivel de satisfacción…", "values": [0.83, 0.91, …], "pct": true }
      ]
    }
  ]
}
```

> ### ⚠️ ADVERTENCIA CRÍTICA — se pierden `chart` y `dual` al regenerar
>
> `generar_json.py` **NO** produce los campos `chart` (tipo de gráfico:
> `"barras"` o `"linea"`) ni `dual` (comparación con nivel nacional). Solo emite
> `name`, `values` y `pct`.
>
> Esos dos campos están puestos **a mano** en `data/datos_indicadores.json` y
> respaldados en [`data/tipos_grafico.json`](../data/tipos_grafico.json). Cada
> vez que corras el script, el JSON se **sobrescribe entero** y esas
> personalizaciones **desaparecen**.
>
> **Cómo reponerlas después de regenerar:** consulta `data/tipos_grafico.json`
> (tiene, por indicador, su `factor`, `name`, `chart` y `dual`) y vuelve a
> aplicar `chart` (y `dual` cuando corresponda) sobre las entradas
> correspondientes de `datos_indicadores.json`.
>
> Como red de seguridad, **haz una copia** del JSON antes de regenerar
> (p. ej. `datos_indicadores.json.bak`) para poder comparar y recuperar los
> campos. Ten en cuenta que `.gitignore` ignora `*.bak`.
>
> **Mejora futura sugerida:** integrar `chart`/`dual` al pipeline —por ejemplo,
> que `generar_json.py` lea `tipos_grafico.json` y los fusione automáticamente al
> escribir el JSON— para que dejen de perderse en cada regeneración.

### Indicadores comparados con el nivel Nacional

Los indicadores que se comparan contra la referencia nacional se representan en
la matriz como **una fila extra** con el sufijo `" (Nacional)"` en el nombre.
Ejemplo:

```
Tasa de deserción            | … valores institucionales …
Tasa de deserción (Nacional) | … valores de referencia nacional …
```

En tiempo de ejecución, `mergeNacional()` (en `app.js`) recorre cada factor,
detecta las filas que terminan en `(Nacional)`, y las **fusiona** dentro del
indicador base: copia sus valores a `values_ref`, y fija `dual = true` y
`chart = 'linea'` en el indicador base. La fila `(Nacional)` desaparece de la
lista visible; el gráfico dibuja la serie nacional como línea punteada gris
(`--- Nacional`) junto a la serie azul de Unimagdalena, con su leyenda.

---

## 6. Cómo agregar un NUEVO indicador

1. **Excel:** en la hoja `Matriz Indicadores`, agrega una fila con el
   `N° Factor` correspondiente, el nombre del factor, el nombre del indicador y
   sus valores por año (deja en blanco o pon `ND` los años sin dato).
2. **Regenera** el JSON (§5).
3. **Asigna el tipo de gráfico:** en `data/datos_indicadores.json`, añade a la
   entrada del nuevo indicador `"chart": "barras"` o `"chart": "linea"`
   (si lo omites, el tablero usa **línea** por defecto). Registra también su
   tipo en `data/tipos_grafico.json` para no perderlo en la próxima
   regeneración.
4. **Si es comparado con nivel nacional:** en vez de tocar `dual` a mano, agrega
   además la fila `"<mismo nombre> (Nacional)"` en el Excel; `mergeNacional()`
   se encarga del resto (ver §5).
5. **Verifica el formato porcentaje.** Si el indicador es una tasa/porcentaje
   pero su nombre no contiene ninguna palabra de `CLAVES_PCT`, no se mostrará con
   `%`. Solución: renombrarlo para que incluya una palabra clave, o añadir una
   nueva palabra a `CLAVES_PCT` en `scripts/generar_json.py` (ver §14).

---

## 7. Cómo agregar un NUEVO factor

Un factor nuevo toca **dos lugares**: los datos (Excel) y la definición visual
(`app.js`). Opcionalmente, la ficha CNA.

1. **Excel:** agrega las filas del nuevo factor con su `N° Factor` (p. ej. `13`)
   y sus indicadores. Regenera el JSON (§5).
2. **`FACTORES_INFO` en `app.js`:** agrega una entrada al array. Define su
   **nombre corto**, su **color distintivo** y su **ícono** (una clave del objeto
   `ICO`). Ejemplo de entrada:

   ```js
   {n:13, ico:'nuevoIcono', color:'#1596A6', short:'Nombre corto del factor',
    desc:'Descripción breve del alcance del factor, usada como texto de respaldo '+
         'en el modal de metodología cuando no hay ficha detallada.'},
   ```

3. **Ícono en `ICO`:** si usas una clave nueva (`nuevoIcono`), agrégala al objeto
   `ICO`. El valor es el **contenido interno** de un `<svg viewBox="0 0 24 24">`
   (solo los `<path>`/`<circle>`, sin la etiqueta `<svg>`, que la pone
   `svgIco()`). Ejemplo:

   ```js
   nuevoIcono:'<path d="M4 4h16v16H4z"/><path d="M8 12h8"/>',
   ```

4. **Ficha CNA (opcional):** si quieres que el modal de la página *Metodología*
   muestre la definición y las "características de alta calidad" del factor,
   agrega su objeto (`n`, `nombre`, `definicion`, `caracteristicas[]`) a
   `data/factores_detalle.json`. Es opcional: sin ficha, el modal usa el `desc`
   de `FACTORES_INFO`.

> **Cuidado con el orden.** El código empareja `FACTORES_INFO[i]` con
> `DB.factors[i]` **por posición de índice**, no por `n`. Mantén ambos en el
> mismo orden (factor 1 primero, factor 2 segundo, …) para que íconos, colores y
> datos coincidan.

---

## 8. Cómo agregar un nuevo AÑO (ej. 2026)

1. **Excel:** agrega la columna `2026` a la hoja `Matriz Indicadores`, después de
   `2025`.
2. **`scripts/generar_json.py`:** añade `2026` a la lista `ANIOS`:

   ```python
   ANIOS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]
   ```

3. **Regenera** el JSON (§5) y recarga.

El tablero lee los años desde `DB.years` (el array `years` del JSON), así que los
ejes X de los gráficos, las columnas de la tabla de *Datos* y los textos de
periodo ("2020–2026") se ajustan **automáticamente**. No toques HTML ni CSS.

---

## 9. Cómo modificar un gráfico

Toda la lógica de dibujo está en `assets/js/app.js`, con SVG generado a mano
(sin librerías):

| Elemento | Función | Notas |
|---|---|---|
| Gráfico de **línea** (grande, página Factores) | `buildLineSVG(ind, years, w, h)` | Incluye área, puntos con etiqueta, punto final dorado y serie nacional punteada si `ind.dual`. |
| Gráfico de **barras** (grande, página Factores) | `buildBarSVG(ind, years, w, h)` | La barra del último año se pinta en azul oscuro. |
| Ejes + grilla horizontal compartidos | `chartFrame(w, h, mn, mx, pct, pad)` | Reutilizado por línea y barras. |
| Montaje + redibujo responsivo | `mountChart(host, ind, years)` | Usa un `ResizeObserver` para redibujar al cambiar el tamaño. |
| Mini-gráfico de tarjeta | `sparkline(vals)` | |

**Cambiar el tipo de un gráfico** (línea ↔ barras): **no** se toca el código, se
cambia el campo `"chart"` del indicador en `data/datos_indicadores.json`
(`"barras"` o `"linea"`) y se replica en `tipos_grafico.json`. El selector está
en `mountChart`:

```js
const tipo = ind.chart==='barras' ? 'barras' : 'linea';   // línea por defecto
```

**Cambiar los colores de las series:** edita las constantes al inicio de
`app.js`:

```js
const ACCENT   = '#0183EF';   // serie Unimagdalena (línea/barras/área)
const GOLD     = '#FF9400';   // punto final / referencia
const NACIONAL = '#8295AB';   // serie de referencia "Nacional" (punteada)
```

---

## 10. Cómo cambiar estilos y colores

Todo el diseño vive en `assets/css/tokens.css`. Los **tokens** están declarados
como variables CSS en el bloque `:root` (arranca en la línea 10). Cambia el token
y el cambio se propaga a todo el sitio. Los principales:

```css
--brand-primary: #004A87;   /* estructura, nav, títulos */
--brand-deep:    #00294B;   /* fondos profundos, sidebar */
--brand-accent:  #0183EF;   /* serie de datos, énfasis, links */
--ref:           #FF9400;   /* referencia / punto final de serie */
--pos:           #00A50B;   /* tendencia al alza */
--neg:           #D10500;   /* tendencia a la baja */
--font-display:  'Outfit', …;   --font-body: 'Inter', …;
--sidebar-w:     248px;     /* ancho del sidebar */
```

> **Importante — hay colores en DOS sitios.** Los colores de la **interfaz** son
> tokens CSS en `tokens.css`. Los colores **dentro de los SVG de los gráficos**
> se generan en JS y NO leen esos tokens: están *hardcodeados* como constantes
> (`ACCENT`, `GOLD`, `NACIONAL` en `app.js`) y como literales en las funciones
> `buildLineSVG`/`buildBarSVG`/`chartFrame` (p. ej. `#DCE5EE` para la grilla,
> `#004A87` para la última barra). Si cambias la paleta, revisa **ambos** lugares
> para que no queden desalineados. Detalle completo en [`ESTILOS.md`](ESTILOS.md).

---

## 11. Cómo mantener el responsive

- **Regla base = escritorio.** Todo lo que está fuera de una *media query* define
  la vista de escritorio.
- **Adaptación móvil = `@media (max-width: 919px)`** en `tokens.css` (arranca en
  la línea 1103). Ahí se activa el header móvil, el sidebar se convierte en
  *drawer* deslizante, las vistas pasan de "llenar pantalla" a scroll normal, y
  los gráficos toman alto fijo. Hay dos *breakpoints* intermedios adicionales
  (`min-width:480px` y `min-width:576px`, ambos hasta 919px) para columnas.
- Los gráficos son responsivos por sí mismos vía `ResizeObserver` (`mountChart`),
  y las funciones de dibujo reducen tipografías y paddings cuando `w < 420`.

Detalle de *breakpoints* y comportamiento móvil en [`RESPONSIVE.md`](RESPONSIVE.md).

---

## 12. Cómo crear nuevos componentes siguiendo la arquitectura

El proyecto no usa framework. El patrón es siempre el mismo:

1. **Una función `renderX()`** que construye el HTML con *template strings* y lo
   inyecta en un contenedor con `innerHTML`. Ejemplos existentes: `renderInicio`,
   `renderFactores` / `renderContent`, `renderDatos`, `renderMetodologia`.
2. **Estilos con prefijo propio** en `tokens.css`. Cada bloque de componente usa
   un prefijo corto y consistente (`ih-` inicio/hero, `fx-` factores, `dz-`
   datos, `pt-` metodología, `fdlg-` modal de factor, `dd-` dropdown). Sigue la
   convención BEM ligera: `bloque__elemento` y `bloque--modificador`.
3. **Cableado de eventos en `wireEvents()`** (eventos globales que se registran
   una vez al arrancar) o al final de la propia `renderX()` cuando los nodos se
   crean dinámicamente (p. ej. los `onclick` de las tarjetas en `renderDatos`).

Además existe un helper reutilizable, `makeDropdown(root, labelId, onSelect)`,
que crea un *dropdown* accesible (teclado, `aria-*`, cierre al hacer clic fuera);
úsalo en vez de reimplementar menús. Más patrones y ejemplos en
[`COMPONENTES.md`](COMPONENTES.md).

---

## 13. Cómo publicar

El sitio se publica en **GitHub Pages** mediante el workflow
`.github/workflows/deploy-pages.yml` (GitHub Actions). Cada **push a la rama
`main`** dispara un despliegue automático que sube la raíz del repo como sitio
estático.

Flujo típico de actualización:

```bash
git add -A
git commit -m "Descripción del cambio"
git push          # dispara el workflow; Pages se republica en ~1–2 min
```

URL publicada: <https://dmetrics1.github.io/unimag-cifras/>

Todas las rutas del sitio son **relativas** (`assets/…`, `data/…`) para que
funcione bajo el subpath de Pages, y `.nojekyll` evita el procesamiento con
Jekyll. Puedes seguir el avance en la pestaña **Actions** del repositorio. Los
pasos completos (crear el repo, conectar el remoto, activar Pages) están en
[`PUBLICAR.md`](PUBLICAR.md).

> Recuerda: `data/datos_indicadores.json` **sí** se versiona (el sitio lo carga
> con `fetch`). El `Matriz_indicadores_por_factor.xlsx` **no** se sube: está en
> `.gitignore` y se mantiene local.

---

## 14. Convenciones del proyecto

**Nomenclatura CSS (BEM ligera + prefijos por componente).**
- Bloque con prefijo corto: `.fx-chart`, `.ih-tile`, `.dz-tbl`, `.pt-card`.
- Elemento: doble guion bajo → `.fx-chart__title`, `.ih-tile__num`.
- Modificador: doble guion → `.fx-kpi--final`, `.btn-dl--primary`.
- Estados: clases `is-*` (`.is-active`, `.is-open`, `.is-collapsed`, `is-sel`).

**JavaScript.**
- Un único archivo `app.js`, funciones **globales** (sin módulos ES ni *bundler*).
- Estado global mínimo y explícito: `DB` (datos), `YEARS`, `curFactor`, `curInd`,
  `curPage`. Accesores `currentFactor()` / `currentInd()`.
- Enrutado por hash (`#/inicio`, `#/factores`, `#/datos`, `#/metodologia`) en
  `showPage` / `router`; el arranque es `init()` sobre `DOMContentLoaded`.
- Escapa siempre el texto que provenga de datos con `escHtml()` antes de meterlo
  en `innerHTML`.
- Formatea números con `fmt(v, pct)` (respeta locale `es-CO` y el flag `pct`).

**HTML.** `index.html` es un cascarón: sidebar + header móvil + cuatro
`<section class="page">` vacías que JS rellena. No metas contenido de datos en el
HTML.

**Organización de carpetas.** Código en `assets/`, datos en `data/`, utilidades
en `scripts/`, documentación en `docs/`. La lógica no conoce rutas absolutas.

**Buenas prácticas que sostienen el proyecto:**
- **Cero dependencias** en el navegador (sin `npm`, sin CDN de librerías JS). Las
  únicas peticiones externas son las tipografías de Google Fonts.
- **Rutas siempre relativas**, para que funcione bajo el subpath de Pages.
- **Datos desacoplados del diseño**: los datos entran por el JSON; HTML y CSS no
  los conocen.
- Para porcentajes, mantén sincronizada la lista `CLAVES_PCT` con los nombres
  reales de los indicadores.

---

## 15. Guía de mantenimiento (checklist)

**Al actualizar valores de indicadores existentes**
- [ ] Editar el Excel (hoja `Matriz Indicadores`).
- [ ] `python scripts/generar_json.py`.
- [ ] **Reponer `chart`/`dual`** desde `tipos_grafico.json` (§5).
- [ ] Recargar con **Ctrl+F5** y revisar el gráfico y la tabla de *Datos*.

**Al agregar un indicador**
- [ ] Fila nueva en Excel → regenerar.
- [ ] Asignar `chart` en el JSON y registrarlo en `tipos_grafico.json`.
- [ ] Si es comparado, añadir la fila `… (Nacional)` en el Excel.
- [ ] Verificar el formato `%` (nombre vs. `CLAVES_PCT`).

**Al agregar un factor**
- [ ] Filas en Excel → regenerar.
- [ ] Entrada en `FACTORES_INFO` (nombre corto, color, ícono) **en el orden
      correcto**.
- [ ] Ícono nuevo en `ICO` si aplica.
- [ ] Ficha en `factores_detalle.json` (opcional).

**Al agregar un año**
- [ ] Columna en el Excel + año en `ANIOS` (`generar_json.py`) → regenerar.

**Al tocar gráficos**
- [ ] Cambio de tipo = campo `chart` (JSON), no código.
- [ ] Cambio de color de serie = `ACCENT`/`GOLD`/`NACIONAL` en `app.js`.
- [ ] Probar en ancho angosto (`w < 420`) que las etiquetas no se solapen.

**Al tocar la tabla de *Datos***
- [ ] Verificar que la exportación CSV (`downloadCSV`) siga cuadrando con las
      columnas y años.

**Al tocar estilos/colores**
- [ ] Cambiar el token en `:root` (`tokens.css`).
- [ ] Revisar si el color también está *hardcodeado* en los SVG de `app.js`.

**Al tocar el responsive**
- [ ] Probar bajo 920px (drawer, header móvil, gráficos de alto fijo).
- [ ] Revisar los *breakpoints* de 480px y 576px.

**Documentación**
- [ ] Actualizar el documento relevante (`ARQUITECTURA.md`, `ESTILOS.md`,
      `RESPONSIVE.md`, esta guía) y registrar el cambio en `../CHANGELOG.md`.

---

*Fuente de los datos: Matriz de indicadores por factor 2020–2025 · Oficina de
Planeación, Universidad del Magdalena.*
