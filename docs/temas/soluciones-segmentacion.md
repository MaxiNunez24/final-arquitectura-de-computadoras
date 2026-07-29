# Soluciones a los riesgos de segmentación

## Definición

Los **riesgos** de la segmentación —estructurales, por dependencia de datos y por
dependencia de control— **pueden producir atascos en el flujo de las
instrucciones**. Esta ficha reúne las **técnicas que permiten reducir y, en
algunos casos, eliminar los efectos de los riesgos**.

**La solución más elemental** para superar los atascos producto de los 3 tipos de
riesgos es **agregar puntos de parada en el cauce hasta que el conflicto
desaparezca**. El gran problema de este tipo de solución es que **el rendimiento
cae fuertemente por la cantidad de tiempos muertos que se insertan**; inclusive
**puede llegar a ser hasta inútil aplicar la segmentación**.

Los tres riesgos, tal como los recapitula la clase 5:

- **Estructurales:** provocados por conflictos en el uso de los "recursos". Los
  recursos típicamente son memoria, ALU, registros.
- **Por dependencia de datos:** conflictos originados entre 2 o más instrucciones
  que **comparten un mismo dato**. Por ejemplo, una instrucción produce un
  resultado que lo necesita otra, ambas dentro del cauce de datos.
- **Por dependencia de control:** ejecución de instrucciones que **alteran la
  secuencia normal de ejecución**, es decir, **instrucciones de salto**
  (condicional e incondicional).

[Ver la ficha de segmentación de cauce](segmentacion.md).

<p class="fuentes">Fuente: <code>Teorías/05 Arq clase5 Algunas soluciones.pdf</code>, fil. 4–5.</p>

## Desarrollo

### 1. Solución a los conflictos estructurales

**La solución a estos conflictos consiste básicamente en "agregar más
hardware".** Estrategias usadas:

| # | Estrategia | Ejemplo |
|---|---|---|
| **1** | **Duplicación de recursos de hardware** | Agregar sumadores o restadores **además de la ALU** |
| **2** | **Separación del recurso en conflicto** | **Separar memorias de instrucciones y datos** (MI y MD) |
| **3** | **Subdividir el acceso al recurso** | En el acceso al **banco de registros**: la **escritura** de un registro se hace en el **primer semiciclo** de reloj y la **lectura en el segundo semiciclo**, con lo que en un ciclo se pueden hacer las 2 operaciones —**siempre y cuando la velocidad del recurso lo soporte**— |

### 2. Soluciones a los conflictos por dependencia de datos

Recordar los 3 tipos de dependencias: **RAW** (lectura después de escritura,
dependencia real), **WAR** (escritura después de lectura, antidependencia) y
**WAW** (escritura después de escritura, dependencia de salida).

**Las soluciones se pueden implementar de 2 maneras:**

| | **Por hardware** | **Por software** |
|---|---|---|
| Técnica 1 | **Retardos** en las etapas del cauce (ciclos de parada) | **Introducción de NOP** — equivalente a insertar retardos / puntos de parada |
| Técnica 2 | **Adelantamiento de operandos (*forwarding*)** entre etapas del cauce | **Reordenación de código** |

#### 2.a — Ciclos de parada (hardware)

La solución más sencilla es **agregar retardos o ciclos de parada en la ruta de
datos**.

**Ejemplo del curso.** Hay una dependencia **RAW con el registro R1** entre:

```
LW  R1, 100(R2)
ADD R3, R1, R4
```

- La instrucción **ADD requiere, en la etapa D (decodificación), el valor de R1**,
  que se carga en la instrucción previa **LW en la etapa W** (escritura en el
  banco de registros).
- **La etapa D de ADD no se puede ejecutar hasta que se ejecute la etapa W de LW.**
- Si se considera que **R1 se escribe en el primer medio ciclo de la etapa W** y
  **se lee en el segundo semiciclo de la etapa D**, entonces **agregando 2 ciclos
  de parada se resuelve el conflicto**.

**El gran problema:** los ciclos de parada agregados **reducen fuertemente la
performance** del procesador segmentado.

#### 2.b — Adelantamiento o *forwarding* (hardware)

**Este método consiste en pasar directamente ("adelantar"), desde una unidad
funcional a otra, el resultado obtenido en una instrucción a las instrucciones
siguientes que lo necesitan como operando.**

Si el dato que necesita la instrucción **i+1** ya está calculado por la
instrucción **i**, se puede **llevar (adelantar) a la entrada de la etapa de la
instrucción i+1 que lo necesita, sin esperar la etapa final de escritura de la
instrucción i**.

Esta solución **puede ser relativamente sencilla de implementar si se identifican
todos los adelantamientos** y se pueden adelantar los datos a las unidades que lo
necesitan.

**Ejemplo del curso — LW seguido de SW.** Hay dependencia RAW entre la escritura
de R1 en `LW R1, 100(R2)` y su lectura en `SW R1, 0(R10)`:

```
LW R1, 100(R2)    F  D  X  M  W
SW R1, 0(R10)        F  D  X  M  W
```

- **No se puede ejecutar el ciclo M de SW hasta que se resuelva el ciclo W de LW.**
- Pero **el dato que se va a cargar en R1 ya está disponible en la etapa previa
  (M) de la instrucción LW**, aunque aún no se haya cargado en R1 (etapa W).
- **Si hubiera un camino que adelantara el dato desde la salida de la unidad M
  hasta la entrada de la misma unidad**, no habría que esperar el ciclo W de LW
  para ejecutar el ciclo M de SW.

**Los 8 casos de conflicto RAW del nanoMIPS.** En procesadores sencillos como el
nanoMIPS este análisis es relativamente fácil; **si el procesador es más complejo
el análisis puede resultar muy complicado**. En el nanoMIPS se identifican **8
tipos de conflictos por dependencia de datos (del tipo RAW únicamente)**:

| Caso | Secuencia | Adelantamiento requerido |
|---|---|---|
| **1** | LW seguido de SW | Salida de **M** → entrada de **M** |
| **2** | LW seguido de aritmética-lógica | Salida de **M** → entrada de **X** |
| **3** | LW seguido de BEQ | Salida de **M** → entrada de **X** |
| **4** | Aritmético-lógica seguida de SW | Salida de **M** → entrada de **M** |
| **5** | Aritmético-lógica seguida de aritmético-lógica | Salida de **X** → entrada de **X** |
| **6** | Aritmético-lógica seguida de BEQ | Salida de **X** → entrada de **X** |
| **7** | LW seguido de LW | Salida de **M** → entrada de **X** |
| **8** | Aritmético-lógica seguida de LW | Salida de **X** → entrada de **X** |

**Los 8 casos se agrupan en 3 problemas de adelantamiento:**

1. **Casos 1 y 4:** adelantamiento desde la **salida de M a la entrada de M**.
2. **Casos 2, 3 y 7:** adelantamiento desde la **salida de M a la entrada de X**.
3. **Casos 5, 6 y 8:** adelantamiento desde la **salida de X a la entrada de X**.

**Cómo se implementa.** Se resuelve **usando multiplexores (MUX)**:

- Para los grupos 1 y 2 (casos 1, 2, 3, 4 y 7): la **trayectoria de los datos
  desde M hasta el banco de registros (BR) tiene una derivación que termina en
  multiplexores**, que permiten **seleccionar distintas alternativas de fuentes de
  datos a X (ALU) y a M (memoria de datos)**.
- Para el grupo 3 (casos 5, 6 y 8): la **trayectoria desde X hasta M o el BR tiene
  una derivación que termina en los mismos multiplexores**.

**Cuando una unidad auxiliar, identificada como *unidad de adelantamiento*,
detecta en los campos de las instrucciones que se están ejecutando las
dependencias, selecciona en los MUX asociados a ella las entradas necesarias para
adelantar los datos requeridos** (por X o por M).

!!! success "Conclusión de la teoría sobre el forwarding"
    *Existen soluciones a los conflictos por dependencia de datos que permiten
    reducir o eliminar el impacto de estos conflictos en la performance del
    procesador. **Los cambios introducidos no son complicados de implementar, y
    sus resultados justifican ampliamente su uso.***

#### 2.c — Soluciones por software

Otra técnica para evitar los atascos por dependencia de datos es **a través del
software**. Esta solución **es realizada por el compilador**, por lo que —al igual
que las técnicas por hardware— **es "transparente" al programador**. Hay 2
posibles soluciones:

- **Introducción de instrucciones NOP** (es decir, retardos) entre las
  instrucciones que tienen dependencia de datos. **Genera retardos que reducen la
  performance** del procesador; es equivalente al uso de puntos de parada.
- **Reordenamiento de instrucciones**, para tratar de **aumentar la separación
  entre las instrucciones con dependencia de datos**. Hay que tener **cuidado con
  modificar el comportamiento del programa**.

**Ejemplo del curso — reordenamiento.** Sobre un programa original de **9
instrucciones**:

- Hay dependencias **entre las instrucciones 2 y 3 (registro R3)** y **entre la 3
  y la 4 (registro R6)**.
- **La instrucción 4 no se puede reubicar** porque tiene dependencia con la 3,
  **pero la instrucción 5 no depende de ninguna de las anteriores**.
- Entonces, **reubicando la instrucción 5 a continuación de la 2, se elimina la
  dependencia sin alterar la lógica del programa**.

El compilador continúa con este proceso intentando reordenar las instrucciones
para evitar los conflictos. **En caso de no poder resolverlos, deberá insertar
instrucciones de NO-OPERACIÓN (NOP)** para eliminar los que persisten luego del
reordenado.

### 3. Soluciones a los conflictos por dependencia de control

El tercer tipo de riesgo es la presencia de **instrucciones de salto**, que pueden
ser de 2 tipos:

- **Incondicional:** la **dirección de destino se debe determinar lo más pronto
  posible** dentro del cauce, para reducir la penalización.
- **Condicional:** introduce el **riesgo adicional por la dependencia entre la
  condición de salto y el resultado dependiente de una instrucción previa**. Por
  ejemplo, en la instrucción **BEQ del nanoMIPS recién se calcula la dirección de
  salto durante la fase W**.

#### 3.a — Ciclos de parada

Igual que antes, **la forma más elemental de resolver el conflicto es agregando
tiempos muertos (ciclos de parada) hasta que desaparece el problema**. En el
nanoMIPS **se requerirían 3 ciclos de reloj** para empezar la instrucción
siguiente a la de salto, considerando que **se puede calcular el salto en el
primer semiciclo del ciclo W de BEQ** y **leer el resultado en el segundo
semiciclo del ciclo F de la instrucción a donde se salta**.

#### 3.b — Adelantar la resolución del salto a la etapa D

Se puede mejorar **modificando la ruta de datos para reducir la cantidad de ciclos
muertos, adelantando la resolución de los saltos a la etapa D**, donde se
decodifica y se accede a los registros.

**El objetivo del adelantamiento es evaluar tempranamente la condición de salto**,
usando por ejemplo un **restador extra a la salida del banco de registros**, en
lugar de esperar a la etapa X asociada a la ALU para determinar la condición de
igualdad de BEQ. Además se puede **agregar un sumador adicional para calcular la
dirección de salto**, en lugar de esperar a la etapa X con la ALU.

**El hardware agregado determina:**

> **si** la instrucción es BEQ **y** A = B
> **entonces** PC = PC + desplazamiento
>
> donde el desplazamiento se calcula con el modo de direccionamiento.

A la salida del BR se agrega **lógica para detectar en forma temprana la condición
de igualdad**, que **controla un MUX**. El MUX **selecciona el valor con el que se
va a cargar el PC**; una de sus entradas es el valor actual del PC con el
desplazamiento incluido en la instrucción de BEQ.

**Resultado: con la ruta de datos modificada, la respuesta del nanoMIPS a una
instrucción de salto BEQ pierde 1 solo ciclo de reloj, en lugar de los 3 que se
perdían originalmente.**

#### 3.c — Técnicas de tratamiento de saltos

En máquinas más complejas, la solución anterior **puede no ser tan sencilla de
implementar**. En general, las técnicas para mitigar el impacto de las
instrucciones de salto en la performance pueden ser de 2 tipos:

- **Técnicas por hardware:** resolver los conflictos a nivel de hardware mediante
  **predicción de saltos**.
- **Técnicas por software:** resolver los conflictos **a nivel del compilador**.

### Predicción de saltos por hardware

Se basan en **usar estrategias para predecir el resultado de la instrucción de
salto**. Pueden ser de 2 tipos:

- **Estáticas:** **no tienen en cuenta información previa** de la ejecución del
  programa.
- **Dinámicas:** **tienen en cuenta la historia previa** del programa en ejecución.

=== "Estáticas"

    Básicamente **se presume una condición** (salta o no salta) y se ejecuta en
    base a esa predicción.

    - **Predecir que nunca se salta:** asume que el salto no se producirá y por lo
      tanto **siempre capta la siguiente instrucción**.
    - **Predecir que siempre se salta:** asume que el salto se producirá y por lo
      tanto **siempre capta la instrucción destino** del salto.

    **En el nanoMIPS siempre capta la próxima instrucción, es decir, predice que
    no va a saltar. Si no salta no se pierde ningún ciclo; si salta se pierde 1
    ciclo.**

    | Ventajas | Desventajas |
    |---|---|
    | **Sencilla de implementar** | **La instrucción a descartar puede afectar el estado del procesador** (registros y/o memoria) |
    | **Pequeños cambios** en la Unidad de Control | *(mitigación)* En el nanoMIPS **el ciclo que se descarta es el de búsqueda de la instrucción (ciclo F), que no modifica el procesador** |
    | **Ruta de datos sin cambios** | |

=== "Dinámicas"

    Se basan en el **análisis de datos previos —la "historia"— sobre cómo se
    comporta el programa**, para predecir la acción. Ejemplos:

    **1. Conmutador saltar/no saltar.** Estando en una de las 2 condiciones
    (predecir que salta o predecir que no salta), **se requieren 2 predicciones
    fallidas consecutivas para conmutar al otro estado**. Tiene un **buen
    comportamiento en lazos** donde el resultado de una consulta —por ejemplo un
    contador que tiene que llegar a 0— **se puede repetir muchas veces antes de
    que cambie**.

    **2. Tabla de historia de saltos (BHT, *branch history table*).** Se implementa
    usando una **pequeña caché asociada a la etapa de búsqueda (F)**, con **3
    campos**:

    - Dirección de una instrucción que es del tipo bifurcación.
    - Dirección del destino o instrucción destino.
    - **N bits de estado** (historia de uso).

    Funcionamiento: cada vez que se precapta una instrucción **se busca en la
    caché BHT si la instrucción es de ramificación**; se toma una **decisión
    predictiva en función de los bits de la historia de uso**; si la predicción es
    saltar, **se capta la dirección de salto**; **si la predicción falla, se
    actualiza la tabla**; y si la instrucción de ramificación no estaba en la BHT,
    **se la carga como nueva entrada**.

    **3. Predicción según el código de operación.** Se basa en la suposición de que
    **algunas instrucciones de salto tienen mayor probabilidad de saltar o de no
    saltar**. Por ejemplo, si el salto involucra un **lazo que se repite muchas
    veces**, la condición para repetir el lazo ocurrirá muchas más veces que la de
    salida —que ocurrirá 1 sola vez—. **La tasa de acierto puede llegar a alcanzar
    un 75 %.**

    **4. Varios cauces (*multiple stream*), uno por cada opción de salto.** Se usan
    **cauces distintos (duplicando hardware)** para ejecutar simultáneamente el que
    corresponde a **no saltar** y el que corresponde a **saltar**. Cuando se
    determina el resultado de la ramificación, **se utiliza el cauce correcto y se
    descarta el incorrecto**. Como se captan simultáneamente 2 cauces, **aumentan
    las búsquedas**, lo que puede provocar **retardos en el acceso al bus y a los
    registros**. Y **si hay nuevos saltos en los cauces en ejecución se necesitan
    más cauces**, lo que **aumenta la complejidad del hardware**.

    **5. Precaptación del destino del salto (*prefetch branch target*).** Se
    **precapta la instrucción destino del salto**, además de las instrucciones
    siguientes a la bifurcación. La instrucción **se guarda hasta que se ejecute la
    instrucción de bifurcación**. **El IBM 360/91 usa este método.**

    **6. Buffer de bucles.** Se usa una **memoria muy rápida, gestionada por la
    etapa de captación**, que **contiene las últimas instrucciones recientemente
    buscadas**. Si hay una instrucción de salto, **el hardware comprueba si está en
    el buffer de bucles**; si es así, **la próxima instrucción se busca desde el
    buffer**. Es **muy eficaz para pequeños bucles y saltos, si el buffer es capaz
    de contener todo el bucle**. Funciona parecido a la caché, **sólo que contiene
    instrucciones consecutivas únicamente**.

### Resolución de saltos por software — el *delay slot*

Las técnicas por software **se basan en tratar de realizar trabajo útil mientras
el salto se resuelve**.

Cuando hay una instrucción de salto **se necesita 1 ciclo (o más) para determinar
si se va a ejecutar el salto o no. Ese tiempo se llama hueco o ranura de retardo
de salto (*branch delay slot*).**

- Hay máquinas que **captan y ejecutan siempre la instrucción siguiente a una
  instrucción de ramificación**, en lugar de descartarla.
- **El compilador puede tratar de insertar, en dichos huecos, instrucciones útiles
  que en lo posible no dependan del salto.** De esta manera **se elimina el
  conflicto y se hace trabajo útil**.
- Si no es posible insertar instrucciones, **se necesita agregar NOP** para evitar
  el conflicto.

**La forma de llenar los huecos es mediante el reordenamiento de instrucciones, y
ese trabajo lo hace el compilador.** Las instrucciones a reordenar pueden provenir
de **3 casos**:

| Caso | Origen de la instrucción | Comentario |
|---|---|---|
| **1** | **Instrucciones anteriores al salto** | **La mejor solución**: siempre deben ejecutarse y **van a ser útiles**. No siempre es posible |
| **2** | **Instrucciones del destino del salto** | Debe ser tal que **no modifique el estado del proceso aun cuando falle la predicción** |
| **3** | **Instrucciones a continuación del salto** | Ídem caso 2 |

<p class="fuentes">Fuente: <code>Teorías/05 Arq clase5 Algunas soluciones.pdf</code>, fil. 6, 7–11, 12–28, 29–31, 32–39, 40–52, 53–54.</p>

## Diagrama

<!-- Diagramas pendientes (Tarea 4): adelantamiento (forwarding) en el cauce del
     nanoMIPS (fil. 14, 16, 23, 26) y resolución temprana del BEQ (fil. 33, 36-37).
     Estos diagramas complementan el del cauce de 5 etapas con riesgos. -->

## Ventajas y desventajas o comparaciones

### Ciclos de parada vs. forwarding

| | **Ciclos de parada** | **Adelantamiento (*forwarding*)** |
|---|---|---|
| **Mecanismo** | Insertar tiempos muertos hasta que el conflicto desaparece | Pasar el resultado **directamente de una unidad funcional a otra** |
| **Hardware adicional** | Prácticamente ninguno | MUX + **unidad de adelantamiento** |
| **Impacto en performance** | **Reduce fuertemente la performance**; puede llegar a hacer inútil la segmentación | **Reduce o elimina** el impacto del conflicto |
| **Complejidad** | Mínima | *"Los cambios introducidos no son complicados de implementar, y sus resultados justifican ampliamente su uso"* |
| **Ejemplo del curso** | `LW R1,100(R2)` → `ADD R3,R1,R4`: **2 ciclos de parada** | `LW R1,100(R2)` → `SW R1,0(R10)`: adelantamiento salida M → entrada M |

### Soluciones por hardware vs. por software

| | **Por hardware** | **Por software** |
|---|---|---|
| **Quién la aplica** | El propio procesador | **El compilador** |
| **Transparencia** | Transparente al programador | **También transparente** al programador |
| **Datos** | Retardos, forwarding | NOP, reordenamiento de código |
| **Control (saltos)** | Predicción estática y dinámica | Rellenado del ***delay slot*** por reordenamiento |
| **Costo** | Hardware adicional (MUX, unidad de adelantamiento, BHT, cauces múltiples) | Ninguno en hardware; **riesgo de alterar el comportamiento del programa** si el reordenamiento se hace mal |

### Predicción estática vs. dinámica

| | **Estática** | **Dinámica** |
|---|---|---|
| **Información que usa** | **Ninguna previa** de la ejecución | **La historia previa** del programa en ejecución |
| **Variantes** | Predecir que nunca salta · predecir que siempre salta | Conmutador saltar/no saltar · BHT · según código de operación · varios cauces · precaptación del destino · buffer de bucles |
| **Costo en hardware** | **Mínimo**: pequeños cambios en la UC, ruta de datos sin cambios | Mayor: caché BHT, duplicación de cauces, memorias rápidas |
| **Precisión** | Baja | Mayor (ej.: predicción por código de operación **hasta 75 %** de acierto) |

### Los 3 casos de relleno del delay slot

| | **Caso 1 — antes del salto** | **Caso 2 — destino del salto** | **Caso 3 — a continuación del salto** |
|---|---|---|---|
| **Sirve siempre** | **Sí** | Sólo **si salta** | Sólo **si no salta** |
| **Requisito** | La instrucción no debe depender del salto | Su resultado **no debe alterar la lógica** si la predicción falla | Ídem |
| **Valoración de la teoría** | **La mejor opción** (no siempre es posible) | El compilador debe además **corregir el lugar a donde salta** | — |

<p class="fuentes">Fuente: <code>Teorías/05 Arq clase5 Algunas soluciones.pdf</code>, fil. 5, 8, 11, 28, 29, 41, 44, 54, 56–57.</p>

## Ejemplo del curso

### Reordenamiento en el delay slot — los 3 casos

Sobre una secuencia con `ADD R1,R2,R3` antes del salto y `SUB R4,R5,R6` como
candidata a rellenar el hueco:

**Caso 1.** El hueco **se rellena con una instrucción anterior al salto**. *Sirve
siempre, es la mejor opción* (no siempre es posible).

**Caso 2 — instrucción del destino del salto.** Como `ADD R1,R2,R3` **se requiere
ejecutar antes de la instrucción de salto**, no se puede reubicar después del
salto. El compilador **busca una instrucción a reubicar en el lugar a donde puede
llegar a saltar**, por ejemplo `SUB R4,R5,R6`: la **copia en el hueco y corrige el
lugar a donde salta** (`MULT R6,R7,R8`).

- **Si efectivamente salta:** la instrucción insertada **sirve y se adelantó
  trabajo**.
- **Si no salta:** la instrucción insertada **se ejecuta pero no sirve, y el
  resultado no debe alterar la lógica**. En otras palabras, el valor que se cargue
  en R4 **no sirve y no debe alterar la lógica del programa**.

**Caso 3 — instrucción a continuación del salto.** Mismo razonamiento, pero el
compilador busca la instrucción **a continuación de la de salto**.

- **Si no salta:** la insertada **sirve y se adelantó trabajo**.
- **Si salta:** **se ejecuta pero no sirve**, y su resultado no debe alterar la
  lógica.

**Estudios en 3 máquinas con delay slot:**

- Aproximadamente **el 60 % de los huecos se rellenan con instrucciones diferentes
  a NOP**.
- De ese 60 %, **entre el 80 y el 85 % corresponde a instrucciones útiles**.
- **En definitiva, el 50 % de los huecos (retardos) se aprovechan con instrucciones
  útiles.**

### Segmentación en el i80486

Como **ejemplo de procesador convencional (tipo CISC)** se analiza el Intel
**80486**, que tiene un cauce compuesto por **5 etapas, 2 de ellas de
decodificación**:

| Etapa | Nombre |
|---|---|
| **F** | Fetch |
| **D1** | Decode 1 |
| **D2** | Decode 2 |
| **EX** | Execute |
| **WB** | Write back |

**3 casos de secuencias de instrucciones y el comportamiento del cauce:**

| Caso | Situación | Penalización |
|---|---|---|
| **1** | 3 instrucciones de movimiento entre memoria y registro | **Sin penalización.** No hay retardo en el cauce por carga de un dato desde memoria |
| **2** | Carga que **utiliza un puntero**, con adelantamiento desde la etapa **EX a la D2** | **1 ciclo** |
| **3** | **Temporizado en una instrucción de bifurcación** | **2 ciclos** |

### nanoMIPS multifuncional — punto flotante

**En general es imprescindible que los procesadores dispongan de operaciones en
punto flotante. El modelo visto del nanoMIPS no las tiene.** Para agregarlas se
requiere:

- Agregar **instrucciones en PF** (ej.: `ADD.D`, `LD.D`).
- Agregar **registros de PF** (ej.: F1, F2, etc.).
- Agregar **hardware para las operaciones aritméticas** de suma, resta,
  multiplicación y división.

**El problema.** Los **tiempos de ejecución de las unidades de punto flotante son
muy distintos de los de la unidad de enteros**. Hasta ahora se había considerado
que todas las etapas del nanoMIPS **tenían la misma duración**, pero las unidades
funcionales de PF **pueden requerir varios ciclos** para completarse —por ejemplo,
**la división en punto flotante lleva muchos más ciclos que una suma de enteros**—.

> **Conclusión: cuando se incorpora punto flotante, no todas las etapas del cauce
> van a durar lo mismo.**

Si las unidades de PF tardan varios ciclos, **una secuencia de 2 instrucciones
consecutivas en punto flotante requeriría retardar la segunda hasta que la primera
se complete**:

```
ADD.D F1, F2, F3
ADD.D F4, F5, F6
```

No se puede empezar la segunda `ADD.D` hasta que no se termine la primera.

**La solución: segmentar las unidades funcionales de punto flotante.** Segmentando
las unidades de PF **se pueden iniciar nuevas instrucciones en PF sin haber
completado la actual**. En el esquema de la teoría se ha segmentado:

| Unidad de punto flotante | Etapas |
|---|---|
| **Suma en PF** | **4** |
| **Multiplicación en PF** | **10** |
| **División en PF** | **20** |

<p class="fuentes">Fuente: <code>Teorías/05 Arq clase5 Algunas soluciones.pdf</code>, fil. 55–58, 59–62, 63–68.</p>

## Preguntas de final sobre este tema

[:material-help-box: Ver el banco de preguntas de soluciones a la segmentación](../finales/temas/soluciones-segmentacion.md)

## Fuentes citadas

- `Teorías/05 Arq clase5 Algunas soluciones.pdf` — 69 filminas. Fuente primaria del
  tema.

**Referencias que da la propia cátedra** (fil. 69): W. Stallings, 5.ª ed., capítulo
11; Hwang & Briggs, *Computer Architecture & Parallel Processing*, capítulo 10.
