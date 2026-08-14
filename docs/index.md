# Arquitectura de Computadoras — Final

Sitio de estudio para el final de **Arquitectura de Computadoras** (UNLP).

!!! danger "Mesa: miércoles 19 de agosto, 10:00, aula 5"
    Final **escrito y teórico**. 5 puntos con subincisos a) y b). **3 horas reloj**.
    Entra todo el programa. **No se toma assembly.**

    Los enunciados usan consignas del tipo *describa*, *analice*, *compare*,
    *esquematice*, *¿cómo…?*, *¿de qué depende…?*.

## Por dónde empezar

<div class="grid cards" markdown>

- :material-calendar-check: **[Plan de estudio](plan.md)**

    Qué toca hoy, cuánto tiempo lleva y qué metas cumplir. Empezá por acá.

- :material-file-document-multiple: **[Fichas por tema](temas/index.md)**

    Los 11 temas del programa, cada uno con definición, desarrollo, diagrama,
    comparaciones y las preguntas de final que le corresponden.

- :material-pencil-box: **[Práctica](practica/index.md)**

    Donde producís en vez de leer: simulacro cronometrado con rúbrica, fichas
    de recuperación activa, quiz y ejercicios de diagramas.

- :material-chart-bar: **[Frecuencia de temas](finales/frecuencia.md)**

    Qué se tomó más veces. Sirve para priorizar si el tiempo aprieta.

- :material-help-circle: **[Banco por tema](finales/por-tema.md)**

    Todas las preguntas de finales viejos, agrupadas por tema y con las
    variantes de redacción juntas.

- :material-timer: **[Simulacros](finales/simulacros.md)**

    Finales completos reconstruidos tal como se tomaron, para cronometrar.

</div>

!!! tip "Leer no alcanza"
    El punto donde se cae el estudio de este final no es entender, es **poder
    redactar cinco respuestas completas a mano en 3 horas**. Reconocer una
    definición correcta es mucho más fácil que producirla en una hoja en blanco.
    Por eso, cuando termines de leer una ficha, seguí con las
    [fichas de recuperación activa](practica/fichas.md) y con el
    [simulacro cronometrado](practica/simulacro.md).

## Cómo está construido este sitio

!!! warning "Regla número uno: nada inventado"
    Todo el contenido conceptual sale de los archivos en `./fuentes/` (material
    de cátedra, no versionado en este repo). Cada sección cita el archivo y la
    página o filmina de origen.

    Donde la fuente no dice nada, la sección queda **vacía y marcada como
    TODO** en vez de completarse con conocimiento general. El listado completo
    está en [TODOs pendientes](todos.md).

### Jerarquía de fuentes

1. **Teorías de cátedra** — `Teorías/0X Arq claseX *.pdf` y sus anexos. Es la
   fuente primaria.
2. **Prácticas resueltas** — `Prácticas/Practica N - Resolución - AC25.pdf`.
   Usadas para los ejemplos del curso.
3. **Resúmenes de alumnos** — Karim, Guaymas, Alfonso, `Resumen_*`. Sólo
   cuando la teoría no cubre el punto, y siempre señalados como tales.

Si un resumen contradice a la teoría, en el sitio va **lo que dice la teoría**
y la discrepancia queda anotada en un bloque de advertencia.
