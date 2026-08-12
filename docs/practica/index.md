<!-- Generado por scripts/gen_practica.py desde data/*.yml.
     No editar a mano: los cambios se pierden en la próxima corrida. -->
# Práctica

La parte del sitio donde **producís** en vez de leer. Todo corre en el navegador y el progreso se guarda **en este dispositivo**: si abrís el sitio en la compu, arrancás de cero.

<div class="grid cards" markdown>

- :material-timer: **[Simulacro cronometrado](simulacro.md)**

    12 finales completos, 3 horas reloj, rúbrica al entregar.

- :material-cards: **[Fichas de recuperación activa](fichas.md)**

    44 preguntas reales, una por vez, de memoria.

- :material-help-circle: **[Quiz conceptual](quiz.md)**

    15 preguntas de opción múltiple.

- :material-alert-circle: **[Detectá la afirmación falsa](afirmaciones.md)**

    6 ejercicios de lectura crítica.

- :material-image-search: **[Elegí el diagrama correcto](diagramas.md)**

    13 ejercicios de memoria visual.

</div>

## En qué orden usarlas

Leés la [ficha del tema](../temas/index.md), y recién después venís acá. El quiz y las afirmaciones sirven para **detectar agujeros** en un rato muerto; las fichas, para **producir de memoria**; el simulacro, para saber si llegás con el tiempo. Reconocer no es lo mismo que redactar: sólo el simulacro y las fichas te dicen si podés escribir la respuesta.

## Cómo está hecho

No hay servidor ni corrección automática de texto: los datos salen de `data/banco-finales.yml`, `data/rubricas.yml` y `data/ejercicios.yml`, y los arma `scripts/gen_practica.py`. Para agregar ejercicios se editan esos YAML y se corre el script.

!!! danger "Los distractores tampoco se inventan"
    La [regla número uno](../index.md) también rige acá. Las opciones incorrectas de un quiz son afirmaciones que **la teoría sí hace**, puestas donde no corresponden. Por eso **no hay ejercicios de cálculo** salvo donde la cátedra desarrolla el cálculo: ver [TODOs](../todos.md).

!!! warning "Temas todavía sin rúbrica"
    Estos temas no tienen cargado el checklist de autocorrección:

    - **Buses** — al corregir, el simulacro manda a la ficha
    - **DMA — Acceso Directo a Memoria** — al corregir, el simulacro manda a la ficha
    - **Procesamiento paralelo** — al corregir, el simulacro manda a la ficha
    - **RISC vs CISC** — al corregir, el simulacro manda a la ficha
    - **Segmentación de cauce** — al corregir, el simulacro manda a la ficha
    - **Soluciones a los riesgos de segmentación** — al corregir, el simulacro manda a la ficha
    - **Procesadores superescalares** — al corregir, el simulacro manda a la ficha
    - **Von Neumann y pila** — al corregir, el simulacro manda a la ficha
