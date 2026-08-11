#!/usr/bin/env python3
"""Valida la estructura mínima de datos y archivos antes de publicar."""

import json
from pathlib import Path


BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data"
YEARS_EXPECTED = list(range(2020, 2026))
NON_PERCENT_INDICATORS = {
    "Número promedio de semestres cursados para la graduación pregrado presencial",
}


def load_json(name):
    with (DATA / name).open(encoding="utf-8") as source:
        return json.load(source)


def validate():
    errors = []
    db = load_json("datos_indicadores.json")
    chart_types = load_json("tipos_grafico.json")
    details = load_json("factores_detalle.json")

    years = db.get("years")
    factors = db.get("factors", [])
    indicators = [indicator for factor in factors for indicator in factor.get("indicators", [])]

    if years != YEARS_EXPECTED:
        errors.append(f"Años inesperados: {years}")
    if len(factors) != 12:
        errors.append(f"Se esperaban 12 factores; encontrados: {len(factors)}")
    if len(indicators) != 92:
        errors.append(f"Se esperaban 92 filas de indicadores; encontradas: {len(indicators)}")
    if len(details.get("factores", [])) != 12:
        errors.append("factores_detalle.json no contiene 12 factores")

    names = set()
    for indicator in indicators:
        name = indicator.get("name", "").strip()
        if not name:
            errors.append("Existe un indicador sin nombre")
        if name in names:
            errors.append(f"Indicador duplicado: {name}")
        names.add(name)
        if len(indicator.get("values", [])) != len(years):
            errors.append(f"Serie desalineada con los años: {name}")
        if indicator.get("chart") not in {"linea", "barras"}:
            errors.append(f"Tipo de gráfico inválido: {name}")
        if name in NON_PERCENT_INDICATORS and indicator.get("pct"):
            errors.append(f"Indicador numérico marcado como porcentaje: {name}")

    mapped = {
        item.get("name", "").strip()
        for item in chart_types.get("indicadores", [])
        if item.get("name", "").strip()
    }
    missing_metadata = sorted(names - mapped)
    if missing_metadata:
        errors.append("Faltan metadatos de gráfico: " + ", ".join(missing_metadata))

    for relative in (
        "index.html",
        "assets/css/tokens.css",
        "assets/js/app.js",
        "assets/img/cifras-autoevaluacion.webp",
    ):
        if not (BASE / relative).is_file():
            errors.append(f"Falta archivo requerido: {relative}")

    if errors:
        raise SystemExit("VALIDACIÓN FALLIDA\n- " + "\n- ".join(errors))

    print(
        "Validación OK: "
        f"{len(factors)} factores, {len(indicators)} filas, {len(years)} años."
    )


if __name__ == "__main__":
    validate()
