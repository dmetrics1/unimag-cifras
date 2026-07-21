# Guía de uso y personalización

Guía orientada a **operación y contenido** (cómo usar el tablero y hacer cambios
sencillos). Para documentación técnica profunda, ver el
[índice de documentación](../README.md#-documentación) y, en especial, la
[Guía de desarrollador](GUIA_DESARROLLADOR.md).

---

## 1. Navegación del tablero

El tablero tiene un **menú de 4 páginas** (en el sidebar en escritorio, o en el
menú hamburguesa ☰ en celular):

- **Inicio** — portada con la presentación y las cifras generales (12 factores,
  87 indicadores, periodo 2020–2025).
- **Factores** — vista principal. Eliges un **Factor** y un **Indicador** en la
  barra de filtros y se muestra:
  - el **gráfico** del indicador (de línea o de barras según el dato; algunos
    incluyen la línea gris del **nivel Nacional**);
  - dos **KPIs**: *Valor final* (último año, con la variación del periodo en verde
    si sube o rojo si baja) y *Valor inicial* (punto de partida).
- **Datos** — tabla completa de los 87 indicadores. Tiene **buscador**, **filtro
  por factor** y botones para **descargar** todo en **JSON** o **CSV** (Excel).
  Al hacer clic en el nombre de un indicador saltas a su gráfico en *Factores*.
- **Metodología** — los 12 factores en tarjetas. Al hacer clic en un factor se
  abre una ficha con su **definición oficial** y sus **características de alta
  calidad** (Consejo Nacional de Acreditación), más un botón a sus indicadores.

En **escritorio** el menú lateral se puede **colapsar** con el botón junto al
logo. En **celular** aparece una barra superior con el botón ☰ que abre el menú.

---

## 2. Dónde se cambia cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Colores, tipografía, tamaños, espaciados, responsive | `assets/css/tokens.css` (variables en `:root` y media queries) |
| Comportamiento, navegación, gráficos, formato de números | `assets/js/app.js` |
| Nombre corto, color o ícono de un factor | `assets/js/app.js` → array `FACTORES_INFO` (y objeto `ICO` para íconos) |
| Definición y características de un factor (Metodología) | `data/factores_detalle.json` |
| Texto del pie/título del sidebar y del header móvil, logo | `index.html` |
| Datos (indicadores, años, valores) | `data/Matriz_indicadores_por_factor.xlsx` + `scripts/generar_json.py` |
| Tipo de gráfico de un indicador (barras/línea) | campo `chart` en `data/datos_indicadores.json` (ver aviso en la [guía de desarrollador](GUIA_DESARROLLADOR.md)) |

---

## 3. Paleta institucional (tokens.css)

```
--brand-primary  #004A87   estructura, títulos, botones
--brand-deep     #00294B   sidebar / paneles oscuros
--brand-accent   #0183EF   serie de datos Unimagdalena (líneas, barras, áreas)
--ref            #FF9400   punto final de la serie
--pos            #00A50B   tendencia al alza (verde)
--neg            #D10500   tendencia a la baja (rojo)
--lime           #A5CA00   verde institucional secundario (botón "Explorar factores")
```

- La serie de **comparación Nacional** se dibuja en gris (`#8295AB`).
- Los colores de la serie de datos y del punto final también están como constantes
  `ACCENT` (`#0183EF`) y `GOLD` (`#FF9400`) al inicio de `assets/js/app.js`, junto
  a `NACIONAL` (`#8295AB`). El resto de la paleta se controla desde los tokens.

El catálogo completo de tokens está en [ESTILOS.md](ESTILOS.md).

---

## 4. Cambiar el texto del pie, el subtítulo o el logo

- **Pie del sidebar:** en `index.html`, dentro de `.sb-foot`.
- **Subtítulo bajo el título:** en `.sb-title span` (sidebar) y en `.mh-title span`
  (header móvil).
- **Logo:** reemplaza `assets/img/escudo-unimagdalena.png` (se usa en el sidebar,
  el header móvil y como favicon).

---

## 5. Añadir un año nuevo (ej. 2026)

1. Agrega la columna `2026` en el Excel (hoja `Matriz Indicadores`).
2. En `scripts/generar_json.py`, añade `2026` a la lista `ANIOS`.
3. Ejecuta `python scripts/generar_json.py`.

El tablero toma los años directamente del JSON, así que los ejes y las tablas se
ajustan solos. (Recuerda reponer los campos `chart`/`dual`; ver la
[guía de desarrollador](GUIA_DESARROLLADOR.md)).

---

## 6. Ideas para seguir (pendientes sugeridos)

- **Integrar `chart`/`dual` al pipeline** de `generar_json.py` para que no se pierdan
  al regenerar el JSON (hoy están en `data/tipos_grafico.json` y se aplican aparte).
- **Exportar** cada gráfico a PNG o el factor completo a PDF.
- **Marcar visualmente** los años sin dato (hoy la línea/serie simplemente salta).
- **Poblar la serie Nacional faltante** para nuevos indicadores comparativos.
- Integrarlo al repositorio del informe de autoevaluación como una sección más.

> ✅ Ya implementado (antes pendiente): comparación con el nivel nacional, exportación
> a JSON/CSV, y diseño responsive para celular y tablet.
