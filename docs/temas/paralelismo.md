# Procesamiento paralelo

## Definición

**La demanda de máquinas de mayor rendimiento es una exigencia que surgió desde la
aparición de las primeras computadoras, y continúa en forma permanente.**

**Existen 2 caminos para aumentar la capacidad de procesamiento:**

| Camino | Qué requiere |
|---|---|
| **1. Mejorar el rendimiento de una máquina con un solo procesador** | **Explotar el paralelismo a nivel instrucción (ILP)** · **Optimizar la detección del paralelismo a nivel de hardware (MPL)** |
| **2. Disponer de sistemas con varios procesadores** | **Explotar el paralelismo a nivel proceso** · **Detección del paralelismo a nivel de sistema operativo, compilador o programación** |

<p class="fuentes">Fuente: <code>Teorías/09 Arq clase9 Procesamiento paralelo.pdf</code>, fil. 3–4.</p>

## Desarrollo

### Taxonomía de Flynn

Existen varias formas distintas de clasificar los sistemas de cómputo. Una de
ellas **se basa en determinar las cantidades de flujos de instrucciones y datos
que se pueden transferir simultáneamente**. En base a este concepto se tienen **4
tipos básicos de máquinas**:

| Sigla | Significado | Ejemplos |
|---|---|---|
| **SISD** | **Una** secuencia de instrucciones, **una** secuencia de datos | **Monoprocesadores** |
| **SIMD** | **Una** secuencia de instrucciones, **múltiples** secuencias de datos | **Procesadores vectoriales y matriciales** |
| **MISD** | **Múltiples** secuencias de instrucciones, **una** secuencia de datos | **Modelo teórico**: no hay registros de máquinas de este tipo |
| **MIMD** | **Múltiples** secuencias de instrucciones y **múltiples** secuencias de datos | Memoria compartida (**SMP**, **NUMA**) y memoria distribuida (**clusters**) |

**El árbol completo de organizaciones de computadores:**

- **SISD** → Monoprocesadores
- **SIMD** → Procesadores vectoriales · Procesadores matriciales
- **MISD**
- **MIMD** → **Memoria compartida (fuertemente acoplada)**: Multiprocesador
  simétrico (SMP) · Acceso no uniforme a memoria (NUMA) — **Memoria distribuida
  (débilmente acoplada)**: Clusters

#### SISD (Single Instruction – Single Data)

Estructura funcional: **UC → SI → EP → SD → UM**

- **UC:** Unidad de Control (captura de instrucciones)
- **EP:** Elemento de Proceso (ejecuta)
- **UM:** Unidad de Memoria (almacenamiento de datos)
- **SI:** secuencia de instrucciones · **SD:** secuencia de datos

Es un sistema básicamente compuesto por **una UC, un EP y una UM**. **La UC
interpreta (lee) una única secuencia de instrucciones, que el EP resuelve sobre
una única secuencia de datos proveniente de la UM.**

#### SIMD (Single Instruction – Multiple Data)

Es un sistema compuesto por:

- **una Unidad de Control (UC)**
- **una matriz de elementos computacionales o elementos de proceso (EP)**
- **una unidad de memoria local (ML) por cada EP**

**La UC interpreta una única secuencia de instrucciones que múltiples EP resuelven
simultáneamente, cada uno sobre una secuencia de datos proveniente de su propia
ML.** Cada instrucción es ejecutada por varios EP, cada uno con sus propios datos.

**En estas máquinas se requiere disponer de:**

- **Un conjunto ampliado de instrucciones** —además de las "convencionales" o
  escalares— para permitir manejar **operaciones vectoriales**: el repertorio
  incluye operaciones de suma, almacenamiento, multiplicación, etc., **de
  vectores**, para poder asignar a los EP.
- **Instrucciones para transferir datos entre EP**, que es un **atributo típico de
  un "lenguaje paralelo"**.

#### MISD (Multiple Instruction – Single Data)

Es un sistema compuesto por:

- **una matriz de elementos de proceso (EP), cada uno con su propia Unidad de
  Control (UC)**
- **una Unidad de Memoria (UM) para todos los EP**

**Cada UC interpreta una secuencia de instrucciones que cada EP resuelve
simultáneamente sobre una única secuencia de datos proveniente de una sola
memoria.** Se transmite una única secuencia de datos a un conjunto de
procesadores, **cada uno ejecutando su propia secuencia de operaciones**.

> **Es un modelo teórico: no hay registros de máquinas de este tipo** (hay algunas
> de características similares pero no cumplen los requisitos para ser exactamente
> tipo SIMD [sic — la filmina dice "SIMD" donde el contexto pide **MISD**]).

#### MIMD (Multiple Instruction – Multiple Data)

Es un sistema compuesto por **múltiples procesadores (UC)** ejecutando **múltiples
secuencias de instrucciones (MI)** sobre **múltiples secuencias de datos (MD)**.

**Se pueden dividir según la organización de la memoria** —que es también la forma
de comunicarse—:

- **MIMD de memoria compartida**, con **2 variantes**:
    - **SMP** (multiprocesadores simétricos)
    - **Sistemas NUMA**
- **MIMD de memoria distribuida**, comúnmente llamados **clusters**. Los nodos se
  vinculan por una **red de interconexión**.

### Multiprocesadores simétricos (SMP)

**Características principales:**

- **Dos o más procesadores idénticos** (o muy similares) de **capacidades
  comparables (homogéneos)**.
- **Memoria principal y E/S única (compartida)** por todos los procesadores.
- **Interconexión mediante un bus u otro tipo de medio similar** → **"fuertemente
  acoplados"**.
- **Igual tiempo de acceso a la memoria para todos los procesadores.** Por eso se
  los identifica como del tipo **"UMA": *Uniform Memory Access***.
- **Todos los procesadores pueden desempeñar las mismas funciones.**
- **Sistema operativo integrado**, que proporciona la interacción entre los
  procesadores y sus programas.

### Multiprocesadores NUMA

**Multiprocesadores con memoria compartida y distribuida. Características
principales:**

- **Dos o más procesadores idénticos** (o muy similares) de capacidades
  comparables (**homogéneos**) **formando "nodos"**.
- **Cada nodo es un procesador completo con su propia memoria local y E/S.** Los
  nodos tienen **características muy similares**.
- **Los nodos están interconectados mediante una red de interconexión.**
- **El espacio de direcciones (memoria lógica) es común a todos los procesadores**,
  por eso es un **sistema de memoria compartida**. Pero **el tiempo de acceso al
  espacio de memoria es distinto para el acceso a la memoria local que para el
  acceso a las memorias de los otros nodos**.
- **Por eso se los llama NUMA: *Non Uniform Memory Access*.**
- **Todos los procesadores pueden desempeñar las mismas funciones.**
- **El SO está integrado** y proporciona la interacción entre los procesadores y
  sus programas.

### Clusters

**Multiprocesadores de memoria distribuida. Características principales:**

- **Compuesto por 2 o más nodos.**
- **Cada nodo es un procesador completo con su propia memoria local y E/S.** Los
  nodos pueden tener **características similares ("homogéneos") o distintas
  ("heterogéneos")**.
- **Interconectados mediante una red de interconexión.** Debido al tipo de red y
  protocolo de comunicación **se los considera del tipo "levemente acoplados"**.
- **Como los espacios de direcciones son independientes, es un sistema de memoria
  distribuida.**
- **Todos los procesadores pueden desempeñar las mismas funciones.**
- **El SO está integrado** y proporciona la interacción entre los procesadores y
  sus programas.
- **La comunicación entre procesos es en base a mensajes**, a resolver por el
  programa.

**Los clusters, básicamente, son computadoras completas, interconectadas, que
trabajan conjuntamente como un único recurso.** Es decir, **para las tareas en
ejecución se comportan como si fueran una única máquina**. Cada computadora se
denomina **"nodo"**. En general presentan **prestaciones y disponibilidad
elevadas**. **Las aplicaciones son propias de un servidor, y constituyen una
alternativa a los SMP.**

### Tipos de acceso a memoria: UMA, NUMA, CC-NUMA

Los sistemas multiprocesadores se pueden clasificar de acuerdo al **tipo de acceso
a memoria**:

| Tipo | Características | Ejemplo que da la teoría |
|---|---|---|
| **1. UMA** — *Uniform Memory Access* | **Igual tiempo de acceso a todas las regiones de memoria** · **Igual tiempo de acceso a memoria para los diferentes procesadores** | **SMP** |
| **2. NUMA** — *Non-uniform Memory Access* | **El tiempo de acceso de un procesador difiere dependiendo de la región de memoria que accede** · **Diferentes procesadores acceden a diferentes regiones de memoria a diferentes velocidades** | **Cluster** |
| **3. CC-NUMA** — caché coherente NUMA | **Es un NUMA que mantiene coherencia de caché entre las cachés de los distintos procesadores** | **Sistemas con memoria compartida distribuida** |

!!! warning "Inconsistencia dentro de la propia teoría sobre NUMA y Cluster"
    La misma clase da dos ubicaciones distintas para el cluster:

    - **Fil. 6 y 17** clasifican el **cluster como MIMD de memoria distribuida**,
      separado de NUMA, que es **memoria compartida**. La fil. 26 lo confirma:
      *"como los espacios de direcciones son independientes, es un sistema de
      memoria distribuida"*.
    - **Fil. 33**, en cambio, pone **"Ej: Cluster"** como ejemplo de **NUMA**.
    - **Fil. 31**, dentro del apartado de clusters, da como ejemplo *"el SGI
      Origin de Silicon Graphics es un **NUMA** con 1024 procesadores MIPS
      R10000"*.

    **Prevalece la clasificación de fil. 6, 17 y 26** —que es la que desarrolla el
    tema y coincide con la taxonomía de Flynn presentada—: **NUMA es memoria
    compartida con acceso no uniforme; cluster es memoria distribuida**. La
    mención de fil. 33 apunta a que **el patrón de tiempos de acceso no uniformes
    también se observa en un cluster**, no a reclasificarlo.

### Sistemas CC-NUMA

**Características:**

- **Cada nodo tiene 2 o más procesadores** (por ejemplo un SMP), **cierta cantidad
  de memoria principal y E/S**.
- **Cada procesador tiene su caché** (típicamente L1 y L2).
- **Los nodos están interconectados por algún tipo de red.**
- **Existe un espacio de direcciones de memoria único para todos los procesadores
  de todos los nodos.**
- **La coherencia se mantiene en forma automática y transparente.**

**Orden de acceso a memoria:**

1. **Caché L1** (local al procesador)
2. **Caché L2** (local al procesador)
3. **Memoria principal** (local al nodo)
4. **Memoria remota** (petición por red)

### Arquitecturas on-chip

Las arquitecturas on-chip, tanto **con memoria compartida** como **con memoria
distribuida**, pueden ser:

- **Homogéneas:** si **todos los procesadores son idénticos**.
- **Heterogéneas:** si **los procesadores tienen distintas prestaciones**.

### Procesamiento multihebra (multithreading)

#### Proceso vs. hebra

| | **Proceso** | **Hebra (*thread*) o hilo** |
|---|---|---|
| **Qué es** | **Un programa ejecutándose ("corriendo") en un sistema** | **Una unidad de trabajo** |
| **Recursos** | Es **"propietario" de recursos propios** | **Tiene su propio contexto de procesador** (incluidos PC y SP) y **área de datos para su pila (stack)** |
| **Memoria** | Maneja un **espacio de direcciones virtuales** para almacenar la imagen del proceso (code, data, stack, etc.), con información propia del estado del proceso y planificación/ejecución por el SO | **Comparte con otras hebras** código, variables globales (espacio de memoria), archivos abiertos por el proceso al que pertenecen, etc. |
| **Ejecución** | — | **Se ejecuta secuencialmente** |
| **Comunicación** | A través de **mecanismos específicos** | — |
| **Conmutación** | El ***process switch*** requiere **un cambio de los recursos asignados**, mediante mecanismos precisos y complejos | **Relativamente fácil de interrumpir**: el procesador cambia a otra hebra rápidamente si lo necesita. El ***thread switch*** es un **cambio de control del procesador entre hebras de un mismo proceso** |

> **Un proceso está compuesto de muchas hebras o hilos.**

#### IPL vs. TPL

Se pueden aumentar las prestaciones de un sistema en **2 niveles**:

- **Nivel de instrucciones (IPL):** aumentando la **cantidad de instrucciones
  ejecutadas en paralelo**, explotando el paralelismo de instrucciones
  secuenciales.
- **Nivel de hebras (TPL):** aumentando el nivel de hebras en paralelo,
  **explotando el paralelismo entre instrucciones pertenecientes a distintos hilos
  de ejecución**. Esto involucra el **sistema operativo, el compilador y el
  hardware**.

El IPL explota el paralelismo a nivel de instrucciones **pertenecientes a un solo
hilo o hebra de ejecución**: **si el programa no tiene mucho paralelismo, el
resultado va a ser pobre**. Pero un proceso puede tener muchas hebras, entonces:

- **Las instrucciones de diferentes hebras pueden ser paralelizadas.**
- **Se pueden mejorar las prestaciones generales si se ejecuta más de una hebra en
  paralelo (simultáneamente).**
- **La idea es que si hay recursos libres durante la ejecución de una hebra,
  ejecutando varias hebras se puede hacer un mejor aprovechamiento de los
  recursos.**
- **No se mejora el tiempo de ejecución de una hebra.**

**El procesamiento de múltiples hebras (multithreading) consiste en ejecutar 2 o
más hebras en forma concurrente.** El ejemplo del curso: si se ejecuta **1 sola
hebra**, el procesador **queda inactivo durante los períodos de tiempo donde se
ejecutan acciones de E/S**. Pero si se pueden ejecutar múltiples hebras, **durante
los períodos de E/S puede ejecutar otras hebras**.

**Tipos de multihebra:**

- **Explícitas:** **definidas en el programa**, tanto a nivel de usuario
  (aplicaciones) como a nivel de sistema operativo (núcleo).
- **Implícitas:** **definidas por el compilador (estático) o por hardware
  (dinámico)**.

**Para implementar procesamiento multihebra es necesario, al menos:**

- **Un PC (contador de programa) distinto para cada hebra** que pueda ejecutarse
  concurrentemente.
- **Hardware para ejecución concurrente.**

#### Cambios de contexto de hebras

**El contexto de una hebra está formado por:**

- El **contador de programa (PC)**
- **Registros** de datos, de direcciones (punteros), de estado, control, de
  segmentos
- **Datos propios en memoria** (eventualmente)
- **Datos en caché** (eventualmente)

**Hay 2 tipos de cambio de contexto:**

| | **Tradicional** | **Rápido (por hardware)** |
|---|---|---|
| **Quién/qué lo produce** | **El SO mediante una interrupción**, típicamente asociada a un **timer** (asignación temporal de hebras) | **La hebra queda en espera por alguna razón**, típicamente por un **fallo de acceso a la caché** |
| **Secuencia** | La interrupción **detiene la hebra en ejecución** → el SO **salva el contexto** de la hebra en ejecución → el SO **recupera el contexto** de la hebra detenida anteriormente → la hebra detenida **se reinicia mediante un retorno de interrupción** | **Si el procesador tiene duplicados al menos el PC y los registros** (todos o gran parte), **el procesador conmuta de hebra sin necesidad de salvar el contexto** de la hebra detenida por el fallo, que consume tiempo |
| **Observación** | **La hebra detenida no se entera de que fue interrumpida** | **Mucho más rápido que el tradicional** del SO. Tener en cuenta que la **penalización de fallo de acceso a la caché es de varios órdenes de magnitud** respecto de un acceso a la caché |

#### Las 4 políticas de ejecución multihebra

Las hebras en ejecución usan recursos, que pueden ser asignados de **2 formas**:

- **Estática:** el **particionado de recursos es fijo**.
- **Dinámica:** el **particionado de recursos cambia** por algún mecanismo.

| Política | Qué hace | Tipo de partición | Ejemplos |
|---|---|---|---|
| **CMP** — *Chip Multi Processor* | El procesador dispone de **2 o más núcleos**. **A cada núcleo se le asigna una hebra en forma fija** | **Estática espacial** | Típico de **procesadores SMP de 2 o más núcleos** |
| **FGMT** — *Fine Grained Multi Threading* | **El procesador conmuta de una hebra a otra en cada ciclo.** La conmutación es rápida, **1 sola hebra por vez**. Dispone de **2 o más contextos** para ejecutar 2 o más hebras concurrentemente | **Estática temporal** | **Cray CDC 6600** y **Denelcor HEP** |
| **CGMT** — *Coarse Grained Multi Threading* | El procesador **conmuta de una hebra a otra cuando una hebra se detiene por algún evento de gran latencia** (por ejemplo, fallo de acceso a la caché) | **Dinámica temporal** | — |
| **SMT** — *Simultaneous Multi Threading* | **Varias hebras ejecutándose en varias unidades funcionales de un procesador superescalar (1 solo núcleo)** | **Dinámica espacial** | **Pentium 4, Core i3, i5, i7** — Intel lo llama **Hyper-threading** |

**Detalles de FGMT.** Al ser una conmutación por ciclo **se dice que es de "grano
fino"**. **Reduce las latencias en memoria, y evita y resuelve dependencias de
datos.** **Requiere que el compilador encuentre muchas hebras independientes.**

**Detalles de CGMT.** La conmutación por algún fallo **se dice que es de "grano
grueso"**. **En general requiere un manejo más complejo porque la conmutación es
asincrónica.** **Se deben replicar registros para conmutar rápido** y **hacer una
distribución equitativa de las hebras**.

<p class="fuentes">Fuente: <code>Teorías/09 Arq clase9 Procesamiento paralelo.pdf</code>, fil. 5–17, 18–19, 22–24, 25–28, 32–33, 34–35, 36–38, 39–47, 48–52.</p>

## Diagrama

### Taxonomía de Flynn con SMP, NUMA y clusters

![Taxonomía de Flynn con SMP, NUMA y clusters](../diagramas/taxonomia-flynn.svg)

!!! note "Está dibujado en vertical, no como árbol"
    La filmina 6 lo muestra como un **árbol horizontal de 4 ramas**. Acá va
    apilado en vertical porque, dibujado como árbol, el diagrama se va a
    ~1600 px de ancho y **en el celular el texto queda ilegible**. El contenido
    y la jerarquía son los mismos.

<p class="fuentes">Fuente: <code>Teorías/09 Arq clase9 Procesamiento paralelo.pdf</code>, fil. 5–17 (taxonomía y esquemas funcionales), fil. 18–19, 22–24, 25–28 (SMP, NUMA, clusters) y fil. 32–33 (UMA/NUMA/CC-NUMA).</p>

## Ventajas y desventajas o comparaciones

### Ventajas y desventajas de los SMP

**Ventajas:**

- **Mayores prestaciones:** en general tienen buenos resultados **si las tareas
  pueden organizarse en paralelo**.
- **Buena disponibilidad:** **un fallo en un procesador no detiene la operación del
  sistema**, dado que todos los procesadores pueden hacer las mismas tareas.
- **Crecimiento:** pueden aumentarse las prestaciones **añadiendo más
  procesadores**, pero **hay restricciones a este mecanismo**.
- **Escalado:** **normalmente limitado**, en función de la cantidad de
  procesadores.

**Desventajas.** Los principales problemas se originan en **los conflictos por el
bus compartido, la coherencia y consistencia de los datos, y la sincronización de
tareas entre procesadores**:

- **Las prestaciones están limitadas por el tiempo de ciclo del bus.**
- **Cada procesador está equipado con una memoria caché**, que reduce los accesos a
  memoria y mejora las prestaciones. **Pero eso trae un problema.**
- **Al disponer una caché en cada procesador se pueden producir problemas de
  coherencia de caché** —datos que pueden estar en más de una caché—. **Por razones
  de velocidad, este problema debe ser resuelto por el hardware.** Se requiere usar
  **protocolos para la administración de los datos en las cachés (protocolos de
  coherencia tipo sondeo o *snoopy*)**.

[Ver la ficha de memoria caché](memoria-cache.md).

### Ventajas de los clusters

- **Escalabilidad absoluta:** dependiendo de **la cantidad de nodos incorporados**
  se puede disponer de mayores prestaciones.
- **Escalabilidad incremental:** **posibilidad de agregar nuevos nodos
  fácilmente**.
- **Alta disponibilidad:** **capacidad de seguir operando con nodos en falla**.
- **Mejor relación precio/prestaciones:** porque **se usan equipos de cómputo
  estándar** y, posiblemente, de bajo costo.

### Cluster vs. SMP

| **SMP** | **Cluster** |
|---|---|
| Permiten dar soporte a **aplicaciones de alta demanda de recursos** | Permiten dar soporte a **aplicaciones de alta demanda de recursos** |
| **Disponibles comercialmente** (SMP es más antiguo) | **Disponibles comercialmente** (SMP es más antiguo) |
| **Más fácil de administrar y configurar** | **Superior escalabilidad incremental y absoluta** |
| **Cercano a los sistemas de un solo procesador** | **Superior disponibilidad** |
| **La planificación (*scheduling*) es la diferencia principal** | **Mayor redundancia** |
| **Menos espacio físico / menor consumo de potencia** | **Cada nodo tiene su propia memoria principal**: así las aplicaciones **no "ven" la memoria global** |
| **Límite práctico en su número de procesadores: entre 16 y 64**, por degradación de prestaciones | **La coherencia es mantenida por software y no por hardware** |
| — | **Alternativa a sistemas SMP** para brindar **multiprocesamiento a gran escala**. Por ejemplo, el **SGI Origin de Silicon Graphics** es un NUMA con **1024 procesadores MIPS R10000** |

### SMP vs. NUMA vs. Cluster

| | **SMP** | **NUMA** | **Cluster** |
|---|---|---|---|
| **Categoría en Flynn** | MIMD memoria compartida | MIMD memoria compartida | MIMD **memoria distribuida** |
| **Acoplamiento** | **Fuertemente acoplado** | — | **Levemente acoplado** |
| **Interconexión** | **Bus** u otro medio similar | **Red de interconexión** | **Red de interconexión** |
| **Memoria** | **Principal y E/S única compartida** | **Cada nodo con memoria local y E/S**, pero **espacio de direcciones común** | **Cada nodo con memoria local y E/S**, **espacios de direcciones independientes** |
| **Tiempo de acceso a memoria** | **Igual para todos** → **UMA** | **Distinto** para memoria local que para las de otros nodos → **NUMA** | — |
| **Homogeneidad de nodos** | Procesadores **idénticos o muy similares** | Nodos con **características muy similares** | Nodos **homogéneos o heterogéneos** |
| **Comunicación entre procesos** | Vía memoria compartida | Vía espacio de direcciones común | **Mensajes**, a resolver por el programa |

### Comparación de las 4 políticas multihebra

| | **CMP** | **FGMT** | **CGMT** | **SMT** |
|---|---|---|---|---|
| **Granularidad de la conmutación** | Fija por núcleo | **Cada ciclo** ("grano fino") | **Ante evento de gran latencia** ("grano grueso") | Simultánea |
| **Partición de recursos** | **Estática espacial** | **Estática temporal** | **Dinámica temporal** | **Dinámica espacial** |
| **Hebras a la vez en ejecución** | 1 por núcleo | **1 sola por vez** | 1 por vez | **Varias, en varias unidades funcionales** |
| **Núcleos** | **2 o más** | 1 | 1 | **1 solo** |
| **Requisitos / dificultades** | — | **Requiere que el compilador encuentre muchas hebras independientes** | **Manejo más complejo** por ser conmutación asincrónica; **replicar registros**; **distribución equitativa de hebras** | — |

<p class="fuentes">Fuente: <code>Teorías/09 Arq clase9 Procesamiento paralelo.pdf</code>, fil. 19–21, 23, 26–31, 49–52.</p>

## Ejemplo del curso

### El Pentium 4 y el Hyper-threading

**El Pentium 4 es un procesador con una arquitectura multithreading —Hyper-threading
o HT, como la llama Intel— híbrida**, que permite disponer de **2 procesadores
lógicos compartiendo algunos de los recursos de ejecución del procesador físico**,
es decir, **1 solo núcleo**.

- **El SO reparte las tareas entre ellos.**
- **Cada procesador lógico puede actuar individualmente.**
- **La mejora depende fuertemente del grado de paralelización de las tareas.** En
  algunos casos **puede llegar a un 30 % de mejora**; en otros **puede hacer la
  ejecución más lenta** —por ello se puede **deshabilitar el "modo HT"**—.

**Por qué es híbrido:** tiene **distintas políticas de tratamiento de las hebras
dependiendo de las unidades funcionales involucradas**:

| Etapas | Política |
|---|---|
| **Fetch – Decode – Dispatch – Issue 1** | **FGMT**, hasta que una hebra se frena, **pasando a CGMT** |
| **Issue 2 – Ex – Mem** | **SMT**: las hebras **pueden mezclar instrucciones** |
| **Retire** | **FGMT** |

[Ver la ficha de procesadores superescalares](superescalares.md).

### Otros ejemplos concretos que da la teoría

| Máquina / familia | Qué ejemplifica |
|---|---|
| **Procesadores vectoriales y matriciales** | **SIMD** |
| **Computadoras monoprocesador** | **SISD** |
| **Cray CDC 6600**, **Denelcor HEP** | **FGMT** |
| **Pentium 4, Core i3/i5/i7** | **SMT** (Hyper-threading) |
| **SGI Origin** de Silicon Graphics | **NUMA con 1024 procesadores MIPS R10000** |

<p class="fuentes">Fuente: <code>Teorías/09 Arq clase9 Procesamiento paralelo.pdf</code>, fil. 8, 11, 31, 50, 52, 53–54.</p>

## Preguntas de final sobre este tema

[:material-help-box: Ver el banco de preguntas de paralelismo](../finales/temas/paralelismo.md)

## Fuentes citadas

- `Teorías/09 Arq clase9 Procesamiento paralelo.pdf` — 55 filminas. Fuente primaria
  del tema.

**Referencias que da la propia cátedra** (fil. 55): *Organización y Arquitectura de
Computadoras*, William Stallings, capítulo 16 de la 5.ª edición o capítulo 18 de la
7.ª edición; *Diseño y evaluación de arquitecturas de computadoras*, M. Beltrán y
A. Guzmán, capítulo 5 de la 1.ª edición.
