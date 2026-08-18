#!/usr/bin/env python3
"""Genera docs/plan.md a partir de data/plan.yml.

Las fechas del plan son RELATIVAS: cada bloque declara `desde`/`hasta` en días
antes del final, y acá se resuelven contra `meta.final`. Reprogramar el plan
entero es cambiar una sola línea del YAML.

El PESO de cada bloque —qué porcentaje del banco de finales cubre— se calcula
desde data/banco-finales.yml, para que la tabla no mienta si mañana se agregan
preguntas.

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
MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
            "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


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


def fecha_larga(f: dt.date) -> str:
    return f"{DIAS_ES[f.weekday()]} {f.day} de {MESES_ES[f.month - 1]}"


def corto(f: dt.date) -> str:
    return f"{f.day}/{f.month}"


def main() -> int:
    plan = cargar("plan.yml")
    banco = cargar("banco-finales.yml")
    temas: dict[str, str] = banco["temas"]
    frec = apariciones_por_tema(banco)
    total_apariciones = sum(frec.values())

    meta = plan["meta"]
    final = dt.date.fromisoformat(meta["final"])
    hoy = dt.date.today()

    # --- Validación -------------------------------------------------------
    fallos: list[str] = []
    if final <= hoy:
        fallos.append(
            f"meta.final es {final} y hoy es {hoy}: el plan ya venció. "
            "Actualizá la fecha de la mesa en data/plan.yml."
        )

    vistos: set[str] = set()
    for b in plan["bloques"]:
        if b["desde"] < b["hasta"]:
            fallos.append(f"{b['id']}: 'desde' ({b['desde']}) debe ser mayor que 'hasta' ({b['hasta']})")
        for slug in b.get("temas") or []:
            if slug not in temas:
                fallos.append(f"{b['id']}: tema desconocido {slug!r}")
            if slug in vistos:
                fallos.append(f"{b['id']}: el tema {slug!r} ya estaba en un bloque anterior")
            vistos.add(slug)

    faltan = sorted(set(temas) - vistos)
    if faltan:
        fallos.append("temas que el plan no cubre: " + ", ".join(faltan))

    if fallos:
        print("ERROR — data/plan.yml no valida:", file=sys.stderr)
        for f in fallos:
            print("  · " + f, file=sys.stderr)
        return 1

    # --- Armado de los bloques --------------------------------------------
    bloques = []
    filas = []

    for b in plan["bloques"]:
        ini = final - dt.timedelta(days=b["desde"])
        fin = final - dt.timedelta(days=b["hasta"])
        peso = sum(frec[s] for s in (b.get("temas") or []))
        pct = 100 * peso / total_apariciones if total_apariciones else 0

        tareas = []
        for slug in b.get("temas") or []:
            tareas.append({
                "titulo": temas[slug],
                "detalle": "La rutina completa: banco → ficha con checkpoints → "
                           "chips → respuesta a mano → rúbrica → quiz.",
                "enlace": f"../temas/{slug}/",
            })
        for e in b.get("extra") or []:
            tareas.append({
                "titulo": e["titulo"],
                "detalle": " ".join(e["detalle"].split()),
                "enlace": f"../{e['enlace']}" if e.get("enlace") else "",
            })

        bloques.append({
            "id": b["id"],
            "rango": f"{corto(ini)} al {corto(fin)}",
            "titulo": b["titulo"],
            "porque": " ".join(b["porque"].split()),
            "tareas": tareas,
            "metas": b.get("metas") or [],
            "aviso": " ".join((b.get("aviso") or "").split()),
            "vencido": fin < hoy,
            "actual": ini <= hoy <= fin,
        })

        nombres = ", ".join(temas[s] for s in (b.get("temas") or [])) or "—"
        filas.append(
            f"| **{corto(ini)} – {corto(fin)}** | {b['titulo'].split('—')[0].strip()} "
            f"| {nombres} | {pct:.0f} % |"
        )

    faltan_dias = (final - hoy).days

    # --- Página -----------------------------------------------------------
    crudo = json.dumps({"bloques": bloques}, ensure_ascii=False,
                       separators=(",", ":")).replace("<", "\\u003c")

    aviso_fecha = ""
    if not meta.get("fecha_confirmada", False):
        aviso_fecha = (
            '!!! danger "Confirmá la fecha de la mesa"\n'
            f"    El plan está armado sobre el **{fecha_larga(final)}**, que es una "
            "fecha **provisoria**. En cuanto tengas la definitiva, cambiá "
            "`meta.final` en `data/plan.yml` y corré `python3 scripts/gen_plan.py`: "
            "todo el calendario se recalcula solo.\n\n"
        )

    cuerpo = [
        AVISO,
        "# Plan de estudio\n",
        f"**Faltan {faltan_dias} días.** El final es el "
        f"**{fecha_larga(final)} a las {meta['hora']}, aula {meta['aula']}**.\n",
        aviso_fecha,
        '!!! tip "Cómo usar esta página"\n'
        "    Tildá las tareas a medida que las hacés: **se guardan en este "
        "dispositivo**. La semana en curso aparece resaltada y las que ya "
        f"pasaron se atenúan. Dedicación: **{meta['horas_por_dia']} por día** "
        f"entre semana, **{meta['horas_finde']} el fin de semana**.\n",
        "## De un vistazo\n",
        "| Semana | Foco | Temas | Peso en el banco |",
        "|---|---|---|---:|",
        *filas,
        "",
        '!!! warning "De dónde sale este reparto"\n'
        "    El **orden de los temas no es criterio propio**: sale de la "
        "[tabla de frecuencia](finales/frecuencia.md), que cuenta apariciones "
        "reales en los finales relevados. Lo que más se tomó va primero, con "
        "más semanas por delante para que decante.\n\n"
        "    **Las horas sí son una estimación**, hecha sobre el tamaño de cada "
        "ficha más el tiempo de escribir a mano y corregir.\n",
        "## La rutina de cada tema\n",
        "Se repite **en todos los temas**, y el orden importa: las preguntas van "
        "**antes** que la ficha, y la teoría al final y sólo como parche.\n",
        "| | Paso | Tiempo |",
        "|---:|---|---:|",
    ]

    for i, p in enumerate(plan["rutina"], 1):
        detalle = " ".join(p["detalle"].split())
        cuerpo.append(
            f"| **{i}** | **{p['paso']}**<br><small>{detalle}</small> "
            f"| {p['minutos']} min |"
        )

    suma = sum(p["minutos"] for p in plan["rutina"])
    h, m = divmod(suma, 60)
    cuerpo.append(f"\n**Total por tema: {h} h {m:02d}.**\n")

    cuerpo.append("## Todos los días\n")
    for d in plan.get("diario") or []:
        cuerpo.append(
            f"- **{d['titulo']}** ({d['minutos']} min) — "
            f"{' '.join(d['detalle'].split())}"
        )
    cuerpo.append("")

    cuerpo.append("## Semana por semana\n")
    cuerpo.append(
        f'<div class="pract" data-tipo="plan" data-datos="d-plan"></div>\n'
        f'<script type="application/json" id="d-plan">{crudo}</script>\n'
    )

    cuerpo.append("\n## Qué NO hacer\n")
    for x in plan.get("no_hacer") or []:
        cuerpo.append(f"- {x}")

    cuerpo.append(
        '\n<p class="fuentes">Fuente del reparto: <code>data/banco-finales.yml</code> '
        "(frecuencia real de los finales). El plan y los tiempos: "
        "<code>data/plan.yml</code>.</p>\n"
    )

    OUT.write_text("\n".join(cuerpo), encoding="utf-8")
    print(
        f"OK  {len(bloques)} bloques · {sum(len(b['tareas']) for b in bloques)} tareas · "
        f"{len(vistos)}/{len(temas)} temas · final el {final} (faltan {faltan_dias} días)"
    )
    if not meta.get("fecha_confirmada", False):
        print("    ATENCIÓN: meta.fecha_confirmada es false, la fecha es provisoria")
    return 0


if __name__ == "__main__":
    sys.exit(main())
