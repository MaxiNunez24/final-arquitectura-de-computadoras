# Segmentación de cauce

## Definición

**La segmentación del cauce (*pipelining*) consiste en:**

- **Descomponer el proceso de ejecución de las instrucciones en fases o etapas.**
- Las fases o etapas son **ejecutadas por unidades separadas y capaces de operar
  simultáneamente**.
- Las instrucciones **se van ejecutando a medida que se liberan las unidades**.
- Las instrucciones **no necesitan esperar la terminación de la previa** para
  comenzar a resolverse.

Es *una forma particularmente efectiva de organizar el hardware de la CPU para
realizar más de una tarea al mismo tiempo*. **Explota el paralelismo en el flujo
secuencial de instrucciones.**

<p class="fuentes">Fuente: <code>Teorías/04 Arq clase4 Segmentación de cauce.pdf</code>, fil. 31.</p>

## Desarrollo

### El procesador de referencia: el nanoMIPS

Para tratar estos temas es mejor usar **un modelo de procesador más sencillo** del
que se usó hasta ahora (8086 / MSX88). Se usa un **modelo de procesador
simplificado basado en el procesador MIPS**, que es un **procesador comercial tipo
RISC**.

**Características principales del nanoMIPS:**

- Palabra de memoria de **32 bits**.
- Espacio de direcciones de **64 bits** (virtual).
- **32 registros** de propósito general de 64 bits (R0..R31), **31 efectivos**.
- **El registro R0 es 0**: si referenciamos a R0 nos devuelve 0.
- Como son 32 registros, se requieren **5 bits** para identificarlos.

**Formato de instrucción — 3 tipos:**

| Tipo | Instrucciones | Campos |
|---|---|---|
| **I** | Acceso a memoria, únicamente **carga y almacenamiento** (`LOAD` y `STORE`) | **RS:** registro base · **RT:** registro fuente o destino de la transferencia · **Desp:** offset |
| **R** | **Aritméticas y lógicas**, únicamente **registro a registro** (no admite operaciones con memoria) | **RS:** operando 1 · **RT:** operando 2 · **RD:** resultado |
| **J** | **Salto** | **RS:** operando 1 · **RT:** operando 2 · **Destino:** desplazamiento respecto del PC (16 bits) |

**El acceso a la memoria se hace únicamente con las instrucciones tipo I. Por esta
razón a este tipo de máquinas se las identifica como máquina tipo
"LOAD/STORE".**

El formato es **muy regular** porque:

- Las instrucciones tienen **todas el mismo tamaño (32 bits)**.
- Los campos con referencias son **siempre los mismos**.

**Modos de direccionamiento.** Dispone **formalmente de 2**, pero considerando 2
casos especiales se obtienen **4 en total**:

| Modo | Descripción |
|---|---|
| **Inmediato** | Dato de 16 bits |
| **Indirecto con desplazamiento** | Suma de registro más un desplazamiento (distinto de 0) |
| **Indirecto vía registro** | Caso especial: si el **desplazamiento es 0** |
| **Directo absoluto** | Caso especial: si el desplazamiento es **vía registro R0** (que vale 0) |

**Repertorio básico de 8 instrucciones** —2 de movimiento de datos con memoria, 5
aritméticas y lógicas, 1 de salto condicional—:

| Tipo | Instrucción | Pseudocódigo | Descripción |
|---|---|---|---|
| I | `LW` | `LW RT, desp(RS)` | Carga registro RT desde memoria |
| I | `SW` | `SW RT, desp(RS)` | Almacena en memoria desde registro RT |
| R | `ADD` | `ADD RD, RS, RT` | Suma palabras en registros RS y RT, resultado en RD |
| R | `SUB` | `SUB RD, RS, RT` | Resta palabras en registros RS y RT, resultado en RD |
| R | `AND` | `AND RD, RS, RT` | AND de palabras en registros RS y RT, resultado en RD |
| R | `OR` | `OR RD, RS, RT` | OR de palabras en registros RS y RT, resultado en RD |
| R | `SLT` | `SLT RD, RS, RT` | Pone 1 en RD si RS es menor o igual que RT |
| J | `BEQ` | `BEQ RS, RT, destino` | Salta a 'destino' si RS es igual a RT |

### Ruta de datos, instrucciones y control

**Bloques identificables en la ruta de datos:**

- **Banco de registros:** compuesto por 32 registros (R0 = 0). Se pueden **leer 2
  registros al mismo tiempo** (doble entrada) y **escribir en 1 solo registro**.
- **ALU:** unidad de cálculo típica de **2 entradas y 1 salida**. En la entrada se
  pueden **seleccionar diferentes fuentes de datos**.
- **Unidad de cálculo de dirección de próxima instrucción:** calcula el próximo
  valor con el que se carga el PC. Puede ser el de la **instrucción consecutiva
  (PC+4)** o el resultado de **sumar un desplazamiento** (instrucción de salto).

**Existen 2 bancos de memoria:**

- **Memoria de instrucciones (MI):** sólo contiene el programa a ejecutar. Se
  accede **únicamente para lectura**, en la fase de búsqueda de la instrucción, y
  **sólo a través del PC**.
- **Memoria de datos (MD):** contiene los datos a leer o escribir. **Sólo se accede
  a través de las instrucciones LOAD y STORE.**

**Unidad de control (CU).** Es una unidad relativamente sencilla que **captura la
instrucción y a partir de ella genera las señales de control** requeridas por los
demás bloques operativos. En particular necesita el campo del **código de
operación (OPCODE)** —bits 31-26— para determinar qué tareas deberá realizar para
completar la instrucción corriente; con él genera señales como **RegWrite,
ALUSrc, MemWrite, MemToReg**, etc. El resto de los campos se usan para las
identificaciones restantes: RS selecciona 1 registro del banco, ídem RT y RD
cuando corresponda.

### Las 5 fases del ciclo de instrucción del nanoMIPS

| Fase | Nombre | ¿En qué instrucciones ocurre? | Qué hace |
|---|---|---|---|
| **F** | Búsqueda de instrucción (*Fetch*) | **Todas** | Busca y lee la instrucción en la memoria de instrucciones. **Actualiza el PC** sumando 4: cada instrucción ocupa 4 bytes, por lo que la próxima consecutiva está en la dirección actual + 4 |
| **D** | Decodificación (*Decode*) y acceso a registros | **Todas** | Decodifica la instrucción (del campo CODOP) y **accede al banco de registros**. Opcionalmente, extensión del signo del offset para el cálculo de la dirección efectiva |
| **X** | Ejecución (*Execute*) | **Todas** | Se ejecuta la operación en la **ALU** |
| **M** | Acceso a memoria (*Memory Access*) | **Sólo en LOAD y STORE** | Se accede a memoria |
| **W** | Almacenamiento en registro (*Writeback*) | En las que **almacenan un dato en un registro** | Escribe en el registro. También es en esta fase cuando puede calcularse el desplazamiento a sumar al PC en instrucciones de salto |

**Qué fases usa cada instrucción:**

| Instrucción | Secuencia | Fases |
|---|---|---|
| **LOAD** | F-D-X-M-W | **5**: requiere todas |
| **STORE** | F-D-X-M | **4**: no tiene fase W |
| **Aritmético/lógica** | F-D-X-W | **4**: no tiene fase M |
| **Salto** | F-D-X-W | **4**: no tiene fase M |

??? example "Detalle de la ejecución de cada tipo de instrucción"

    === "LOAD"

        - **Fase F:** lee la instrucción. Los bits 26–31 son leídos por la UC; los
          bits 21–25 identifican **RS** (registro puntero); los bits 16–20
          identifican **RT** (destino o de escritura); los bits 0–15 son el
          **desplazamiento** a sumar al RS.
        - **Fase D:** la UC decodifica la instrucción y se accede al registro RS.
        - **Fase X:** se calcula la **dirección efectiva** donde está el operando
          a cargar en RT, como el valor de RS más el desplazamiento (inmediato).
        - **Fase M:** con la dirección efectiva se accede a la memoria de datos y
          se **lee el dato** a cargar en RT.
        - **Fase W:** el dato de la memoria **se carga en el registro RT**.

    === "STORE"

        - **Fase F:** igual que LOAD: bits 26–31 a la UC, 21–25 → RS, 16–20 → RT,
          0–15 → desplazamiento.
        - **Fase D:** la UC decodifica y se accede al registro RS.
        - **Fase X:** se calcula la **dirección efectiva** donde se va a almacenar
          el operando cargado en RT, como RS + desplazamiento.
        - **Fase M:** con la dirección efectiva se accede a la memoria de datos y
          se **carga el dato almacenado en RT**.
        - **Fase W:** **no hay.**

    === "ADD"

        - **Fase F:** lee la instrucción. Bits 26–31 a la UC; bits 21–25 → **RS**
          (1.er operando); bits 16–20 → **RT** (2.º operando); bits 11–15 → **RD**
          (registro destino).
        - **Fase D:** la UC decodifica y se accede a **los registros RS y RT**.
        - **Fase X:** se **suman los contenidos** de RS y RT.
        - **Fase M:** **no hay.**
        - **Fase W:** se **escribe el resultado en RD**.

### Los 3 modos de ejecución

=== "Monociclo"

    Cada vez que el PC envía una dirección a la memoria de instrucciones, se
    accede a una nueva instrucción. **Como no hay registros sincrónicos
    intercalados** en las trayectorias de datos e instrucciones, el dato **fluye
    por las unidades funcionales** (registros, ALU, memoria, MUX, etc.) hasta que
    se completa la ejecución de la instrucción. **No se inicia un nuevo ciclo de
    instrucción hasta que el PC se carga con un nuevo valor.** Si el PC está
    sincronizado con el reloj de la CPU, **en cada ciclo de reloj se inicia una
    nueva instrucción**.

    - **El período del reloj se hace con el tiempo necesario para completar la
      instrucción más lenta.**
    - En las instrucciones más rápidas el procesador **"espera" el fin del ciclo**
      para continuar.
    - **La eficiencia depende del tiempo de resolución de la instrucción más
      lenta.**

=== "Multiciclo"

    En la ejecución monociclo el ciclo de reloj se hace en función de la
    instrucción "más larga", es decir la de **LOAD**. Las instrucciones "más
    cortas" tienen que esperar hasta que se complete el período de reloj. **Si la
    tasa de instrucciones cortas es mucho mayor que la de las largas, se puede
    perder mucho tiempo inútilmente.**

    La solución es **fijar un ciclo de reloj más pequeño y disponer que cada
    instrucción ocupe varios períodos de reloj**.

    - Cada instrucción requiere **varios ciclos de reloj**.
    - Las instrucciones más rápidas **usan menos ciclos** que las más lentas.
    - **El ciclo de instrucción es variable y se ajusta al tipo de instrucción.**

=== "Segmentado (pipeline)"

    Las etapas se **solapan**: mientras una instrucción está en la etapa X, la
    siguiente está en D y la siguiente en F. Ver el desarrollo completo más abajo.

### La analogía de la lavandería

Para entender el concepto de segmentación de una tarea repetitiva, la teoría
analiza el "proceso" de una **lavandería** con 3 etapas, ejecutadas en **3
sectores (estaciones) separados**:

| Etapa | Duración |
|---|---|
| Lavado | 30 minutos |
| Secado | 40 minutos |
| Despacho | 20 minutos |

**Ejecución secuencial.** Cuando se termina con un encargue recién se empieza con
el siguiente. Cada tarea (A, B, C, D) requiere en total 90 minutos (30+40+20) →
**tiempo total = 6 horas**.

**Ejecución solapada.** Como las unidades funcionales son distintas, **pueden
operar en forma simultánea**. Solapando las tareas A, B, C y D se consigue
realizarlas en **3 horas 30 minutos**, en lugar de las 6 horas del modelo
secuencial.

**Cada tarea sigue llevando exactamente el mismo tiempo: 90 minutos. La mejora se
obtiene debido al solapamiento** de las tareas de las distintas unidades
funcionales. Este concepto se puede aplicar al proceso repetitivo de ejecutar una
secuencia de instrucciones.

### Segmentación en el nanoMIPS

**Los 5 segmentos del nanoMIPS** y los recursos que usan:

| Segmento | Qué hace | Recurso |
|---|---|---|
| **F** | Búsqueda de la instrucción | **MI** — memoria de instrucciones |
| **D** | Decodificación y acceso a registros | **BR** — banco de registros |
| **X** | Ejecución | **ALU** |
| **M** | Acceso a la memoria de datos | **MD** — memoria de datos |
| **W** | Escritura del resultado en el banco de registros | **BR** |

**Cómo se implementa.** Para aplicar la segmentación hay que **dividir (segmentar)
el cauce de los datos en etapas**, y la forma de hacerlo es **usando registros
sincrónicos entre cada etapa**. Los datos avanzan de etapa a etapa **en cada ciclo
de reloj**, que es cuando el registro de separación de la etapa **copia a la
salida lo que tiene en su entrada**.

**También hay que segmentar el control.** Así como se segmenta el cauce de los
datos, **también se debe hacer lo mismo con las señales que controlan las unidades
funcionales** (MI, BR, ALU, MD, BR), porque **cada unidad funcional está operando
con diferentes instrucciones**, en diferentes estados de ejecución. Por ejemplo:
mientras el BR está buscando los operandos de la instrucción I1, la MI estará
buscando la instrucción I2. Las señales de control **se segmentan igual que el
cauce de datos, usando registros sincrónicos entre cada etapa**.

**Comportamiento con una secuencia de 5 instrucciones:**

- Se considera que **cada instrucción requiere 5 ciclos de reloj**, uno por cada
  segmento (F-D-X-M-W).
- **En cada ciclo se incorpora una nueva instrucción**, sin haber completado las
  anteriores.
- **La primera instrucción se termina en el período de reloj 5**; hasta ese ciclo
  no se había resuelto ninguna instrucción.
- **A partir del quinto ciclo, se termina 1 instrucción por ciclo.**
- Notar que en el quinto ciclo el procesador está **ejecutando 5 instrucciones
  simultáneamente, pero en distintas fases**.

### Análisis del rendimiento

**El máximo rendimiento teórico se obtiene cuando se completa una instrucción en
cada ciclo de reloj.** En esas condiciones **todas las unidades funcionales están
trabajando simultáneamente con distintas instrucciones**.

Si **K** es el número de etapas del cauce, entonces:

> **Vel. procesador segmentado = K × Vel. secuencial**

**El incremento potencial de la segmentación del cauce es proporcional al número
de etapas del cauce.**

!!! important "Lo que la segmentación NO mejora"
    **No se mejora la velocidad de ejecución de la instrucción.** La segmentación
    **incrementa la productividad (*throughput*)**, es decir, la **cantidad de
    instrucciones resueltas en un período de tiempo determinado**.

**Suposiciones del análisis anterior:**

- Todas las tareas o segmentos **duran la misma cantidad de ciclos de reloj**.
- Todas las instrucciones **siempre pasan por todas las mismas etapas**.
- Todas las etapas **pueden ser manejadas en paralelo** (no hay conflictos para
  usarlas simultáneamente).
- **No se consideraron instrucciones de salto.**

**Correcciones para un análisis realista:**

1. **No todas las instrucciones necesitan todas las etapas.** Ej.: en el nanoMIPS
   la instrucción `SW RT, inmed(RS)` no utiliza W. Ej.: en el MSX88, un
   `MOV AX, mem` no requiere X.
2. **No todas las etapas pueden ser manejadas en paralelo.** Ej.: si la memoria no
   estuviera dividida y fuera una sola, los segmentos F (búsqueda de la
   instrucción) y M (acceso a memoria) accederían ambos a la misma memoria.
3. **Los programas tienen instrucciones de salto.**

### Los riesgos (conflictos)

**Los conflictos que aparecen al tener en cuenta esas correcciones se denominan
riesgos. Existen 3 tipos:**

#### 1. Riesgos estructurales

Son **conflictos provocados por el uso de los "recursos"**. Los recursos
típicamente son: **memoria, ALU, registros**.

**Ejemplo — la memoria.** Si la memoria del nanoMIPS fuera una sola (instrucciones
y datos), habría un conflicto **cada vez que se solapan los ciclos M y F**. Por
esta razón **la memoria del nanoMIPS está dividida en MI y MD**, de manera de
reducir los conflictos por accesos a memoria.

Otra opción para evitar el conflicto por el acceso a un recurso es **retardar
(retrasar) la ejecución de la tarea** los ciclos de reloj necesarios hasta que
desaparece el conflicto. Pero **al perder ciclos de reloj se pierde tiempo y baja
la performance** del procesador. Y además, **el retraso puede generar nuevos
conflictos** que también deben resolverse de alguna manera.

#### 2. Riesgos por dependencia de datos

Son **conflictos originados entre 2 o más instrucciones que comparten un mismo
dato**. Por ejemplo, una instrucción produce un resultado que lo necesita otra,
ambas dentro del cauce de datos. Hay riesgo **cuando un dato es usado en 2 o más
segmentos del cauce**: **los operandos fuente o destino de una instrucción no
están disponibles en el momento en que se necesitan** en una etapa determinada del
cauce.

**Los 3 tipos de dependencias de datos:**

| Sigla | Nombre | Qué ocurre | Observación |
|---|---|---|---|
| **RAW** | Lectura después de escritura — **dependencia verdadera / real** | Una instrucción **escribe** un dato que otra **lee** posteriormente | — |
| **WAW** | Escritura después de escritura — **dependencia de salida** | Una instrucción **escribe** un dato que otra **escribe** posteriormente | **Sólo ocurre si se permite que las instrucciones se adelanten unas a otras** (alteración en la secuencia de ejecución) |
| **WAR** | Escritura después de lectura — **antidependencia** | Una instrucción **lee** un dato que otra **escribe** posteriormente | **No se puede dar en nuestro cauce simple** |

#### 3. Riesgos por dependencia de control

Son **conflictos que ocurren cuando la ejecución de una instrucción depende de
cómo se ejecute otra** —por ejemplo, un salto y los 2 posibles caminos—. Pueden
ocurrir cuando se va a ejecutar una **instrucción de salto condicional**: una
instrucción tiene que **calcular el nuevo valor que modifica el PC**, y **la
próxima instrucción no puede comenzar hasta que no se resuelva el salto**.

### Soluciones básicas por retardo

La clase 4 muestra la solución elemental —**parar el cauce**— para los tres tipos:

- **Estructural:** se retrasa el inicio de `AND R9,R10,R11` **1 ciclo** (ciclo de
  parada) para evitar el conflicto con `LW R1,100(R2)`.
- **Dependencia de datos:** se retrasa la decodificación D de `ADD R3,R1,R4`
  **3 ciclos** para esperar a tener disponible el dato de `LW R1,100(R2)`. Se
  considera que la **escritura W de LW se hace en el primer medio ciclo** y se
  puede **leer por ADD en el segundo semiciclo**.
- **Dependencia de control:** se retrasan **3 ciclos** la próxima instrucción,
  hasta que se resuelva el cálculo de la instrucción de salto.

Las soluciones más elaboradas están en la clase 5:
[ver soluciones a los riesgos de segmentación](soluciones-segmentacion.md).

<p class="fuentes">Fuente: <code>Teorías/04 Arq clase4 Segmentación de cauce.pdf</code>, fil. 4–16, 17–26, 27–30, 31–36, 45–54, 55–57, 58–66.</p>

## Diagrama

<!-- Diagrama pendiente (Tarea 4): cauce de 5 etapas del nanoMIPS con riesgos
     (fil. 46, 49, 52, 54, 59, 61, 64–66). -->

## Ventajas y desventajas o comparaciones

### Monociclo vs. multiciclo vs. segmentado

| | **Monociclo** | **Multiciclo** | **Segmentado** |
|---|---|---|---|
| **Ciclo de reloj** | Fijado por la **instrucción más lenta** (LOAD) | **Más pequeño**; cada instrucción ocupa varios períodos | Un ciclo por etapa |
| **Ciclos por instrucción** | 1 (largo) | **Variable**, se ajusta al tipo de instrucción | 1 por etapa, pero **solapadas** |
| **Problema que resuelve** | — | Las instrucciones cortas **no desperdician** el resto del ciclo | Las unidades funcionales **no quedan ociosas** |
| **Desventaja** | Si hay muchas instrucciones cortas **se pierde mucho tiempo inútilmente**; la eficiencia depende de la instrucción más lenta | Sigue ejecutando **de a una instrucción por vez** | Aparecen los **riesgos** |

### Rendimiento de la segmentación — ejemplos numéricos

| Máquina | Segmentado | Secuencial | Ciclos por instrucción |
|---|---|---|---|
| **3 etapas (F, D, E)**, 3 instrucciones | **5 ciclos** | **9 ciclos** | 3 en ambos casos |
| **4 etapas (F, D, E, W)**, 5 instrucciones | **8 ciclos** | **20 ciclos** (5 × 4) | 4 en ambos casos |

**En ambos casos cada instrucción sigue requiriendo la misma cantidad de ciclos de
reloj.** La ganancia es en throughput, no en latencia individual.

### Conclusiones sobre la segmentación

- El comportamiento de un procesador ejecutando una secuencia de instrucciones **se
  comporta de forma similar a una línea de montaje** en una planta de manufactura.
- Cada instrucción pasa, durante su ejecución, por varias etapas; **en cada una se
  realiza sólo una parte del todo**.
- **La entrada de una nueva instrucción puede hacerse antes de que se terminen las
  anteriores.** Por lo tanto **varias instrucciones están siendo manipuladas
  simultáneamente, cada una en un estado de ejecución distinto**.
- Dado que el procesador tarda menos tiempo en resolver un conjunto de
  instrucciones, **la segmentación mejora las prestaciones a nivel de diseño del
  hardware**.
- Como **el programador no interviene** en la segmentación y solapamiento de las
  instrucciones, **la segmentación es "invisible" (por ahora) al programador**.
- **Se puede usar tanto en procesadores RISC como CISC.**
- El **diseño de procesadores segmentados tiene gran dependencia del repertorio de
  instrucciones**. [Ver RISC vs CISC](risc-cisc.md).

### Comparación de los 3 tipos de riesgo

| | **Estructural** | **Dependencia de datos** | **Dependencia de control** |
|---|---|---|---|
| **Causa** | Uso simultáneo de un **recurso** (memoria, ALU, registros) | 2 o más instrucciones **comparten un dato** | La ejecución de una instrucción **depende de cómo se ejecute otra** (salto) |
| **Ejemplo del curso** | Solapamiento de F y M con memoria única | RAW entre `LW R1,100(R2)` y `ADD R3,R1,R4` | Salto condicional |
| **Solución elemental** | Dividir el recurso (**MI y MD separadas**) o **retardar** | **Retardar** la etapa D | **Retardar** 3 ciclos |

<p class="fuentes">Fuente: <code>Teorías/04 Arq clase4 Segmentación de cauce.pdf</code>, fil. 28–30, 39, 42, 43–44, 58–66.</p>

## Ejemplo del curso

El **ejemplo del curso es el nanoMIPS mismo**, desarrollado en el apartado
[El procesador de referencia](#el-procesador-de-referencia-el-nanomips) y en
[Segmentación en el nanoMIPS](#segmentacion-en-el-nanomips). Los casos concretos
que resuelve la teoría:

### Analogía de la lavandería

3 etapas (lavado 30', secado 40', despacho 20'), 4 encargues A/B/C/D:

| Modo | Tiempo total |
|---|---|
| **Secuencial** | **6 horas** |
| **Solapado** | **3 horas 30 minutos** |

Cada tarea sigue llevando 90 minutos: **la mejora es puramente por solapamiento**.

### Conteo de ciclos con y sin segmentación

- Máquina de **3 fases** (F, D, E) y **3 instrucciones**: secuencial **9 ciclos**,
  segmentado **5 ciclos**.
- Máquina de **4 fases** (F, D, E, W) y **5 instrucciones**: secuencial **20
  ciclos** (5 × 4), segmentado **8 ciclos**.
- nanoMIPS de **5 etapas** y **5 instrucciones**: la primera termina en el ciclo
  5, y **a partir de ahí se termina 1 instrucción por ciclo**. En el quinto ciclo
  hay **5 instrucciones ejecutándose simultáneamente en distintas fases**.

### Riesgos concretos que muestra la teoría

| Riesgo | Instrucciones | Resolución mostrada |
|---|---|---|
| **Estructural** | `LW R1,100(R2)` vs. `AND R9,R10,R11` | Retrasar el inicio del AND **1 ciclo de parada** |
| **Datos (RAW)** | `LW R1,100(R2)` → `ADD R3,R1,R4` | Retrasar la fase D del ADD **3 ciclos**, considerando que W de LW se hace en el **primer medio ciclo** y la lectura en el **segundo semiciclo** |
| **Control** | Salto condicional | Retrasar **3 ciclos** la próxima instrucción |

<p class="fuentes">Fuente: <code>Teorías/04 Arq clase4 Segmentación de cauce.pdf</code>, fil. 32–36, 39, 42, 50, 59–66.</p>

## Preguntas de final sobre este tema

[:material-help-box: Ver el banco de preguntas de segmentación](../finales/temas/segmentacion.md)

## Fuentes citadas

- `Teorías/04 Arq clase4 Segmentación de cauce.pdf` — 67 filminas. Fuente primaria
  del tema.

**Referencias que da la propia cátedra** (fil. 67): W. Stallings, 5.ª ed., capítulo
11; Hwang & Briggs, *Computer Architecture & Parallel Processing*, capítulo 10;
M. Pardo y A. Sacristán, *Diseño y evaluación de arquitecturas de computadoras*.
