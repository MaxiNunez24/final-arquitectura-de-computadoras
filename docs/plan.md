<!-- Generado por scripts/gen_plan.py desde data/plan.yml.
     No editar a mano: los cambios se pierden en la próxima corrida. -->

# Plan de estudio

**Faltan 29 días.** El final es el **miércoles 16 de septiembre a las 10:00, aula 5**.

!!! danger "Confirmá la fecha de la mesa"
    El plan está armado sobre el **miércoles 16 de septiembre**, que es una fecha **provisoria**. En cuanto tengas la definitiva, cambiá `meta.final` en `data/plan.yml` y corré `python3 scripts/gen_plan.py`: todo el calendario se recalcula solo.


!!! tip "Cómo usar esta página"
    Tildá las tareas a medida que las hacés: **se guardan en este dispositivo**. La semana en curso aparece resaltada y las que ya pasaron se atenúan. Dedicación: **2 a 3 h por día** entre semana, **4 a 5 h el fin de semana**.

## De un vistazo

| Semana | Foco | Temas | Peso en el banco |
|---|---|---|---:|
| **19/8 – 25/8** | Semana 1 | Memoria caché, Interrupciones, Entrada/Salida, DMA — Acceso Directo a Memoria | 48 % |
| **26/8 – 1/9** | Semana 2 | Segmentación de cauce, Soluciones a los riesgos de segmentación, Procesadores superescalares | 28 % |
| **2/9 – 8/9** | Semana 3 | Procesamiento paralelo, Buses, RISC vs CISC, Von Neumann y pila | 24 % |
| **9/9 – 15/9** | Semana 4 | — | 0 % |

!!! warning "De dónde sale este reparto"
    El **orden de los temas no es criterio propio**: sale de la [tabla de frecuencia](finales/frecuencia.md), que cuenta apariciones reales en los finales relevados. Lo que más se tomó va primero, con más semanas por delante para que decante.

    **Las horas sí son una estimación**, hecha sobre el tamaño de cada ficha más el tiempo de escribir a mano y corregir.

## La rutina de cada tema

Se repite **en todos los temas**, y el orden importa: las preguntas van **antes** que la ficha, y la teoría al final y sólo como parche.

| | Paso | Tiempo |
|---:|---|---:|
| **1** | **Leé los enunciados reales del tema en el banco**<br><small>No para contestarlos: para saber qué te van a pedir. Vas a leer distinto sabiendo que el enunciado dice «esquematice la estructura interna del PIC».</small> | 5 min |
| **2** | **Leé la ficha, parando en cada «Comprobación rápida»**<br><small>Los checkpoints están puestos justo donde se pierde el concepto. Si fallás uno, releé esa sección antes de seguir: es más barato ahí que en la hoja.</small> | 40 min |
| **3** | **Armá la respuesta con los chips**<br><small>En «¿Qué no puede faltar?», filtrado por el tema. Sirve para fijar qué conceptos entran antes de tener que producirlos de memoria.</small> | 10 min |
| **4** | **Cerrá todo y escribí UNA respuesta a mano**<br><small>Sin material, sin buscar nada, cronometrado. Éste es el paso que cuenta y es el primero que se cae cuando falta tiempo. Defendelo.</small> | 25 min |
| **5** | **Corregite con la rúbrica**<br><small>Tildá punto por punto lo que sí escribiste. Lo que quedó sin tildar es tu lista de repaso, y casi nunca es lo que esperabas.</small> | 10 min |
| **6** | **Quiz y afirmaciones falsas del tema**<br><small>Para pescar lo que no sabías que no sabías.</small> | 10 min |

**Total por tema: 1 h 40.**

## Todos los días

- **Fichas de recuperación activa** (15 min) — De los temas ya vistos, no del de hoy. Es lo que evita que lo de la semana 1 se borre para la semana 4.
- **Una partida de Contrarreloj** (5 min) — Opcional, para los días en que cuesta arrancar. Mirá qué tema te queda en rojo en el panel de dominio.

## Semana por semana

<div class="pract" data-tipo="plan" data-datos="d-plan"></div>
<script type="application/json" id="d-plan">{"bloques":[{"id":"S1","rango":"19/8 al 25/8","titulo":"Semana 1 — Los cuatro más tomados","porque":"Caché, interrupciones, E/S y DMA suman casi la mitad del banco. Van primero porque son los que más veces vas a necesitar y porque así tienen tres semanas para decantar. Un tema por día, con dos días de aire.","tareas":[{"titulo":"Memoria caché","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/memoria-cache/"},{"titulo":"Interrupciones","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/interrupciones/"},{"titulo":"Entrada/Salida","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/entrada-salida/"},{"titulo":"DMA — Acceso Directo a Memoria","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/dma/"}],"metas":["Los 4 temas leídos con TODOS sus checkpoints contestados bien.","4 respuestas completas escritas a mano, una por tema, cronometradas.","El esquema del PIC y la estructura del módulo de E/S dibujados de memoria.","Quiz de los 4 temas al 100 %."],"aviso":"No arranques por el simulacro. Esta semana es para construir material propio: cada respuesta escrita a mano es la que vas a repasar en la semana 4.","vencido":false,"actual":false},{"id":"S2","rango":"26/8 al 1/9","titulo":"Semana 2 — El bloque del cauce","porque":"Segmentación, sus soluciones y superescalares son un solo hilo: los riesgos no se entienden sin las soluciones, y el superescalar es la evolución de los dos. Es el bloque más pesado del programa y conviene darle una semana entera.","tareas":[{"titulo":"Segmentación de cauce","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/segmentacion/"},{"titulo":"Soluciones a los riesgos de segmentación","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/soluciones-segmentacion/"},{"titulo":"Procesadores superescalares","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/superescalares/"}],"metas":["El cauce de 5 etapas dibujado de memoria con los 3 riesgos marcados.","3 respuestas a mano: los riesgos, las soluciones y las políticas de emisión.","Poder explicar en voz alta de dónde sale el dato en el forwarding LW→SW.","Las secuencias de estos temas ordenadas sin errores."],"aviso":"El punto que más se pierde: la segmentación NO acelera cada instrucción, mejora el throughput. Si no lo escribís con esas palabras, lo perdés.","vencido":false,"actual":false},{"id":"S3","rango":"2/9 al 8/9","titulo":"Semana 3 — Los que faltan y el primer simulacro","porque":"Paralelismo, buses, RISC y von Neumann completan el programa. Son cuatro temas pero tres tienen fichas cortas. A mitad de semana entra el primer simulacro completo: con los 11 temas vistos, es el momento de descubrir si el problema va a ser de tiempo.","tareas":[{"titulo":"Procesamiento paralelo","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/paralelismo/"},{"titulo":"Buses","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/buses/"},{"titulo":"RISC vs CISC","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/risc-cisc/"},{"titulo":"Von Neumann y pila","detalle":"La rutina completa: banco → ficha con checkpoints → chips → respuesta a mano → rúbrica → quiz.","enlace":"../temas/von-neumann-y-pila/"},{"titulo":"Primer simulacro completo, 3 horas, a mano","detalle":"Elegí uno del banco. No importa el puntaje: importa si llegás a contestar los 5 puntos. Corregilo con las rúbricas y anotá los huecos.","enlace":"../practica/simulacro/"}],"metas":["Los 11 temas con al menos una respuesta escrita a mano.","Primer simulacro entregado dentro de las 3 horas y corregido.","Lista escrita de los huecos que dejó el simulacro."],"aviso":"Von Neumann y pila es el tema más flojo del sitio: no existe la clase 1 en las fuentes y pila y pasaje de parámetros salen de resúmenes de alumnos. Es el único donde vale la pena abrir Stallings, capítulos 3, 10 y 11.","vencido":false,"actual":false},{"id":"S4","rango":"9/9 al 15/9","titulo":"Semana 4 — Sólo simulacros y errores","porque":"Nada nuevo. Esta semana se comprueba que podés escribir 5 puntos en 3 horas, que es lo que realmente se evalúa. Dos simulacros más, y el resto del tiempo repasando SOLAMENTE lo que falló.","tareas":[{"titulo":"Dos simulacros completos más, en días distintos","detalle":"A mano, con reloj, sin material. Usá finales que no hayas hecho.","enlace":"../practica/simulacro/"},{"titulo":"Repaso dirigido por errores","detalle":"Sólo los puntos que las rúbricas dejaron sin tildar. No abras un tema que salió bien: a esta altura eso es ansiedad disfrazada de estudio.","enlace":""},{"titulo":"Una vuelta completa de fichas de recuperación activa","detalle":"Los 44 enunciados del banco, de memoria. Es el repaso más eficiente que hay a esta altura.","enlace":"../practica/fichas/"}],"metas":["3 simulacros completos hechos en total, los 5 puntos contestados.","Hoja única con los errores recurrentes.","Las 44 fichas en el cajón «la sabía»."],"aviso":"El día anterior: cerrá la carpeta temprano. Dormir bien rinde más que la última hora de repaso.","vencido":false,"actual":false}]}</script>


## Qué NO hacer

- No releas las teorías completas. Son 12 PDFs de ~50 filminas. Las fichas ya son esa condensación con la cita al pie; la teoría se abre sólo para el punto que falló.
- No dejes «escribir a mano» para la última semana. Es el error que hunde este plan: entendés leyendo y no podés redactar.
- No estudies los TODOs como si fueran tuyos. SCSI, temporización asíncrona, Core i7 y el ejemplo numérico de DMA no están en las fuentes de cátedra: si caen, se contesta lo que sí está y se aclara el límite.
- No confundas el juego con estudiar. Contrarreloj y el quiz entrenan reconocer; el examen te pide producir. Sirven de entrada en calor, no de reemplazo.
- No hagas los 3 simulacros la misma semana que leés temas nuevos. Se pisan y ninguno rinde.
- No arranques un tema nuevo en la semana 4.

<p class="fuentes">Fuente del reparto: <code>data/banco-finales.yml</code> (frecuencia real de los finales). El plan y los tiempos: <code>data/plan.yml</code>.</p>
