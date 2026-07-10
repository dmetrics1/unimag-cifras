# Guía de uso y personalización

## 1. Navegación del tablero

- **Sidebar izquierdo:** lista de los 12 factores. Cada uno muestra cuántos
  indicadores contiene. Al hacer clic se cargan sus indicadores.
- **Tarjetas:** cada indicador aparece como tarjeta con su último valor, la
  variación del periodo (verde = sube, rojo = baja) y un mini-gráfico.
- **Clic en una tarjeta:** abre el detalle con el gráfico grande, los KPIs
  (inicial, último, máximo, variación) y la tabla año por año.
- **Buscador:** filtra indicadores dentro del factor activo.
- **Tarjetas / Tabla:** alterna entre la vista visual y la vista de tabla
  (útil para factores con muchos indicadores).

## 2. Dónde se cambia cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Colores, tipografía, tamaños, sidebar | `assets/css/tokens.css` (variables en `:root`) |
| Comportamiento, gráficos, formato de números | `assets/js/app.js` |
| Texto del pie del sidebar, título, logo | `index.html` |
| Datos (indicadores, años, valores) | `data/Matriz_indicadores_por_factor.xlsx` + `scripts/generar_json.py` |

## 3. Paleta institucional (tokens.css)

```
--brand-primary  #004A87   estructura, títulos, botones
--brand-deep     #00294B   sidebar
--brand-accent   #0183EF   serie de datos (líneas y áreas)
--ref            #FF9400   punto final de la serie
--pos            #00A50B   tendencia al alza
--neg            #D10500   tendencia a la baja
```

Cambiar el color de las líneas de los gráficos: edita las constantes `ACCENT`
y `GOLD` al inicio de `assets/js/app.js`.

## 4. Cambiar el texto del pie o el subtítulo

En `index.html`, dentro de `.sb-foot` y `.sb-title span`. Por ejemplo, para usar
la sigla de la oficina responsable, reemplaza "Oficina de Planeación".

## 5. Añadir un año nuevo (ej. 2026)

1. Agrega la columna `2026` en el Excel.
2. En `scripts/generar_json.py`, añade `2026` a la lista `ANIOS`.
3. Ejecuta `python scripts/generar_json.py`.

El tablero toma los años directamente del JSON, así que los ejes y las tablas
se ajustan solos.

## 6. Ideas para seguir (pendientes sugeridos)

- **Comparar 2–3 indicadores** en un mismo gráfico (p. ej. tasa institucional vs.
  nacional, que ya vienen en pares en la matriz).
- **Exportar** cada gráfico a PNG o el factor completo a PDF.
- **Marcar visualmente** los años sin dato (hoy la línea simplemente salta).
- Integrarlo al repositorio del informe Saber Pro como una sección más.
