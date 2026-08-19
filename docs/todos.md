# TODOs — qué falta y por qué

Listado completo de lo que quedó marcado `<!-- TODO: falta en fuentes -->`,
agrupado por tema.

!!! danger "Estos huecos son intencionales"
    La [regla número uno](index.md) del proyecto es **no inventar contenido**. Cada
    ítem de esta página es algo que **la cátedra pregunta o nombra, pero que no
    está desarrollado en `fuentes/`**. Antes que completarlo con conocimiento
    general, se dejó vacío y anotado. **Si vas a estudiar alguno de estos puntos,
    buscalo en Stallings** —es el texto base de la cátedra— o pedíselo a un
    compañero.

---

## Buses

Es el tema con más huecos: **la única fuente de cátedra es un anexo**, no hay una
clase teórica numerada de buses.

| Qué falta | Estado en las fuentes | Dónde buscarlo |
|---|---|---|
| **Temporización asíncrona** | La fil. 22 del anexo trae **únicamente el cronograma** (señales MSYN / SSYN de *handshake*), **sin ninguna descripción en texto** — a diferencia de la síncrona, que sí tiene su lista de características en fil. 20 | Stallings, cap. 3 |
| **SCSI** | Aparece **nombrado en los esquemas** de jerarquía de buses (fil. 14 y 38) como un dispositivo colgado del bus de expansión o del de alta velocidad, pero **no hay ninguna filmina que lo explique**: ni funcionamiento, ni arbitraje, ni protocolo | Stallings, cap. 3 · `www.pcguide.com/ref/mbsys/buses/`, lectura que recomienda la cátedra |
| **Intel Core i7** | La fil. 41 es **una imagen sin texto explicativo ni cálculo de anchos de banda**, a diferencia del resto de los chipsets —Pentium MMX, II, III, IV y Athlon XP—, que sí traen su filmina de cálculo | — |

[:material-arrow-right: Ir a la ficha de buses](temas/buses.md)

---

## DMA

| Qué falta | Estado en las fuentes |
|---|---|
| **Ejemplo numérico propio de DMA** | La clase 3 desarrolla un ejemplo numérico completo —impresora de 20 ppm y disco de 10 MB/s, CPU de 200 MHz y 100 MIPS— **sólo para comparar E/S con espera contra E/S por interrupción**. **No lo extiende al DMA.** Lo más cercano a un ejemplo concreto es la mención del **chip 8237** como DMAC (fil. 46) y la línea **INT3 del MSX88, conectada al puerto a impresora, identificada como DMA** (clase 2, fil. 45); ninguna trae un desarrollo transcribible |

[:material-arrow-right: Ir a la ficha de DMA](temas/dma.md)

---

## Von Neumann y pila

!!! success "Resuelto el 18/8/2026: apareció la clase 1"
    Este tema era **el peor cubierto del sitio** porque `fuentes/Teorías/` iba
    de la clase 02 a la 09 y la única fuente específica era un anexo de 5
    filminas. Con la subida del material del sitio oficial apareció
    **`Arq Clase1 Repaso OC.pdf`, 131 filminas**, que cubre pila (fil. 77–86),
    subrutinas (87–96), pasaje de parámetros (97–121) y anidamiento (122–127).

    La ficha **ya no se apoya en resúmenes de alumnos** para esos puntos, y se
    le agregó la comparación del manejo del SP en **i80x86 vs. M68xxx**
    (fil. 79–82), que antes no estaba en ningún lado.

| Qué falta | Estado en las fuentes |
|---|---|
| **Diagrama de la estructura de la pila con base y límite** | La clase 1 **sí trae esquemas de PUSH y POP** para las dos familias de procesadores (fil. 79–82), y con eso se podría dibujar. Pero los registros de **base** y **límite** siguen sin aparecer en cátedra: sólo se nombra el **SP**. Un diagrama con los tres campos seguiría siendo mitad inventado |
| **Noción de «cabecera» y longitud variable** | La cátedra habla de **tope**, no de cabecera, y no discute la longitud como propiedad. Viene de `Resumen Arquitectura (2).pdf`, p. 1, y está marcado como tal en la ficha |

**Sin explotar todavía de la clase 1**, por si hace falta más adelante:
ciclo de instrucción básico y detallado (fil. 63–67), modos de direccionamiento
(58–62), decisiones de diseño del repertorio (32–40) y el ejemplo para MSX88
(128–129).

[:material-arrow-right: Ir a la ficha de von Neumann y pila](temas/von-neumann-y-pila.md)

---

## Banco de finales

| Qué falta | Estado en las fuentes |
|---|---|
| **`2015 - AC Final - 01.pdf`** | El PDF contiene **únicamente una imagen escaneada sin capa de texto** (CCITT, 1656×2339). **No se OCReó**: no hay modelo de tesseract en español instalado —sólo `eng` y `osd`—, y meter texto de OCR dudoso en enunciados que tienen que ser **textuales** sería peor que dejarlos afuera. **Requiere transcripción manual** desde el PDF original |

[:material-arrow-right: Ir a los simulacros](finales/simulacros.md)

---

## Pendientes que no son de contenido

- **`site_url` en `mkdocs.yml` está vacío.** Completar con la URL real de GitHub
  Pages (`https://<usuario>.github.io/<repo>/`) al publicar.

---

## Temas sin ningún TODO

Estos 8 quedaron **completos con material de cátedra**, sin huecos:

<div class="grid cards" markdown>

- :material-check-circle: **[Interrupciones](temas/interrupciones.md)**
- :material-check-circle: **[Entrada/Salida](temas/entrada-salida.md)**
- :material-check-circle: **[Memoria caché](temas/memoria-cache.md)**
- :material-check-circle: **[Segmentación de cauce](temas/segmentacion.md)**
- :material-check-circle: **[Soluciones a la segmentación](temas/soluciones-segmentacion.md)**
- :material-check-circle: **[RISC vs CISC](temas/risc-cisc.md)**
- :material-check-circle: **[Superescalares](temas/superescalares.md)**
- :material-check-circle: **[Procesamiento paralelo](temas/paralelismo.md)**

</div>
