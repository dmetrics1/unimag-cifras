# Unimagdalena en Cifras — Indicadores por Factor

Tablero web interactivo de los **indicadores institucionales** de la Universidad
del Magdalena, organizados por los **12 factores de acreditación** (Acuerdo CESU
01 de 2025) y con su evolución **2020–2025**.

🔗 **En vivo:** <https://dmetrics1.github.io/unimag-cifras/>

La jerarquía es **Factor → Indicador**: cada factor agrupa varios indicadores y
cada indicador tiene su propia serie temporal y su gráfico (línea o barras, con
comparación frente al nivel nacional cuando aplica).

| | |
|---|---|
| **Factores** | 12 (modelo de acreditación en alta calidad) |
| **Indicadores** | 87 mostrados (5 con comparación nacional) · 92 filas en el JSON |
| **Periodo** | 2020–2025 (6 años) |
| **Stack** | HTML5 + CSS3 + JavaScript **vanilla** · SVG · sin build · sin dependencias en runtime |
| **Datos** | Excel → Python (`generar_json.py`) → JSON → `fetch` en el navegador |
| **Hosting** | GitHub Pages (despliegue automático con GitHub Actions) |

---

## Secciones del tablero

- **Inicio** — portada con la presentación y las cifras generales.
- **Factores** — vista principal: eliges factor + indicador y ves su gráfico y KPIs.
- **Datos** — tabla completa con buscador, filtro por factor y descarga (JSON / CSV).
- **Metodología** — los 12 factores; al hacer clic se abre la ficha oficial (CNA).

---

## Cómo verlo en local

El tablero carga el JSON con `fetch`, así que **debe abrirse desde un servidor
local** (no con doble clic sobre el archivo, o el navegador bloqueará la carga).

**Windows:** doble clic en `abrir_local.bat`
**Mac / Linux:** `./abrir_local.sh`
**Manual (cualquier sistema con Python):**

```bash
python -m http.server 8000
```

Luego abre <http://localhost:8000> (si no ves cambios, recarga con **Ctrl+F5** por
la caché).

---

## Estructura del proyecto

```
unimagdalena_cifras_informe/
├── index.html                       # Estructura del tablero (header móvil, sidebar, 4 páginas)
├── assets/
│   ├── css/tokens.css               # Sistema de diseño: tokens, layout, componentes, responsive
│   ├── js/app.js                    # Toda la lógica: router, render, motor SVG, dropdowns, modal, drawer
│   └── img/escudo-unimagdalena.png  # Identidad visual institucional
├── data/
│   ├── datos_indicadores.json       # Datos que consume el tablero (generado desde el Excel)
│   ├── factores_detalle.json        # Definiciones y características del CNA por factor
│   ├── tipos_grafico.json           # Tipo de gráfico (barras/línea/dual) por indicador
│   └── Matriz_indicadores_por_factor.xlsx  # Fuente de trabajo (LOCAL, no versionada)
├── scripts/
│   └── generar_json.py              # Regenera datos_indicadores.json desde el Excel (openpyxl)
├── docs/                            # Documentación técnica (ver índice abajo)
├── .github/workflows/deploy-pages.yml  # Despliegue automático a GitHub Pages
├── CHANGELOG.md                     # Registro de cambios
├── requirements.txt                 # Dependencias del script Python (openpyxl)
├── abrir_local.bat / abrir_local.sh # Lanzadores del servidor local
├── .nojekyll                        # Evita el procesamiento Jekyll en Pages
└── .gitignore
```

Flujo de datos (datos desacoplados del diseño):

```
Excel  →  scripts/generar_json.py  →  data/datos_indicadores.json  →  fetch()  →  render (SVG)  →  usuario
```

---

## 📚 Documentación

Toda la documentación técnica vive en [`docs/`](docs/). Empieza por la que
corresponda a lo que necesitas:

| Documento | Para qué |
|---|---|
| [docs/GUIA_DESARROLLADOR.md](docs/GUIA_DESARROLLADOR.md) | **Empieza aquí.** Cómo iniciar, actualizar datos, agregar indicadores/factores, publicar y mantener. |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Arquitectura, flujo de datos, ciclo de vida, navegación y motor de gráficos (con diagramas). |
| [docs/RESPONSIVE.md](docs/RESPONSIVE.md) | Estrategia responsive, breakpoints, drawer móvil, tipografía fluida, safe-areas. |
| [docs/ESTILOS.md](docs/ESTILOS.md) | Sistema CSS: tokens, variables, convenciones y cómo extenderlo. |
| [docs/JAVASCRIPT.md](docs/JAVASCRIPT.md) | Capa JS: inicialización, render, ResizeObserver, componentes, dónde extender. |
| [docs/COMPONENTES.md](docs/COMPONENTES.md) | Catálogo de componentes de UI (propósito, estructura, comportamiento). |
| [docs/adr/README.md](docs/adr/README.md) | Decisiones técnicas (ADR): por qué vanilla, SVG, JSON, desktop-first, Pages… |
| [docs/PUBLICAR.md](docs/PUBLICAR.md) | Paso a paso para publicar en GitHub + GitHub Pages. |
| [docs/guia.md](docs/guia.md) | Guía de uso y personalización (orientada a operación/contenido). |
| [CHANGELOG.md](CHANGELOG.md) | Historial de versiones y cambios. |

---

## Actualizar los datos (resumen)

1. Edita `data/Matriz_indicadores_por_factor.xlsx` (hoja `Matriz Indicadores`).
2. Regenera el JSON:
   ```bash
   pip install -r requirements.txt
   python scripts/generar_json.py
   ```
3. Recarga el tablero. No hay que tocar el HTML ni el CSS.

> ⚠️ **Importante:** `generar_json.py` **no** genera los campos `chart` (barras/línea)
> ni `dual` (comparación nacional). Están documentados en `data/tipos_grafico.json` y
> deben reponerse tras regenerar. Ver el detalle en
> [docs/GUIA_DESARROLLADOR.md](docs/GUIA_DESARROLLADOR.md).

**Archivos fuente no versionados:** el sitio solo necesita `data/datos_indicadores.json`.
El Excel de trabajo se mantiene local (está en `.gitignore`).

---

## Publicación

Sitio estático servido desde la raíz del repositorio. Todas las rutas son relativas
para funcionar bajo el subpath de Pages. Cada push a `main` dispara el despliegue
automático. Pasos exactos en [docs/PUBLICAR.md](docs/PUBLICAR.md).

---

## Fuente

Matriz de indicadores por factor 2020–2025 · **Oficina de Planeación**,
Universidad del Magdalena. Definiciones de factores: Lineamientos de acreditación
institucional en alta calidad del **Consejo Nacional de Acreditación (CNA)**.
