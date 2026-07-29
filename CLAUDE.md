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
    Para `von-neumann-y-pila` la única fuente de cátedra es el anexo de la
    clase 01, que son 5 filminas (212 palabras). Es poco: verificar cobertura
    antes de dar el tema por cerrado y marcar TODO lo que falte.

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
- **`nanoMIPS` no aparece en ninguna fuente** (0 hits en 20 PDFs + 4 docx). Hay
  material de WinMIPS64/MIPS64, no de nanoMIPS.

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
- **Tarea 3 — Fichas por tema.** *Pendiente.* Las 11 páginas existen como
  esqueleto con las 7 secciones vacías marcadas TODO.
- **Tarea 4 — Diagramas PlantUML.** *Pendiente.* `docs/diagramas/` está vacío.
- **Tarea 5 — CLAUDE.md.** Hecha (este archivo).

### Diagramas pedidos (Tarea 4)

Basarse en los diagramas **que aparecen en las teorías**. Si en la teoría no hay
diagrama de algo, no inventarlo: dejarlo como TODO.

- ciclo de instrucción con fase de interrupción
- PIC 8259
- estructura interna del módulo de E/S
- comparación de las tres técnicas de gestión de E/S
- jerarquía de memoria
- las tres correspondencias de caché
- cauce de 5 etapas del nanoMIPS con riesgos ← **sin fuente**, ver trampas
- ejecución superescalar
- taxonomía de Flynn con SMP/NUMA/cluster
