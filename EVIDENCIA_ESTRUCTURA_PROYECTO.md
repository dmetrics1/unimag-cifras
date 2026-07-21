# ESTRUCTURA Y ARQUITECTURA DEL PROYECTO
## TABLERO DE INDICADORES INSTITUCIONALES 2020–2025
**Oficina de Planeación · Universidad del Magdalena**

Este documento detalla la estructura, flujo de datos y diseño del dashboard interactivo **"Unimagdalena en Cifras"**. Sirve como soporte técnico y evidencia de la implementación del tablero institucional de autoevaluación.

> 📚 **Documentación técnica ampliada:** este documento es un resumen ejecutivo. La
> documentación detallada para desarrolladores está en [`docs/`](docs/):
> [arquitectura](docs/ARQUITECTURA.md), [responsive](docs/RESPONSIVE.md),
> [CSS](docs/ESTILOS.md), [JavaScript](docs/JAVASCRIPT.md),
> [componentes](docs/COMPONENTES.md), [guía de desarrollador](docs/GUIA_DESARROLLADOR.md),
> [decisiones técnicas (ADR)](docs/adr/README.md) y el [CHANGELOG](CHANGELOG.md).

---

## 1. FICHA TÉCNICA DEL DESARROLLO

*   **Proyecto:** Tablero Interactivo de Indicadores por Factor (Acreditación de Alta Calidad)
*   **Periodo de Datos:** Serie continua 2020 a 2025
*   **Alcance:** 12 Factores del modelo de acreditación (Acuerdo CESU 01 de 2025)
*   **Tecnologías Utilizadas:**
    *   **Frontend:** HTML5 semántico, CSS3 Vanilla (Custom Properties/Tokens), JavaScript Moderno (ES6+).
    *   **Motor Gráfico:** Renderizado SVG responsivo autogenerado (sin librerías externas para máxima velocidad y carga offline).
    *   **Procesamiento:** Python 3 + `openpyxl` (automatización de la ingesta de Excel).
    *   **Formato de Datos:** JSON estructurado para el desacoplamiento de datos y diseño.

---

## 2. ARQUITECTURA DEL FLUJO DE DATOS

El sistema funciona mediante un flujo unidireccional y desacoplado, lo que permite actualizar los datos del tablero modificando únicamente el archivo Excel de origen y ejecutando un script de empaquetado:

```
[ Matriz_indicadores_por_factor.xlsx ] (Base de datos original en Excel)
                  │
                  ▼ (Ejecución: python scripts/generar_json.py)
[ datos_indicadores.json ] (Base de datos limpia y formateada en JSON)
                  │
                  ▼ (Consumo dinámico vía Fetch API en cliente)
[ index.html + app.js + tokens.css ] (Tablero web interactivo responsivo)
```

1.  **Fuente de Datos (`Excel`):** La Oficina de Planeación administra las cifras en la hoja "Matriz Indicadores" del Excel.
2.  **Script de Ingesta (`Python`):** `generar_json.py` lee el archivo Excel, limpia las celdas (valores de texto, no disponibles, o faltantes se convierten a `null` de forma segura) y asocia cada indicador a su respectivo Factor.
3.  **Base de Datos Estática (`JSON`):** Genera `datos_indicadores.json` estructurando la información por años e indicadores.
4.  **Renderizado en Cliente (`JS + SVG`):** El navegador carga el JSON localmente mediante un `fetch()`. JavaScript procesa las series temporales, las dibuja en elementos `<svg>` adaptables en tiempo real, calcula las tendencias de incremento/decremento y renderiza las vistas correspondientes.

---

## 3. ESTRUCTURA DE ARCHIVOS Y CARPETAS (FILE TREE)

El proyecto está organizado de manera limpia y modular bajo las siguientes rutas:

```
unimagdalena_cifras_informe/
│
├── index.html                       # Página principal del tablero (estructura base y menús)
│
├── assets/                          # Recursos visuales y de lógica del cliente
│   ├── css/
│   │   └── tokens.css               # Diseño del sitio (colores corporativos, fuentes y grillas)
│   ├── js/
│   │   └── app.js                   # Lógica interactiva (router, render, SVGs de línea/barras y CSV)
│   └── img/
│       └── escudo-unimagdalena.png  # Identidad visual institucional de la Universidad
│
├── data/                            # Directorio de bases de datos y matrices
│   ├── Matriz_indicadores_por_factor.xlsx  # Excel original con los indicadores de planeación
│   ├── datos_indicadores.json       # Datos procesados en formato JSON (generado automáticamente)
│   └── factores_detalle.json        # Glosario con definiciones del CNA y características de calidad
│
├── scripts/                         # Scripts de backend y automatización
│   └── generar_json.py              # Script en Python para transformar el Excel a JSON estructurado
│
├── docs/                            # Documentación del proyecto
│   ├── guia.md                      # Manual de uso, actualización de datos y personalización
│   └── PUBLICAR.md                  # Instrucciones de despliegue y subida a GitHub Pages
│
├── requirements.txt                 # Dependencias del script de Python (openpyxl)
├── abrir_local.bat                  # Lanzador en Windows para abrir el servidor local con un clic
├── abrir_local.sh                   # Lanzador en Unix/macOS para abrir el servidor local
└── .gitignore                       # Ignora archivos temporales y locales del control de versiones
```

---

## 4. MÉTRICAS CONSOLIDADAS DEL TABLERO

Tras la carga e integración de datos, el proyecto abarca las siguientes cifras y componentes clave:

*   **Factores Evaluados:** 12 factores del Modelo de Acreditación de Alta Calidad del CNA.
*   **Años Continuos de Trayectoria:** 6 años de evolución registrados (2020, 2021, 2022, 2023, 2024 y 2025).
*   **Filas de datos en el JSON:** 92 filas de indicador en `datos_indicadores.json`.
*   **Indicadores mostrados en el tablero:** **87 indicadores únicos**. En el arranque, la función `mergeNacional()` fusiona las **5 filas "X (Nacional)"** dentro de su indicador base como línea de comparación (92 − 5 = 87), por lo que la serie nacional no se cuenta como indicador aparte.
*   **Indicadores Duales (Comparativos):** 5 indicadores integrados de doble serie (Universidad del Magdalena vs. Media Nacional):
    1.  *Promedio puntaje global Saber Pro*
    2.  *Tasa de deserción en nivel universitario*
    3.  *Tasa de graduación acumulada por cohorte en nivel universitario*
    4.  *Tasa de empleabilidad en pregrado*
    5.  *Tasa de empleabilidad en posgrado*

### Distribución de Indicadores por Factor
*   **Factor 1 (Identidad institucional):** 1 indicador
*   **Factor 2 (Gobierno y transparencia):** 2 indicadores
*   **Factor 3 (Gestión y sostenibilidad):** 10 indicadores
*   **Factor 4 (Aseguramiento de la calidad):** 2 indicadores
*   **Factor 5 (Procesos académicos):** 9 indicadores
*   **Factor 6 (Investigación e innovación):** 13 indicadores
*   **Factor 7 (Extensión e impacto social):** 8 indicadores
*   **Factor 8 (Visibilidad e internacionalización):** 7 indicadores
*   **Factor 9 (Bienestar institucional):** 6 indicadores
*   **Factor 10 (Comunidad de profesores):** 7 indicadores
*   **Factor 11 (Comunidad de estudiantes):** 17 indicadores
*   **Factor 12 (Comunidad de egresados):** 5 indicadores

---

## 5. DISEÑO DE INTERFAZ Y COMPONENTES VISUALES

El dashboard se compone de 4 secciones interactivas principales:

1.  **Inicio (Resumen):**
    *   Presentación institucional con datos históricos agregados.
    *   Tarjetas resúmenes con contadores de Factores, Indicadores y Periodo.
2.  **Explorador por Factores (Visualizador Principal):**
    *   **Banda de cabecera:** Muestra el número, nombre del factor y subtítulo con metadatos.
    *   **Barra de filtros:** Contiene dropdowns customizados para alternar el Factor y el Indicador de forma instantánea.
    *   **Área de Gráfico SVG:** Dibuja la curva evolutiva (Línea + área rellena con gradiente azul) o columnas (Barras de columnas con resaltado automático del último año) de forma totalmente fluida y responsiva.
    *   **Panel de KPIs:** Detalla el *Valor Inicial* (punto de partida) y el *Valor Final* (con badge de tendencia que indica la tasa de variación porcentual respecto al año inicial).
3.  **Metodología (Glosario CNA):**
    *   Grilla de los 12 factores con íconos vectoriales identificativos y recuento de indicadores.
    *   Al hacer clic en cualquier factor, abre un modal deslizante que carga la definición del factor y las características de alta calidad detalladas por el Consejo Nacional de Acreditación (CNA).
4.  **Datos (Hoja de Cálculo Consolidada):**
    *   Buscador interactivo en tiempo real que filtra por coincidencia de texto en el nombre del indicador o factor.
    *   Tabla de doble entrada ordenada por Factor, Nombre e histórico 2020-2025.
    *   Botones de exportación directa de toda la base a formatos estructurados **JSON** y **CSV** de forma local.

---

## 6. GUÍA DE ESTILOS E IDENTIDAD VISUAL (TOKENS DE DISEÑO)

El tablero respeta rigurosamente la identidad corporativa y los colores oficiales de la Universidad del Magdalena definidos en `tokens.css`:

### Paleta de Colores
*   **Azul Primario (`#004A87`):** Azul institucional base, usado para títulos, botones, y componentes estructurales.
*   **Azul Profundo (`#00294B`):** Azul marino profundo para fondos del sidebar izquierdo y paneles oscuros.
*   **Azul Acento (`#0183EF`):** Azul vibrante para líneas, curvas SVG y series de datos de la universidad.
*   **Oro/Naranja Referencia (`#FF9400`):** Resaltado de hitos, metas o el punto final de las series.
*   **Verde Tendencia (`#00A50B`):** Indicador de variaciones positivas o al alza.
*   **Rojo Caída (`#D10500`):** Indicador de disminuciones de desempeño.
*   **Fondo General (`#F7F9FB`):** Gris-azul claro para el fondo de la pantalla.

### Tipografías
*   **`Outfit`:** Fuente decorativa moderna y geométrica utilizada en encabezados, contadores grandes de KPIs y ejes de años de gráficos.
*   **`Inter`:** Fuente de lectura técnica optimizada para etiquetas de datos, nombres de indicadores, tablas y cuerpo de texto.
