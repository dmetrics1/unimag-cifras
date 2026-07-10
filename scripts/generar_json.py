#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar_json.py
================
Lee la matriz de indicadores por factor (Excel) y produce el JSON que
consume el tablero: data/datos_indicadores.json

Uso:
    python scripts/generar_json.py

Requisitos:
    pip install openpyxl

Estructura esperada de la hoja "Matriz Indicadores":
    N° Factor | Factor | Indicadores | 2020 | 2021 | 2022 | 2023 | 2024 | 2025

Salida (JSON):
    {
      "years": [2020, ..., 2025],
      "factors": [
        {"n": 1, "factor": "...", "indicators": [
            {"name": "...", "values": [v2020, ..., v2025], "pct": true|false}
        ]}
      ]
    }

Valores de texto ("No Aplica", "ND", "No Disponible", "NaN", vacío) se
convierten a null: la serie salta ese año en el gráfico.
"""

import json
import math
import os
import sys

try:
    import openpyxl
except ImportError:
    sys.exit("Falta openpyxl. Instala con: pip install openpyxl")

# --- Rutas (relativas a la raíz del proyecto) ---
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL = os.path.join(BASE, "data", "Matriz_indicadores_por_factor.xlsx")
SALIDA = os.path.join(BASE, "data", "datos_indicadores.json")
HOJA = "Matriz Indicadores"
ANIOS = [2020, 2021, 2022, 2023, 2024, 2025]

# Palabras clave que marcan un indicador como porcentaje (se muestra con %)
CLAVES_PCT = [
    "porcentaje", "tasa", "nivel de satisfacción", "aporte relativo",
    "participación", "absorción", "selectividad", "empleabilidad",
    "deserción", "graduación",
]


def limpiar(v):
    """Devuelve número (float/int) o None para cualquier texto/vacío."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        if isinstance(v, float) and math.isnan(v):
            return None
        return round(float(v), 6)
    return None  # "No Aplica", "ND", etc.


def es_porcentaje(nombre):
    n = (nombre or "").lower()
    return any(clave in n for clave in CLAVES_PCT)


def main():
    if not os.path.exists(EXCEL):
        sys.exit("No se encontró el Excel en: " + EXCEL)

    wb = openpyxl.load_workbook(EXCEL, data_only=True)
    if HOJA not in wb.sheetnames:
        sys.exit('No existe la hoja "%s". Hojas: %s' % (HOJA, wb.sheetnames))

    ws = wb[HOJA]
    filas = list(ws.iter_rows(values_only=True))[1:]  # saltar cabecera

    factores = {}
    for r in filas:
        if r[0] is None:
            continue
        n_factor = int(r[0])
        nombre_factor = r[1]
        nombre_ind = r[2]
        valores = [limpiar(r[3 + i]) for i in range(len(ANIOS))]

        factores.setdefault(n_factor, {
            "n": n_factor,
            "factor": nombre_factor,
            "indicators": [],
        })
        factores[n_factor]["indicators"].append({
            "name": nombre_ind,
            "values": valores,
            "pct": es_porcentaje(nombre_ind),
        })

    salida = {
        "years": ANIOS,
        "factors": [factores[k] for k in sorted(factores)],
    }

    with open(SALIDA, "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=None)

    total_ind = sum(len(x["indicators"]) for x in salida["factors"])
    print("OK -> %s" % SALIDA)
    print("Factores: %d | Indicadores: %d" % (len(salida["factors"]), total_ind))


if __name__ == "__main__":
    main()
