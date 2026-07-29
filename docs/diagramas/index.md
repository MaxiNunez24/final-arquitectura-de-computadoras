# Diagramas

Los 13 esquemas del sitio, todos juntos. **Cada uno está basado en un diagrama que
aparece en las teorías de cátedra**: donde la teoría no tiene diagrama, no se
inventó uno.

!!! info "Cómo están hechos"
    Los diagramas se escriben en **PlantUML** (`docs/diagramas/*.puml`, versionados
    en el repo) y se **pre-renderizan a SVG durante el build**. El sitio publicado
    **no depende de ningún servidor externo**: se ven igual offline desde el
    celular.

    Están armados **angostos y altos** a propósito. Varios de los originales de la
    cátedra son horizontales; dibujados así se van a ~1600 px de ancho y, escalados
    al ancho de un celular, el texto queda ilegible.

## Interrupciones

### Ciclo de instrucción con la fase de gestión de interrupciones

![Ciclo de instrucción con fase de gestión de interrupciones](ciclo-instruccion-interrupcion.svg)

<p class="fuentes">Fuente: <code>Teorías/02 Arq clase2 Interrupciones.pdf</code>, fil. 22–23, 26–27.</p>

### Estructura y conexionado del PIC

![Interrupciones vectorizadas con el PIC](pic.svg)

<p class="fuentes">Fuente: <code>Teorías/02 Arq clase2 Interrupciones.pdf</code>, fil. 33–36, 43–45 y <code>Prácticas/Practica 3 - Interrupciones por Hardware - Resolución - AC25.pdf</code>, p. 1–2.</p>

## Entrada/Salida y DMA

### Estructura interna del módulo de E/S

![Estructura interna del módulo de E/S](modulo-es.svg)

<p class="fuentes">Fuente: <code>Teorías/03 Arq clase3 EntradaSalida.pdf</code>, fil. 10–13.</p>

### Las 3 técnicas de gestión de la transferencia

![Comparación de las tres técnicas de gestión de E/S](tecnicas-es.svg)

<p class="fuentes">Fuente: <code>Teorías/03 Arq clase3 EntradaSalida.pdf</code>, fil. 24–28 y 44–52.</p>

## Memoria caché

### Jerarquía de memoria

![Jerarquía de memoria](jerarquia-memoria.svg)

<p class="fuentes">Fuente: <code>Teorías/07 Arq clase7 Memoria.pdf</code>, fil. 8–15.</p>

### Las 3 correspondencias de caché

![Las tres correspondencias de caché](correspondencias-cache.svg)

<p class="fuentes">Fuente: <code>Teorías/07 Arq clase7 Memoria.pdf</code>, fil. 42–55.</p>

## Segmentación

### Cauce de 5 etapas del nanoMIPS con los 3 tipos de riesgo

![Cauce de 5 etapas del nanoMIPS y los tres tipos de riesgo](cauce-nanomips.svg)

<p class="fuentes">Fuente: <code>Teorías/04 Arq clase4 Segmentación de cauce.pdf</code>, fil. 45–54 y 58–66, con las soluciones de <code>Teorías/05 Arq clase5 Algunas soluciones.pdf</code>, fil. 6, 12–27 y 32–39.</p>

## RISC

### Ventana de registros

![Ventana de registros: solapamiento y buffer circular](ventana-registros.svg)

<p class="fuentes">Fuente: <code>Teorías/06 Arq clase6 RISC.pdf</code>, fil. 26–38.</p>

## Superescalares

### Modelo de ejecución superescalar

![Ejecución superescalar: de Fetch a Commit, y comparación con segmentada y supersegmentada](ejecucion-superescalar.svg)

<p class="fuentes">Fuente: <code>Teorías/08 Arq clase8 Procesadores Superescalares.pdf</code>, fil. 9–12, 18, 39–43 y 44–47.</p>

## Procesamiento paralelo

### Taxonomía de Flynn con SMP, NUMA y clusters

![Taxonomía de Flynn con SMP, NUMA y clusters](taxonomia-flynn.svg)

<p class="fuentes">Fuente: <code>Teorías/09 Arq clase9 Procesamiento paralelo.pdf</code>, fil. 5–17, 18–19, 22–28 y 32–33.</p>

## Buses

### Interconexión y jerarquía de buses

![Interconexión mediante un bus, arquitectura tradicional y de altas prestaciones](buses-jerarquia.svg)

<p class="fuentes">Fuente: <code>Teorías/7 anexo clase 07 sobre_buses.pdf</code>, fil. 8–11, 13–14 y 38.</p>

## Von Neumann y pila

### Los 3 subsistemas de von Neumann

![Arquitectura de von Neumann: CPU, memoria y E/S sobre los tres buses](von-neumann.svg)

<p class="fuentes">Fuente: <code>Teorías/03 Arq clase3 EntradaSalida.pdf</code>, fil. 3.</p>

### Las máquinas de N direcciones

![Máquinas de 4, 3, 2, 1 y 0 direcciones resolviendo la misma expresión](maquinas-n-direcciones.svg)

<p class="fuentes">Fuente: <code>Teorías/1 anexo clase 01 sobre maq_de_Ndir.pdf</code>, fil. 1–5. Los programas van transcriptos textuales de las filminas.</p>

---

## Lo que NO se dibujó, y por qué

!!! warning "Diagramas que la cátedra no tiene"
    Estos temas **se preguntan en los finales pero no tienen diagrama de
    cátedra**. No se dibujaron para no inventar un esquema que nunca se dio:

    - **Estructura de la pila** (puntero de pila, base, límite) — sólo descrita en
      texto, y en resúmenes de alumnos.
    - **Temporización asíncrona de bus** — la filmina 22 del anexo de la clase 07
      trae el cronograma MSYN/SSYN **sin texto que lo explique**.
    - **SCSI** — aparece nombrado en los esquemas de jerarquía de buses, pero no
      hay ninguna filmina sobre su funcionamiento.
    - **Intel Core i7** — la filmina 41 es una imagen sin texto ni cálculo de
      anchos de banda, a diferencia del resto de los chipsets.
