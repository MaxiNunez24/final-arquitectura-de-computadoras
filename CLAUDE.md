# Sitio de estudio — Arquitectura de Computadoras (UNLP)

Contexto para futuras sesiones. Leer entero antes de tocar contenido.

## Qué es esto

Sitio MkDocs Material para estudiar el **final de Arquitectura de Computadoras**
(UNLP). El material fuente vive en `./fuentes/` y **no está versionado**
(está en `.gitignore`: son PDFs pesados y material de cátedra).

**Fecha del final: mesa de septiembre, PROVISORIA (ver aviso).** Se lee principalmente
desde el celular → el diseño es mobile-first y eso no es negociable.

!!! danger "No se presentó al 19/8: la mesa pasa a septiembre"
    Actualizado el **18/8/2026**. La fecha nueva está **sin confirmar**:
    `data/plan.yml` tiene `meta.final: 2026-09-16` y
    `meta.fecha_confirmada: false`, lo que hace que el sitio muestre un aviso
    rojo. **En cuanto se sepa la fecha real, cambiar esa línea y correr
    `python3 scripts/gen_plan.py`**: el calendario entero se recalcula.

    Con un mes por delante la vara para agregar cosas vuelve a ser normal, y
    se completó lo que había quedado afuera por tiempo (checkpoints inline).

!!! warning "Mirá el reloj, no las notas viejas"
    El plan de estudio se armó una vez sobre una fecha **supuesta**, sacada de
    una nota de este mismo archivo en vez del reloj del sistema, y quedó
    corrido dos días. Antes de tocar `data/plan.yml` o cualquier cosa con
    fechas: `date`. `scripts/gen_plan.py` ahora **aborta** si el plan arranca
    antes de hoy.

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
data/rubricas.yml          Checklists de autocorrección ("qué tiene que aparecer")
data/ejercicios.yml        Quiz, afirmaciones falsas y elección de diagrama
data/plan.yml              Plan de estudio en bloques semanales RELATIVOS
data/conceptos.yml         Chips de "¿qué no puede faltar?" y secuencias a ordenar
data/inline.yml            Checkpoints que se inyectan DENTRO de docs/temas/*.md
scripts/gen_banco.py       Genera docs/finales/ desde el YAML
scripts/gen_practica.py    Genera docs/practica/ desde los 3 YAML
scripts/gen_plan.py        Genera docs/plan.md desde plan.yml + banco-finales.yml
scripts/gen_inline.py      Inyecta checkpoints en las fichas (idempotente, --quitar)
scripts/render_puml.sh     Pre-renderiza docs/diagramas/*.puml a SVG
docs/temas/                Las 11 fichas por tema
docs/finales/              Generado — NO editar a mano
docs/practica/             Generado — NO editar a mano
docs/diagramas/            Los .puml versionados (los .svg se generan)
docs/assets/javascripts/practica.js    Motor de los widgets (JS plano)
docs/assets/stylesheets/practica.css
mkdocs.yml
.github/workflows/deploy.yml
```

### Flujos

```bash
python3 scripts/gen_banco.py     # tras editar data/banco-finales.yml
python3 scripts/gen_practica.py  # tras editar cualquiera de los 3 YAML de data/
python3 scripts/gen_plan.py      # tras editar data/plan.yml
python3 scripts/gen_inline.py    # tras editar data/inline.yml
python3 scripts/gen_inline.py --quitar   # saca los checkpoints de las fichas
bash scripts/render_puml.sh      # tras editar cualquier .puml
mkdocs build --strict            # tiene que pasar limpio
mkdocs serve                     # previsualizar
```

**`docs/finales/*.md` y `docs/practica/*.md` son generados.** Editarlos a mano
no sirve: se pisan. Los cambios van en los YAML de `data/`.

!!! warning "En local, `mkdocs build --strict` aborta con 28 warnings"
    Son **todas** por los `.svg` faltantes: están en `.gitignore` y se generan
    en el build. Corré `bash scripts/render_puml.sh` antes y quedan en cero. En
    CI ya corre en ese orden. **Si aparece un warning que no sea de un `.svg`,
    ése sí es real.**

    `mkdocs serve` **no recarga** los cambios de los archivos generados: hay que
    reiniciarlo.

**Los diagramas se pre-renderizan a SVG en el build**, no en runtime. El sitio
publicado no depende de ningún servidor PlantUML externo. Los `.puml` van
versionados; los `.svg` están en `.gitignore`.

## La sección de práctica

`docs/practica/` son **widgets de JS plano dentro del MkDocs**. No hay build
extra, ni framework, ni segundo deploy. Los datos van **embebidos en cada página**
como `<script type="application/json">`: sin `fetch` no hay rutas relativas que
romper con `use_directory_urls`, y anda con la pestaña sin señal.

### Por qué NO se replicó el stack del otro proyecto

Existe un curso hermano con **Astro + Starlight + Pyodide** (Python real
corregido en el navegador). **Acá no aplica:** este final es escrito y teórico,
**no se toma programación**. Montar un intérprete de Python para un examen donde
no se escribe una línea de código es traer la infraestructura sin la carga.

Lo que sí se tomó de ese stack es **el patrón**: teoría y práctica separadas y
linkeadas, ejercicio cada tanto, progreso en `localStorage`. Los componentes que
transfieren son opción múltiple, "encontrá el error" (reformulado como
**afirmación falsa**) y el **modo parcial** sin feedback instantáneo. Los que no
transfieren son todos los que dependen de ejecutar código.

### Los 5 formatos

| Página | Widget | De dónde salen los datos |
|---|---|---|
| `simulacro.md` | Reloj de 3 h, autoguardado, una entrega, rúbrica al entregar | `banco-finales.yml` + `rubricas.yml` |
| `fichas.md` | Recuperación activa con repetición espaciada por cajones | `banco-finales.yml` + `rubricas.yml` |
| `quiz.md` | Opción múltiple (admite varias correctas) | `ejercicios.yml`, `tipo: multiple` |
| `afirmaciones.md` | Detectá la afirmación falsa | `ejercicios.yml`, `tipo: falsa` |
| `diagramas.md` | Elegí el diagrama correcto | `ejercicios.yml`, sección `diagramas` |

Los últimos tres comparten el mismo motor: una consigna, N opciones, una o
varias correctas y explicación por opción.

### Cómo se cruzan los incisos con las rúbricas

Los incisos de los simulacros **son** las preguntas del banco: salen de los
mismos archivos. `gen_practica.py` los cruza por **Jaccard sobre el vocabulario**
(palabras de más de 3 letras, umbral 0,5) y así ofrece al corregir **la rúbrica
del enunciado concreto** en vez de las 5 del tema. Cobertura actual: **92 de 98
incisos**. Los que no matchean caen a las del tema, con un aviso.

### REGLA NÚMERO UNO aplicada a los ejercicios

**Un distractor inventado es contenido inventado, y es peor que en una ficha**,
porque se lee como un error *ya verificado*.

- ✅ **Recombinar la fuente.** El distractor es una afirmación que la teoría
  **sí hace**, puesta donde no corresponde: el `ISR` ofrecido donde va el `IRR`,
  la ventaja de `write-through` atribuida a `write-back`, los campos de la
  correspondencia directa ofrecidos como respuesta sobre la asociativa. Todo el
  material existe en las fuentes; lo único que se arma es el cruce.
- ❌ **Fabricar.** Números que la cátedra no dio, mecanismos que no describió,
  "consecuencias lógicas" deducidas por criterio propio.

**Por eso no hay ejercicios de cálculo.** Se relevaron las 11 fichas buscando
CPI, speedup, tasa de aciertos y ancho de banda: **sólo `memoria-cache` (tiempo
de acceso medio), `buses` (anchos de banda de los chipsets) y `entrada-salida`
(impresora/disco) traen cálculo desarrollado**. `segmentacion` no tiene ni una
fórmula de speedup, y `paralelismo`, `risc-cisc` y `dma` no tienen ningún
cálculo. Inventar los números sería exactamente lo que el proyecto no hace.

En `rubricas.yml`, el campo `extension` **es lo único orientativo**: es criterio
de estudio (cuánto escribiría un alumno para aprobar ese punto), no sale de las
fuentes. Los `claves` y la `fuente` sí.

---

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
- **Tarea 4 — Diagramas PlantUML.** Hecha. **13 diagramas** en `docs/diagramas/`
  (los 9 pedidos + 4 extras), insertados en la sección "Diagrama" de cada ficha y
  reunidos en `docs/diagramas/index.md`.
- **Tarea 5 — CLAUDE.md.** Hecha (este archivo).
- **Tarea 6 — Práctica interactiva.** Hecha. 5 formatos en `docs/practica/`:
  **35 rúbricas con 279 puntos de checklist** (44/44 fichas y 92/98 incisos de
  simulacro reciben la rúbrica de su enunciado), **44 preguntas de quiz**,
  **14 afirmaciones falsas** y **13 ejercicios de diagramas**. Los 11 temas
  quedan cubiertos en los tres formatos.

  Los ítems del quiz de la segunda tanda se escribieron **leyendo las filminas**,
  no las fichas. Se verificó primero que **la página del PDF sea el número de
  filmina** —está impreso en cada diapositiva— así que las citas del sitio son
  correctas.
- **Tarea 7 — Libro interactivo y plan mensual.** Hecha (18/8/2026).
  **30 checkpoints con 35 preguntas** inyectados dentro de las 11 fichas con
  `gen_inline.py`, que es **idempotente** y tiene `--quitar` como inverso exacto.
  El plan pasó a **4 bloques semanales con fechas relativas** a `meta.final`.
  `site_url` dejó de estar vacío.
- **TODOs.** `docs/todos.md` lista los 4 huecos reales, agrupados por tema.

### Backlog que sigue abierto

1. **Los 4 TODOs de contenido** (SCSI, temporización asíncrona de bus, Core i7,
   ejemplo numérico de DMA). **No se pueden cerrar desde `fuentes/`**: la cátedra
   no los desarrolla. Requieren Stallings, que no está en el repo.
2. **`2015 - AC Final - 01.pdf`** sigue sin transcribir. `tesseract` **no está
   instalado** en esta máquina, así que ni siquiera hay OCR dudoso disponible:
   es transcripción manual.
3. **`modulo-es.svg` mide 1004 px de ancho**, por encima del objetivo de ≤900 px.
   Se ve, pero con el texto más chico que el resto en el celular.
4. **Más ítems donde la cobertura es fina**: buses, RISC, DMA y von Neumann
   tienen 3 preguntas de quiz cada uno.
5. **Java 8** impide renderizar PlantUML en local (hace falta 11+). En CI corre
   Temurin 17, así que el sitio publicado está bien.

### Verificación de los ejercicios

`gen_practica.py` **valida y aborta con exit 1** ante: índices de `correctas`
fuera de rango o repetidos, ids duplicados, temas inexistentes, opciones sin
explicación, ítems sin cita de fuente, `tipo: falsa` con más de una correcta,
diagramas que apunten a un `.puml` inexistente y `aplica_a` que apunte fuera del
banco.

**Un índice de correcta mal puesto no rompe el build pero enseña un error como
si estuviera verificado.** Por eso el chequeo frena la generación en vez de
avisar. Los 6 modos de fallo están probados.

Prueba de humo end-to-end: contestar el quiz entero con las respuestas
declaradas en el YAML da **44/44** y las afirmaciones **14/14**.

### Lo próximo, si hay tiempo

1. **`site_url` en `mkdocs.yml` sigue vacío** —
   `https://maxinunez24.github.io/final-arquitectura-de-computadoras/`.
2. **Transcribir `2015 - AC Final - 01.pdf`** a mano y sumarlo como simulacro
   número 13.
3. Más ítems de quiz donde la cobertura es más fina: buses, RISC vs CISC, DMA y
   von Neumann tienen 3 cada uno.

### Herramienta para leer las fuentes

`pdftotext -layout` (viene con Git Bash en `/mingw64/bin`) extrae las teorías
con `\f` entre filminas. Para ubicar un tema rápido, grepear el texto extraído
por palabra clave devuelve el número de filmina directamente.

!!! danger "PlantUML necesita Graphviz, y sin él NO falla"
    Todos los diagramas menos `ciclo-instruccion-interrupcion` necesitan
    **Graphviz (`dot`)**. Si falta, PlantUML **no devuelve error**: genera un SVG
    válido con el mensaje *"Cannot find Graphviz"* dibujado adentro y termina con
    exit 0. El build pasa, el deploy pasa, y el sitio publica los diagramas
    ilegibles. **Ya pasó: se publicaron 12 de 13 rotos.**

    Por eso `render_puml.sh` ahora **inspecciona el contenido de los SVG
    generados y aborta** si encuentra el mensaje de error. Verificar que un
    archivo exista y devuelva HTTP 200 no alcanza — hay que mirar qué tiene
    adentro.

    En CI se instala con `apt-get install graphviz`, en un paso propio del
    workflow.

!!! warning "Java 8 no puede renderizar los diagramas en esta máquina"
    `scripts/render_puml.sh` baja PlantUML 1.2026.6, que necesita **Java 11+**.
    Con el Java 8 instalado tira `UnsupportedClassVersionError`. **No afecta al
    sitio publicado**: el workflow usa Temurin 17. En local significa que las
    miniaturas de `practica/diagramas.md` no se ven y que
    `mkdocs build --strict` aborta por los 28 links a `.svg`.

!!! danger "El repo es público"
    `https://github.com/MaxiNunez24/final-arquitectura-de-computadoras`. Las
    fuentes son material de cátedra: `fuentes/` y `*.zip` están en `.gitignore` y
    **tienen que seguir ahí**. Para migrar las fuentes entre máquinas, copiar la
    carpeta directamente; no hace falta git.

### Convenciones de los diagramas

- **Todos comparten `docs/diagramas/_estilo.iuml`**, que se incluye con
  `!include _estilo.iuml`. El renderizador sólo toma `*.puml`, así que el `.iuml`
  no genera SVG propio.
- **Mobile-first: angostos y altos.** Objetivo **≤ 900 px de ancho**. El CSS los
  escala al 100 % del ancho de la columna, así que un diagrama de 1600 px queda
  ilegible en el celular. Varios originales de la cátedra son horizontales
  (taxonomía de Flynn, las 3 correspondencias de caché, las 3 técnicas de E/S):
  **se apilaron en vertical a propósito**, con una nota en la ficha cuando el
  cambio de forma es notorio.
- **Para forzar el apilado vertical de bloques hermanos**, los enlaces
  `-down[hidden]->` tienen que ir **entre elementos concretos, no entre los
  contenedores**: entre contenedores Graphviz los sigue poniendo lado a lado.
- **No usar `skinparam padding`:** mete un banner de warning dentro del SVG.
- Cada `.puml` arranca con un **comentario que cita la filmina de origen**.

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
