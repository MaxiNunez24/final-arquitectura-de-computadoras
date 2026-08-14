#!/usr/bin/env python3
"""Genera docs/plan.md a partir de data/plan.yml.

El reparto de temas por día lo decide data/plan.yml, pero el PESO de cada día
—qué porcentaje del banco de finales cubre— se calcula acá desde
data/banco-finales.yml, para que la tabla no mienta si mañana se agregan
preguntas al banco.

Uso:  python3 scripts/gen_plan.py
"""
from __future__ import annotations

import datetime as dt
import json
import pathlib
import sys
from collections import Counter

import yaml

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATA = RAIZ / "data"
OUT = RAIZ / "docs" / "plan.md"

AVISO = (
    "<!-- Generado por scripts/gen_plan.py desde data/plan.yml.\n"
    "     No editar a mano: los cambios se pierden en la próxima corrida. -->\n"
)

DIAS_ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]


def cargar(nombre: str) -> dict:
    return yaml.safe_load((DATA / nombre).read_text(encoding="utf-8"))


def apariciones_por_tema(banco: dict) -> Counter:
    """Mismo conteo que usa scripts/gen_banco.py para la tabla de frecuencia."""
    frec: Counter = Counter()
    for p in banco["preguntas"]:
        total = max(1, len(p.get("fechas") or []))
        for v in p.get("variantes") or []:
            total += max(1, len(v.get("fechas") or []))
        frec[p["tema"]] += total
        for t in p.get("tambien_en") or []:
            frec[t] += 1
    return frec


def hhmm(minutos: int) -> str:
    h, m = divmod(minutos, 60)
    if h and m:
        return f"{h} h {m:02d}"
    if h:
        return f"{h} h"
    return f"{m} min"


def main() -> int:
    plan = cargar("plan.yml")
    banco = cargar("banco-finales.yml")
    temas: dict[str, str] = banco["temas"]
    frec = apariciones_por_tema(banco)
    total_apariciones = sum(frec.values())

    meta = plan["meta"]
    rutina = plan["rutina"]
    diario = plan.get("diario") or []

    # --- Validación --------------------------------------------------------
    fallos = []
    vistos = set()

    # Un plan de estudio que arranca ayer es peor que no tener plan: se lee
    # como vigente y reparte los temas en días que ya no existen. Ya pasó una
    # vez, por armarlo sobre una fecha supuesta en vez de mirar el reloj.
    hoy = dt.date.today()
    primera = min(dt.date.fromisoformat(d["fecha"]) for d in plan["dias"])
    if primera < hoy:
        fallos.append(
            f"el plan arranca el {primera} y hoy es {hoy}: hay que recorrer "
            "las fechas de data/plan.yml"
        )

    final = dt.date.fromisoformat(meta["final"])
    ultima = max(dt.date.fromisoformat(d["fecha"]) for d in plan["dias"])
    if ultima >= final:
        fallos.append(f"hay días de plan el {ultima}, y el final es el {final}")

    for d in plan["dias"]:
        for t in d.get("temas") or []:
            if t["slug"] not in temas:
                fallos.append(f"{d['fecha']}: tema desconocido {t['slug']!r}")
            vistos.add(t["slug"])
    faltan = sorted(set(temas) - vistos)
    if faltan:
        fallos.append("temas que el plan no cubre: " + ", ".join(faltan))
    if fallos:
        print("ERROR — data/plan.yml no valida:", file=sys.stderr)
        for f in fallos:
            print("  · " + f, file=sys.stderr)
        return 1

    # --- Armado de los días -----------------------------------------------
    dias = []
    filas_tabla = []
    total_min = 0

    for d in plan["dias"]:
        fecha = dt.date.fromisoformat(d["fecha"])
        etiqueta = f"{DIAS_ES[fecha.weekday()]} {fecha.day}/{fecha.month}"

        tareas = []
        minutos_dia = 0
        peso = 0

        for extra in diario:
            if d["fecha"] >= extra.get("desde", "0000-01-01"):
                tareas.append({
                    "titulo": extra["titulo"],
                    "minutos": extra["minutos"],
                    "detalle": " ".join(extra["detalle"].split()),
                    "enlace": "../practica/fichas/",
                })
                minutos_dia += extra["minutos"]

        for t in d.get("temas") or []:
            slug = t["slug"]
            peso += frec[slug]
            tareas.append({
                "titulo": f"{temas[slug]} — la rutina completa",
                "minutos": t["minutos"],
                "detalle": " ".join(t["nota"].split()),
                "enlace": f"../temas/{slug}/",
            })
            minutos_dia += t["minutos"]

        for extra in d.get("extra") or []:
            tareas.append({
                "titulo": extra["titulo"],
                "minutos": extra["minutos"],
                "detalle": " ".join(extra["detalle"].split()),
                "enlace": "../practica/simulacro/" if "imulacro" in extra["titulo"] else "",
            })
            minutos_dia += extra["minutos"]

        total_min += minutos_dia
        pct = 100 * peso / total_apariciones if total_apariciones else 0

        dias.append({
            "fecha": d["fecha"],
            "etiqueta": etiqueta,
            "titulo": d["titulo"],
            "porque": " ".join(d["porque"].split()),
            "horas": hhmm(minutos_dia),
            "tareas": tareas,
            "metas": d.get("metas") or [],
            "minimo": " ".join((d.get("minimo") or "").split()),
        })

        nombres = ", ".join(temas[t["slug"]] for t in (d.get("temas") or [])) or "—"
        filas_tabla.append(
            f"| **{etiqueta}** | {nombres} | {hhmm(minutos_dia)} | "
            f"{pct:.0f} % |"
        )

    # --- Página ------------------------------------------------------------
    crudo = json.dumps({"dias": dias}, ensure_ascii=False, separators=(",", ":"))
    crudo = crudo.replace("<", "\\u003c")

    final = dt.date.fromisoformat(meta["final"])
    cuerpo = [
        AVISO,
        "# Plan de estudio\n",
        f"**Quedan {len(dias)} días.** El final es el "
        f"**{DIAS_ES[final.weekday()]} {final.day}/{final.month}"
        f" a las {meta['hora']}, aula {meta['aula']}**.\n",
        f'!!! tip "Cómo usar esta página"\n'
        f"    Tildá las tareas a medida que las hacés: **se guardan en este "
        f"dispositivo**. El día de hoy aparece resaltado y los días que ya "
        f"pasaron se atenúan. Dedicación estimada: **{meta['horas_por_dia']} "
        f"por día**; si un día no da, cada tarjeta trae abajo una versión "
        f"mínima de **{meta['horas_minimo']}**.\n",
        "## De un vistazo\n",
        "| Día | Temas | Tiempo | Peso en el banco |",
        "|---|---|---|---:|",
        *filas_tabla,
        f"\n**Total estimado: {hhmm(total_min)}** repartidos en {len(dias)} días.\n",
        '!!! warning "De dónde sale este reparto"\n'
        "    El **orden de los temas no es criterio propio**: sale de la "
        "[tabla de frecuencia](finales/frecuencia.md), que cuenta apariciones "
        "reales en los finales relevados. Lo que más se tomó va primero, con "
        "más días por delante para que decante.\n\n"
        "    **Los minutos sí son una estimación**, hecha sobre el tamaño real "
        "de cada ficha más el tiempo de escribir a mano y corregir. Son una "
        "guía para no quedarte pegado, no una promesa.\n",
        "## La rutina de cada tema\n",
        "Esto se repite **en todos los temas**, y el orden importa: las "
        "preguntas van **antes** que la ficha, y la teoría al final y sólo como "
        "parche.\n",
        "| | Paso | Tiempo |",
        "|---:|---|---:|",
    ]

    for i, p in enumerate(rutina, 1):
        detalle = " ".join(p["detalle"].split())
        cuerpo.append(
            f"| **{i}** | **{p['paso']}**<br><small>{detalle}</small> "
            f"| {p['minutos']} min |"
        )

    suma_rutina = sum(p["minutos"] for p in rutina)
    cuerpo.append(f"\n**Total por tema: {hhmm(suma_rutina)}.**\n")

    cuerpo.append("## Día por día\n")
    cuerpo.append(
        f'<div class="pract" data-tipo="plan" data-datos="d-plan"></div>\n'
        f'<script type="application/json" id="d-plan">{crudo}</script>\n'
    )

    cuerpo.append("\n## Qué NO hacer\n")
    cuerpo.append(
        "En una semana, esto pesa tanto como qué sí hacer.\n"
    )
    for x in plan.get("no_hacer") or []:
        cuerpo.append(f"- {x}")

    cuerpo.append(
        '\n<p class="fuentes">Fuente del reparto: <code>data/banco-finales.yml</code> '
        "(frecuencia real de los finales). El plan y los tiempos: "
        "<code>data/plan.yml</code>.</p>\n"
    )

    OUT.write_text("\n".join(cuerpo), encoding="utf-8")
    print(
        f"OK  {len(dias)} días · {sum(len(d['tareas']) for d in dias)} tareas · "
        f"{hhmm(total_min)} estimadas · {len(vistos)}/{len(temas)} temas cubiertos"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
