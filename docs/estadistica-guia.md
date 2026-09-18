# Guía estadística del estudio

### Qué estamos midiendo, con qué variables y con qué herramientas

> **Para quién es este documento.** Está escrito para alguien que trabaja en
> filología o en enseñanza de idiomas y que no tiene formación estadística
> previa. No hay fórmulas complicadas: cada término se explica la primera vez
> que aparece y se relaciona siempre con una pregunta concreta del formulario.
> Si en algún momento algo suena a jerga, está recogido en el
> [glosario](#12-glosario-en-una-línea) del final.

---

## Índice

1. [Qué tipo de estudio es y qué quiere demostrar](#1-qué-tipo-de-estudio-es-y-qué-quiere-demostrar)
2. [La idea central: variable independiente y variable dependiente](#2-la-idea-central-variable-independiente-y-variable-dependiente)
3. [Los tipos de variable que aparecen en el estudio](#3-los-tipos-de-variable-que-aparecen-en-el-estudio)
4. [Cómo están organizados los datos: dos niveles](#4-cómo-están-organizados-los-datos-dos-niveles)
5. [Inventario completo de variables independientes](#5-inventario-completo-de-variables-independientes)
6. [Inventario completo de variables dependientes](#6-inventario-completo-de-variables-dependientes)
7. [Variables de diseño y de control](#7-variables-de-diseño-y-de-control)
8. [Qué estadísticas calcula la aplicación hoy](#8-qué-estadísticas-calcula-la-aplicación-hoy)
9. [Los cruces de variables: qué se cruza con qué](#9-los-cruces-de-variables-qué-se-cruza-con-qué)
10. [Las herramientas estadísticas que se están usando](#10-las-herramientas-estadísticas-que-se-están-usando)
11. [Qué falta y qué convendría añadir en el análisis de la tesis](#11-qué-falta-y-qué-convendría-añadir-en-el-análisis-de-la-tesis)
12. [Glosario en una línea](#12-glosario-en-una-línea)
13. [Avisos importantes de interpretación](#13-avisos-importantes-de-interpretación)

---

## 1. Qué tipo de estudio es y qué quiere demostrar

El estudio es un **experimento de actitudes lingüísticas** con la técnica
llamada **_verbal guise_** («máscara verbal»).

La lógica es esta: si le preguntamos a alguien «¿qué opinas del acento
andaluz?», la respuesta estará contaminada por lo que esa persona *cree que
debe* responder. Así que no se le pregunta. En su lugar:

1. El participante escucha una grabación real, **sin saber de dónde es**. En el
   formulario cada audio se llama simplemente «Grabación 1», «Grabación 2»… La
   ciudad solo existe en la base de datos, para el investigador.
2. Se le pide que valore **la voz, la persona y la cultura** que asocia a esa
   grabación.
3. Como el texto que se dice es el mismo en todas las grabaciones (un jefe de
   hotel dirigiéndose a dos empleados, Mariam y Omar), **lo único que cambia
   entre audios es el acento**.

De ahí sale la inferencia clave del estudio:

> Si la grabación de Cádiz recibe sistemáticamente puntuaciones más bajas en
> «culta» que la de Madrid, y el contenido es idéntico, entonces esa diferencia
> **no está en lo que se dice, sino en el prejuicio que despierta el acento**.

Ese es el mecanismo científico de todo el trabajo. Todo lo estadístico que
viene a continuación no es más que una manera ordenada de comprobar si esas
diferencias existen realmente o son casualidad.

---

## 2. La idea central: variable independiente y variable dependiente

Esta es la distinción más importante del documento, así que la explicamos con
calma y sin tecnicismos.

Una **variable** es, simplemente, *cualquier cosa que puede tomar valores
distintos en distintos casos*: la edad (23, 41, 19…), el género (femenino,
masculino, otro), una puntuación de 1 a 5, una ciudad…

Cuando se investiga, las variables se dividen en dos papeles:

| | **Variable independiente (VI)** | **Variable dependiente (VD)** |
|---|---|---|
| **Qué es** | La supuesta **causa**. Lo que el investigador manipula o toma como dado. | El supuesto **efecto**. Lo que se mide para ver si cambia. |
| **Cómo recordarla** | *De qué depende* | *Lo que depende* |
| **Pregunta típica** | «¿Influye X…?» → X es la VI | «…en Y?» → Y es la VD |
| **En este estudio** | El **acento** de la grabación (Granada, Cádiz, Madrid…) y la **zona dialectal** (meridional / septentrional). | Las **puntuaciones** que el participante da: agradable, culta, inteligente, proximidad, nivel de ingresos percibido… |

Ejemplo aplicado al estudio, leído como una frase:

> «¿Influye **la zona dialectal del acento** (VI) en **la puntuación de
> "culta"** (VD) que recibe la persona que habla?»

Un truco útil para no confundirse nunca: **la variable dependiente es la que
aparece en el eje vertical de la gráfica** (la altura de la barra: la
puntuación media), y **la independiente en el eje horizontal** (las ciudades,
los grupos). Si miras el panel de resultados de la aplicación, prácticamente
todas las gráficas están construidas así.

### El matiz que hay que tener claro en este estudio

Hay **dos familias de variables independientes**, y conviene no mezclarlas:

**a) La VI experimental: el acento.** Esta es la que el estudio *manipula de
verdad*. El investigador decide qué grabación escucha cada persona. Como está
bajo control y el texto es idéntico, es la única que permite hablar con
propiedad de **causa**.

**b) Las VI del participante: quién responde.** Edad, género, nivel de español,
si ha visitado España, lengua materna… Estas **no se manipulan**: vienen dadas.
Sirven para preguntar «¿los participantes con nivel C2 puntúan distinto que los
de nivel A2?». Son independientes en el sentido estadístico (se usan como
predictoras), pero técnicamente se llaman **variables de agrupación** o
**covariables**, y con ellas se puede hablar de **asociación**, no de causa.

> **Consecuencia práctica para la redacción de la tesis:** con (a) se puede
> escribir «el acento meridional *provoca* valoraciones más bajas en estatus».
> Con (b) hay que escribir «las mujeres del estudio *puntuaron* más alto que los
> hombres», o «se observó una *asociación* entre X e Y», nunca «el género
> *causa*…». Es un matiz que un tribunal aprecia.

---

## 3. Los tipos de variable que aparecen en el estudio

Cada tipo de variable admite unas operaciones estadísticas y prohíbe otras. En
este estudio hay cuatro tipos, y conviene distinguirlos porque **determinan qué
gráfica y qué prueba son legítimas**.

### 3.1 Variables categóricas nominales

Son **etiquetas sin orden**: ninguna es «más» que otra.

- Género del participante (Femenino / Masculino / Otro)
- Lengua materna, ciudad de nacimiento, ciudad de residencia
- Comunidad autónoma percibida (las 19 opciones)
- Ciudad de la grabación (Granada, Cádiz…)
- Zona dialectal (meridional / septentrional)
- Métodos de estudio del español (Academia, Internet, Música…)

**Qué se puede hacer con ellas:** contar cuántos hay de cada tipo
(**frecuencias**), calcular **porcentajes**, y representarlas con barras o con
un gráfico de sectores. **Qué no se puede hacer:** una media. «La media de
comunidad autónoma es 7,4» no significa nada.

### 3.2 Variables categóricas dicotómicas (sí/no)

Son nominales de solo dos valores. En la base de datos se guardan como
verdadero/falso:

- ¿Estudias? ¿Trabajas?
- ¿Tienes familia en España? ¿Has visitado España? ¿Has visitado otros países
  hispanohablantes?
- ¿Conoces personas de esta región?
- ¿Crees que la persona trata distinto a Mariam y a Omar?
- ¿Habría sido diferente con una jefa mujer?

**Qué se puede hacer:** contar sí/no y, sobre todo, calcular el **porcentaje de
síes**, que sí es un número con sentido y se puede comparar entre grupos («el
62 % dice que sí en Cádiz frente al 31 % en Madrid»).

### 3.3 Variables ordinales

Tienen **orden**, pero **las distancias entre escalones no son necesariamente
iguales**.

- Nivel de español: A1 < A2 < B1 < B2 < C1 < C2 < Nativo
- Nivel educativo: primaria < secundaria < … < doctorado
- Nivel de estudios percibido y nivel de ingresos percibidos: Bajo < Medio < Alto
- Tiempo de estancia: «menos de 1 mes» < «1-3 meses» < …
- **Las escalas de diferencial semántico de 1 a 5** ← las más importantes
- **La proximidad de pronunciación de 1 a 5**

El caso de las escalas 1-5 merece una explicación aparte, porque es el corazón
del estudio y también su punto estadísticamente más delicado.

### 3.4 El caso especial: el diferencial semántico

El **diferencial semántico** es una técnica clásica (Osgood, 1957) que se usa
exactamente así en el formulario:

```
Desagradable  ◯ — ◯ — ◯ — ◯ — ◯  Agradable
              1   2   3   4   5
```

El participante marca el punto que mejor refleja su impresión. En este estudio
hay **23 pares de adjetivos**, repartidos en tres bloques:

| Bloque | Ítems | Adjetivos (negativo 1 → positivo 5) |
|---|---|---|
| **Voz / pronunciación** | 11 | Desagradable–Agradable · Monótona–Variada · Complicada–Sencilla · Distante–Cercana · Rural–Urbana · Lenta–Rápida · Aburrida–Divertida · Confusa–Clara · Fea–Bonita · Poco profesional–Profesional · Poco musical–Musical |
| **Persona que habla** | 6 | Poco inteligente–Inteligente · Antipática–Simpática · Distante–Cercana · Inculta–Culta · Maleducada–Educada · Poco confiable–Confiable |
| **Cultura asociada** | 6 | Tradicional–Innovadora · Aburrida–Divertida · Desconocida–Conocida · Distante–Cercana · Pobre–Rica · Poco interesante–Interesante |

**El debate técnico, resumido.** Estrictamente, una escala de 1 a 5 es
**ordinal**: sabemos que 4 es más que 3, pero no podemos jurar que la distancia
entre 3 y 4 sea idéntica a la que hay entre 4 y 5. Por eso, en sentido estricto,
no deberíamos calcular medias.

**Lo que se hace en la práctica, y por qué es aceptable.** En la bibliografía de
actitudes lingüísticas y en psicología social **es la norma tratar el
diferencial semántico como si fuera una variable de intervalo** y calcular
medias, siempre que:

- la escala tenga 5 puntos o más (aquí son 5 ✔),
- los puntos estén equiespaciados visualmente, sin etiquetas intermedias que
  rompan la simetría (aquí son cinco círculos idénticos ✔),
- y sobre todo, que **se promedien varios ítems**, no uno solo (aquí se
  promedian 11 + 6 + 6 ✔).

Esa última condición es la clave: la media de once ítems se comporta
estadísticamente mucho mejor que un ítem suelto.

> **Cómo defenderlo si alguien lo pregunta en la defensa de la tesis:** «Las
> escalas se han tratado como variables de intervalo, práctica habitual en los
> estudios de actitudes lingüísticas con diferencial semántico, dado que se
> trata de escalas simétricas de cinco puntos y que el análisis se realiza sobre
> índices promediados. Para las comparaciones se han contrastado además los
> resultados con pruebas no paramétricas» (ver §11).

### 3.5 Variables cuantitativas continuas

Números de verdad, donde las distancias sí son iguales:

- **Edad** del participante
- **Años de estudio del español**

Aquí sí tiene pleno sentido la media, la mediana y la desviación típica.

### 3.6 Variables cualitativas de texto libre

No son estadísticas, pero son **datos valiosísimos para una tesis de filología**,
porque explican el *porqué* de los números:

- Un aspecto de la pronunciación que te haya **gustado**
- Un aspecto que te haya **disgustado**
- Qué opinión tienes sobre esta región
- ¿Tu actitud puede verse influida por el género de quien habla?
- Qué región crees que habla mejor español y por qué

Estos campos **no se pueden meter en una gráfica directamente**, pero se
analizan por **codificación temática**: se leen todas las respuestas, se agrupan
en categorías recurrentes («seseo», «velocidad», «me recuerda a…», «cierre de
vocales»), se cuenta cuántas veces aparece cada categoría y **entonces sí** se
convierten en una variable nominal con frecuencias. Es lo que en metodología se
llama **método mixto**: los números dicen *qué* pasa, los textos dicen *por qué*.

---

## 4. Cómo están organizados los datos: dos niveles

Este apartado es corto pero importante, porque explica por qué hay dos tablas
en la base de datos y por qué eso tiene consecuencias estadísticas.

Los datos tienen **estructura anidada** (o «jerárquica», o «de dos niveles»):

```
NIVEL 2 — PARTICIPANTE  (tabla "participantes", 1 fila por persona)
│   email, edad, género, nivel de español, ¿ha visitado España?…
│
├── NIVEL 1 — VALORACIÓN de la grabación A  (tabla "valoraciones")
├── NIVEL 1 — VALORACIÓN de la grabación B
├── NIVEL 1 — VALORACIÓN de la grabación C
├── NIVEL 1 — VALORACIÓN de la grabación D
├── NIVEL 1 — VALORACIÓN de la grabación E
└── NIVEL 1 — VALORACIÓN de la grabación F
        23 puntuaciones + proximidad + ingresos + estudios + región + …
```

Cada participante produce **6 valoraciones** (una por grabación escuchada). Por
tanto:

- Con **30 participantes** hay 30 filas de nivel 2 pero **180 filas de nivel 1**.
- El **N no es el mismo según qué se analice**: para «edad media de la muestra»
  el N es 30; para «puntuación media de agradabilidad» el N es 180. En la tesis
  hay que decir siempre **cuál de los dos N** se está usando en cada tabla.

**La consecuencia estadística (importante y fácil de pasar por alto):** las 6
valoraciones de una misma persona **no son independientes entre sí**. Quien es
generoso puntuando lo será en las seis. Esto se llama **medidas repetidas** o
**datos dependientes**, y significa que las pruebas estadísticas clásicas «para
grupos independientes» no son del todo apropiadas. En §11 se indica qué usar en
su lugar.

En el archivo CSV que exporta la aplicación los dos niveles vienen **aplanados**:
una fila por valoración, con los datos del participante **repetidos** en cada
una de sus seis filas. Es el formato que esperan Excel, SPSS, R y jamovi, así
que está bien así; solo hay que recordar que el email repetido seis veces es la
misma persona, no seis personas.

---

## 5. Inventario completo de variables independientes

### 5.1 VI experimentales (las que se manipulan) — **nivel valoración**

Estas son las que dan sentido al experimento.

| Variable | Tipo | Valores | Papel |
|---|---|---|---|
| **Ciudad de la grabación** | Nominal | Granada, Cádiz, Badajoz, Murcia, Tenerife, Madrid, Barcelona, Mallorca, Huesca, Guipúzcoa, A Coruña, Asturias (12) | La VI principal: 12 acentos comparados entre sí. |
| **Zona dialectal** | Nominal dicotómica | meridional (5) / septentrional (7) | La VI más potente del estudio: agrupa los 12 acentos en los 2 bloques que interesa contrastar. |
| **Comunidad autónoma real** | Nominal | Andalucía, Extremadura, Canarias… | No se compara directamente: se usa como **respuesta correcta** para medir aciertos. |

> **Por qué la zona dialectal es tan importante.** Comparar 12 ciudades entre sí
> exige muchísimos participantes para que cada celda tenga datos suficientes.
> Comparar **2 zonas** (meridional vs. septentrional) concentra toda la muestra
> en dos grupos grandes y es **muchísimo más potente estadísticamente**. Si la
> tesis tiene que quedarse con un solo resultado sólido, lo más probable es que
> sea este contraste. Además, el propio formulario está diseñado para él:
> dentro de cada versión las grabaciones se presentan **alternando zonas**
> (meridional → septentrional → meridional…) para que ninguna zona se concentre
> al principio o al final y arrastre el efecto del cansancio.

### 5.2 VI del participante (características, no manipuladas) — **nivel participante**

| Variable | Tipo | Para qué sirve como VI |
|---|---|---|
| **Género** | Nominal (F / M / Otro) | ¿Valoran igual hombres y mujeres? Especialmente relevante para las preguntas sobre Mariam y Omar. |
| **Edad** | Cuantitativa | ¿Los prejuicios lingüísticos son generacionales? Se puede usar continua o agrupada en tramos. |
| **Nivel de español (MCER)** | Ordinal (A1…C2, Nativo) | **Muy interesante:** ¿se afinan los prejuicios con la competencia? Un A2 quizá ni distinga los acentos; un C1 sí. |
| **Años de estudio del español** | Cuantitativa | Mismo razonamiento, medido en tiempo en vez de en certificado. |
| **Lengua(s) materna(s)** | Nominal | ¿Un arabófono y un francófono perciben distinto el mismo acento? |
| **Nivel educativo** | Ordinal | Control sociodemográfico clásico. |
| **Ciudad de nacimiento / residencia** | Nominal | Contexto geográfico del informante. |
| **¿Estudia? / ¿Trabaja?** | Dicotómica | Perfil de ocupación. |
| **Métodos de estudio** (selección múltiple) | Nominal múltiple | ¿Quien aprendió con música/TV tiene otras actitudes que quien aprendió en academia? Ojo: es **multirespuesta**, los porcentajes suman más de 100 %. |
| **Otros idiomas y sus niveles** | Ordinal por idioma | Perfil plurilingüe. |
| **¿Familia en España?** | Dicotómica | **Variable de contacto.** |
| **¿Ha visitado España? / zonas / tiempo de estancia** | Dicotómica + nominal + ordinal | **La más prometedora de todas:** la hipótesis del contacto dice que quien ha estado en Andalucía puntuará el acento andaluz distinto que quien no ha estado nunca. |
| **¿Ha visitado otros países hispanohablantes? / cuáles / tiempo** | Dicotómica + nominal + ordinal | Amplitud de exposición al español. |

> **Sugerencia concreta para la tesis.** De todas estas, las tres que suelen dar
> resultados publicables son: **nivel de español**, **haber visitado España** y
> **género del participante**. Merece la pena centrarse en ellas en vez de
> cruzar las trece: cuantos más cruces se hacen, más probable es encontrar
> «resultados» que solo son ruido (ver §13).

---

## 6. Inventario completo de variables dependientes

Todas se miden **a nivel de valoración**: el participante las responde una vez
**por cada grabación**.

### 6.1 Las 23 escalas de diferencial semántico (1-5) — VD principales

Son las variables dependientes por excelencia del estudio. Se agrupan en tres
índices:

| Índice | Composición | Qué mide |
|---|---|---|
| **Índice de VOZ** | Media de los 11 ítems de pronunciación | Valoración estética y funcional del acento en sí. |
| **Índice de PERSONA** | Media de los 6 ítems de persona | El **prejuicio social**: qué tipo de persona imaginamos detrás del acento. |
| **Índice de CULTURA** | Media de los 6 ítems de cultura | La actitud hacia la comunidad asociada al acento. |

Cada ítem individual es también, por sí mismo, una VD utilizable. La aplicación
permite comparar las 12 ciudades **ítem por ítem** («compara este rasgo»), lo
cual es muy útil: puede ocurrir que un acento salga alto en «simpática» y bajo
en «culta», y **eso es precisamente el hallazgo interesante**.

> **Aviso importante sobre tres ítems.** Dentro de la escala de voz hay tres
> pares que **no son valorativos, sino descriptivos**:
> **Rural–Urbana**, **Lenta–Rápida** y (en cultura) **Tradicional–Innovadora**.
> Un 5 en «rápida» no significa «mejor», solo «más rápida». Al meterlos en la
> media global del índice de voz se está sumando peras con manzanas. **Dos
> opciones, ambas defendibles:** (a) excluirlos del índice global y analizarlos
> por separado como rasgos descriptivos, o (b) mantenerlos pero advertirlo
> explícitamente en la tesis. La opción (a) es más limpia, y da además un
> resultado propio muy vendible: *«el acento X se percibe como el más rural y el
> más lento»*.

### 6.2 El resto de variables dependientes

| VD | Tipo | Cómo se analiza |
|---|---|---|
| **Proximidad con la propia pronunciación** (1-5) | Ordinal | Media por ciudad + distribución de las 5 opciones. Mide **distancia percibida**, y es una posible variable explicativa de las demás: *cuanto más cercano me suena, mejor lo valoro*. |
| **Nivel de estudios percibido** (Bajo/Medio/Alto) | Ordinal de 3 niveles | Porcentajes por ciudad. **Es la medida de estatus más directa del estudio.** |
| **Nivel de ingresos percibido** (Bajo/Medio/Alto) | Ordinal de 3 niveles | Ídem. |
| **Región percibida** (19 comunidades) | Nominal | Distribución de frecuencias: ¿dónde sitúa la gente cada acento? |
| **Acierto en la región** (derivada) | Dicotómica → porcentaje | Se compara la región percibida con la real y se calcula el **% de aciertos**. Mide **reconocibilidad** del acento. |
| **¿Trato diferenciado entre Mariam y Omar?** | Dicotómica | % de síes por ciudad. |
| **¿Habría sido diferente con una jefa mujer?** | Dicotómica | % de síes por ciudad. |
| **Aspecto gustado / disgustado** | Texto libre | Codificación temática (§3.6). |
| **¿Conoces personas de esta región?** + opinión | Dicotómica + texto | Puede usarse también como **variable moderadora**: ¿puntúan distinto quienes conocen gente de esa región? |
| **¿Influye el género de quien habla en tu actitud?** | Texto libre | Codificación temática. |

### 6.3 Un par de conceptos extra que conviene conocer

Además de VI y VD, hay dos papeles más que una variable puede jugar, y que
aparecen de forma natural en este estudio:

- **Variable moderadora:** la que *cambia la fuerza* de la relación entre VI y
  VD. Ejemplo: «el acento meridional recibe peores valoraciones, **pero solo
  entre quienes nunca han visitado España**». Ahí «haber visitado España» es
  moderadora.
- **Variable mediadora:** la que explica *el mecanismo* por el que la VI afecta
  a la VD. Ejemplo: «el acento meridional se percibe como más lejano a mi
  pronunciación (proximidad), **y por eso** se valora peor». Ahí la proximidad es
  mediadora.

No hace falta contrastarlas formalmente con modelos complejos; mencionarlas y
razonarlas cualitativamente ya enriquece mucho la discusión de una tesis.

---

## 7. Variables de diseño y de control

Hay una variable que no es ni independiente ni dependiente en sentido propio,
pero que hay que documentar en el capítulo de metodología: el **bloque** o
versión del formulario.

### El problema que resuelve

El formulario con las 12 grabaciones duraba unos 40 minutos. Ese cansancio
**arruina los datos**: las últimas grabaciones reciben respuestas mecánicas.
Pero eliminar grabaciones habría empobrecido el estudio.

### La solución: diseño de bloques incompletos balanceados (BIBD)

Se crearon **6 versiones del formulario**, cada una con **6 grabaciones**:

| Versión | Meridionales | Septentrionales |
|---|---|---|
| **F1** | Granada, Cádiz, Badajoz | Madrid, Barcelona, Mallorca |
| **F2** | Granada, Murcia, Tenerife | Huesca, Guipúzcoa, A Coruña |
| **F3** | Cádiz, Murcia, Tenerife | Asturias, Madrid, Huesca |
| **F4** | Granada, Badajoz | Barcelona, Mallorca, Guipúzcoa, Asturias |
| **F5** | Cádiz, Murcia | Madrid, A Coruña, Mallorca, Guipúzcoa |
| **F6** | Badajoz, Tenerife | Barcelona, Huesca, A Coruña, Asturias |

**«Incompleto»** significa que ningún participante evalúa todas las grabaciones.
**«Balanceado»** significa que el reparto es matemáticamente equitativo: **cada
una de las 12 grabaciones aparece en exactamente 3 de las 6 versiones**. Ese
número —3— se llama **réplica** del diseño, y que sea idéntico para las doce es
justamente lo que hace válido el diseño.

Además, la aplicación **asigna a cada nuevo participante la versión que menos
participantes ha completado hasta ese momento** (empates, al azar). Así las seis
versiones se llenan a la par sin intervención manual, y el reparto se
autocorrige si hay abandonos:

| Participantes | Por versión | Escuchas por audio |
|---|---|---|
| 12 | 2 | 6 (brecha 0) |
| 20 | 3-4 | 9-11 |
| 30 | 5 | 15 (brecha 0) |

La aplicación vigila esto sola: el panel muestra la **brecha** (diferencia entre
el audio más escuchado y el menos escuchado) y avisa si el diseño se desequilibra.
Una brecha de 0 es equilibrio perfecto. **Los múltiplos de 6 participantes dan
siempre equilibrio perfecto**, así que es buena idea cerrar la recogida de datos
en 30, 36, 42…

### Cómo se redacta esto en la tesis

Es un punto fuerte del trabajo, no una limitación, y conviene presentarlo así:

> «Para evitar la fatiga del informante sin reducir el número de variedades
> analizadas, se empleó un **diseño de bloques incompletos balanceados**: las 12
> grabaciones se distribuyeron en 6 versiones de 6 grabaciones cada una, de modo
> que cada variedad apareciera en exactamente 3 versiones (réplica = 3). La
> asignación de versiones se realizó de forma automática y autoequilibrante, y
> dentro de cada versión las variedades se presentaron alternando zona dialectal
> para neutralizar los efectos de orden.»

---

## 8. Qué estadísticas calcula la aplicación hoy

Conviene ser preciso en esto: **la aplicación calcula estadística descriptiva,
no inferencial**. Es decir, **describe** lo que hay en la muestra recogida, pero
todavía **no contrasta hipótesis** ni dice si las diferencias son
estadísticamente significativas. Ese paso se hace fuera, con el CSV (ver §11).

### 8.1 La distinción descriptiva / inferencial, en dos líneas

- **Estadística descriptiva:** resume los datos que tengo. *«En mi muestra, el
  acento de Cádiz obtuvo 3,2 y el de Madrid 4,1».* Es un hecho, no admite duda.
- **Estadística inferencial:** generaliza a la población. *«Esa diferencia de
  0,9 puntos es demasiado grande para ser casualidad: es muy probable que exista
  también fuera de mi muestra».* Es una apuesta probabilística.

Una tesis necesita las dos: la primera para presentar, la segunda para concluir.

### 8.2 Medidas resumen (los KPI de la cabecera)

| Indicador | Qué es | Sobre qué N |
|---|---|---|
| **Participantes** | Recuento de personas | Nivel participante |
| **Valoraciones de audio** | Recuento de audios valorados | Nivel valoración (≈ 6 × participantes) |
| **Edad media** | Media aritmética | Nivel participante |
| **Proximidad media** | Media aritmética de 1-5 | Nivel valoración |

### 8.3 Medias aritméticas

La **media** es sumar todos los valores y dividir entre cuántos son. Es la
medida estrella del estudio, y se calcula:

- Por **ítem** y por **ciudad**: la media de «agradable» en Granada, la media de
  «culta» en Barcelona… (23 ítems × 12 ciudades).
- Por **índice** y por **ciudad**: las medias globales de voz, persona y cultura.
  Ojo a un detalle técnico: estas medias globales son **medias de medias** (se
  promedian los 11 —o 6— valores medios de los ítems). Con datos completos el
  resultado coincide con la media general, pero conviene saberlo.
- Por **zona dialectal**: el perfil completo de meridional frente a
  septentrional, con todas sus grabaciones juntas.
- De **proximidad**, por ciudad y global.

### 8.4 Distribuciones de frecuencias y porcentajes

Una **distribución de frecuencias** es simplemente contar cuántas veces aparece
cada valor. La aplicación las calcula para:

- Género y nivel de español de los participantes
- Edad en **tramos** (<18, 18-24, 25-34, 35-44, 45-54, 55+) → esto es un
  **histograma**, que sirve para ver la forma de la muestra de un vistazo
- Nivel de ingresos y de estudios percibidos, por ciudad y global
- Región percibida (las 19 comunidades), por ciudad y global
- Proximidad (cuántos dieron 1, cuántos 2…)
- Las dos preguntas sí/no sobre género, por ciudad
- Contexto: estudia, trabaja, familia en España, ha visitado España, ha visitado
  otros países

Un detalle de implementación útil: las distribuciones **rellenan con ceros** las
categorías que no ha elegido nadie. Es lo correcto —que nadie sitúe un acento en
Cantabria es un dato, no un hueco— y evita tablas con categorías fantasma.

### 8.5 Porcentajes derivados

- **% de aciertos en la región**: de los que respondieron, cuántos acertaron la
  comunidad real de cada grabación. Es una medida de **reconocibilidad**: un
  acento con 70 % de aciertos es un estereotipo consolidado; uno con 10 % es
  irreconocible para esa población. Esa diferencia por sí sola da para un
  apartado entero de la tesis.

### 8.6 Ordenaciones (ranking)

- **Ranking de grabaciones por agradabilidad de la voz**: las 12 ciudades
  ordenadas de mayor a menor. Es descriptivo y muy visual, pero **cuidado**: un
  ranking sugiere diferencias que pueden no ser reales. El 1.º y el 2.º pueden
  estar separados por 0,03 puntos, que no significa nada. Nunca presentes un
  ranking sin decir **cuánta** distancia hay entre puestos.

### 8.7 Indicadores de calidad del diseño

- **Escuchas por audio** (N de cada grabación)
- **Mínimo, máximo y brecha** entre el audio más y el menos escuchado
- **Réplicas por grabación** y comprobación automática de si el diseño sigue
  equilibrado
- **Reparto de participantes por versión** del formulario

Estos números no son un resultado del estudio: son la **prueba documental de que
el muestreo fue correcto**, y van en el capítulo de metodología.

---

## 9. Los cruces de variables: qué se cruza con qué

«Cruzar variables» significa mirar una VD **separada por los grupos de una VI**,
en vez de mirarla en conjunto. Es el paso que convierte un dato en un hallazgo.

- **Sin cruzar:** «la puntuación media de "culta" es 3,4». Poco informativo.
- **Cruzando por zona:** «meridional 2,9 · septentrional 3,8». Ahí hay una tesis.

Cuando se cruzan dos variables **categóricas** y se cuentan los casos de cada
combinación, la tabla resultante se llama **tabla de contingencia** (o tabla
cruzada / *crosstab*). Ejemplo:

|  | Estudios percibidos: Bajo | Medio | Alto |
|---|---|---|---|
| **Acento meridional** | 41 | 58 | 21 |
| **Acento septentrional** | 18 | 62 | 88 |

Esa tabla es exactamente lo que se somete después a una prueba de **chi-cuadrado**
(§11) para saber si el patrón es real o casualidad.

### 9.1 Cruces que la aplicación ya hace

| VD | × | VI | Dónde se ve |
|---|---|---|---|
| Índices de voz / persona / cultura | × | Ciudad (12) | «Las cuatro medidas, ciudad a ciudad» |
| Cada ítem por separado | × | Ciudad (12) | «Compara un rasgo concreto» |
| Perfil completo de los 23 ítems | × | Zona dialectal | Gráficas de radar por zona |
| Proximidad | × | Ciudad | Barras de proximidad |
| Nivel de ingresos percibido | × | Ciudad | Barras apiladas |
| Nivel de estudios percibido | × | Ciudad | Barras apiladas |
| % de aciertos de región | × | Ciudad | Barras de aciertos |
| Preguntas de género (sí/no) | × | Ciudad | Barras sí/no por ciudad |
| Región percibida | × | Ciudad | Distribución por grabación |
| Perfil de cada ciudad | × | Media de las 12 | Cada pestaña de ciudad compara la ciudad con el promedio general |

Es decir: **la aplicación cruza sistemáticamente todas las VD por la VI
experimental** (ciudad y zona). Eso está completo.

### 9.2 Cruces que faltan y hay que hacer fuera, con el CSV

La aplicación **no cruza todavía por las características del participante**. Y
ahí es donde están algunas de las preguntas más interesantes:

| Pregunta de investigación | Cruce necesario |
|---|---|
| ¿Quien tiene más nivel de español discrimina más entre acentos? | Índices × Nivel de español × Zona |
| ¿Haber estado en España cambia la actitud? | Índices × ¿Visitado España? × Zona |
| ¿Las mujeres perciben más el trato diferenciado a Mariam? | % síes × Género del participante |
| ¿Los mayores tienen prejuicios más marcados? | Índices × Edad (o tramos) × Zona |
| ¿Cuanto más cercano me suena, mejor lo valoro? | Índice de voz × Proximidad (correlación) |
| ¿Se valora mejor un acento cuando se acierta su procedencia? | Índices × Acierto (sí/no) |
| ¿La lengua materna condiciona lo que se percibe? | Índices × Lengua materna × Zona |

Todos estos cruces son inmediatos en Excel (tabla dinámica), SPSS o jamovi a
partir del CSV exportado, porque el CSV ya trae **en la misma fila** los datos
del participante y los de la valoración, además de la **ciudad y la zona** de
cada grabación.

---

## 10. Las herramientas estadísticas que se están usando

Aquí hay dos sentidos de «herramienta»: los **programas** y los **procedimientos
estadísticos**. Van los dos.

### 10.1 Herramientas informáticas

| Herramienta | Qué papel juega |
|---|---|
| **Formulario web propio** (Astro) | Recogida de datos. Sustituye al cuestionario en papel y a Google Forms. Valida las respuestas sobre la marcha (nada queda en blanco), reparte las versiones del BIBD automáticamente y **impide respuestas duplicadas** usando el email como clave única. |
| **Supabase / PostgreSQL** | Base de datos. Guarda los datos ya estructurados en dos tablas (participantes y valoraciones), con protección de acceso: solo los investigadores autenticados pueden leer las respuestas. |
| **Panel de resultados propio** (`/admin`) | Calcula y muestra toda la estadística descriptiva **en tiempo real**, según van entrando respuestas. Permite ver el estudio avanzar sin exportar nada. |
| **Chart.js** | Librería de gráficas. Genera las barras, los radares y los sectores del panel. |
| **Exportación a CSV** | El puente hacia el análisis serio. Un botón descarga toda la base de datos aplanada, con acentos correctos para Excel, lista para SPSS, R o jamovi. |

> **Ventaja metodológica que conviene mencionar en la tesis:** al recoger los
> datos con un formulario propio no hay **transcripción manual**, y por tanto no
> hay errores de transcripción. Los datos que se analizan son literalmente los
> que marcó el informante. También se elimina el problema de los cuestionarios
> incompletos: el formulario no deja avanzar sin responder.

### 10.2 Procedimientos estadísticos ya aplicados

Todos pertenecen a la **estadística descriptiva**:

1. **Recuentos (frecuencias absolutas)** — cuántos casos de cada valor.
2. **Porcentajes (frecuencias relativas)** — imprescindibles cuando los grupos
   tienen tamaños distintos: comparar «30 síes» con «45 síes» no dice nada si un
   grupo tiene 40 personas y el otro 200.
3. **Media aritmética** — la tendencia central de las escalas 1-5, la edad y la
   proximidad.
4. **Agrupación en intervalos (binning)** — la edad continua convertida en seis
   tramos para el histograma.
5. **Distribuciones categóricas completas** — con ceros explícitos en las
   categorías vacías.
6. **Tasa de acierto** — comparación de una respuesta con un valor de referencia
   conocido, expresada en porcentaje.
7. **Ordenación (ranking)** — de las 12 ciudades por agradabilidad.
8. **Agregación por grupos** — las 12 ciudades colapsadas en 2 zonas dialectales.
9. **Medidas de equilibrio del muestreo** — mínimo, máximo y brecha de escuchas
   por audio; comprobación automática de la réplica del BIBD.

### 10.3 Tipos de gráfica utilizados y qué dice cada uno

Elegir mal la gráfica es un error frecuente en las tesis, así que:

| Gráfica | Para qué se usa aquí | Cuándo es la correcta |
|---|---|---|
| **Barras verticales** | Ranking, medias por ciudad, aciertos | Comparar una cantidad entre categorías. La opción por defecto y casi siempre la mejor. |
| **Barras agrupadas** | Las cuatro medidas (voz/persona/cultura/proximidad) ciudad a ciudad | Comparar **varias medidas** a la vez entre las mismas categorías. |
| **Barras apiladas** | Ingresos y estudios percibidos por ciudad; sí/no de género | Mostrar la **composición interna** de cada categoría (qué porcentaje de cada nivel). |
| **Barras horizontales** | Perfiles de ítems, región percibida | Cuando las etiquetas son largas («Poco profesional – Profesional») y no caben debajo. |
| **Gráfico de radar (telaraña)** | Perfil de los 23 ítems, meridional vs. septentrional | **Muy adecuado para el diferencial semántico**: muestra de un vistazo la «forma» del estereotipo de cada zona. Solo funciona con 2-3 series y escala común (aquí, 1-5 en todos los ejes ✔). |
| **Histograma** | Distribución de edades por tramos | Ver la forma de una variable continua. Ojo: un histograma **no** es un gráfico de barras; las categorías tienen orden natural y son intervalos. |
| **Sectores (donut)** | Preguntas sí/no | Solo aceptable con **2 o 3 categorías**. Con más, siempre barras. |

---

## 11. Qué falta y qué convendría añadir en el análisis de la tesis

Esta sección es la hoja de ruta del capítulo de análisis. Nada de esto lo hace
la aplicación: se hace con el CSV descargado, en SPSS, jamovi o R.

> **Recomendación de programa:** **jamovi** es gratuito, se parece a SPSS, tiene
> menús en español, produce las tablas ya con formato de publicación y no
> requiere escribir código. Para una tesis de filología es con diferencia la
> opción más razonable. (jamovi.org)

### 11.1 Medidas de dispersión — **esto es lo más urgente**

La aplicación da medias, pero **no da desviaciones típicas**. Y una media sin
dispersión es una media a medias:

- Media 3,0 con todos respondiendo 3 → **hay consenso**.
- Media 3,0 con la mitad respondiendo 1 y la otra mitad 5 → **hay polarización**,
  que es un resultado radicalmente distinto y mucho más interesante.

La **desviación típica** (o «estándar», SD) mide cuánto se alejan las respuestas
de la media, en promedio. En una escala de 1 a 5: una SD por debajo de 0,8
indica acuerdo; por encima de 1,3, desacuerdo notable.

**Toda tabla de medias en la tesis debe llevar su SD y su N al lado.** Es
obligatorio en cualquier publicación del área. Formato habitual:
*M = 3,42 (DT = 0,87); n = 45*.

### 11.2 Pruebas de contraste (estadística inferencial)

Aquí es donde se responde a «¿esta diferencia es real o es casualidad?».

**El p-valor en una frase:** el valor *p* es la probabilidad de haber obtenido
una diferencia así de grande **si en realidad no hubiera ninguna diferencia**.
Si p < 0,05, esa probabilidad es menor del 5 %, y se concluye que la diferencia
es **estadísticamente significativa**. Se escribe *p* en cursiva.

| Qué quieres comparar | Prueba paramétrica | Alternativa no paramétrica |
|---|---|---|
| Índices de voz/persona/cultura entre **2 zonas** (meridional vs. septentrional) | **t de Student** para muestras independientes | **U de Mann-Whitney** |
| Índices entre las **12 ciudades** | **ANOVA** de un factor + post-hoc de Bonferroni o Tukey (para saber *qué* pares difieren) | **Kruskal-Wallis** + Dunn |
| Dos variables **categóricas** (p. ej. zona × nivel de ingresos percibido) | **Chi-cuadrado (χ²)** de independencia | Exacta de Fisher si hay casillas con pocos casos |
| Relación entre **dos variables numéricas** (p. ej. proximidad e índice de voz) | **correlación de Pearson (r)** | **Spearman (ρ)** — más adecuada para ordinales |
| Varias VI a la vez (zona + nivel de español + género) | **ANOVA factorial** o **regresión lineal múltiple** | — |

**«Paramétrica» vs. «no paramétrica», sin tecnicismos:** las paramétricas asumen
que los datos se distribuyen más o menos en forma de campana; las no
paramétricas no asumen nada y trabajan con rangos (posiciones) en vez de con
valores. Con escalas de 1-5 y muestras pequeñas, **lo más prudente es hacer las
dos y comprobar que coinciden**: si la t de Student y la U de Mann-Whitney dan
el mismo veredicto, el resultado es sólido y nadie lo va a discutir. Cuesta dos
clics más y blinda el capítulo.

### 11.3 El tamaño del efecto — el complemento imprescindible del p-valor

El p-valor dice **si** hay diferencia; **no dice si esa diferencia importa**. Con
una muestra muy grande, una diferencia ridícula sale significativa.

Por eso hay que informar del **tamaño del efecto**:

- **d de Cohen** para comparar dos grupos: 0,2 = pequeño · 0,5 = mediano ·
  0,8 = grande.
- **eta cuadrado (η²)** para ANOVA: qué porcentaje de la variación explica la VI.
- **V de Cramer** para chi-cuadrado.

Una frase de resultados bien construida los lleva todos:

> «Las variedades meridionales obtuvieron puntuaciones significativamente más
> bajas en el índice de estatus que las septentrionales (*M* = 2,91; *DT* = 0,74
> frente a *M* = 3,68; *DT* = 0,69), *t*(178) = 7,12, *p* < 0,001, *d* = 1,07,
> lo que constituye un efecto de magnitud elevada.»

### 11.4 Fiabilidad de las escalas: el alfa de Cronbach

Antes de promediar 11 ítems en un solo «índice de voz», hay que demostrar que
esos 11 ítems **miden efectivamente lo mismo**. La medida estándar es el **alfa
de Cronbach (α)**, que va de 0 a 1:

- α ≥ 0,70 → aceptable, se puede promediar
- α ≥ 0,80 → bueno
- α < 0,70 → los ítems no forman un bloque coherente; hay que revisar cuáles

Se calcula en un clic en jamovi o SPSS, y **es prácticamente obligatorio** en
cualquier estudio que use escalas sumadas. Una sola frase en la tesis basta:
*«La consistencia interna de la escala de voz fue buena (α = 0,84)»*.

Es más que probable que los tres ítems descriptivos señalados en §6.1
(Rural–Urbana, Lenta–Rápida, Tradicional–Innovadora) **bajen el alfa**. Si es
así, el propio alfa justifica objetivamente su exclusión del índice: un
argumento estadístico, no una decisión arbitraria.

### 11.5 Análisis factorial (opcional, pero muy vistoso)

El **análisis factorial exploratorio** busca, de forma automática, qué ítems se
agrupan entre sí. En la bibliografía clásica de actitudes lingüísticas
(desde Lambert en los años 60) los adjetivos suelen agruparse en **dos grandes
dimensiones**:

- **Estatus / competencia:** inteligente, culta, profesional, educada, clara
- **Solidaridad / atracción social:** simpática, cercana, agradable, divertida,
  confiable

Y el hallazgo clásico del campo —que esta tesis está en condiciones de replicar
con datos españoles— es el siguiente:

> Las variedades no estándar (meridionales) suelen puntuar **bajo en estatus
> pero alto en solidaridad**: «hablan peor, pero me caen mejor».

Si los datos reproducen ese patrón, es un resultado de primer orden y una
conclusión redonda para la tesis. Y aunque no se llegue a hacer el análisis
factorial formal, **agrupar los ítems en esas dos dimensiones a mano y comparar
las medias de cada una** ya permite contarlo.

### 11.6 El problema de las medidas repetidas

Como se explicó en §4, cada participante aporta 6 valoraciones no independientes.
Lo estrictamente correcto sería usar **modelos mixtos** (con el participante como
efecto aleatorio) o **ANOVA de medidas repetidas**.

Siendo realistas, para una tesis de filología esto puede ser desproporcionado.
**La solución práctica y honesta**: hacer los análisis con las pruebas habituales
y **declararlo explícitamente como limitación** en el apartado correspondiente:

> «Dado el diseño de bloques incompletos, cada informante valoró seis variedades,
> por lo que las observaciones no son plenamente independientes. Los contrastes
> deben interpretarse con la cautela que impone este hecho.»

Esa frase demuestra que se conoce el problema, que es lo que un tribunal quiere
ver. Alternativa sencilla si se busca todavía más rigor: **promediar por
participante** (una sola puntuación media para meridionales y otra para
septentrionales por persona) y comparar esas dos con una **t de Student para
muestras relacionadas** (o Wilcoxon). Con eso cada participante aporta un solo
par de datos, la independencia queda garantizada y el análisis es impecable.

---

## 12. Glosario en una línea

| Término | Significado |
|---|---|
| **Variable** | Cualquier cosa que puede tomar valores distintos en distintos casos. |
| **Variable independiente (VI)** | La supuesta causa; lo que agrupa o se manipula. |
| **Variable dependiente (VD)** | El supuesto efecto; lo que se mide. |
| **Variable moderadora** | La que cambia la fuerza de la relación VI→VD. |
| **Variable mediadora** | La que explica el mecanismo de la relación VI→VD. |
| **Nominal** | Categorías sin orden (género, región). |
| **Ordinal** | Categorías con orden pero sin distancias iguales (A1…C2, 1-5). |
| **Continua / de intervalo** | Números con distancias iguales (edad). |
| **N / n** | Número de casos. Mayúscula para el total, minúscula para un subgrupo. |
| **Media (M)** | Promedio aritmético. |
| **Mediana** | El valor central al ordenar los datos; resiste mejor los valores extremos. |
| **Desviación típica (DT / SD)** | Cuánto se dispersan los datos alrededor de la media. |
| **Frecuencia** | Cuántas veces aparece un valor. |
| **Distribución** | El reparto completo de frecuencias de una variable. |
| **Histograma** | Gráfica de la distribución de una variable continua por intervalos. |
| **Tabla de contingencia** | Tabla que cruza dos variables categóricas y cuenta los casos. |
| **Estadística descriptiva** | Resume la muestra recogida. |
| **Estadística inferencial** | Generaliza de la muestra a la población. |
| **p-valor** | Probabilidad de ver esta diferencia si en realidad no existiera. p < 0,05 = significativa. |
| **Significativo** | Improbable por azar. **No** quiere decir «importante». |
| **Tamaño del efecto** | Cuán grande es la diferencia (d de Cohen, η², V de Cramer). |
| **Paramétrica** | Prueba que asume distribución normal (t, ANOVA, Pearson). |
| **No paramétrica** | Prueba que no la asume (Mann-Whitney, Kruskal-Wallis, Spearman). |
| **Alfa de Cronbach (α)** | Mide si varios ítems miden lo mismo. ≥ 0,70 aceptable. |
| **Correlación (r, ρ)** | Grado en que dos variables numéricas suben o bajan juntas, de −1 a +1. |
| **Diferencial semántico** | Escala entre dos adjetivos opuestos (Osgood, 1957). |
| **Verbal guise** | Técnica que valora acentos reales sin revelar su procedencia. |
| **BIBD** | Diseño de bloques incompletos balanceados: cada informante ve solo una parte, pero todo se ve igual de veces. |
| **Réplica** | Nº de veces que cada grabación aparece en el conjunto de versiones (aquí, 3). |
| **Medidas repetidas** | Varias respuestas de la misma persona; no son independientes. |

---

## 13. Avisos importantes de interpretación

Cinco cosas que conviene tener presentes para no cometer errores que después
cuesta corregir.

**1. Un 0 no siempre significa «cero».**
En las gráficas, cuando una grabación todavía no tiene ninguna valoración, la
media aparece como 0. Ese 0 **no quiere decir «valoración pésima»**: quiere decir
«sin datos». Antes de interpretar cualquier gráfica hay que mirar el **N** de esa
ciudad. Como norma prudente, **no interpretes ninguna media con menos de 10
valoraciones detrás**, y no la presentes en la tesis sin advertirlo.

**2. Las diferencias pequeñas no son diferencias.**
Que Granada tenga 3,42 y Murcia 3,39 **no significa nada**. Podrían invertirse
mañana con dos participantes más. Solo se puede hablar de diferencia cuando una
prueba estadística la respalda (§11.2). El ranking es una herramienta visual, no
una conclusión.

**3. Cuantos más cruces se hacen, más falsos hallazgos aparecen.**
Si se cruzan todas las VD con todas las VI, se hacen cientos de comparaciones, y
por pura casualidad **alrededor de 1 de cada 20 saldrá «significativa» sin
serlo**. Es el problema de las comparaciones múltiples. La defensa: **decidir de
antemano** qué hipótesis se quieren contrastar (p. ej. tres o cuatro: zona,
nivel de español, visita a España, género), contrastarlas, y presentar todo lo
demás explícitamente como **exploratorio**.

**4. Los prejuicios medidos son de la muestra, no de la humanidad.**
Si los informantes son estudiantes de español de un país concreto, las
conclusiones valen **para ese perfil**. La frase correcta en la tesis es «los
informantes de este estudio asociaron…», no «se percibe que…». Esto se llama
**validez externa** y es la limitación más habitual —y más perdonable— de un
estudio de este tipo, siempre que se declare.

**5. Percibir no es ser.**
El estudio mide **percepciones**: qué nivel de estudios *atribuye* el oyente, qué
región *cree* reconocer. No mide ninguna propiedad real de quien habla. Toda la
redacción de resultados debe mantener ese verbo: *percibido*, *atribuido*,
*asociado*. Precisamente ahí está el valor del trabajo: **documentar el prejuicio,
no confirmarlo**.

---

### Resumen en cinco líneas

- La **variable independiente** principal es el **acento** (12 ciudades, agrupadas
  en 2 zonas dialectales); secundariamente, las características del participante.
- Las **variables dependientes** son las **23 escalas de 1 a 5**, la proximidad, el
  estatus percibido (estudios e ingresos), la región percibida y las dos preguntas
  sobre género.
- La aplicación calcula hoy **estadística descriptiva**: medias, frecuencias,
  porcentajes, aciertos, ranking y control del equilibrio del muestreo.
- Falta la **estadística inferencial**, que se hace con el CSV exportado en jamovi
  o SPSS: desviaciones típicas, t/ANOVA (o sus equivalentes no paramétricos),
  chi-cuadrado, correlaciones, tamaños del efecto y alfa de Cronbach.
- El **diseño BIBD** no es una limitación, es un punto fuerte: hay que explicarlo
  en metodología con su réplica de 3 y su asignación autoequilibrante.
