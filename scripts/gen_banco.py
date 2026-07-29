#!/usr/bin/env python3
"""Genera las páginas de docs/finales/ a partir de data/banco-finales.yml.

El YAML es la fuente de verdad: no editar a mano el markdown que sale de acá,
se pisa en cada corrida. Uso:  python3 scripts/gen_banco.py
"""
from __future__ import annotations

import pathlib
import sys
from collections import Counter

import yaml

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATA = RAIZ / "data" / "banco-finales.yml"
OUT = RAIZ / "docs" / "finales"

AVISO = (
    "<!-- Generado por scripts/gen_banco.py desde data/banco-finales.yml.\n"
    "     No editar a mano: los cambios se pierden en la próxima corrida. -->\n"
)


def marca_respuesta(valor) -> str:
    """Etiqueta si la pregunta tiene respuesta desarrollada en las fuentes."""
    return {
        True: ":material-check-circle: con respuesta",
        False: ":material-close-circle: sin respuesta",
        "parcial": ":material-circle-half-full: respuesta parcial",
    }.get(valor, ":material-help-circle: sin datos")


def fmt_fechas(fechas) -> str:
    return ", ".join(fechas) if fechas else "sin fecha registrada"


def bloque_pregunta(p: dict, nivel: str = "###") -> list[str]:
    """Renderiza una pregunta canónica con todas sus variantes agrupadas."""
    out = [f"{nivel} {p['id']}\n"]
    out.append(f'<div class="enunciado" markdown>\n\n{p["enunciado"].strip()}\n\n</div>\n')

    meta = [
        f"**Fechas:** {fmt_fechas(p.get('fechas'))}",
        f"**Origen:** `{p['archivo_origen']}`",
        marca_respuesta(p.get("tiene_respuesta")),
    ]
    out.append(" · ".join(meta) + "\n")

    if p.get("tambien_en"):
        otros = ", ".join(f"`{t}`" for t in p["tambien_en"])
        out.append(f"!!! note \"También cuenta para\"\n    {otros}\n")

    if p.get("nota"):
        out.append(f'!!! info "Nota de extracción"\n    {p["nota"].strip()}\n')

    variantes = p.get("variantes") or []
    if variantes:
        out.append(
            f'??? abstract "Variantes de redacción ({len(variantes)})"\n'
        )
        for v in variantes:
            out.append(f'    **·** {v["enunciado"].strip()}\n')
            sub = (
                f"    <small>{fmt_fechas(v.get('fechas'))} — "
                f"`{v['archivo_origen']}` — {marca_respuesta(v.get('tiene_respuesta'))}</small>\n"
            )
            out.append(sub)
            if v.get("nota"):
                out.append(f"    <small>*{v['nota'].strip()}*</small>\n")
    return out


def contar_apariciones(p: dict) -> int:
    """Una aparición por cada fecha registrada, en la canónica y en variantes.

    Si una redacción no tiene ninguna fecha asociada la contamos igual como 1:
    apareció en un final, sólo que la fuente no registró cuándo.
    """
    total = max(1, len(p.get("fechas") or []))
    for v in p.get("variantes") or []:
        total += max(1, len(v.get("fechas") or []))
    return total


def main() -> int:
    datos = yaml.safe_load(DATA.read_text(encoding="utf-8"))
    temas: dict[str, str] = datos["temas"]
    preguntas: list[dict] = datos["preguntas"]
    simulacros: list[dict] = datos["simulacros"]

    (OUT / "temas").mkdir(parents=True, exist_ok=True)

    # ---------------- Frecuencia por tema ----------------
    frec: Counter[str] = Counter()
    canon: Counter[str] = Counter()
    for p in preguntas:
        frec[p["tema"]] += contar_apariciones(p)
        canon[p["tema"]] += 1
        for t in p.get("tambien_en") or []:
            frec[t] += 1

    total = sum(frec.values())
    filas = []
    for slug, n in frec.most_common():
        pct = 100 * n / total
        barra = "█" * max(1, round(pct / 2))
        filas.append(
            f"| [{temas[slug]}](temas/{slug}.md) | {n} | {canon[slug]} "
            f"| {pct:.1f}% | `{barra}` |"
        )

    (OUT / "frecuencia.md").write_text(
        AVISO
        + "# Frecuencia de temas\n\n"
        "Cuántas veces apareció cada tema en los finales relevados, ordenado de "
        "mayor a menor. Sirve para priorizar si el tiempo aprieta.\n\n"
        "!!! warning \"Cómo leer esta tabla\"\n"
        "    **Apariciones** cuenta cada fecha registrada en las fuentes para "
        "cada redacción de una pregunta. Muchos enunciados de las fuentes no "
        "traen fecha: esos cuentan como 1. Es una aproximación al peso relativo "
        "de cada tema, **no** un conteo exacto de finales tomados.\n\n"
        "| Tema | Apariciones | Preguntas distintas | Peso | |\n"
        "|---|---:|---:|---:|---|\n" + "\n".join(filas) + "\n\n"
        f"**Total de apariciones contabilizadas:** {total}\n\n"
        f'<p class="fuentes">Fuente: <code>data/banco-finales.yml</code>, '
        f"derivado de los 11 archivos de <code>fuentes/Finales/</code>.</p>\n",
        encoding="utf-8",
    )

    # ---------------- Una página por tema ----------------
    for slug, nombre in temas.items():
        propias = [p for p in preguntas if p["tema"] == slug]
        prestadas = [
            p for p in preguntas
            if slug in (p.get("tambien_en") or []) and p["tema"] != slug
        ]
        cuerpo = [AVISO, f"# {nombre} — preguntas de final\n"]
        cuerpo.append(
            f"[:material-card-text: Ver la ficha del tema](../temas/{slug}.md)\n"
        )

        if not propias and not prestadas:
            cuerpo.append("<!-- TODO: falta en fuentes -->\n")
        else:
            cuerpo.append(
                f"{len(propias)} pregunta(s) canónica(s), "
                f"{sum(len(p.get('variantes') or []) for p in propias)} "
                "variante(s) de redacción agrupadas.\n"
            )
            for p in propias:
                cuerpo += bloque_pregunta(p)
            if prestadas:
                cuerpo.append("## Preguntas de otros temas que tocan este\n")
                for p in prestadas:
                    cuerpo.append(
                        f"- **{p['id']}** ({temas[p['tema']]}): "
                        f"{p['enunciado'].strip()}\n"
                    )
        (OUT / "temas" / f"{slug}.md").write_text("\n".join(cuerpo), encoding="utf-8")

    # ---------------- Índice del banco por tema ----------------
    idx = [AVISO, "# Banco por tema\n",
           "Todas las preguntas de finales viejos, agrupadas por tema. Las "
           "variantes de redacción van plegadas dentro de cada pregunta "
           "canónica.\n",
           "| Tema | Preguntas | Apariciones |\n|---|---:|---:|"]
    for slug, nombre in temas.items():
        n = len([p for p in preguntas if p["tema"] == slug])
        idx.append(f"| [{nombre}](temas/{slug}.md) | {n} | {frec[slug]} |")
    (OUT / "por-tema.md").write_text("\n".join(idx) + "\n", encoding="utf-8")

    # ---------------- Simulacros ----------------
    sim = [AVISO, "# Simulacros\n",
           "Finales completos reconstruidos tal como se tomaron. "
           "El final real es de **5 puntos con subincisos a) y b)** y "
           "**3 horas reloj**.\n",
           '!!! tip "Cómo usarlos"\n'
           "    Cronometrá 3 horas y resolvé uno entero sin mirar las fichas. "
           "Los finales viejos de 2014 y anteriores usan un formato distinto "
           "(5 o 6 puntos sin subincisos).\n"]

    hechos = [s for s in simulacros if s.get("completo")]
    pendientes = [s for s in simulacros if not s.get("completo")]

    for s in hechos:
        sim.append(f"## {s['nombre']}\n")
        etiquetas = []
        if s.get("fecha"):
            etiquetas.append(f"**Fecha:** {s['fecha']}")
        etiquetas.append(f"**Origen:** `{s['archivo_origen']}`")
        if s.get("con_respuestas"):
            etiquetas.append(marca_respuesta(s["con_respuestas"]))
        sim.append(" · ".join(etiquetas) + "\n")
        if s.get("nota"):
            sim.append(f'!!! info ""\n    {s["nota"].strip()}\n')
        for punto in s["puntos"]:
            titulo = f" — {punto['titulo']}" if punto.get("titulo") else ""
            sim.append(f"**{punto['numero']}.{titulo}**\n")
            for inc in punto["incisos"]:
                letra = f"**{inc['letra']})** " if inc.get("letra") else ""
                sim.append(
                    f"- {letra}{inc['enunciado'].strip()} "
                    f"<small>`{inc['tema']}`</small>"
                )
            sim.append("")

    if pendientes:
        sim.append("## Finales conocidos pero sin transcribir\n")
        for s in pendientes:
            sim.append(f"### {s['nombre']}\n")
            sim.append("<!-- TODO: falta en fuentes -->\n")
            sim.append(f'!!! danger "Pendiente de transcripción manual"\n'
                       f'    {s.get("nota", "").strip()}\n')

    (OUT / "simulacros.md").write_text("\n".join(sim) + "\n", encoding="utf-8")

    # ---------------- Portada de la sección ----------------
    n_var = sum(len(p.get("variantes") or []) for p in preguntas)
    (OUT / "index.md").write_text(
        AVISO
        + "# Banco de finales\n\n"
        f"**{len(preguntas)}** preguntas canónicas con **{n_var}** variantes de "
        f"redacción agrupadas, y **{len(hechos)}** finales completos "
        "reconstruidos, extraídos de los archivos de `fuentes/Finales/`.\n\n"
        "<div class=\"grid cards\" markdown>\n\n"
        "- :material-chart-bar: **[Frecuencia de temas](frecuencia.md)**\n\n"
        "    Qué se tomó más veces.\n\n"
        "- :material-format-list-bulleted: **[Banco por tema](por-tema.md)**\n\n"
        "    Las preguntas agrupadas, con las variantes juntas.\n\n"
        "- :material-timer: **[Simulacros](simulacros.md)**\n\n"
        "    Finales enteros para cronometrar.\n\n"
        "</div>\n\n"
        "## Sobre la extracción\n\n"
        "Los enunciados se transcriben **textuales**, incluidas las erratas del "
        "original. Donde una fuente no traía respuesta desarrollada, la "
        "pregunta queda marcada como *sin respuesta* en vez de completarse.\n\n"
        "!!! warning \"Duplicados detectados en las fuentes\"\n"
        "    - `Arquitectura_finales_parte1.pdf` y `SF - AC Final - 40.pdf` son "
        "**el mismo archivo** (sha256 idéntico). Se cita una sola vez.\n"
        "    - `Finales arq Alfonso _resueltos.docx` y `Preguntas del Final "
        "Arquitectura Hasta 2014.pdf` comparten el 99,1% del vocabulario: son "
        "el mismo documento en dos formatos.\n"
        "    - `Finales 2010.docx`, pese al nombre, no trae finales completos: "
        "es un único desarrollo sobre buses.\n",
        encoding="utf-8",
    )

    print(f"OK  {len(preguntas)} preguntas · {n_var} variantes · "
          f"{len(hechos)} simulacros · {len(temas)} páginas de tema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
