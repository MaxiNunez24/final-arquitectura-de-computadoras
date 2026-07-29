# Sitio de estudio — Arquitectura de Computadoras (UNLP)

Contexto para futuras sesiones. Leer entero antes de tocar contenido.

## Qué es esto

Sitio MkDocs Material para estudiar el **final de Arquitectura de Computadoras**
(UNLP). El material fuente vive en `./fuentes/` y **no está versionado**
(está en `.gitignore`: son PDFs pesados y material de cátedra).

**Fecha del final: 26/8.** Se lee principalmente desde el celular → el diseño es
mobile-first y eso no es negociable.

## Contexto del examen

- Final **escrito y teórico**. **No se toma assembly.**
- **5 puntos con subincisos a) y b)**. Entra todo el programa.
- **3 horas reloj.**
- Los enunciados usan: *describa*, *analice*, *compare*, *esquematice*,
  *¿cómo…?*, *¿de qué depende…?*.

Confirmado en `fuentes/Finales/Características de los finales de Arquitectura de
Computadoras.pdf`, que además trae el programa analítico completo (5 unidades) y
la bibliografía de la cátedra (Stallings es el texto base).

---

## REGLA NÚMERO UNO — no inventar contenido

Este material se usa para rendir un examen. **Contenido inventado o "completado
con criterio propio" es peor que no tener nada.**

- Todo contenido conceptual sale de `./fuentes/`. Sin excepciones.
- Si algo no está en las fuentes: escribir `<!-- TODO: falta en fuentes -->` y
  **dejar la sección vacía**. No completar con conocimiento general del modelo.
- **No reescribir ni "mejorar" definiciones técnicas.** Transcribir el sentido
  con fidelidad.
- Los enunciados de finales van **textuales**, incluidas las erratas del
  original (`SMTP` por `SMP`, `tanoxomía` por `taxonomía`, `cause` por `cauce`).
  Marcar `[sic]` sólo cuando la errata pueda confundir al leer.

## Jerarquía de fuentes

Cuando dos fuentes se contradicen, gana la de arriba. La discrepancia se anota
con un bloque `!!! warning` explicando qué dice cada una.

1. **Teorías de cátedra** — `fuentes/Teorías/0X Arq claseX *.pdf` y los anexos.
   Fuente primaria.
2. **Prácticas resueltas** — `fuentes/Prácticas/Practica N - Resolución - AC25.pdf`.
   Para los "ejemplos del curso".
3. **Resúmenes de alumnos** — Karim, Guaymas, Alfonso, `Resumen_*`. Sólo cuando
   la teoría no cubre el punto, y siempre señalados como tales.

## Convención de citas

Cada sección cierra con la fuente al pie, en un bloque con clase `fuentes`:

```html
<p class="fuentes">Fuente: <code>Teorías/02 Arq clase2 Interrupciones.pdf</code>, fil. 12–15.</p>
```

- Para las teorías (que son filminas): **filmina/s**, `fil. N` o `fil. N–M`.
- Para PDFs de texto corrido: **página**, `p. N`.
- Ruta relativa a `fuentes/`, sin el prefijo `fuentes/`.
- Si una sección mezcla dos fuentes, se citan las dos.

---

## Mapa de fuentes → temas

Las 12 teorías cubren los 11 temas de las fichas así:

| Tema (slug) | Teoría principal |
|---|---|
| `interrupciones` | `02 Arq clase2 Interrupciones.pdf` (+ `2 anexo clase 02 ejer_int_en _MSX88.pdf`) |
| `entrada-salida` | `03 Arq clase3 EntradaSalida.pdf` |
| `dma` | `03 Arq clase3 EntradaSalida.pdf` |
| `memoria-cache` | `07 Arq clase7 Memoria.pdf` |
| `segmentacion` | `04 Arq clase4 Segmentación de cauce.pdf` |
| `soluciones-segmentacion` | `05 Arq clase5 Algunas soluciones.pdf` |
| `risc-cisc` | `06 Arq clase6 RISC.pdf` (+ `6 anexo clase 06 sobre_winmips.pdf`) |
| `superescalares` | `08 Arq clase8 Procesadores Superescalares.pdf` |
| `paralelismo` | `09 Arq clase9 Procesamiento paralelo.pdf` |
| `buses` | `7 anexo clase 07 sobre_buses.pdf` |
| `von-neumann-y-pila` | `1 anexo clase 01 sobre maq_de_Ndir.pdf` |

!!! warning "No existe la clase 1"
    `fuentes/Teorías/` va de la **clase 02 a la 09**. No hay `01 Arq clase1`.
    Para `von-neumann-y-pila` la única fuente de cátedra específica es el anexo de
    la clase 01, que son 5 filminas (212 palabras) y sólo cubre **máquinas de N
    direcciones**. **Resuelto en la Tarea 3** apoyándose en:

    - `Prácticas/Practica 4 - Resolución - AC2025.pdf` — *"Pila, Subrutina y
      Convención"*, para el ejemplo del curso.
    - Resúmenes de alumnos (`Resumen Arquitectura (2).pdf`, Guaymas, oct2022) para
      pila / subrutinas / pasaje de parámetros, **marcados como tales en cada
      sección**.

    Es el tema más flojo del sitio: **verificar contra Stallings caps. 3, 10 y 11**.

### Prácticas → temas

| Práctica | Tema al que alimenta |
|---|---|
| `Practica 2 - E_S - Resolución - AC25.pdf` | `entrada-salida` — PIO (PA/PB/CA/CB), protocolo Centronics (busy/strobe/data), consulta de estado |
| `Practica 3 - Interrupciones por Hardware - Resolución - AC25.pdf` | `interrupciones` — registros del PIC con ejemplos, tabla de IMR, CLI/STI, EOI, la regla del ×4 para el vector |
| `Practica 4 - Resolución - AC2025.pdf` | `von-neumann-y-pila` y `risc-cisc` — convención de registros MIPS, `jal`/`jr`, anidamiento, PUSH/POP a mano, pasaje por registros/referencia/pila |

!!! note "Las prácticas usan VonSim y WinMIPS64; las teorías, MSX88"
    Las teorías (clase 2 y su anexo) están escritas sobre **MSX88**; las prácticas
    resueltas AC24/AC25 usan **VonSim** y **WinMIPS64**. Las direcciones de los
    registros del PIC coinciden. **No es una contradicción**: es el mismo modelo de
    máquina con distinta herramienta. Ya está anotado en la ficha de
    `entrada-salida`.

## Trampas ya verificadas en las fuentes

No volver a investigar esto, ya está confirmado con `sha256sum` y análisis de texto:

- `Arquitectura_finales_parte1.pdf` y `SF - AC Final - 40.pdf` son **el mismo
  archivo** (sha256 idéntico). Citar una sola vez.
- `Finales arq Alfonso _resueltos.docx` y `Preguntas del Final Arquitectura
  Hasta 2014.pdf` comparten el **99,1%** del vocabulario: mismo documento, dos
  formatos. Se cita el PDF, que conserva mejor el formato de las fechas.
- Los 3 PDFs de `Set de Instrucciones/` están **duplicados** dentro de
  `Finales/` (sha256 idéntico).
- `Finales 2010.docx` **no trae finales** pese al nombre: es un único desarrollo
  respondido sobre buses, con 6 imágenes del anexo de la clase 07.
- `2015 - AC Final - 01.pdf` es una **imagen escaneada** (CCITT 1656×2339, sin
  capa de texto). No hay modelo de tesseract en español instalado (sólo `eng` +
  `osd`), así que **no se OCReó**: queda para transcripción manual. Decisión
  tomada explícitamente para no meter texto dudoso en enunciados que tienen que
  ser textuales.
- ~~**`nanoMIPS` no aparece en ninguna fuente**~~ — **CORREGIDO en la Tarea 3.**
  Ese chequeo se hizo **antes de que se subieran las teorías**. El **nanoMIPS es el
  procesador de referencia de la clase 4 entera** (`04 Arq clase4 Segmentación de
  cauce.pdf`, fil. 4–26 y 45–54) y reaparece en la clase 5. **El diagrama del cauce
  de 5 etapas con riesgos sí tiene fuente.** El `6 anexo clase 06 sobre_winmips.pdf`
  es material del **MIPS64/WinMIPS64**, que es distinto pero compatible: mismas 5
  etapas, con los nombres IF/ID/EX/MEM/WB en lugar de F/D/X/M/W.

- **`09 Arq clase9` se contradice sobre dónde cae el cluster.** Fil. 6, 17 y 26 lo
  clasifican como **MIMD de memoria distribuida** (separado de NUMA, que es memoria
  compartida), pero fil. 33 pone *"Ej: Cluster"* como ejemplo de **NUMA** y fil. 31
  llama NUMA al SGI Origin dentro del apartado de clusters. **Prevalece fil. 6/17/26**;
  ya está documentado con un `!!! warning` en la ficha de `paralelismo`.

- **Erratas de las propias filminas ya detectadas.** `09 Arq clase9` fil. 14 dice
  *"no cumplen los requisitos para ser exactamente tipo **SIMD**"* hablando de MISD.
  Marcado con `[sic]` en la ficha.

- **Temas nombrados pero no desarrollados en las fuentes de cátedra** (quedaron con
  TODO en las fichas):
    - **SCSI** — aparece sólo en los esquemas de jerarquía de buses (`7 anexo clase
      07`, fil. 14 y 38), sin ninguna filmina que lo explique.
    - **Temporización asíncrona de bus** — fil. 22 es **sólo el cronograma**
      (MSYN/SSYN), sin texto descriptivo, a diferencia de la síncrona (fil. 20).
    - **Intel Core i7** — fil. 41 es una imagen sin texto ni cálculo de anchos de
      banda, a diferencia del resto de los chipsets.
    - **Ejemplo numérico de DMA** — la clase 3 desarrolla el ejemplo
      impresora/disco sólo para comparar espera vs. interrupción; **no lo extiende
      al DMA**.

---

## Estructura del repo

```
data/banco-finales.yml     Fuente de verdad del banco de finales
scripts/gen_banco.py       Genera docs/finales/ desde el YAML
scripts/render_puml.sh     Pre-renderiza docs/diagramas/*.puml a SVG
docs/temas/                Las 11 fichas por tema
docs/finales/              Generado — NO editar a mano
docs/diagramas/            Los .puml versionados (los .svg se generan)
mkdocs.yml
.github/workflows/deploy.yml
```

### Flujos

```bash
python3 scripts/gen_banco.py    # tras editar data/banco-finales.yml
bash scripts/render_puml.sh     # tras editar cualquier .puml
mkdocs build --strict           # tiene que pasar limpio
mkdocs serve                    # previsualizar
```

**`docs/finales/*.md` es generado.** Editarlo a mano no sirve: se pisa. Los
cambios van en `data/banco-finales.yml`.

**Los diagramas se pre-renderizan a SVG en el build**, no en runtime. El sitio
publicado no depende de ningún servidor PlantUML externo. Los `.puml` van
versionados; los `.svg` están en `.gitignore`.

## Estructura fija de una ficha de tema

Las 11 páginas de `docs/temas/` llevan **siempre** estas 7 secciones, en este
orden, aunque alguna quede vacía con TODO:

1. Definición
2. Desarrollo (mecanismo / estructura / clasificación)
3. Diagrama (PlantUML, si aplica)
4. Ventajas y desventajas o comparaciones
5. Ejemplo del curso
6. Preguntas de final sobre este tema (link a `../finales/temas/<slug>.md`)
7. Fuentes citadas

---

## Estado actual

- **Tarea 1 — Scaffold.** Hecha. MkDocs Material mobile-first, dark toggle,
  búsqueda en español, CI a GH Pages, pre-render de PlantUML.
  Pendiente: `site_url` en `mkdocs.yml` está vacío, completar con la URL real.
- **Tarea 2 — Banco de finales.** Hecha. 44 preguntas canónicas, 86 variantes,
  12 simulacros.
- **Tarea 3 — Fichas por tema.** Hecha. Las 11 páginas escritas desde las teorías,
  ~39.500 palabras. Quedan **4 TODO**, todos por ausencia real en las fuentes
  (SCSI, temporización asíncrona, Core i7, ejemplo numérico de DMA).
  **La sección "Diagrama" de cada ficha está vacía a propósito**, con un comentario
  HTML que dice qué diagrama va y de qué filminas sale: se completa en la Tarea 4.
- **Tarea 4 — Diagramas PlantUML.** *Pendiente.* `docs/diagramas/` está vacío.
- **Tarea 5 — CLAUDE.md.** Hecha (este archivo).

### Diagramas pedidos (Tarea 4)

Basarse en los diagramas **que aparecen en las teorías**. Si en la teoría no hay
diagrama de algo, no inventarlo: dejarlo como TODO.

Los 9 pedidos, con la filmina de la que sale cada uno (relevado en la Tarea 3; cada
ficha tiene el mismo dato en un comentario HTML dentro de su sección "Diagrama"):

| Diagrama | Fuente | Ficha destino |
|---|---|---|
| ciclo de instrucción con fase de interrupción | `02 Arq clase2`, fil. 22–23, 25 | `interrupciones` |
| PIC 8259 | `02 Arq clase2`, fil. 33, 35, 43 | `interrupciones` |
| estructura interna del módulo de E/S | `03 Arq clase3`, fil. 12 | `entrada-salida` |
| comparación de las tres técnicas de gestión de E/S | `03 Arq clase3`, fil. 24–28, 44 | `entrada-salida`, `dma` |
| jerarquía de memoria | `07 Arq clase7`, fil. 8, 11 | `memoria-cache` |
| las tres correspondencias de caché | `07 Arq clase7`, fil. 43, 44–45, 48–49, 52–53 | `memoria-cache` |
| **cauce de 5 etapas del nanoMIPS con riesgos** | `04 Arq clase4`, fil. 46, 49, 52, 54, 59, 61, 64–66 (+ `05 Arq clase5`, fil. 14, 16, 23, 26 para forwarding) — **sí tiene fuente**, ver trampas | `segmentacion`, `soluciones-segmentacion` |
| ejecución superescalar | `08 Arq clase8`, fil. 44 (+ fil. 9, 10, 12, 18 para la comparación segmentada/supersegmentada/superescalar) | `superescalares` |
| taxonomía de Flynn con SMP/NUMA/cluster | `09 Arq clase9`, fil. 6 (+ fil. 7, 9, 12, 15, 16 para los esquemas funcionales) | `paralelismo` |

Extras que las fichas dejaron señalados y valdría la pena dibujar:

- interconexión mediante un bus / bus tradicional / bus de altas prestaciones —
  `7 anexo clase 07`, fil. 11, 14, 38 → `buses`
- modelo de von Neumann de 3 subsistemas — `03 Arq clase3`, fil. 3 →
  `von-neumann-y-pila`
- evolución de las máquinas de N direcciones — `1 anexo clase 01`, fil. 1–5 →
  `von-neumann-y-pila`
- ventana de registros y su buffer circular — `06 Arq clase6`, fil. 28, 32, 34, 36
  → `risc-cisc`

**No dibujar la estructura de la pila (SP / base / límite):** sólo está descrita en
texto en resúmenes de alumnos, no hay diagrama de cátedra.
