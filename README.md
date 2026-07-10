# Unimagdalena en Cifras — Indicadores por Factor

Tablero institucional interactivo (HTML/JS) de los indicadores de la
Universidad del Magdalena, organizados por **factor de acreditación** y con su
evolución **2020–2025**.

La jerarquía es **Factor → Indicador**: cada factor agrupa varios indicadores y
cada indicador tiene su propia serie temporal y su gráfico.

Identidad visual (paleta de azules institucionales, tipografías Outfit + Inter,
escudo) alineada con el informe Saber Pro de la Universidad.

---

## Estructura

```
unimagdalena_cifras/
├── index.html                     # Tablero (enlaza CSS y JS externos)
├── assets/
│   ├── css/tokens.css             # Identidad visual (colores, tipografía, layout)
│   ├── js/app.js                  # Lógica: navegación, tarjetas, gráficos, modal
│   └── img/escudo-unimagdalena.png
├── data/
│   ├── datos_indicadores.json     # Datos que consume el tablero (generado)
│   └── Matriz_indicadores_por_factor.xlsx   # Fuente original
├── scripts/
│   └── generar_json.py            # Regenera el JSON desde el Excel
├── docs/
│   └── guia.md                    # Guía de uso y personalización
├── requirements.txt
├── abrir_local.bat                # Servidor local en Windows
├── abrir_local.sh                 # Servidor local en Mac/Linux
└── .gitignore
```

Este flujo separa los datos del diseño, igual que el informe Saber Pro:

```
Excel  ->  scripts/generar_json.py  ->  data/datos_indicadores.json  ->  index.html
```

---

## Cómo verlo

El tablero carga el JSON con `fetch`, así que **debe abrirse desde un servidor
local** (no con doble clic sobre el archivo, o el navegador bloqueará la carga).

**Windows:** doble clic en `abrir_local.bat`

**Mac / Linux:**
```bash
./abrir_local.sh
```

**Manual (cualquier sistema con Python):**
```bash
python -m http.server 8000
```
Luego abre: <http://localhost:8000>

---

## Actualizar los datos

1. Edita `data/Matriz_indicadores_por_factor.xlsx` (agrega filas/años en la hoja
   `Matriz Indicadores`).
2. Regenera el JSON:
   ```bash
   pip install -r requirements.txt
   python scripts/generar_json.py
   ```
3. Recarga el tablero. No hay que tocar el HTML ni el CSS.

---

## Notas de datos

- Valores de texto como `No Aplica`, `ND`, `No Disponible` se tratan como
  huecos: la serie salta ese año en el gráfico.
- Los indicadores tipo porcentaje/tasa se detectan por su nombre y se muestran
  con `%`. Si algún indicador nuevo debe formatearse como porcentaje, añade una
  palabra clave en la lista `CLAVES_PCT` de `scripts/generar_json.py`.

## Archivos fuente (no versionados)

El sitio solo necesita `data/datos_indicadores.json` (lo carga con `fetch`). La
fuente de trabajo —`data/Matriz_indicadores_por_factor.xlsx`— **se mantiene
local y no se versiona** (está en `.gitignore`). Quien quiera regenerar el JSON
debe colocar su propio Excel en `data/` y ejecutar `python scripts/generar_json.py`.

## Publicación (GitHub Pages)

El tablero funciona como sitio estático servido desde la raíz del repositorio.
Todas las rutas son relativas (`assets/…`, `data/…`) para que funcione bajo el
subpath de Pages (`usuario.github.io/NOMBRE-REPO/`). El archivo `.nojekyll` en la
raíz evita el procesamiento con Jekyll. Los pasos exactos están en
[`docs/PUBLICAR.md`](docs/PUBLICAR.md).

## Fuente

Matriz de indicadores por factor 2020–2025 · Oficina de Planeación,
Universidad del Magdalena.
