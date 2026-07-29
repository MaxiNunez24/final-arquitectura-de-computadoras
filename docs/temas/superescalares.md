# Procesadores superescalares

## Definición

**En la ejecución superescalar de instrucciones, en cada ciclo se inician más de 1
instrucción.** Por ejemplo, un procesador superescalar **de grado 2 inicia 2
nuevas instrucciones en cada ciclo de reloj**.

**La aproximación superescalar se basa en poder ejecutar varias instrucciones en
diferentes cauces de manera independiente y concurrente.**

Un procesador superescalar dispone, básicamente, de **múltiples unidades
funcionales, cada una implementada como un cauce segmentado**, que admite la
ejecución paralela de varias instrucciones.

Ejemplos de procesadores superescalares: **MC68040, i80486, MC88110, i80860,
PA-RISC, Sparc, R6000**.

<p class="fuentes">Fuente: <code>Teorías/08 Arq clase8 Procesadores Superescalares.pdf</code>, fil. 12–13, 16.</p>

## Desarrollo

### Evolución de la segmentación por generaciones

| Generación | Modelo de ejecución | Características | Ejemplos |
|---|---|---|---|
| **1.ª** | **Secuencial** | Proceso de ejecución **completamente secuencial**. **No empezaba una nueva instrucción hasta que se completaba la corriente** | i4004, i8008/80, MC6800, MCS6502, Z80, F8 |
| **2.ª** | **Segmentada** | Se empezó a **segmentar el cauce**, aunque en forma **limitada y en muy pocas etapas**. **Nuevas instrucciones podían iniciarse mientras otras estaban en proceso** | MC68000, i8086/286, Z8000 |
| **3.ª** | **Segmentada aumentada** | La segmentación **se profundizó**, aumentando significativamente **la cantidad de etapas** (F, D, EA, E, M, WB) | MC68020, i80386, R2000/3000 |

### Limitaciones de los procesadores segmentados

En general, un procesador de **k etapas** tiene una **productividad teórica máxima
igual a k**. Pero esa productividad tiene varias limitaciones:

- **La máxima capacidad teórica es 1 instrucción por ciclo (IPC = 1):** sólo puede
  completar 1 instrucción por ciclo de reloj.
- **Hay 1 solo pipeline** para los diferentes tipos (de datos).
- **Los atascos en el cauce producen burbujas innecesarias** que reducen la
  productividad.

**Rendimiento de un procesador escalar segmentado.** Depende de:

- **IPC:** número de instrucciones por ciclo.
- **f:** frecuencia del reloj (T = 1/f).
- **k:** cantidad de etapas del cauce.

> **CPU time = N.º instr. × IPC × T**, donde T = tiempo de ciclo

**Para estos procesadores, en el mejor de los casos IPC = 1, y sólo se puede
mejorar este tiempo si se aumenta f.**

**Las limitaciones se originan en 2 aspectos:**

1. **El IPC es igual a 1, en el mejor de los casos.**
2. **Los posibles conflictos que pueden producir atascos en el cauce**, debidos a:
    - **Dependencias de datos:** verdadera, de salida y antidependencia.
    - **Penalizaciones en saltos.**
    - **Conflictos por uso de recursos.**

**Existen 2 técnicas para aumentar la performance usando segmentación:**
supersegmentación y superescalaridad.

### Procesadores supersegmentados

**En la ejecución supersegmentada de instrucciones cada ciclo se divide en
fracciones más chicas, en las que se inician nuevas instrucciones.** Por ejemplo,
un procesador **supersegmentado de grado 2 acepta una nueva instrucción en cada
semiciclo de reloj**.

- La ejecución supersegmentada consiste en **subdividir cada segmento en partes
  más pequeñas**.
- **Como muchas operaciones no necesitan todo un ciclo de reloj**, se puede hacer
  más de una tarea en ese ciclo subdividiéndolo en subintervalos, **lo que es
  equivalente a usar una mayor frecuencia de reloj** (menor ciclo de reloj).
- **El tiempo para las instrucciones individuales no varía**, pero **aumenta el
  grado del paralelismo de la máquina temporal**.
- **El pipeline se hace más profundo, pero está limitado por la tecnología** —es
  decir, por la frecuencia máxima—.

### Procesadores superescalares

**Se pueden llevar a cabo (completar) 2 o más instancias de cada etapa de una
instrucción simultáneamente.** Para poder iniciar/ejecutar 2 o más instrucciones
simultáneamente **se requiere la duplicación de algunas o todas las partes de la
CPU/ALU**, por ejemplo:

- **Captación de múltiples instrucciones** al mismo tiempo.
- **Ejecución (sumas y multiplicaciones) simultánea.**
- **Ejecución de carga/almacenamiento mientras se lleva a cabo una operación en la
  ALU.**

**El grado de paralelismo y, por tanto, la aceleración de la máquina aumentan, ya
que se ejecutan más instrucciones en paralelo.**

**La aproximación superescalar presenta paralelismo de máquina de 2 tipos:
temporal y espacial.** Por ejemplo, una máquina supersegmentada de **profundidad 5
y ancho 4** tendría capacidad de ejecutar **hasta 20 instrucciones
simultáneamente**.

**Los conflictos en procesadores superescalares son los mismos que en procesadores
segmentados:**

| Ejemplo | Conflicto |
|---|---|
| `I0 Add r1, r2` / `I1 Mov r3, r1` | **Dependencia de datos** — I1 usa un dato calculado por I0 |
| `I0 Add r1, r2` / `I1 Jmp etiqueta` | **Penalización por instrucciones de salto** |
| `I0 Add r1, r2` / `I1 Add r4, r3` | **Conflicto en un recurso** — I0 e I1 usan la misma unidad funcional |

### Paralelismo: IPL y MPL

**El paralelismo es la capacidad para ejecutar varias tareas en el mismo intervalo
de tiempo (en "paralelo"). Hay 2 tipos:**

- **Paralelismo a nivel de instrucciones:** se refiere a **las posibilidades que
  tiene un programa** para ejecutar instrucciones en paralelo.
- **Paralelismo a nivel de máquina:** es **la capacidad que tiene una máquina**
  para encontrar y ejecutar tareas en paralelo.

| | **IPL** — paralelismo a nivel de programa | **MPL** — paralelismo a nivel de máquina |
|---|---|---|
| **Qué mide** | El **grado de paralelismo de un programa**: la cantidad, **en promedio**, de instrucciones que pueden ejecutarse en paralelo | El **grado de paralelismo de una máquina**: su capacidad para **aprovechar el paralelismo de un programa** |
| **De qué depende** | Que las instrucciones **sean independientes** | **Número de instrucciones captadas por ciclo** · **número de unidades funcionales** · **mecanismos para localizar y ejecutar instrucciones independientes** |

### Tratamiento de las instrucciones

En los procesadores superescalares **el objetivo fundamental es localizar
instrucciones que puedan ser introducidas al pipeline y ejecutadas**. En este
proceso de detección es necesario distinguir:

- **El orden en que se captan** las instrucciones.
- **El orden en que se ejecutan** las instrucciones.
- **El orden en que las instrucciones actualizan los registros y las posiciones de
  memoria.**

> **Cuanto más sofisticado es el procesador, menos restricciones impone a estos
> ordenamientos. Incluso puede alterar cualquier ordenamiento respecto del
> estrictamente secuencial. La única condición es que el resultado debe ser
> correcto.**

### Políticas de emisión

**Las políticas de emisión de instrucciones son los protocolos usados para el
envío de las instrucciones a las unidades funcionales**, es decir, definen la
forma en que **se captan, ejecutan y finalizan** (escriben los resultados) las
instrucciones.

**En función del orden en que se captan, ejecutan y terminan, existen 3
políticas:**

1. **Emisión y finalización ordenada**
2. **Emisión ordenada y finalización desordenada**
3. **Emisión y finalización desordenada**

#### Emisión y finalización ordenada

**Las instrucciones se emiten exactamente como están en el programa** —como si
fuera "secuencial"— **y se escriben los resultados en el mismo orden**.

- Las instrucciones **se captan y decodifican de a 2**.
- I5 e I6 **deben esperar hasta que se desocupen ambos decodificadores** D1 y D2.
- Dado que el orden de escritura debe ser el mismo en que se captan, **I2 no puede
  ser escrita hasta que I1 no se haya completado** y esté lista para guardarse.
- **I4 tiene que esperar que I3 libere E3.** Ídem I5 e I6.
- **I5 tiene que esperar que se ejecute I4.**

> **Se requieren 8 ciclos para ejecutar las 6 instrucciones.**

#### Emisión ordenada y finalización desordenada

**Las instrucciones se emiten exactamente como están en el programa, pero los
resultados se escriben en "cualquier orden".**

- Las instrucciones **se captan y decodifican de a 2**; por eso I5 e I6 deben
  esperar a que se desocupen ambos decodificadores.
- Dado que el orden de escritura **puede ser distinto** del de captación, **I2
  puede ser escrita antes que I1** se haya completado.
- Al permitir la finalización desordenada, **I3 puede ser ejecutada
  anticipadamente, ganándose 1 ciclo**.

> **Ahora se requieren 7 ciclos para ejecutar las 6 instrucciones.**

**Conclusiones:**

- Las instrucciones **entran a las unidades de ejecución a medida que se van
  decodificando y hay unidades de ejecución disponibles**.
- Las emisiones **están limitadas por los posibles conflictos de recursos,
  dependencias de datos y de saltos**.
- **Al permitir la finalización desordenada aparecen nuevas fuentes de conflictos
  por dependencia de datos.**
- **La lógica de emisión de instrucciones es más compleja** que la empleada en
  máquinas con política de finalización ordenada.
- **Con la política de emisión ordenada, el procesador sólo puede decodificar
  instrucciones hasta el punto de dependencia o conflicto:** no analiza si hay
  nuevas instrucciones que pueden emitirse sin producir conflicto.

#### Emisión y finalización desordenada

**Para permitir que el procesador busque más allá del punto de conflicto por
nuevas instrucciones, se requiere usar una política de emisión desordenada.**

La política de emisión desordenada **requiere separar, mediante un buffer llamado
*Ventana de instrucciones*, las unidades de decodificación y las de ejecución**.

- **Cada instrucción decodificada se coloca en un buffer intermedio, desde donde se
  emiten las que no presentan conflictos.**
- **Mientras no se llene el buffer, nuevas instrucciones son decodificadas y
  colocadas** para su emisión a las unidades de ejecución.
- **Las instrucciones emitidas no deben tener conflictos por recursos ni por
  dependencias de datos.**

!!! important "La ventana de instrucciones no es una etapa del cauce"
    **Es un buffer que retiene la información necesaria para emitirla.**

**En el ejemplo del curso:**

- Las instrucciones se captan y decodifican de a 2, **pero ahora la ventana
  permite, en el ciclo 3, decodificar las instrucciones I5 e I6**.
- Como **I6 no tiene dependencias y está lista para ejecutarse, puede ser emitida
  anticipadamente, incluso antes de I5**. La ventana **le permite "ver" al
  procesador más adelante de las instrucciones en conflicto**, pudiendo detectar
  nuevas instrucciones (la I6) que no generan conflicto.

> **Ahora se requieren 6 ciclos para ejecutar las 6 instrucciones.**

### Renombrado de registros

**Al permitir finalización y/o emisión desordenada surgen los nuevos problemas de
dependencia de datos (WAW y WAR).**

Las dependencias de salida y antidependencias **surgen porque los valores de los
registros pueden no reflejar la secuencia de valores dictada por el flujo del
programa**. En realidad **es un conflicto de almacenamiento: hay instrucciones que
compiten por un mismo registro**.

Estos nuevos conflictos **pueden resolverse con detenciones en la etapa del
cauce**, pero esa solución **produce pérdidas de tiempo que pueden llegar a ser
inaceptables**.

**Dado que en definitiva es un conflicto de recursos —los registros—, se puede
resolver duplicando los recursos. Esta técnica se conoce como Renombrado de
Registros.**

- **Los registros en las instrucciones del programa son registros "lógicos".**
- **Los registros físicos (los reales) los asigna el procesador.**
- **Cada vez que se guarda un dato en un registro, el procesador le asigna un nuevo
  registro físico.** Las instrucciones siguientes que referencien a ese registro
  **deben renombrarse** para referenciar el registro físico que tiene el dato
  correcto.

**Ejemplo del curso.** Secuencia con nombres de registros como referencias
"lógicas":

```
R3 := R3 op R5    (I1)
R4 := R3 + 1      (I2)
R3 := R5 + 1      (I3)
R7 := R3 op R4    (I4)
```

Se observan las **3 dependencias**: **RAW entre I1 e I2**, **WAR entre I2 e I3**,
**WAW entre I1 e I3**.

El procesador va asignando nuevos registros en cada escritura, quedando las
referencias **"físicas"**:

```
R3b := R3a op R5a    (I1)
R4a := R3b + 1       (I2)
R3c := R5a + 1       (I3)
R7a := R3c op R4a    (I4)
```

- En **I1** se asigna un nuevo registro **R3b**, distinto del usado anteriormente
  (R3a).
- **I2 debe renombrarse para usar R3b** (y no R3a), y **crea R4a**, que no existía
  previamente.
- **I3 asigna un nuevo registro R3c**, distinto del usado anteriormente (R3b).
- **I4 debe renombrarse para usar R3c** (y no R3b), y **crea R7a**.

> **De esta manera se eliminan las dependencias WAW y WAR (antidependencia y
> dependencia de salida), quedando únicamente la dependencia verdadera RAW.**

### El modelo de ejecución superescalar

El modelo completo se esquematiza en **6 etapas**:

**Fetch → Decode → Dispatch → Issue → Execute → Commit**

| Bloque | Qué hace |
|---|---|
| **Captación de instrucciones y predicción de saltos** (Fetch, Decode) | Las instrucciones **son captadas a partir del programa estático y decodificadas** para la **detección temprana de dependencias** y la **predicción de saltos** |
| **Envío de instrucciones** (Dispatch) | Las instrucciones, **todavía ordenadas, son enviadas a la ventana de ejecución**, donde **se las redistribuye en función de las dependencias verdaderas**: las que están en condiciones de ser ejecutadas o las que necesitan disponer de datos de otras instrucciones |
| **Emisión y ejecución** (Issue, Execute) | Las instrucciones **son ejecutadas en un orden basado en la disponibilidad de unidades de ejecución y en las dependencias verdaderas** |
| **Reordenación y entrega** (Commit) | Las instrucciones ejecutadas **son nuevamente reordenadas secuencialmente** y los resultados **guardados en el orden que corresponde** |

**Para qué sirve el último paso (Commit):**

- **Reordenar el almacenamiento de acuerdo al programa original.**
- **Eliminar todas las ejecuciones inservibles** —aquellas que se hicieron por
  predicción de salto o **ejecución especulativa**— y que se deben descartar.
- **Mejorar la respuesta a las interrupciones.**

> **De esta manera, las instrucciones ejecutadas producen resultados almacenados
> temporalmente, hasta que se graban los resultados válidos en los registros
> reales.**

**En resumen, la ejecución superescalar involucra:**

- Diferentes estrategias de **captación simultánea de múltiples instrucciones**.
- **Lógica para determinar dependencias verdaderas** entre valores de registros y
  mecanismos para comunicar esos valores.
- **Mecanismos para iniciar o emitir múltiples instrucciones en paralelo.**
- **Recursos para la ejecución en paralelo** de múltiples instrucciones.
- **Mecanismos para entregar el estado del procesador en un orden correcto.**

### Interrupciones en procesadores superescalares

**En los procesadores superescalares el tratamiento de interrupciones internas o
excepciones —rupturas por ejecución de instrucciones— y externas —rupturas por
eventos externos— es más complicado que en los procesadores convencionales.**

**La razón:** en el momento en que se produce una interrupción **hay varias
instrucciones en ejecución, y además desordenadas**. El problema que se plantea es:
producida una excepción en una instrucción dada I2, **¿en qué estado quedaron las
instrucciones anteriores (I1) y posteriores (I3)**, dado que con la política de
ejecución desordenada **pudieron haber quedado en distintos estados**?

**Interrupciones internas o excepciones — 2 estrategias:**

| | **Excepciones precisas** | **Excepciones imprecisas** |
|---|---|---|
| **Comportamiento** | **Las instrucciones que preceden a la que produjo la excepción se completan, y las que le suceden se reinician.** El comportamiento es "idéntico" al que tendría **la misma computadora no segmentada** | **No se respetan las condiciones exactas de la máquina no segmentada** |

**Para garantizar un estado consistente (preciso) se requiere:**

1. **Las instrucciones anteriores terminan correctamente.**
2. **La que origina la excepción y las siguientes se abortan.**
3. **Tras la rutina de tratamiento se comienza por la que originó la excepción.**

Para que las interrupciones sean precisas, **los resultados se deben almacenar en
el orden en que aparecen las instrucciones**. Para ello **se requiere retardar las
escrituras de los resultados** de tal manera que queden en el orden en el que
estaba el programa secuencial.

**Interrupciones externas.** Pueden tener distinto grado de "precisión", dado que
**no necesariamente tienen que ver con las instrucciones en ejecución** —por
ejemplo, operaciones de E/S—:

| Grado | Comportamiento |
|---|---|
| **Imprecisas** | **Se completa lo que estaba en ejecución** |
| **"Algo" imprecisas** | **El software** —la rutina de servicio de la interrupción— **resuelve algunas inconsistencias** |
| **Precisas** | **Sólo se completan las instrucciones previas a la interrupción**, para lo cual **se requiere implementar la escritura con buffer de salida**. La unidad de emisión **deja de emitir**, **se cancela la cola**, **todas las instrucciones pendientes se completan** y comienza el procesamiento de la interrupción |

[Ver la ficha de interrupciones](interrupciones.md).

<p class="fuentes">Fuente: <code>Teorías/08 Arq clase8 Procesadores Superescalares.pdf</code>, fil. 3–5, 6–9, 10–11, 12–17, 19–21, 22, 23–38, 39–43, 44–47, 54–58.</p>

## Diagrama

<!-- Diagrama pendiente (Tarea 4): ejecución superescalar, modelo de 6 etapas
     Fetch-Decode-Dispatch-Issue-Execute-Commit con la ventana de ejecución
     (fil. 44), y comparación segmentada / supersegmentada / superescalar
     (fil. 9, 10, 12, 18). -->

## Ventajas y desventajas o comparaciones

### Segmentada vs. supersegmentada vs. superescalar

| | **Segmentada (máquina base)** | **Supersegmentada** | **Superescalar** |
|---|---|---|---|
| **Idea** | Solapar etapas de instrucciones sucesivas | **Subdividir cada segmento en partes más pequeñas** | **Iniciar más de 1 instrucción por ciclo** |
| **Cuándo inicia una nueva instrucción** | 1 por ciclo | **1 por subintervalo** (grado 2 = 1 por semiciclo) | **Varias por ciclo** (grado 2 = 2 por ciclo) |
| **Qué duplica** | Nada | Nada: **profundiza el pipeline** | **Unidades funcionales** (ALU, load/store, captación) |
| **Tipo de paralelismo** | — | **Temporal** | **Temporal y espacial** |
| **IPC máximo** | **1** | 1 por subintervalo | **> 1** |
| **Límite** | IPC = 1 y atascos | **La tecnología**: la frecuencia máxima alcanzable | Dependencias, conflictos de recursos, complejidad de la lógica de emisión |
| **Tiempo de la instrucción individual** | — | **No varía** | — |

### Las 3 políticas de emisión

| | **Emisión y finalización ordenada** | **Emisión ordenada, finalización desordenada** | **Emisión y finalización desordenada** |
|---|---|---|---|
| **Orden de emisión** | El del programa | El del programa | **Libre** |
| **Orden de escritura** | El del programa | **Libre** | **Libre** |
| **Buffer intermedio** | No | No | **Ventana de instrucciones** |
| **Ciclos en el ejemplo (6 instrucciones)** | **8** | **7** | **6** |
| **Ventaja** | Lógica simple; excepciones precisas | Gana ciclos ejecutando anticipadamente | **Permite "ver" más allá del punto de conflicto** |
| **Desventaja** | El procesador **se detiene en el primer conflicto** | Aparecen **nuevos conflictos WAW y WAR**; lógica de emisión más compleja | La más compleja; necesita **renombrado de registros** para ser útil |

### Con y sin renombrado de registros

Estudio de la teoría, comparando la **aceleración (*speedup*)** en 4 tipos de
máquina —base sin duplicación, +ld/st, +ALU, +both— y **3 tamaños de ventana de
instrucciones (8, 16 y 32)**:

| | **Sin renombrado** | **Con renombrado** |
|---|---|---|
| **Efecto de duplicar unidades funcionales (ld/st y ALU)** | **Poco impacto**: la aceleración pasa de **2 a 2,5** | **Mejora fuertemente**: la aceleración pasa de **2,5 a 4** |
| **Efecto del tamaño de la ventana** | **De 8 a 32 no modifica significativamente** los resultados | **Impacto significativo al pasar de 8 a 16** instrucciones |

**Por qué la gran diferencia:**

- **Sin renombrado:** **todos** los conflictos por dependencias de datos (RAW, WAR,
  WAW) **se resuelven mediante detenciones del cauce (*stall*)**.
- **Con renombrado:** **se eliminan los conflictos por dependencia de salida y
  antidependencia (WAW, WAR)**, quedando **únicamente la dependencia directa o
  verdadera (RAW)**.

### Excepciones precisas vs. imprecisas

| Sistema | Tipo de excepción | Performance |
|---|---|---|
| **Con finalización desordenada** | **Imprecisas** | **Mayor** |
| **Con finalización ordenada** (es decir, **con buffer de reordenamiento**) | **Precisas** | **Menor** |

<p class="fuentes">Fuente: <code>Teorías/08 Arq clase8 Procesadores Superescalares.pdf</code>, fil. 6, 10–12, 18, 23–38, 48–51, 59.</p>

## Ejemplo del curso

### La secuencia de 6 instrucciones y las 3 políticas

**El procesador de referencia** es un superescalar con un **cauce de 3
segmentos**:

- **Búsqueda de instrucción y decodificación:** IF+D
- **Ejecución:** Ex
- **Escritura de resultados:** W

Y dispone de:

- **2 unidades de decodificación** D1 y D2
- **3 unidades de ejecución** E1, E2 y E3
- **2 copias de la etapa de escritura** W1 y W2

Como tiene 2 unidades de búsqueda y decodificación, **2 instrucciones pueden ser
leídas y decodificadas al mismo tiempo**, y **sólo se puede leer un nuevo par
cuando se liberan ambas unidades D1 y D2**. Para garantizar la correcta ejecución,
**los conflictos se resuelven parando la instrucción (*stall*) hasta que el
conflicto desaparece**.

**Características de la secuencia de 6 instrucciones:**

| Instrucción | Característica |
|---|---|
| **I1** | Tarda **2 ciclos** en ejecutarse |
| **I2** | Tarda **1 ciclo** |
| **I3 e I4** | Tardan 1 ciclo y **usan la misma unidad funcional (E3)** |
| **I5 e I6** | Tardan 1 ciclo y **usan la misma unidad funcional (E2)** |
| **I5** | **Depende del valor producido por I4** |

=== "Emisión y finalización ordenada — 8 ciclos"

    | Ciclo | D1 | D2 | E1 | E2 | E3 | W1 | W2 |
    |---:|---|---|---|---|---|---|---|
    | 1 | I1 | I2 | | | | | |
    | 2 | I3 | I4 | I1 | I2 | | | |
    | 3 | I3 | I4 | I1 | | | | |
    | 4 | | I4 | | | I3 | I1 | I2 |
    | 5 | I5 | I6 | | | I4 | | |
    | 6 | | I6 | | I5 | | I3 | I4 |
    | 7 | | | | I6 | | | |
    | 8 | | | | | | I5 | I6 |

=== "Emisión ordenada, finalización desordenada — 7 ciclos"

    | Ciclo | Decodificación | Ejecución | Escritura |
    |---:|---|---|---|
    | 1 | I1, I2 | | |
    | 2 | I3, I4 | I1, I2 | |
    | 3 | I4 | I1, I3 | I2 |
    | 4 | I5, I6 | I4 | I1, I3 |
    | 5 | I6 | I5 | I4 |
    | 6 | | I6 | I5 |
    | 7 | | | I6 |

=== "Emisión y finalización desordenada — 6 ciclos"

    | Ciclo | Decodificación | Ventana de instrucciones | Ejecución | Escritura |
    |---:|---|---|---|---|
    | 1 | I1, I2 | | | |
    | 2 | I3, I4 | I1, I2 | I1, I2 | |
    | 3 | I5, I6 | I3, I4 | I1, I3 | I2 |
    | 4 | | I4, I5, I6 | I6, I4 | I1, I3 |
    | 5 | | I5 | I5 | I4, I6 |
    | 6 | | | | I5 |

    **La clave:** en el ciclo 3 la ventana permite decodificar I5 e I6, y como
    **I6 no tiene dependencias puede emitirse anticipadamente, incluso antes de
    I5**.

### Los 3 riesgos con finalización desordenada

Programa de ejemplo:

```
R3 := R2 op R5    (I1)
R4 := R3 + 1      (I2)
R3 := R5 + 1      (I3)
R7 := R3 op R4    (I4)
```

| Riesgo | Explicación |
|---|---|
| **1) RAW** — dependencia verdadera | **I1 escribe el resultado en R3, que es un operando de I2** |
| **2) WAW** — dependencia de salida | **I1 escribe el resultado en R3 igual que I3.** Si I3 se escribe antes que I1, **entonces I4 usará un valor incorrecto de R3** |
| **3) WAR** — antidependencia | **I3 escribe en R3, pero I2 necesita el valor previo de R3.** I3 no puede escribir R3 **hasta que I2 haya leído el valor** |

### Esquema de un procesador superescalar concreto

- **La unidad de búsqueda de instrucciones (F)** busca y **carga en un buffer
  (cola de instrucciones)** las instrucciones leídas.
- **La unidad de decodificación/emisión** puede **tomar 2 instrucciones de la cola
  y decodificarlas**.
- **Hay 2 unidades de ejecución (ALU): una de punto fijo y otra de punto
  flotante.**
- Si de las 2 instrucciones que capta **una es de enteros y la otra de coma
  flotante (segmentada), y no existen riesgos, entonces pueden emitirse y
  ejecutarse a la vez**. Entran **2 instrucciones por ciclo**.

> **Es responsabilidad del compilador generar el código apropiado para el máximo
> aprovechamiento del procesador superescalar.**

<p class="fuentes">Fuente: <code>Teorías/08 Arq clase8 Procesadores Superescalares.pdf</code>, fil. 24–31, 33, 37–38, 40, 52–53.</p>

## Preguntas de final sobre este tema

[:material-help-box: Ver el banco de preguntas de superescalares](../finales/temas/superescalares.md)

## Fuentes citadas

- `Teorías/08 Arq clase8 Procesadores Superescalares.pdf` — 60 filminas. Fuente
  primaria del tema.

**Referencias que da la propia cátedra** (fil. 60): *Organización y Arquitectura de
Computadoras*, William Stallings, capítulo 13 de la 5.ª edición o capítulo 14 de la
7.ª edición.
