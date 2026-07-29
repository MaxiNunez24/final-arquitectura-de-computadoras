# DMA — Acceso Directo a Memoria

## Definición

**El Acceso Directo a Memoria (DMA) es una técnica de transferencia de datos
entre periférico y memoria sin intervención directa de la CPU.**

Comúnmente es llevada a cabo por un **"Controlador de DMA" (DMAC)** específico,
encargado de llevar a cabo la transferencia. Físicamente está ubicado sobre el
bus del sistema, entre el módulo de E/S y la memoria.

Es la **tercera** de las 3 estrategias básicas de gestión de la transferencia de
E/S, junto con la E/S programada con espera de respuesta y la E/S programada
administrada por interrupción —las otras dos sí requieren intervención directa de
la CPU en cada dato—.
[Ver Entrada/Salida](entrada-salida.md).

<p class="fuentes">Fuente: <code>Teorías/03 Arq clase3 EntradaSalida.pdf</code>, fil. 24, 44.</p>

## Desarrollo

### El DMAC como maestro del bus

Dado que la transferencia por DMA **requiere el uso del bus**, tanto el DMAC como
la CPU pueden tomarlo: **el DMAC y la CPU "compiten" por el uso del bus**.

Cuando el DMAC toma el bus **actúa como *master*** durante la transferencia, y
debe ser capaz de:

- **Solicitar el uso del bus** mediante las señales y la lógica de arbitraje
  necesarias.
- **Especificar la dirección de memoria** sobre la que se realiza la
  transferencia.
- **Generar las señales de control** del bus.
- **Especificar el tipo de operación** (lectura/escritura).
- **Generar las señales de sincronización** de la transferencia.

Cuando la CPU entrega el bus al DMAC —el chip 8237 en el esquema de la teoría—,
**se desconecta lógicamente del mismo**, y es el DMAC el que toma el control del
bus.

### Las 3 fases de una transferencia por DMA

El proceso de transferencia requiere realizar una serie de acciones o fases
relativamente complejas. Las principales son:

#### 1. Fase de inicialización

La CPU debe **configurar el módulo de E/S y el DMAC** con los parámetros de la
transferencia.

=== "Inicialización de la interfaz de E/S"

    - **Tipo de transferencia** (lectura/escritura).
    - **Configuración del periférico**.
    - Otra información de control para el periférico —por ejemplo, si es un
      disco se especifica el número de pista, sector, etc.—.

=== "Inicialización del DMAC"

    - **N.º de bytes o palabras** a transferir.
    - **Tipo de transferencia** (lectura/escritura).
    - **Dirección de memoria inicial** para la transferencia.
    - Otra información de la transferencia.

#### 2. Fase de ejecución de la transferencia

1. Cuando el **periférico está listo**, pide al DMAC iniciar la transferencia
   mediante una **señal física**.
2. Cuando el DMAC recibe el pedido del periférico, **pide el control del bus**
   mediante alguna señal especial a la CPU. La CPU típicamente dispone de algunas
   señales destinadas a implementar las transferencias por DMA.
3. Cuando reconoce el pedido de DMA, la CPU **entrega (libera) el bus** y se
   "desconecta" lógicamente del mismo: ya no lo controla.
4. La CPU **avisa al DMAC que liberó el bus** mediante otra señal especial.
5. Al liberar la CPU el bus, el **DMAC toma el control** y ejecuta la
   transferencia hasta terminarla.
6. El DMAC **avisa al periférico** que puede iniciar la transferencia.
7. El periférico comienza a **transferir los datos a través del bus con la
   memoria, de a uno por vez**. La transferencia implica que:
   **bus master = DMAC + periférico**, **bus slave = memoria**.
8. Después de la transferencia de **cada palabra** se actualizan los registros
   del DMAC:
    - N.º de bytes faltantes (o cuenta de los que se transfirieron).
    - Próxima dirección de memoria donde guardar el dato (anterior o posterior a
      la corriente).
9. Cuando el **número de bytes faltantes es igual a 0**, significa que transfirió
   todos los datos y **terminó la transferencia**.

#### 3. Fase de finalización y análisis de la transferencia

1. Una vez que termina la fase 2, el DMAC **libera el bus** y le avisa a la CPU
   por medio de una señal física.
2. La CPU **retoma el control del bus**.
3. El DMAC suele activar además una **señal de interrupción** para indicar a la
   CPU la finalización de la operación de E/S solicitada.
4. La CPU, mediante la interrupción, **verifica el resultado de la
   transferencia** vía los registros internos del DMAC. Algunos resultados a
   verificar:
    - ¿Transferencia OK o fallida?
    - ¿Errores? ¿Tipo de errores?
    - Estado del periférico.

### Técnicas de transferencia por DMA

Hay varias formas distintas de implementar las transferencias por DMA. La teoría
desarrolla **2**:

#### Por ráfagas (*burst*)

Es la vista hasta ahora. El DMAC solicita el control del bus a la CPU. **Cuando
la CPU concede el bus, el DMAC no lo libera hasta haber finalizado la
transferencia de todo el bloque de datos completo.**

- **Ventaja:** la transferencia se realiza de **forma muy rápida**, limitada por
  la velocidad del periférico.
- **Desventaja:** durante el tiempo que dura la transferencia **la CPU no puede
  utilizar el bus con memoria**, lo que puede **degradar el rendimiento del
  sistema**.

#### Por robo de ciclo (*cycle-stealing*)

El DMAC solicita el control del bus a la CPU. **Cuando la CPU concede el bus, se
realiza la transferencia de una única palabra y después el DMAC libera el bus.**
El DMAC solicita el control del bus **tantas veces como sea necesario** hasta
finalizar la transferencia del bloque completo: **el uso del bus se reparte entre
la CPU y el DMAC**.

- **Ventaja:** **no se degrada tanto** el rendimiento del sistema y de la CPU.
- **Desventaja:** la transferencia **puede tardar un poco más** de tiempo.

!!! important "El robo de ciclo NO es una interrupción"
    La toma y liberación del bus por parte de la CPU **no es una interrupción**:
    el procesador **no debe guardar el contexto**, no está interrumpiendo su
    tarea.

    Si bien el trabajo de la CPU es más lento que si no estuviera presente la
    transferencia por DMA, **no será tanto como si tuviera que estar desconectada
    del bus todo el tiempo**. En general, para transferencias de E/S de
    **múltiples palabras, la técnica por robo de ciclo es la más eficiente**, ya
    que permite implementar la transferencia por DMA **al mismo tiempo que la CPU
    continúa trabajando** en su tarea.

### Canales de E/S — la extensión del concepto de DMA

En el **nivel más alto** de la escala de transferencias de E/S están los
**canales de E/S**, que representan una **extensión al concepto de DMA**.

Los canales de E/S tienen la habilidad de **ejecutar programas de servicios de
E/S**, lo que les permite tener un **completo control de la transferencia de
datos**:

- **La CPU no ejecuta las instrucciones de E/S**: las realiza el procesador
  incluido en el canal.
- El programa que ejecuta el procesador interno del canal está **almacenado en la
  memoria principal**.
- La CPU solamente interviene para **iniciar la transferencia** y dar la orden de
  ejecutar el programa de E/S que está en memoria.
- El programa de servicio de E/S especifica **dispositivos, áreas de memoria a
  usar, prioridades y acciones ante errores**.

**Hay 2 tipos básicos de canales de E/S:**

=== "Canal selector"

    - Controla varios dispositivos de alta velocidad, **de a uno por vez**.
    - El canal **selecciona un dispositivo** y efectúa la transferencia sobre el
      dispositivo seleccionado.
    - Cada dispositivo tiene asociado un **controlador o módulo de E/S** que lo
      maneja.
    - Por lo tanto, **el canal de E/S ocupa el lugar de la CPU** en el control
      del módulo de E/S.
    - **Sólo puede atender 1 dispositivo a la vez.**

=== "Canal multiplexor"

    - Controla varios dispositivos de alta velocidad, **incluso
      simultáneamente**.
    - El canal **multiplexa la atención** entre los dispositivos seleccionados.
    - El multiplexado puede ser:
        - **Multiplexor de bytes:** acepta y transmite de a caracteres.
        - **Multiplexor de bloques:** intercala bloques de datos desde distintos
          dispositivos.
    - **Puede atender varios dispositivos a la vez.**

<p class="fuentes">Fuente: <code>Teorías/03 Arq clase3 EntradaSalida.pdf</code>, fil. 45–52, 55–58, 59–64.</p>

## Diagrama

### El DMA frente a las otras 2 técnicas de gestión de E/S

![Comparación de las tres técnicas de gestión de E/S](../diagramas/tecnicas-es.svg)

<p class="fuentes">Fuente: <code>Teorías/03 Arq clase3 EntradaSalida.pdf</code>, fil. 24–28 y 44–52.</p>

## Ventajas y desventajas o comparaciones

### Ventajas e inconvenientes del DMA

**Ventaja principal — la eficiencia.** La CPU **se libera de tener que controlar
la transferencia de los datos**: sólo prepara la transmisión y verifica el
resultado de la misma.

**Desventaja principal — el uso del bus.** Como las transferencias por DMA
**pueden tener mayor prioridad que la CPU**, se puede **degradar el rendimiento
de la CPU** si el DMAC hace uso intensivo del bus.

!!! note "Por qué el problema del bus es menos grave de lo que parece"
    No necesariamente la CPU necesita todo el tiempo el bus:

    - **En computadoras con memoria caché:** la mayor parte del tiempo la CPU
      **lee instrucciones de la caché**, por lo que no necesita usar el bus de
      memoria. El DMAC puede aprovechar esos intervalos para realizar las
      transferencias.
    - **En computadores sin caché:** el procesador **no utiliza el bus en todas
      las fases** de la ejecución de una instrucción. El DMAC puede aprovechar
      las fases en las que la CPU no lo utiliza.

### Ráfaga vs. robo de ciclo

| | **Por ráfagas (*burst*)** | **Por robo de ciclo (*cycle-stealing*)** |
|---|---|---|
| **Qué transfiere por cada toma del bus** | El **bloque completo** | Una **única palabra** |
| **Cuándo libera el bus** | Al terminar todo el bloque | Después de cada palabra |
| **Uso del bus** | Exclusivo del DMAC mientras dura | **Repartido** entre CPU y DMAC |
| **Ventaja** | Transferencia **muy rápida**, limitada sólo por la velocidad del periférico | **No degrada tanto** el rendimiento del sistema y de la CPU |
| **Desventaja** | La CPU **no puede usar el bus con memoria** durante la transferencia → puede degradar el rendimiento | La transferencia **puede tardar un poco más** |

Para transferencias de **múltiples palabras**, la técnica por **robo de ciclo es
la más eficiente**.

### DMA frente a las otras 2 técnicas de gestión de E/S

| | **Programada con espera** | **Por interrupción** | **DMA** |
|---|---|---|---|
| **¿La CPU transfiere cada dato?** | Sí | Sí | **No** |
| **CPU mientras el periférico no está listo** | Ociosa | Puede hacer otra tarea | Puede hacer otra tarea |
| **Rol de la CPU** | Control casi directo de toda la operación | Inicia y atiende cada interrupción | **Sólo prepara la transferencia y verifica el resultado** |
| **Quién es maestro del bus** | La CPU | La CPU | **El DMAC** durante la transferencia |
| **Nivel en la escala de E/S** | 1 | 2 | **3** |

### Canal selector vs. canal multiplexor

| | **Selector** | **Multiplexor** |
|---|---|---|
| **Dispositivos simultáneos** | **1 por vez** | **Varios a la vez** |
| **Mecanismo** | Selecciona un dispositivo y transfiere sobre él | Multiplexa la atención entre los dispositivos seleccionados |
| **Variantes** | — | De **bytes** (de a caracteres) y de **bloques** (intercala bloques de distintos dispositivos) |

<p class="fuentes">Fuente: <code>Teorías/03 Arq clase3 EntradaSalida.pdf</code>, fil. 24, 53–58, 59, 61–64.</p>

## Ejemplo del curso

<!-- TODO: falta en fuentes -->

!!! warning "Sin ejemplo numérico propio de DMA en la teoría"
    La clase 3 desarrolla un ejemplo numérico completo (impresora de 20 ppm y
    disco de 10 MB/s, CPU de 200 MHz y 100 MIPS) **sólo para comparar E/S con
    espera contra E/S por interrupción** —está en la
    [ficha de Entrada/Salida](entrada-salida.md#ejemplo-del-curso)—. Ese ejemplo
    **no se extiende al DMA** en las filminas.

    Lo más cercano a un ejemplo concreto es la mención del **chip 8237** como
    DMAC en el esquema de conexión al bus (fil. 46) y la línea **INT3 del MSX88,
    conectada a la salida del puerto a impresora, identificada como DMA**
    (`Teorías/02 Arq clase2 Interrupciones.pdf`, fil. 45). Ninguna de las dos
    trae un desarrollo que se pueda transcribir como "ejemplo del curso".

## Preguntas de final sobre este tema

[:material-help-box: Ver el banco de preguntas de DMA](../finales/temas/dma.md)

## Fuentes citadas

- `Teorías/03 Arq clase3 EntradaSalida.pdf` — 65 filminas, en particular fil.
  44–64. Fuente primaria del tema.
- `Teorías/02 Arq clase2 Interrupciones.pdf` — fil. 45, para la línea INT3 del
  MSX88.

**Referencias que da la propia cátedra** (fil. 65): W. Stallings, 5.ª ed.,
capítulo 6.
