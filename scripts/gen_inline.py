#!/usr/bin/env python3
"""Inyecta checkpoints de práctica DENTRO de las fichas de docs/temas/.

Las fichas están escritas a mano, así que este script no las genera: las
*edita* entre marcas, y es idempotente. Cada corrida borra lo que inyectó
antes y vuelve a escribirlo, de modo que editar data/inline.yml y correr esto
alcanza; nunca hay que limpiar a mano.

    <!-- practica:inicio ID -->
    ...bloque generado...
    <!-- practica:fin ID -->

Los checkpoints se insertan al final de la sección indicada en `despues_de`,
es decir justo antes del próximo encabezado de nivel igual o superior.

Uso:  python3 scripts/gen_inline.py [--quitar]
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

import yaml

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATA = RAIZ / "data"
TEMAS = RAIZ / "docs" / "temas"

INICIO = "<!-- practica:inicio {} -->"
FIN = "<!-- practica:fin {} -->"


def cargar(nombre: str) -> dict:
    return yaml.safe_load((DATA / nombre).read_text(encoding="utf-8"))


def limpiar(texto: str) -> str:
    """Saca todos los bloques inyectados, cualquiera sea su id."""
    patron = re.compile(
        r"\n*<!-- practica:inicio [^>]+ -->.*?<!-- practica:fin [^>]+ -->\n*",
        re.S,
    )
    # Se normaliza el cierre del archivo para que `--quitar` sea el inverso
    # exacto de la inyección. Sin esto cada ciclo deja una línea en blanco más.
    return patron.sub("\n\n", texto).rstrip("\n") + "\n"


def nivel(linea: str) -> int:
    m = re.match(r"^(#{1,6})\s", linea)
    return len(m.group(1)) if m else 0


def insertar(texto: str, encabezado: str, bloque: str) -> tuple[str, str]:
    """Devuelve (texto_nuevo, error). El bloque va al final de esa sección."""
    lineas = texto.split("\n")
    idx = None
    for i, l in enumerate(lineas):
        if nivel(l) and l.split(" ", 1)[-1].strip() == encabezado:
            idx = i
            break
    if idx is None:
        return texto, f"no encontré el encabezado {encabezado!r}"

    n = nivel(lineas[idx])
    fin = len(lineas)
    for j in range(idx + 1, len(lineas)):
        nj = nivel(lineas[j])
        if nj and nj <= n:
            fin = j
            break

    nuevas = lineas[:fin] + ["", bloque, ""] + lineas[fin:]
    return "\n".join(nuevas).rstrip("\n") + "\n", ""


def widget(ident: str, datos: dict) -> str:
    crudo = json.dumps(datos, ensure_ascii=False, separators=(",", ":"))
    crudo = crudo.replace("<", "\u003c")
    return (
        f'<div class="pract pract--inline" data-tipo="opciones" '
        f'data-datos="{ident}"></div>\n'
        f'<script type="application/json" id="{ident}">{crudo}</script>'
    )


def main() -> int:
    quitar = "--quitar" in sys.argv

    # Siempre se limpia primero: así el script es idempotente y `--quitar`
    # es simplemente "limpiar y no volver a escribir".
    for md in sorted(TEMAS.glob("*.md")):
        if md.stem == "index":
            continue
        t = md.read_text(encoding="utf-8")
        limpio = limpiar(t)
        if limpio != t:
            md.write_text(limpio, encoding="utf-8")

    if quitar:
        print("OK  checkpoints removidos de docs/temas/")
        return 0

    inline = cargar("inline.yml")
    temas_banco = cargar("banco-finales.yml")["temas"]

    fallos: list[str] = []
    vistos: set[str] = set()
    por_tema: dict[str, int] = {}
    total_preg = 0

    for bloque in inline["checkpoints"]:
        ide = bloque["id"]
        if ide in vistos:
            fallos.append(f"{ide}: id repetido")
        vistos.add(ide)
        if bloque["tema"] not in temas_banco:
            fallos.append(f"{ide}: tema desconocido {bloque['tema']!r}")
        if not bloque.get("preguntas"):
            fallos.append(f"{ide}: sin preguntas")
        for k, p in enumerate(bloque.get("preguntas") or []):
            n = len(p["opciones"])
            if not (p.get("fuente") or "").strip():
                fallos.append(f"{ide}[{k}]: sin cita de fuente")
            if not p.get("correctas"):
                fallos.append(f"{ide}[{k}]: sin respuesta correcta")
            for c in p["correctas"]:
                if not 0 <= c < n:
                    fallos.append(f"{ide}[{k}]: correcta {c} fuera de rango (0..{n-1})")
            if len(set(p["correctas"])) != len(p["correctas"]):
                fallos.append(f"{ide}[{k}]: correctas repetidas")
            for i, o in enumerate(p["opciones"]):
                if not (o.get("explicacion") or "").strip():
                    fallos.append(f"{ide}[{k}]: opción {i} sin explicación")

    if fallos:
        print("ERROR — data/inline.yml no valida:", file=sys.stderr)
        for f in fallos:
            print("  · " + f, file=sys.stderr)
        return 1

    for bloque in inline["checkpoints"]:
        md = TEMAS / f"{bloque['tema']}.md"
        if not md.exists():
            print(f"ERROR — no existe {md}", file=sys.stderr)
            return 1

        items = []
        for p in bloque["preguntas"]:
            items.append({
                "id": bloque["id"],
                "tema": bloque["tema"],
                "tema_nombre": temas_banco[bloque["tema"]],
                "consigna": " ".join(p["consigna"].split()),
                "opciones": [
                    {"texto": " ".join(o["texto"].split()),
                     "explicacion": " ".join(o["explicacion"].split())}
                    for o in p["opciones"]
                ],
                "correctas": p["correctas"],
                "fuente": p.get("fuente", ""),
            })

        cuerpo = (
            INICIO.format(bloque["id"]) + "\n"
            + '!!! question "Comprobación rápida"\n'
            + "    Antes de seguir leyendo, contestá esto. Si fallás, releé la "
            + "sección de arriba: es más barato ahora que en el examen.\n\n"
            + widget(f"in-{bloque['id']}", {"items": items, "temas": []}) + "\n"
            + FIN.format(bloque["id"])
        )

        texto = md.read_text(encoding="utf-8")
        nuevo, err = insertar(texto, bloque["despues_de"], cuerpo)
        if err:
            print(f"ERROR — {bloque['id']}: {err}", file=sys.stderr)
            return 1
        md.write_text(nuevo, encoding="utf-8")

        por_tema[bloque["tema"]] = por_tema.get(bloque["tema"], 0) + 1
        total_preg += len(items)

    print(
        f"OK  {len(inline['checkpoints'])} checkpoints · {total_preg} preguntas · "
        f"{len(por_tema)}/{len(temas_banco)} temas"
    )
    faltan = sorted(set(temas_banco) - set(por_tema))
    if faltan:
        print("    sin checkpoints todavía: " + ", ".join(faltan))
    return 0


if __name__ == "__main__":
    sys.exit(main())
