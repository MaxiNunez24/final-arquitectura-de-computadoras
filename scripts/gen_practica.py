#!/usr/bin/env python3
"""Genera las páginas de docs/practica/ a partir de los YAML de data/.

Lee tres fuentes de verdad y las cruza:

    data/banco-finales.yml  → los enunciados reales y los simulacros
    data/rubricas.yml       → el checklist de "qué tiene que aparecer"
    data/ejercicios.yml     → quiz, afirmaciones falsas y elección de diagrama

Los datos se embeben en cada página dentro de un <script type="application/json">
en vez de servirse como archivo aparte: sin fetch no hay rutas relativas que
romper con use_directory_urls ni pedidos de red, y el ejercicio anda con la
pestaña sin señal. Los widgets los monta docs/assets/javascripts/practica.js.

Uso:  python3 scripts/gen_practica.py
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import unicodedata
from collections import defaultdict

import yaml

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATA = RAIZ / "data"
OUT = RAIZ / "docs" / "practica"

AVISO = (
    "<!-- Generado por scripts/gen_practica.py desde data/*.yml.\n"
    "     No editar a mano: los cambios se pierden en la próxima corrida. -->\n"
)


def cargar(nombre: str) -> dict:
    return yaml.safe_load((DATA / nombre).read_text(encoding="utf-8"))


def slug(texto: str) -> str:
    """Identificador estable a partir del nombre del simulacro.

    Tiene que ser estable entre corridas: es parte de la clave de
    localStorage donde el alumno tiene su simulacro a medio hacer. Por eso
    no se usa el índice de la lista, que se corre al insertar uno nuevo.
    """
    base = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", base.lower())).strip("-")


def widget(tipo: str, ident: str, datos: dict) -> str:
    """Div de montaje + los datos del widget embebidos como JSON.

    Se escapa '<' para que ninguna cadena del YAML pueda cerrar el <script>
    antes de tiempo.
    """
    crudo = json.dumps(datos, ensure_ascii=False, separators=(",", ":"))
    crudo = crudo.replace("<", "\\u003c")
    return (
        f'<div class="pract" data-tipo="{tipo}" data-datos="{ident}"></div>\n'
        f'<script type="application/json" id="{ident}">{crudo}</script>\n'
    )


def lista_temas(temas: dict[str, str]) -> list[dict]:
    return [{"slug": s, "nombre": n} for s, n in temas.items()]


def main() -> int:
    banco = cargar("banco-finales.yml")
    rubricas = cargar("rubricas.yml")["rubricas"]
    ejercicios = cargar("ejercicios.yml")

    temas: dict[str, str] = banco["temas"]
    preguntas: list[dict] = banco["preguntas"]
    simulacros: list[dict] = banco["simulacros"]

    OUT.mkdir(parents=True, exist_ok=True)

    # --- Índices de rúbricas: por tema y por pregunta ---------------------
    rub_por_tema: dict[str, list[dict]] = defaultdict(list)
    rub_por_pregunta: dict[str, list[dict]] = defaultdict(list)
    for r in rubricas:
        magro = {
            "id": r["id"],
            "titulo": r["titulo"],
            "claves": r["claves"],
            "fuente": r.get("fuente", ""),
            "extension": r.get("extension", ""),
        }
        rub_por_tema[r["tema"]].append(magro)
        for qid in r.get("aplica_a") or []:
            rub_por_pregunta[qid].append(magro)

    sin_rubrica = sorted(t for t in temas if t not in rub_por_tema)

    # --- Enunciado → id de pregunta ---------------------------------------
    # Los incisos de los simulacros SON las preguntas del banco: salen de los
    # mismos archivos. Cruzándolos podemos ofrecer al corregir la rúbrica del
    # inciso concreto en vez de las 5 del tema.
    def palabras(texto: str) -> set[str]:
        base = unicodedata.normalize("NFKD", texto.lower())
        base = base.encode("ascii", "ignore").decode()
        # Se descartan las de 3 letras o menos: artículos y preposiciones no
        # aportan nada al parecido y sí ensucian el coeficiente.
        return {w for w in re.findall(r"[a-z0-9]+", base) if len(w) > 3}

    redacciones: list[tuple[set[str], str]] = []
    for p in preguntas:
        redacciones.append((palabras(p["enunciado"]), p["id"]))
        for v in p.get("variantes") or []:
            redacciones.append((palabras(v["enunciado"]), p["id"]))

    def rubricas_del_inciso(enunciado: str, tema: str) -> list[dict]:
        """Rúbricas de la pregunta que más se parece al inciso.

        Jaccard sobre el vocabulario. Con 0,5 alcanza: las redacciones de un
        mismo punto entre años difieren en el verbo y poco más. Si no llega,
        se devuelve vacío y el JS cae a mostrar las del tema.
        """
        mias = palabras(enunciado)
        if not mias:
            return []
        mejor, puntaje = None, 0.0
        for otras, qid in redacciones:
            union = mias | otras
            if not union:
                continue
            j = len(mias & otras) / len(union)
            if j > puntaje:
                mejor, puntaje = qid, j
        if mejor and puntaje >= 0.5 and rub_por_pregunta.get(mejor):
            return rub_por_pregunta[mejor]
        return []

    # ------------------------------------------------------------------
    # 1) Simulacro cronometrado
    # ------------------------------------------------------------------
    sims = []
    for s in simulacros:
        if not s.get("completo"):
            continue
        sims.append({
            "id": s.get("id") or slug(s["nombre"]),
            "nombre": s["nombre"],
            "fecha": s.get("fecha", ""),
            "nota": " ".join((s.get("nota") or "").split()),
            "puntos": [
                {
                    "numero": p["numero"],
                    "titulo": p.get("titulo", ""),
                    "incisos": [
                        {
                            "letra": inc.get("letra", ""),
                            "enunciado": " ".join(inc["enunciado"].split()),
                            "tema": inc["tema"],
                            "tema_nombre": temas.get(inc["tema"], inc["tema"]),
                            # Vacío = el JS cae a las rúbricas del tema
                            "rubricas": rubricas_del_inciso(
                                inc["enunciado"], inc["tema"]
                            ),
                        }
                        for inc in p["incisos"]
                    ],
                }
                for p in s["puntos"]
            ],
        })

    n_incisos = sum(len(p["incisos"]) for s in sims for p in s["puntos"])

    (OUT / "simulacro.md").write_text(
        AVISO
        + "# Simulacro cronometrado\n\n"
        f"Los **{len(sims)} finales completos** del banco, con **reloj de 3 horas**, "
        "una sola entrega y **sin corrección automática**. Al entregar aparece la "
        "rúbrica de cada inciso para que te corrijas vos.\n\n"
        '!!! danger "Esto es lo más parecido al examen que hay en el sitio"\n'
        "    El final se pierde por no poder **redactar** en el tiempo, no por no "
        "entender. Hacelo **a mano en papel** si podés, y usá el reloj de acá "
        "sólo para cronometrar. Si escribís en el cuadro de texto, no uses "
        "corrector ni busques nada: no vas a tener eso el 26/8.\n\n"
        + widget("simulacro", "d-sim", {
            "simulacros": sims,
            "rubricas": dict(rub_por_tema),
        })
        + "\n"
        '<p class="fuentes">Fuente: <code>data/banco-finales.yml</code> '
        "(enunciados textuales de <code>fuentes/Finales/</code>) y "
        "<code>data/rubricas.yml</code>.</p>\n",
        encoding="utf-8",
    )

    # ------------------------------------------------------------------
    # 2) Fichas de recuperación activa
    # ------------------------------------------------------------------
    fichas = []
    for p in preguntas:
        fichas.append({
            "id": p["id"],
            "tema": p["tema"],
            "tema_nombre": temas.get(p["tema"], p["tema"]),
            "enunciado": " ".join(p["enunciado"].split()),
            "fechas": p.get("fechas") or [],
            "variantes": len(p.get("variantes") or []),
            "rubricas": rub_por_pregunta.get(p["id"], []),
        })

    con_rub = sum(1 for f in fichas if f["rubricas"])

    (OUT / "fichas.md").write_text(
        AVISO
        + "# Fichas de recuperación activa\n\n"
        f"Las **{len(fichas)} preguntas canónicas** del banco, una por vez. "
        "Leés el enunciado, **contestás de memoria en voz alta o en papel**, y "
        "recién ahí das vuelta la ficha para ver qué tenía que aparecer.\n\n"
        '!!! tip "Leer la respuesta antes de intentarla no sirve"\n'
        "    El efecto de recuperación activa viene de **fallar intentando**. Si "
        "mirás el dorso primero, esto se convierte en un resumen más.\n\n"
        f"**{con_rub} de {len(fichas)}** fichas tienen rúbrica cargada. El resto "
        "manda a la ficha del tema.\n\n"
        + widget("fichas", "d-fichas", {
            "fichas": fichas,
            "temas": lista_temas(temas),
            "base": "../../",
        })
        + "\n"
        '<p class="fuentes">Fuente: <code>data/banco-finales.yml</code> y '
        "<code>data/rubricas.yml</code>.</p>\n",
        encoding="utf-8",
    )

    # ------------------------------------------------------------------
    # 3) y 4) Opción múltiple  ·  Afirmación falsa
    # ------------------------------------------------------------------
    def items_de(tipo: str) -> list[dict]:
        out = []
        for it in ejercicios["opciones"]:
            if it.get("tipo", "multiple") != tipo:
                continue
            out.append({
                "id": it["id"],
                "tema": it["tema"],
                "tema_nombre": temas.get(it["tema"], it["tema"]),
                "consigna": " ".join(it["consigna"].split()),
                "opciones": [
                    {
                        "texto": " ".join(o["texto"].split()),
                        "explicacion": " ".join((o.get("explicacion") or "").split()),
                    }
                    for o in it["opciones"]
                ],
                "correctas": it["correctas"],
                "fuente": it.get("fuente", ""),
            })
        return out

    multiples = items_de("multiple")
    falsas = items_de("falsa")

    def temas_cubiertos(items: list[dict]) -> list[dict]:
        usados = {i["tema"] for i in items}
        return [t for t in lista_temas(temas) if t["slug"] in usados]

    (OUT / "quiz.md").write_text(
        AVISO
        + "# Quiz conceptual\n\n"
        f"**{len(multiples)} preguntas** de opción múltiple para chequear "
        "concepto rápido. Algunas tienen **más de una respuesta correcta**: el "
        "widget te avisa cuando es el caso.\n\n"
        '!!! warning "Esto no reemplaza escribir"\n'
        "    Reconocer la respuesta correcta entre cuatro es **mucho más fácil** "
        "que producirla en una hoja en blanco. Sirve para detectar agujeros, no "
        "para saber si estás listo. Para eso está el "
        "[simulacro](simulacro.md).\n\n"
        + widget("opciones", "d-quiz", {
            "items": multiples,
            "temas": temas_cubiertos(multiples),
        })
        + "\n"
        '<p class="fuentes">Fuente: <code>data/ejercicios.yml</code>. Cada ítem '
        "cita al pie la filmina de la que salen sus opciones.</p>\n",
        encoding="utf-8",
    )

    (OUT / "afirmaciones.md").write_text(
        AVISO
        + "# Detectá la afirmación falsa\n\n"
        f"**{len(falsas)} ejercicios**: tres o cuatro afirmaciones sobre un tema, "
        "**una es falsa**. Entrena la lectura crítica que piden los enunciados "
        "que dicen *analice* y *compare*.\n\n"
        '!!! info "Por qué este formato"\n'
        "    Las afirmaciones falsas de acá no son inventadas: son cosas que la "
        "teoría **sí dice**, puestas donde no corresponden —la ventaja de "
        "`write-through` atribuida a `write-back`, el registro `ISR` donde va el "
        "`IRR`—. Son exactamente los cruces que se hacen bajo presión a las dos "
        "horas y media de examen.\n\n"
        + widget("opciones", "d-falsas", {
            "items": falsas,
            "temas": temas_cubiertos(falsas),
        })
        + "\n"
        '<p class="fuentes">Fuente: <code>data/ejercicios.yml</code>.</p>\n',
        encoding="utf-8",
    )

    # ------------------------------------------------------------------
    # 5) Elegí el diagrama correcto
    # ------------------------------------------------------------------
    # docs/practica/diagramas.md se sirve en /practica/diagramas/, así que
    # los SVG de docs/diagramas/ quedan dos niveles arriba.
    difs = []
    for it in ejercicios["diagramas"]:
        difs.append({
            "id": it["id"],
            "tema": it["tema"],
            "tema_nombre": temas.get(it["tema"], it["tema"]),
            "consigna": " ".join(it["consigna"].split()),
            "opciones": [
                {"svg": f"../../diagramas/{o['svg']}.svg"} for o in it["opciones"]
            ],
            "correcta": it["correcta"],
            "explicacion": " ".join(it["explicacion"].split()),
            "fuente": it.get("fuente", ""),
        })

    (OUT / "diagramas.md").write_text(
        AVISO
        + "# Elegí el diagrama correcto\n\n"
        f"**{len(difs)} ejercicios** de memoria visual sobre los 13 diagramas del "
        "sitio. Se te da el concepto y elegís cuál es su esquema.\n\n"
        '!!! tip "Para qué sirve"\n'
        "    Varios enunciados arrancan con **«esquematice y describa»**. Si el "
        "dibujo no te sale solo, la respuesta empieza mal. Acá el objetivo es que "
        "reconozcas la **forma** del diagrama antes de tener que reproducirla.\n\n"
        '!!! warning "Si no ves las miniaturas"\n'
        "    Los `.svg` se generan en el build y no están versionados. En un "
        "checkout limpio hay que correr `bash scripts/render_puml.sh` antes de "
        "`mkdocs serve`. En el sitio publicado ya vienen renderizados.\n\n"
        + widget("diagramas", "d-difs", {"items": difs})
        + "\n"
        '<p class="fuentes">Fuente: <code>data/ejercicios.yml</code> y los '
        "<code>.puml</code> de <code>docs/diagramas/</code>.</p>\n",
        encoding="utf-8",
    )

    # ------------------------------------------------------------------
    # Portada de la sección
    # ------------------------------------------------------------------
    faltantes = ""
    if sin_rubrica:
        filas = "\n".join(
            f"    - **{temas[s]}** — al corregir, el simulacro manda a la ficha"
            for s in sin_rubrica
        )
        faltantes = (
            '\n!!! warning "Temas todavía sin rúbrica"\n'
            "    Estos temas no tienen cargado el checklist de autocorrección:\n\n"
            f"{filas}\n"
        )

    (OUT / "index.md").write_text(
        AVISO
        + "# Práctica\n\n"
        "La parte del sitio donde **producís** en vez de leer. Todo corre en el "
        "navegador y el progreso se guarda **en este dispositivo**: si abrís el "
        "sitio en la compu, arrancás de cero.\n\n"
        '<div class="grid cards" markdown>\n\n'
        "- :material-timer: **[Simulacro cronometrado](simulacro.md)**\n\n"
        f"    {len(sims)} finales completos, 3 horas reloj, rúbrica al entregar.\n\n"
        "- :material-cards: **[Fichas de recuperación activa](fichas.md)**\n\n"
        f"    {len(fichas)} preguntas reales, una por vez, de memoria.\n\n"
        "- :material-help-circle: **[Quiz conceptual](quiz.md)**\n\n"
        f"    {len(multiples)} preguntas de opción múltiple.\n\n"
        "- :material-alert-circle: **[Detectá la afirmación falsa](afirmaciones.md)**\n\n"
        f"    {len(falsas)} ejercicios de lectura crítica.\n\n"
        "- :material-image-search: **[Elegí el diagrama correcto](diagramas.md)**\n\n"
        f"    {len(difs)} ejercicios de memoria visual.\n\n"
        "</div>\n\n"
        "## En qué orden usarlas\n\n"
        "Leés la [ficha del tema](../temas/index.md), y recién después venís acá. "
        "El quiz y las afirmaciones sirven para **detectar agujeros** en un rato "
        "muerto; las fichas, para **producir de memoria**; el simulacro, para "
        "saber si llegás con el tiempo. Reconocer no es lo mismo que redactar: "
        "sólo el simulacro y las fichas te dicen si podés escribir la respuesta.\n\n"
        "## Cómo está hecho\n\n"
        "No hay servidor ni corrección automática de texto: los datos salen de "
        "`data/banco-finales.yml`, `data/rubricas.yml` y `data/ejercicios.yml`, "
        "y los arma `scripts/gen_practica.py`. Para agregar ejercicios se editan "
        "esos YAML y se corre el script.\n\n"
        '!!! danger "Los distractores tampoco se inventan"\n'
        "    La [regla número uno](../index.md) también rige acá. Las opciones "
        "incorrectas de un quiz son afirmaciones que **la teoría sí hace**, "
        "puestas donde no corresponden. Por eso **no hay ejercicios de cálculo** "
        "salvo donde la cátedra desarrolla el cálculo: ver "
        "[TODOs](../todos.md).\n"
        + faltantes,
        encoding="utf-8",
    )

    print(
        f"OK  {len(sims)} simulacros ({n_incisos} incisos) · {len(fichas)} fichas "
        f"({con_rub} con rúbrica) · {len(multiples)} quiz · {len(falsas)} falsas · "
        f"{len(difs)} diagramas"
    )
    if sin_rubrica:
        print("    sin rúbrica todavía: " + ", ".join(sin_rubrica))
    return 0


if __name__ == "__main__":
    sys.exit(main())
