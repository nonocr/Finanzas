# Investigación competitiva: monAI, Monefy, Goin, Expende, Wallet, Fintonic y YNAB

**Fecha de la investigación:** 6 de noviembre de 2026.
**Para:** el producto «Finanzas» (app personal de finanzas en colones).
**Cómo leer este documento:** cada afirmación lleva una etiqueta de tipo de evidencia:

- **[Oficial]** función o dato confirmado por una fuente de la empresa (sitio, centro de ayuda, ficha de tienda, notas de versión, respuesta del desarrollador).
- **[Usuario]** opinión o experiencia de usuarios (reseñas de tiendas, foros, reclamaciones).
- **[Medio]** afirmación de un medio, reseñador o agregador.
- **[Inferencia]** conclusión del investigador, no respaldada directamente por una fuente.

Los números entre corchetes como [Y3] o [F12] remiten a la bibliografía del final, agrupada por app. Las citas son breves y textuales; el resto es síntesis propia.

---

## 1. Contexto de Finanzas (resumen para quien no conoce el proyecto)

Finanzas es una app personal de finanzas en colones costarricenses (₡), con interfaz en español de Costa Rica y en inglés. Su usuaria de referencia es la dueña: la usa sobre todo en el iPhone, a menudo justo después de pagar, con una mano y en pocos segundos. Al abrirla quiere ver cómo va el mes o la semana. El registro está abierto a cualquiera y cada persona solo ve sus datos.

Lo que **ya tiene** (verificado en el código el 6‑nov‑2026), porque varias ideas de la competencia ya están cubiertas:

- Gastos, ingresos y transferencias (los pagos de tarjeta de crédito son transferencias). Cuentas de efectivo, débito, crédito (con límite, día de corte y día de pago), banco y ahorro.
- Presupuesto mensual por categoría y total, con regla de color única (acero, ámbar desde 80 %, rojo desde 100 %) y opción de copiar el mes anterior.
- Movimientos fijos (semanal, quincenal, mensual, anual) que se registran solos al abrir la app sin duplicar. No tienen fecha de fin.
- **Captura automática:** pagos de Apple Wallet mediante una automatización de Atajos de iOS que envía a la Edge Function `wallet-sync`; en Android, notificaciones de compra reenviadas con MacroDroid. Asigna la tarjeta por nombre en Wallet o últimos 4 dígitos y la categoría por **reglas por comercio**. Lo que no puede categorizar queda **por revisar** en una bandeja visible en el Resumen. Evita duplicados por huella del pago y, en Android, por mismo monto y tarjeta en 5 minutos.
- **Dólares por movimiento:** un pago en US$ guarda los colones, el monto original y el tipo de cambio de venta del BCCR (API de Hacienda).
- Estadísticas: dona por categoría, tendencia de 6 meses, métodos de pago, principales comercios, comparación con los mismos días del mes anterior y detalle al tocar una categoría o un comercio.
- Búsqueda de movimientos, exportación CSV, modo discreto (montos difuminados), Resumen configurable (secciones, orden y cifra de la tarjeta), 10 temas oscuros, verificación en dos pasos y borrado de cuenta.
- **Datos:** viven en Supabase (nube, con seguridad por fila). La app guarda una copia en el teléfono y una cola de cambios para funcionar **sin conexión**. No es una app «solo local»: esto importa al comparar con Monefy o eXpend.
- Web/PWA y apps nativas con Capacitor (iOS y Android). Sin modelo de negocio definido; la hace una sola persona.

Lo que **no tiene** hoy y aparece en la competencia: plantillas o favoritos, widgets y acciones de Siri/Atajos para registrar, dividir un movimiento, etiquetas, metas de ahorro, notificaciones locales (recordatorios, resúmenes), pronóstico del mes, importación de CSV, emparejar un gasto manual con el que llega después automáticamente, aviso cuando la captura automática deja de llegar, confirmar varios pendientes a la vez, cuentas en dólares, reembolsos, deudas personales y fecha de fin en los fijos.

Diferencias de contexto que afectan casi toda la comparación:

- **País:** en Costa Rica no hay open banking ni agregadores bancarios disponibles para una app así. Cinco de las siete apps (YNAB, Fintonic, Wallet, Goin y, en parte, MonAi) se apoyan en conexión bancaria en otros mercados.
- **Moneda:** colones sin céntimos en la práctica, y uso frecuente del dólar.
- **Modelo:** Finanzas es gratis y no tiene que monetizar. Varias quejas fuertes de la competencia nacen de su modelo de negocio (suscripciones, venta de préstamos, comisiones).
- **Escala:** Finanzas la mantiene una persona; cualquier función con costo variable (IA en servidor) o dependencia regulatoria pesa más.

---

## 2. Metodología

**Qué se hizo.**

- Para cada app se hicieron entre 20 y 26 búsquedas web, en español y en inglés, y se leyeron entre 16 y 30 páginas. En total, unas 150 búsquedas y más de 140 páginas.
- Se priorizaron las fuentes oficiales (sitio, centro de ayuda, fichas de App Store y Google Play, notas de versión, términos y política de privacidad) y las reseñas de tiendas de varios países, incluida **Costa Rica** cuando la app tenía ficha allí.
- Se complementó con reclamaciones públicas (OCU), foros (Rankia, Forocoches, Steam), medios (Cinco Días, Crónica Global, Diario Financiero, Genbeta, Xataka, PCMag, USA Today, Finder) y agregadores (AppBrain, Wealthy Pot).
- Para Fintonic se analizaron **500 reseñas escritas** de la App Store española (31‑ago‑2024 a 4‑nov‑2026) obtenidas del RSS público de Apple. Los conteos se hicieron por palabras clave, así que son aproximados.
- La investigación por app se repartió entre siete agentes que trabajaron en paralelo con las mismas instrucciones. Después, el investigador principal **volvió a comprobar directamente** los datos más delicados:
  - la suspensión de Goin en Crónica Global [G1];
  - la página de ayuda de Goin que confirma el ahorro automático desactivado [G6];
  - la ayuda de ShareCost sobre la importación de Apple Pay [W8];
  - la página de precios de YNAB [Y1];
  - la FAQ de MonAi [M13];
  - la ficha de Fintonic en la App Store [F1];
  - la búsqueda del nombre «Expende».

**Cómo se cuenta la evidencia.**

- Un «patrón» indica cuántas fuentes independientes lo respaldan. Las fichas de App Store de distintos países se cuentan como fuentes separadas, pero su independencia es parcial (mismo público global, misma app).
- Una sola reseña se trata como indicio, no como tendencia.

**Identificación de productos ambiguos.**

- **«Expende»:** no existe ninguna app con ese nombre exacto en App Store, Google Play ni la web. Se investigó **eXpend: Make Budgeting a Habit**, la más cercana por nombre y propósito (certeza media‑baja). Ver sección 4.7.
- **«monAI»:** se investigó **MonAi** (Florian Vates, get-monai.app), la única que coincide con ese nombre y la idea de rastreador con IA. Se descartaron Mona AI (otro desarrollador) y MONAI, un framework de imagen médica.
- **«Wallet»:** se investigó **Wallet de BudgetBakers**, la app de finanzas personales más conocida con ese nombre. Apple Wallet y Google Wallet no son apps de presupuesto.
- **Goin:** es la app española de Prakma Innovation (goin.app). No hay que confundirla con GOin (gestora cripto francesa) ni con Goin' (red social de estudiantes).

Las limitaciones están en la sección 10.

---

## 3. Resumen ejecutivo

Los hallazgos están ordenados por la fuerza de la evidencia.

1. **La captura automática sin banco ya es un patrón, y su punto débil es la fiabilidad, no la idea.**
   - Wallet [W7], MonAi [M13] y Finanzas usan la misma automatización «Transacción» de Atajos de iOS. Wallet y MonAi leen además notificaciones en Android.
   - Las quejas no son por la falta de la función, sino porque deja de funcionar sin aviso. En MonAi hay reseñas de fallos en 5 tiendas, y su FAQ reconoce un error de Apple [M13]. En Wallet, la propia ayuda lista los problemas conocidos (montos en 0, duplicados, permisos revocados) [W6].
   - ShareCost, de la misma empresa que Wallet, resolvió parte de esto con tres piezas: una bandeja de importados con deshacer y selección múltiple, reglas por tarjeta nueva («siempre a… / ignorar / ahora no») y avisos de «importación pausada» y «verificado: se capturó un pago el…» [W8].
   - Para Finanzas es la oportunidad con mejor relación entre evidencia y encaje: ya tiene la captura y le falta sobre todo **visibilidad del estado** y **revisión más rápida**.
2. **Registrar rápido es lo más elogiado en las apps manuales.**
   - Monefy: más de 10 reseñas en 5 tiendas y 3 medios [Mo7, Mo8, Mo10, Mo12, Mo13].
   - eXpend: unas 9 reseñas en 4 tiendas sobre la interfaz [E2–E4, E9].
   - MonAi: 4 tiendas elogian la voz [M4–M10].
   - Los mecanismos difieren: tocar la categoría (Monefy), plantillas (eXpend, Wallet) y voz o texto libre (MonAi). Ninguna fuente demuestra que uno sea mejor que otro.
3. **La confianza se rompe por el modelo de negocio más que por fallas técnicas.**
   - **Fintonic:** convirtió su inicio en un escaparate de su puntuación crediticia y sus préstamos. De las 120 reseñas escritas desde el 20‑ago‑2026, 65 hablan del rediseño; 81 de las 500 mencionan publicidad, SMS o llamadas [F3].
   - **MonAi:** el muro de pago tras el onboarding genera unas 14 reseñas negativas en 5 tiendas [M5–M10].
   - **Monefy:** promociones engañosas y Premium perdido al cambiar de teléfono [Mo8, Mo12, Mo13].
   - **YNAB:** el precio y sus subidas aparecen en 7 fuentes [Y9, Y11–Y13, Y19, Y21, Y23].
   - Para Finanzas, que es gratis, esto no es una función que copiar, sino un **riesgo que evitar** si algún día monetiza.
4. **Las integraciones bancarias son la fuente principal de quejas donde existen.**
   - Fintonic: 78 de 500 reseñas [F3]. Wallet: 6 o más fuentes [W21–W26]. YNAB: 4 fuentes, y la empresa lo reconoce [Y6, Y13, Y22].
   - En **Goin**, la pérdida de su conexión bancaria y de su socio de pagos dejó inactiva su función central. Su FAQ oficial confirma que las conexiones de ahorro automático están desactivadas [G6]. Crónica Global informa de una suspensión cautelar del Banco de España a la entidad de pago con la que opera [G1]. Esta última noticia tiene un solo medio original.
   - [Inferencia] Que Finanzas no dependa de un agregador es una ventaja real en Costa Rica, pero no la libra del mismo tipo de fragilidad: su captura depende de Atajos, MacroDroid y los formatos de notificación de los bancos.
5. **Los presupuestos que «avisan» se valoran más que los que solo miden.**
   - Wallet calcula un **gasto previsto**: lo gastado, más los pagos planificados, más el promedio de periodos anteriores, con semáforo [W12].
   - Los usuarios de Fintonic lamentan haber perdido la «previsión por partida» (13 reseñas desde ago‑2026) [F3].
   - YNAB y su sistema de objetivos convierten gastos anuales en una cuota mensual [Y22].
   - A Monefy le critican que el presupuesto diario no se ajuste con lo gastado (4 reseñas) [Mo10].
   - La evidencia de demanda es moderada y viene sobre todo de quejas por ausencia o pérdida, no de elogios directos.
6. **Hay pocas pruebas sobre algunas ideas muy promocionadas.**
   - El chat con IA de MonAi está en beta y no encontré opiniones de usuarios sobre él.
   - El redondeo de Goin ya no es diferenciador: lo ofrecen bancos y neobancos [G29], y hoy está desactivado en Goin.
   - Ninguna de las dos ideas tiene evidencia fuerte de valor para la usuaria de Finanzas.

Las ideas para Finanzas mejor respaldadas, con detalle en la sección 7, son:

- Un **estado visible de la captura automática** (última captura, aviso si se detiene, guía de configuración).
- **Revisión rápida** de pendientes (deslizar o confirmar varios a la vez, con deshacer).
- **Emparejar** un gasto anotado a mano con el que llega después automáticamente.
- **Plantillas o favoritos** de un toque.
- Un **pronóstico del mes** en el Resumen.
- **Metas para gastos irregulares**, como marchamo, seguros o diciembre.
- **Recordatorios locales** de fijos y de corte o pago de tarjeta.

Ninguna requiere open banking ni IA en servidor.

---

## 4. Análisis por aplicación

### 4.1 YNAB (You Need A Budget)

**Identificación.**
- **Producto:** YNAB, de You Need A Budget LLC (ynab.com). App iOS id1010865877, versión 26.42 de noviembre de 2026, que requiere iOS 18 [Y5]. App Android `com.youneedabudget.evergreen.app` [Y10].
- **Versión antigua:** no confundir con «YNAB 4 / Classic», la app de escritorio de pago único, descontinuada pero que algunos todavía usan con parches [Y26].
- **Herramientas de terceros:** «Toolkit», «Widgets» o «Sync for YNAB» no son de YNAB [Y11].

**Qué es y a quién sirve.**
- **Método:** presupuesto de **base cero**. Solo se reparte el dinero que ya se tiene: el ingreso cae en «Ready to Assign» y se asigna a categorías hasta dejarlo en cero. Si una categoría se sobregira, se cubre moviendo dinero de otra [Oficial, Y4; Medio, Y11].
- **Para quién:** personas que quieren cambiar hábitos, salir de deudas o planificar en pareja, y que aceptan revisar la app varias veces por semana [Medio, Y11, Y17, Y19].
- **Precio** [Oficial, Y1, verificado el 6‑nov‑2026]:
  - US$14,99 al mes o US$109 al año.
  - Prueba de 34 días sin tarjeta y 365 días gratis para universitarios.
  - Precio en USD sin ajuste por país.
  - Una suscripción se comparte con hasta 6 personas.
- **Modelo:** declara ganar solo con la suscripción, sin anuncios ni venta de datos [Oficial, Y1].
- **Disponibilidad:**
  - **App solo en inglés** [Oficial, Y5].
  - **Una sola moneda por plan** [Oficial, Y1].
  - Conexión bancaria solo en «algunos bancos de EE. UU., Canadá, Reino Unido y la UE»; en el resto del mundo, importación de archivos [Oficial, Y1].

**Funciones principales** [Oficial salvo indicación].
- **Asignar y ver el plan.** «Plan» para asignar dinero y «Home», agregada en 2025, con alertas de dinero por asignar, pendientes por aprobar, sobregiros, categorías fijadas y resumen del mes [Y15, Y22].
- **Aprobar importados en Card Mode** (22‑sep‑2026): deslizar a la derecha aprueba, a la izquierda pospone, y se puede deshacer con un toque [Y2].
- **Objetivos (targets)** semanales, mensuales, anuales o personalizados, en dos modos: «rellenar hasta» o «apartar otro monto». Ejemplo de la ayuda: un seguro anual convertido en cuota mensual [Y22].
- **Tarjetas de crédito.** El dinero pasa solo de la categoría de gasto a la de pago de la tarjeta. Desde el 7‑oct‑2026 los intereses tienen categoría propia [Y2].
- **Reportes:** gasto por categoría, patrimonio, ingresos contra gastos y «Age of Money» (días promedio entre recibir y gastar el dinero) [Y4, Y22].

**Funciones menos evidentes** [Oficial].
- **Autocategorización «2 de 3»:** un comercio cambia de categoría por defecto solo si 2 de sus 3 últimas transacciones coinciden en la nueva. También se puede fijar o desactivar [Y2].
- **Recurrentes que se emparejan** con lo importado del banco y se aprueban solas. Al editarlas se elige si el cambio aplica solo a esa o a todas las futuras [Y22].
- **Reconciliación** contra el saldo del banco, con ajuste automático si no coincide [Y22].
- **«Plan Reset»** (16‑sep‑2026): devuelve lo no gastado a «por asignar» y se puede deshacer [Y2].
- **«Hide Amounts»:** muestra los montos como puntos, pensado para enseñar el plan sin revelar cifras [Y15, Y22]. Es equivalente al modo discreto de Finanzas.
- **Siri, Atajos, pantalla bloqueada, Centro de control, widgets y Apple Watch** [Y5, Y22]. La versión 26.42 corrigió un fallo que podía poner un monto incorrecto en el atajo «Add New Transaction» [Y5].
- **Apple Wallet (FinanceKit):** solo Apple Card, Apple Cash y Savings en EE. UU., y cuentas de terceros en el Reino Unido [Y22]. [Inferencia] No aplica a Costa Rica.
- **Importación CSV/OFX/QIF:** solo en web o iPad. Trae conversor CSV desde el 14‑sep‑2026 [Y2, Y22].
- **API pública** ampliada el 29‑abr‑2026, mencionada explícitamente para asistentes de IA [Y3].

**Qué elogian los usuarios** (fuentes independientes entre paréntesis).
- **Cambia hábitos y quita estrés,** con historias de salir de deudas (4) [Y6, Y12, Y14, Y25]. Un usuario danés lo resume así: «It changed everything» [Y9].
- **Funciona mejor que otras apps probadas** (3) [Y6, Y7, Y9].
- **Compartir la suscripción en pareja o familia** (3) [Y11, Y12, Y14].
- **Educación, soporte y comunidad** (3) [Y1, Y13, Y17].
- **En la App Store de Costa Rica:** 4,5 de 5 con 24 valoraciones; un usuario tico elogia sus reportes [Y7].

**Quejas y fricciones.**
- **Precio alto, sin plan gratis y subidas sucesivas** (7) [Y9, Y11, Y12, Y13, Y19, Y21, Y23]. La subida a US$109 fue el 1‑ago‑2024 [Medio, Y16]. Dos de esas fuentes son competidores, así que tienen sesgo.
- **Curva de aprendizaje** de 2 semanas a 3 meses (7) [Y12, Y14, Y17, Y20, Y21, Y25, más Joingerald, un sitio de contenido SEO que no incluí en la bibliografía].
- **El mantenimiento pesa:** si se acumulan pendientes, se deja de abrir la app (3) [Y6, Y11, Y12]. Una reseña de EE. UU. dice que la reconciliación «tediosa» le quitó las ganas de abrirla [Y6].
- **Conexión bancaria con duplicados, lentitud o pagos a la tarjeta equivocada** (4, más la ayuda oficial que lo reconoce) [Y6, Y13, Y22].
- **Rediseños que mueven controles habituales** (4) [Y6, Y9, Y27].
- **Reportes limitados en el móvil** (3) [Y6, Y9, Y24].
- **Solo en inglés** (2, más la fuente oficial). En la tienda de República Dominicana piden español y la empresa responde que no puede traducir [Y8].

**Qué la diferencia.** Vende un **método**, no un registro: la educación y la comunidad pesan tanto como la app. Además destaca por la integración con el ecosistema de Apple, la suscripción para 6 personas y un ritmo alto de mejoras en 2026 [Inferencia sobre Y1, Y2, Y5].

**Ideas pertinentes para Finanzas** [Inferencia].
1. **Revisión de pendientes estilo Card Mode.** Deslizar para confirmar con la categoría sugerida, deslizar para posponer y deshacer. Finanzas ya tiene la bandeja «por revisar»; lo nuevo sería el gesto y la revisión en serie.
2. **Regla «2 de 3» para las reglas por comercio.** Una compra atípica, como un regalo en el súper, no debería cambiar la categoría habitual. Hoy las reglas de Finanzas son explícitas (patrón → categoría); la variante sería sugerir la regla tras 2 de 3 coincidencias en lugar de crearla al confirmar un solo pago.
3. **Emparejar** el gasto anotado a mano o el cobro fijo con el que llega después de Wallet o de la notificación: mismo monto en una ventana de días.
4. **Objetivos para gastos irregulares de Costa Rica** (marchamo, RTV, seguros, matrícula, diciembre): monto anual convertido en cuota mensual en ₡.
5. **Ajuste de saldo explícito.** Finanzas ya permite corregir el saldo de una cuenta cambiando su saldo inicial. YNAB muestra que crear un movimiento de ajuste visible es más fácil de auditar.

**Qué no copiar.**
- **Base cero obligatoria y jerga propia** («Ready to Assign», «Age of Money»): son el origen de la curva de aprendizaje y chocan con «registrar en segundos».
- **Funciones exclusivas de web o iPad**, como la importación de archivos.
- **Exigir mantenimiento constante.**
- **Una sola moneda y un solo idioma.**

**Fuentes consultadas:** Y1–Y27 (sección 12).

---

### 4.2 Fintonic

**Identificación.**
- **Producto:** «Fintonic | Ahorra y finánciate», de Fintonic Servicios Financieros S.L. (Madrid). Versión 10.0.10 del 27‑oct‑2026, que requiere iOS 18 [Oficial, F1, verificado].
- **Países:** hoy opera solo en **España**. Cerró en Chile el 31‑mar‑2023 [Medio, F15] y salió de México [Medio, F14, F16]. No encontré el comunicado oficial de la salida de México.
- **Ambigüedad de nombre:** «Fintoc» es otra fintech, chilena.

**Qué es y a quién sirve.**
- **Origen:** nació en 2012 como agregador bancario gratuito para controlar gastos.
- **Hoy:** la ficha de la App Store empieza con «la app que te ayuda a conseguir mejores préstamos» y gira en torno a su puntuación crediticia **FinScore** y **CreditBuilder**, recomendaciones con IA para mejorarla [Oficial, F1].
- **Modelo:** gratis para el usuario. Cobra a las entidades cuando el usuario contrata un préstamo u otro producto [Oficial, F1, F5].
- **Lo que no encontré:** ninguna fuente confirma un «Fintonic Premium». Existió un curso de pago con FinCoach, que un usuario cita a 59,70 € en 2022 [Usuario, F18]; su precio actual no está verificado.
- **Estrategia y resultados** [Medio]: Cinco Días describe «Fintonic 2.0», con scoring, marketplace de préstamos, gestor de finanzas y crédito propio [F14]. Roams dice que fue rentable por primera vez en el verano de 2025 [F13].

**Funciones principales** [Oficial].
- **Agregación bancaria PSD2,** con licencia del Banco de España. El consentimiento se renueva cada 90 días [F1, F9].
- **Categorización automática** con edición manual. Permite:
  - recategorizar;
  - **dividir** un movimiento en varias categorías;
  - marcar un movimiento como «**no computable**» (ni gasto ni ingreso);
  - ocultar o renombrar cuentas.

  Todo según la ayuda [F8].
- **Alertas** de comisiones, descubiertos, **cargos duplicados** y vencimiento de seguros [F7].
- **Previsión mensual automática por categoría** según el historial, con informe semanal los lunes y mensual [F6]. Fintonic no confirma su estado actual: desde el rediseño, 13 reseñas dicen que desapareció [Usuario, F3].
- **Menos evidentes:**
  - app dentro de ChatGPT para estimar el FinScore (jun‑2026) [F11];
  - Revolut conectable desde ago‑2026 [F1];
  - etiqueta de privacidad de la App Store que declara «Identificadores» usados para **rastrear** entre apps de otras empresas [F1].

**Qué elogian los usuarios.**
- **Base:** 500 reseñas escritas, de las cuales 62 tienen 4 o 5 estrellas [F3].
- **Descubrir y controlar gastos:** 13 reseñas positivas. Ejemplo del 29‑oct‑2026: «Descubro gastos que no me imaginaba».
- **Ver todas las cuentas en un solo lugar:** 4 reseñas, más Genbeta 2023 [F20] y Xataka 2021 [F21].
- **Rapidez del préstamo y buena atención:** 7 reseñas.

**Quejas y fricciones.**
- **Contraste de notas:**
  - Nota global: **4,3 de 5 con 26 mil valoraciones** [Oficial, F1].
  - Las 500 reseñas escritas recientes promedian unas **1,8 estrellas**, con 66 % de 1 estrella [F3].
  - [Inferencia] La nota global incluye valoraciones antiguas y sin texto; las reseñas escritas suelen ser más negativas.
- **Rediseño v10:** el FinScore y los préstamos pasaron a ocupar el inicio. La propia nota de versión anuncia «una nueva Home con el FinScore como protagonista» [Oficial, F1].
  - De las 120 reseñas escritas desde el 20‑ago‑2026, 65 hablan del rediseño y 28 de que los movimientos quedaron escondidos [F3].
  - Título de una reseña del 2‑oct‑2026: «No queremos finscore como protagonista».
- **Venta cruzada, SMS, llamadas y sospecha de cesión de datos:**
  - 81 menciones de publicidad, SMS o llamadas, y 23 sobre privacidad, en las reseñas [F3]; también en Rankia [F17].
  - Fintonic afirma que no cede datos [F5]. La cesión no está verificada.
- **Sincronización con bancos** caída, desconectada o con duplicados: 78 reseñas, más Forocoches [F19].
- **Categorización que no aprende** (25 reseñas). Una de 2021 lo dice así: después de corregir 40 veces una tienda a «supermercado», la siguiente compra vuelve a salir como «restaurante» [F2].
- **Otras:**
  - exportación rota (16);
  - pérdida de histórico (13);
  - sin movimientos manuales en efectivo (13);
  - no deja borrar la cuenta (4).

**Qué la diferencia.** Su licencia propia de agregación y pagos, el FinScore ligado a un marketplace de préstamos y las alertas de comisiones y duplicados. [Inferencia] El control de gastos, que fue su razón de ser, hoy está subordinado al negocio de préstamos.

**Ideas pertinentes para Finanzas** [Inferencia].
1. **Aviso de posible cargo duplicado:** mismo comercio y monto en poco tiempo, calculado con los datos que ya llegan de Wallet y de las notificaciones de Android. Finanzas ya descarta duplicados exactos en el servidor; esto sería avisar de los casi‑duplicados en lugar de descartarlos.
2. **Dividir un movimiento,** por ejemplo el súper entre comida y limpieza.
3. **Estado «no cuenta» para reembolsos.** Hoy un reembolso solo se puede registrar como ingreso, lo que infla los ingresos y no reduce el gasto de la categoría.
4. **Presupuesto propuesto:** mediana de los últimos 3 meses por categoría, editable. Es justo lo que lamentan haber perdido sus usuarios.
5. **Resumen semanal los lunes** como notificación local.

**Qué no copiar.**
- **Convertir el inicio en escaparate de productos o de una puntuación.** Es la causa principal de rechazo.
- **Monetizar con datos, llamadas o venta cruzada.**
- **Rastreadores de terceros.**
- **Quitar funciones o perder histórico en una migración.**
- **Subir el iOS mínimo de forma agresiva.** Al menos 2 reseñas se quejan de quedar fuera con iOS 18 obligatorio.

**Fuentes consultadas:** F1–F22 (sección 12).

---

### 4.3 Wallet (BudgetBakers)

**Identificación.**
- **Producto:** Wallet, de BudgetBakers s.r.o. (Praga). App iOS id1032467659, paquete Android `com.droid4you.application.wallet` [Oficial, W20, W21].
- **El nombre cambia según tienda y país:** en la App Store de Costa Rica se llama «Wallet - Money Management» [W24].
- **Otras apps de la empresa:** ShareCost (gastos compartidos) y Board (flujo de caja para pymes) [W1].

**Qué es y a quién sirve.**
- **Qué es:** un gestor de finanzas personales y familiares multiplataforma (iOS, Android y web) con multimoneda madura.
- **Para quién:** se recomienda a expatriados y a quien viene de hojas de cálculo [Medio, W3, W4, W28].
- **Modelo y precios:**
  - **Freemium:** el registro manual es gratis. Premium, mensual, anual o **Lifetime** (pago único), añade sincronización bancaria, cuentas ilimitadas y grupos compartidos. Una compra sirve en todas las plataformas [Oficial, W2].
  - La App Store de EE. UU. lista compras de 5,99 a 49,99 USD, sin indicar el periodo de cada una [Oficial, W21].
- **Costa Rica:**
  - En la App Store de Costa Rica el desarrollador respondió que **no hay integración con BAC**, que muchos ticos la piden, y sugirió importar el extracto por la web [Oficial, W24].
  - **Google Pay Sync** sí aparece disponible en Costa Rica [Oficial, W6].

**Funciones principales** [Oficial].
- **Registro manual** con categorías y subcategorías, beneficiario, etiquetas (hasta 5 por registro) y plantillas [W11].
- **Presupuestos** por categoría, cuenta o etiqueta [W12]:
  - Muestran lo **gastado**, lo **restante**, el **gasto previsto** (lo gastado, más los pagos planificados, más el promedio de periodos anteriores) y el **balance esperado**.
  - Usan un semáforo verde, naranja y rojo.
  - **No existen en la versión web.**
- **Pagos planificados** con recordatorios [W1].
- **Multimoneda:** una cuenta por moneda y tipo de cambio automático cada noche o manual. **La moneda base no se puede cambiar sin borrar todos los datos** [W13, W27].

**Funciones menos evidentes** [Oficial].
- **Apple Pay mediante Atajos de iOS.** Una automatización «Transacción» llama a la acción «Add transaction to Wallet» con importe, comercio y cuenta [W7]. **Es el mismo mecanismo que usa Finanzas.**
- **ShareCost** resuelve mejor esta importación [W8, verificado]:
  - un atajo preconfigurado que se agrega con un toque;
  - la pantalla «Verified — a payment was captured on…» que confirma que funciona;
  - una lista de importados con descartar y deshacer, y selección múltiple;
  - **reglas por tarjeta nueva** («Always add to… / Ignore this card / Not now»);
  - el aviso «Transaction import paused» con botón para reactivar en Android.
- **Google Pay Sync en Android.** Lee las notificaciones de Google Wallet; su asistente revisa el acceso a notificaciones, la batería y el autoarranque por marca de teléfono. Problemas documentados [W6]:
  - si no hay notificación, no se registra;
  - montos en 0 cuando Google marca la tarjeta como sensible;
  - duplicados si también está conectado el banco.
- **Reglas automáticas** por palabra clave, aplicables a registros anteriores con vista previa. **Solo funcionan con registros bancarios, no con los manuales** [W10].
- **Importación CSV, XLS u OFX solo desde la web,** sin separadores de miles [W14].
- **Datos y conexión:** la ayuda indica que los dispositivos deben estar en línea para guardar y que reinstalar puede borrar lo no sincronizado [W15].
- **API REST y servidor MCP** para asistentes de IA [W19].

**Qué elogian los usuarios.**
- **Fácil de usar y con diseño limpio** (5) [W3, W4, W22–W24].
- **Multimoneda** (5) [W3, W4, W22, W23, W28].
- **Opción Lifetime frente a suscripción** (3) [W3, W22, W23].
- **Multiplataforma** (3) [W4, W22, W24].
- **Valoraciones:** App Store de **Costa Rica 4,8 con 487 valoraciones**, EE. UU. 4,6 con 5,9 mil [W21, W24], y Google Play cerca de 4,6 con unas 388 mil según medios [W3, W4].

**Quejas y fricciones.**
- **Sincronización bancaria** que falla, se desconecta o duplica (6 o más) [W4, W22–W24, W26]. Finder dice que es la razón de «la gran mayoría» de las reseñas negativas [W4].
- **Soporte lento o genérico** (5) [W3, W22–W24, W26].
- **Pérdida de datos o sincronización rota entre dispositivos** (4). Una persona de Costa Rica perdió todo al cambiar de teléfono [W24].
- **Diferencias de funciones entre iOS, Android y web** (4) [W2, W4, W25].
- **Pagar Premium y que no funcione en tu país o con tu banco** (3, incluida una usuaria tica) [W22, W24].
- **Pedidos:**
  - dividir transacciones (3);
  - cambiar la moneda base (1, más la confirmación oficial);
  - calendario de días sin gasto (1);
  - verificación en dos pasos (1).

**Qué la diferencia.**
- Captura de pagos móviles sin banco en las dos plataformas.
- Multimoneda.
- Presupuestos con pronóstico.
- Pago único y una sola compra para todas las plataformas.

**Ideas pertinentes para Finanzas** [Inferencia].
1. **Estado de la captura,** inspirado en ShareCost:
   - una pantalla de configuración que confirme «se capturó un pago el…»;
   - un aviso de «la captura no llega desde hace X días».

   Finanzas ya guarda `last_used_at` del token y lo muestra en Ajustes → Wallet. Falta llevarlo al Resumen y avisar cuando se detiene.
2. **Reglas por tarjeta nueva.** Cuando llega un pago de una tarjeta sin cuenta asignada, preguntar «¿siempre a esta cuenta?». Hoy cae en la primera tarjeta y queda por revisar.
3. **Pronóstico del mes** en el Resumen, con la fórmula de Wallet (gastado + fijos pendientes + promedio). Debería permitir excluir gastos excepcionales del promedio, que es la crítica de Medium [W25].
4. **Plantillas** de registro.
5. **Cuentas en dólares,** con la lección de no bloquear la moneda base.

**Qué no copiar.**
- **Guardar solo en línea** y tener funciones distintas por plataforma.
- **Reglas que solo aplican a una fuente de datos.**
- **Cobrar por automatizaciones que dependen del país** sin avisarlo antes de pagar.
- **Un catálogo de cuentas muy amplio** (hipotecas, cripto) y un servidor MCP con escritura. [Inferencia] Para un desarrollador solo es complejidad y superficie de riesgo.

**Fuentes consultadas:** W1–W28 (sección 12).

---

### 4.4 Monefy

**Identificación.**
- **Producto:** Monefy, publicado en Google Play desde febrero de 2014 (`com.monefy.app.lite`). En la App Store es la id1212024409 [Oficial, Mo2, Mo3; Medio, Mo12].
- **Desarrollador actual:** Reflective Technologies ApS, una empresa danesa de Aarhus. Su estudio dice que «adquiere» apps y cita a Monefy [Oficial, Mo5, Mo6].
- **Desarrollador original y fecha de la compra:** no verificados.
- **El pedido mencionaba «AMUSED»:** no encontré ninguna fuente que vincule a Monefy con ese nombre.
- **Nombres parecidos que son otras apps:** Monify (inversiones, Ucrania) y Moneify [Mo20].

**Qué es y a quién sirve.**
- **Qué es:** un registro manual rápido, sin cuenta ni conexión bancaria. Los datos quedan en el teléfono y se pueden sincronizar con el Google Drive o el Dropbox del propio usuario [Oficial, Mo4].
- **A quién sirve:** a quien quiere saber a dónde se va el dinero sin conectar el banco [Medio, Mo11, Mo15, Mo17].
- **Escala:** la web dice que tiene más de 11 millones de descargas; AppBrain cuenta 11 millones de instalaciones en Android [Mo1, Mo12].
- **Modelo:**
  - Freemium. Premium desbloquea cuentas ilimitadas, recurrentes y filtros avanzados [Oficial, Mo4]. El modo oscuro también es Premium, según una respuesta del desarrollador [Mo7].
  - Los términos de uso hablan de suscripción mensual o anual, o de compra única [Mo5].
  - En la App Store de Costa Rica aparecen compras de 39,99 y 59,99 USD, sin indicar si son de por vida [Oficial, Mo16].
- **Anuncios, sin resolver:** la FAQ dice que la app tiene «cero SDK de anuncios» [Mo4], pero una reseña de iOS se queja de anuncios constantes [Mo7].

**Funciones principales.**
- **Registro desde la pantalla principal:** los íconos de categoría rodean una dona con los gastos del periodo. Hay dos rutas:
  1. Tocar «−» o «+», escribir el monto con la calculadora integrada, elegir cuenta y fecha, y tocar la categoría [Oficial, Mo4].
  2. Tocar directamente la categoría y escribir el monto. La web lo vende como «dos toques» [Oficial, Mo1; Medio, Mo15].
- **Presupuesto:** un único tope mensual con un anillo verde que muestra lo que queda. Según la FAQ, **no hay presupuesto por categoría** [Oficial, Mo4].
  - El blog oficial afirma lo contrario, pero ese mismo artículo también promete sincronización bancaria, que la app no tiene. Por eso doy más peso a la FAQ [Mo17].
- **Ciclo configurable:** el mes puede empezar cualquier día del 1 al 31, y también se elige el primer día de la semana [Oficial, Mo4].
- **Cuentas en varias monedas** con tipo de cambio **manual** y fecha de vigencia. **Si no hay tasa, convierte 1:1** [Oficial, Mo4].
- **Recurrentes** (diarios, semanales, mensuales, anuales o personalizados). Al editarlos se elige si el cambio aplica a ese registro, a los futuros o a todos [Oficial, Mo4].
- **Seguridad:** PIN de 4 dígitos y biometría. Si se olvida el PIN hay que reinstalar la app, y sin respaldo se pierden los datos [Oficial, Mo4].
- **Notas de versión de 2025–2026:** son genéricas; no encontré funciones nuevas anunciadas [Mo2, Mo12].

**Qué elogian los usuarios.**
- **Valoraciones en iOS:** EE. UU. 4,7 (6,8 mil), España 4,6, México 4,8, Reino Unido 4,7 y **Costa Rica 4,8 (426)** [Mo2, Mo8, Mo10, Mo13, Mo16].
- **Valoración en Google Play:** más baja, **3,98** con 190 mil valoraciones, de las cuales cerca del 16 % son de 1 estrella [Medio, Mo12].
- **Registro simple y rápido:** más de 10 reseñas en 5 páginas de tiendas, y 3 medios. Un usuario del Reino Unido lo resume así: si registrar no es una tarea pesada, es más probable hacerlo [Mo10].
- **La dona hace visible el gasto:** 4 reseñas [Mo7, Mo10].
- **Uso sostenido durante 4 a 7 años:** 7 reseñas en 4 páginas [Mo7, Mo8, Mo10, Mo12].
- **No conectar el banco:** 2 reseñas y 4 medios.

**Quejas y fricciones.**
- **Premium perdido al cambiar de teléfono, compra de por vida no reconocida o paso forzado a suscripción:** 6 reseñas en 3 fuentes, las de Google Play de sep–nov de 2026 [Mo8, Mo12, Mo13].
- **Soporte que no contesta:** 6 reseñas en 4 fuentes.
- **Promociones engañosas:** un «91 % de descuento» que no se aplica al pagar (5 reseñas en 3 fuentes).
- **Sincronización descuadrada o pérdida de datos:** 5 reseñas. La FAQ reconoce archivos duplicados o corruptos [Mo4].
- **Presupuesto pobre:** 4 reseñas. El monto diario no se ajusta con lo gastado y los recurrentes futuros cuentan como ya gastados [Mo10].
- **Arranque lento sin conexión:** según una reseña de iOS, la app tarda unos 2 minutos en abrir sin datos móviles [Mo7]. Es un solo caso, pero muy pertinente para Finanzas.
- **Pedidos sueltos:**
  - fotos de recibos;
  - tipo de cambio automático;
  - ocultar categorías como el alquiler en la dona;
  - buscar por nota y ver el total;
  - **detectar gastos a partir de los SMS del banco** [Mo12].

**Qué la diferencia.** La dona funciona a la vez como reporte y como teclado de registro. Además, no pide cuenta y usa la nube del propio usuario. [Inferencia] Su fuerza es lo poco que cuesta registrar, no la profundidad de sus funciones.

**Ideas pertinentes para Finanzas** [Inferencia].
1. **Categorías como botones de registro rápido** en la zona del pulgar, no en una dona arriba de la pantalla.
2. **Calculadora en el campo de monto,** útil para sumar varias cosas o dividir una cuenta.
3. **«Disponible por día» que se recalcule** con lo gastado y los días que quedan. Corrige justo la falla que le critican a Monefy.
4. **Fijos «comprometidos»:** mostrar los fijos que vienen como compromiso, sin restarlos antes de su fecha. Finanzas ya los registra solo cuando vencen.
5. **Ocultar categorías de la dona,** como el alquiler, sin sacarlas de los totales.

**Qué no copiar.**
- **Arranque que depende de la red.**
- **Tipo de cambio 1:1 por defecto.**
- **Sincronizar copiando el archivo entero de la base de datos.**
- **Funciones básicas detrás de un pago y promociones al abrir la app.**
- **Marketing que contradice la FAQ.**

**Fuentes consultadas:** Mo1–Mo21 (sección 12).

---

### 4.5 MonAi (la «monAI» del pedido)

**Identificación.**
- **App elegida:** «Finanzas personales - MonAi» / «Expense Tracker - MonAi», de Florian Vates (Alemania). App iOS id6447112647, Android `app.getmonai.android`, sitio get-monai.app [Oficial, M1, M11, M12].
- **Por qué esta:** es la única que se llama exactamente así y es un rastreador de gastos con IA. Tiene fuerte presencia en Latinoamérica: Colombia 4,7 con 4,8 mil valoraciones y México 4,7 con 1,2 mil. En **Costa Rica** tiene 4,8 con 215 valoraciones [Oficial, M2, M7, M8].
- **Candidatas descartadas:** Mona AI (`ai.moneytracker.app`) es de otro desarrollador, y MONAI es un framework de imagen médica [M19].

**Qué es y a quién sirve.**
- **Qué es:** un rastreador minimalista para registrar sin esfuerzo, hablando, escribiendo en lenguaje natural o con automatizaciones. La FAQ dice abiertamente que no es para quien quiere gráficos avanzados, conexión bancaria o estadística detallada [Oficial, M13].
- **Equipo:** tres personas, una de ellas creadora de contenido en redes latinoamericanas [Oficial, M12; Medio, M16].
- **Modelo:**
  - Suscripción con **prueba de 7 días** [Oficial, M13, verificado]. En la App Store de Costa Rica, el mensual cuesta 7,99 USD y el anual 71,99, con precios introductorios más bajos [Oficial, M2].
  - Hay **planes con compromiso de 12 meses cobrado mes a mes** y **créditos de IA** [Oficial, M14].
  - Las fuentes oficiales se contradicen sobre si existe un nivel gratis: los términos describen uno de 20 movimientos al mes [M14], pero el desarrollador responde en la tienda que «no tiene versión gratuita» [M10].

**Funciones principales** [Oficial, M12–M14, verificado en la FAQ].
- **Registro por voz o texto libre.** En una frase se pueden dar varios gastos («fui al cine por $19, las palomitas $4») y la app los separa. Entiende fechas relativas («ayer»). Hay un widget con micrófono.
- **Apple Pay mediante Atajos.** La FAQ aclara que **solo funciona con pagos presenciales, no con compras en línea**.
- **SMS o correo del banco en iOS.** Una automatización de Atajos pasa el texto del mensaje a la acción «Transaction from prompt».
- **Notificaciones de apps bancarias en Android.** No lee SMS ni correo, por privacidad.
- **Presupuestos por categoría** con aviso antes de pasarse.
- **Recurrentes:** al editarlos se elige si el cambio aplica a esa, a las futuras o a las pasadas.
- **Otras:** etiquetas con #, listas compartidas, exportación CSV y Face ID.
- **Funciones menos evidentes:**
  - El saldo **vuelve a 0 cada mes** por defecto, con opción de arrastrar el sobrante («Rollover»). La FAQ dedica una entrada a quienes creen haber perdido datos el día 1.
  - **Una moneda por lista:** para COP y USD el desarrollador recomienda listas separadas.
  - **«AI Reports»:** un chat sobre tus gastos, en beta.

**Qué datos van a terceros** [Oficial, M14].
- El texto dictado o escrito pasa por el servidor de MonAi (Frankfurt) y por **OpenAI**.
- Las notas de voz de WhatsApp van a **Groq**.
- El chat envía las transacciones de la lista (fecha, descripción, monto, categoría, etiquetas y presupuestos) a **Anthropic**.
- [Inferencia] La captura con IA necesita conexión. No encontré información sobre su funcionamiento sin red ni sobre el soporte específico del colón.

**Qué elogian los usuarios.**
- **Sencillez y diseño:** 6 tiendas y 1 medio [M4–M10, M16].
- **Voz rápida y certera:** 4 tiendas. En Ecuador: «El modo de dictado de consumos funciona súper bien» [M10].
- **Automatización con Apple Pay:** 4 tiendas.
- **Listas compartidas en pareja u hogar:** 3 tiendas.
- **Desarrollador cercano:** 2 tiendas.
- **Sesgo:** el desarrollador responde casi todas las reseñas y los testimonios de su sitio están seleccionados.

**Quejas y fricciones.**
- **Muro de pago tras el onboarding y sensación de engaño:** unas 14 reseñas en 5 tiendas. Ejemplo de Chile: si no pagas, no puedes hacer nada [M5].
- **Precio alto para una app de ahorro:** 3 tiendas. Una reseña mexicana lo resume con ironía: «Paso #1 para ahorrar, no descargar la app» [M8].
- **La automatización de Apple Pay falla o da error:** 5 tiendas, incluida Costa Rica, y lo reconoce la FAQ [M4, M5, M6, M8, M9, M13].
- **Cobros después de cancelar** por el compromiso de 12 meses: 2 tiendas.
- **Pedidos sueltos** que encajan en Costa Rica:
  - **compras a cuotas con o sin interés** [M8];
  - **varias cuentas con saldo** [M9];
  - **conciliar con el estado de cuenta** [M9].
- **Lo que no encontré:** quejas concretas de categorías mal asignadas por la IA ni de privacidad.

**Qué la diferencia.** Muchas formas de capturar un gasto, minimalismo deliberado, distribución con influencer en Latinoamérica y un desarrollador muy presente.

**Ideas pertinentes para Finanzas** [Inferencia].
1. **Texto libre interpretado en el teléfono, sin IA en servidor.** Por ejemplo «súper 45 mil ayer» o «uber 3.800 y almuerzo 6 mil». Funcionaría sin conexión y sin costo por uso. Finanzas ya tiene un parser de montos (`parseAmountToCents`) y reglas por comercio que se podrían reutilizar.
2. **Voz con el dictado del sistema más ese mismo intérprete.**
3. **«Registrar desde texto» en Atajos** para SMS o correos de bancos ticos. Cubre compras en línea y tarjetas que no están en Apple Pay, el hueco que MonAi admite. En Finanzas ya existe el intérprete de notificaciones de Android (`notification.ts`), así que la lógica se podría compartir.
4. **Lista de verificación al configurar la automatización.** La FAQ de MonAi lo explica: la primera vez el teléfono debe estar desbloqueado para aceptar «Permitir siempre».
5. **Compras a cuotas:** un fijo con fecha de fin.

**Qué no copiar.**
- **Muro de pago y compromiso de 12 meses.**
- **IA en servidor para la captura básica:** tiene costo por uso, rompe el funcionamiento sin conexión y envía datos a terceros.
- **Subir el historial completo a un LLM.**
- **El canal de WhatsApp.**
- **Créditos de IA.**
- **Una moneda por lista.**
- **Poner el saldo en 0 cada mes sin explicarlo.**

**Fuentes consultadas:** M1–M19 (sección 12).

---

### 4.6 Goin

**Identificación.**
- **Empresa y producto:** Goin (goin.app), de Prakma Innovation SL, Barcelona. La app se lanzó en 2018 [Oficial, G5; Medio, G1].
- **Nombres parecidos, sin relación:** GOin (gestora cripto francesa) y Goin' (red social de estudiantes) [G22, G23].

**Estado actual** (la sección más importante para leer bien esta app).
- **Ahorro automático desactivado.** La FAQ oficial dice: «Las conexiones bancarias para las funcionalidades de ahorro automático están actualmente desactivadas». Los usuarios aún pueden retirar su saldo por transferencia [Oficial, G6, verificado].
- **Suspensión cautelar.** El 9‑ago‑2026, Crónica Global informó que el Banco de España suspendió de forma cautelar el servicio de ejecución de pagos, mientras se resuelve un expediente reservado [Medio, G1, verificado].
  - La licencia de entidad de pago no es de Goin sino de un tercero, Easy Payment and Finance EP SAU.
  - Goin responde que la medida no afecta a la actividad de la app.
  - El mismo medio informa de 10 M€ de pérdidas acumuladas.
  - Solo hay un medio original: El Ecosistema Startup repite la nota [G2].
- **Lo que siguen anunciando las tiendas:** el redondeo [G5, G8].

**Qué es y a quién sirve.**
- **Público:** jóvenes en Europa que quieren ahorrar sin esfuerzo. Combina ahorro hacia objetivos, cripto, cashback y un asistente con IA («GAIA») [Oficial, G5].
- **Precio:** plan gratuito y **Goin Pro a 1,33 € al mes** [Oficial, G5].
- **Comisiones:** desde 2025 solo hay 1 retirada gratis al mes, según la respuesta de soporte en una reclamación [Oficial, G15]. La web tiene un artículo sobre tasas por inactividad, pero no pude leer los importes [G10].

**Funciones (históricas y actuales).**
- **Objetivos de ahorro** con nombre, importe, fecha y progreso [Medio, G14, G18].
- **Métodos de ahorro, todos vía conexión bancaria PSD2 y hoy desactivados** [Oficial, G6]:
  - redondeo de cada gasto al euro siguiente;
  - retención del 1–20 % de cada ingreso;
  - ahorro periódico;
  - reglas por hábitos.

  Fuentes de esta lista: [Oficial, G5; Medio, G16, G18].
- **Cargo diario agrupado:** los redondeos del día se cobraban juntos en un solo cargo diario [Medio, G18].
- **Cripto y stablecoin EURC** [Oficial, G11], y **cashback** en más de 800 marcas [Oficial, G5].
- **Menos evidentes:**
  - retos diarios [Usuario, G5];
  - «Ahorra jugando», sorteos que exigían aportar 2 € [Medio, G18, 2021];
  - la ficha de la App Store declara rastreo con identificadores [Oficial, G5].

**Qué elogian los usuarios.**
- **Valoración:** App Store España, **4,6 de 5 con unas 11 mil valoraciones**. Las reseñas visibles no tienen fecha y parecen anteriores a la crisis [G5].
- **Ahorrar «sin darte cuenta»:** 4 fuentes [G5, G16, G25, G26]. Un usuario cuenta que ahorró más de 700 € en poco tiempo [G5].
- **Gamificación y diseño:** 2 fuentes. Una reseña la compara con YNAB y concluye: «esta es proactiva, y funciona» [G5].

**Quejas y fricciones.**
- **Retiradas bloqueadas o lentas:** 3 fuentes [G1, G16, G28]. En una reclamación de abril de 2026, una transferencia de 3.000 € seguía retenida días después [G28].
- **Soporte deficiente:** 2 fuentes. Crónica Global lo describe como «un laberinto kafkiano» [G1].
- **Comisión nueva por retirada:** 1 fuente [G15].
- **Riesgo de custodia de cripto:** 1 fuente, de 2023 [G25].
- **Fallos de conexión con el banco:** 3 fuentes [G5, G6, G16].

**Qué la diferencia.** Era independiente del banco gracias a PSD2; esa fue su ventaja y, al apagarse la conexión, su punto débil. Según Finect, el redondeo ya no distingue a nadie porque lo ofrecen los bancos [Medio, G29].

**Ideas pertinentes para Finanzas.** Finanzas no mueve dinero, así que todo sería «virtual» [Inferencia].
1. **Metas de ahorro en ₡** con monto, fecha y cuánto aportar por mes, ligadas a una cuenta de ahorro registrada.
2. **Retención opcional al registrar un ingreso:** por ejemplo, «¿apartar 10 %?» crea una transferencia hacia la cuenta de ahorro. El usuario mueve el dinero de verdad por su banco o SINPE Móvil.
3. **Redondeo simulado** a ₡500 o ₡1.000. No hay evidencia de que la usuaria de referencia lo quiera, y Finect indica que el redondeo ya es común. Queda como exploración, con prioridad baja.
4. **Alertas de categoría** calculadas en el teléfono («Restaurantes va 35 % sobre tu promedio»), sin IA.

**Qué no copiar.**
- **Custodiar o mover dinero.** [Inferencia] En Costa Rica requeriría supervisión financiera, un punto que no verifiqué.
- **Inversión, cripto, sorteos con aportación, comisiones o cashback.**
- **Pedir credenciales bancarias.**
- **Rastrear a los usuarios.**
- **Seguir anunciando funciones que ya no funcionan.**

**Fuentes consultadas:** G1–G30 (sección 12).

---

### 4.7 «Expende» (investigado: eXpend)

**Identificación** (certeza **media‑baja**).
- **No existe ninguna app llamada exactamente «Expende».** Lo comprobé con búsquedas propias en español y en inglés, en App Store, Google Play y la web.
- **App investigada:** la más cercana por nombre y propósito es **eXpend: Make Budgeting a Habit**. En iOS es la id6747117634 y en Android el paquete `com.subdial.expend`, con ficha en español en Google Play: «eXpend: Presupuesto un hábito» [Oficial, E1, E7, E8].
- **Candidatas descartadas:**
  - Expend (expend.com), gastos de empresa (B2B);
  - Expendee, que parece abandonada desde 2023;
  - Expendo y Expendy, de las que hay muy poca información;
  - Expensify, que el pedido excluía.

  Fuentes: [E13–E16].
- **Si la usuaria se refería a otra app,** esta sección no aplica.

**Qué es y a quién sirve.**
- **Qué es:** un registro de gastos y presupuesto **sin cuenta ni servidores**, que funciona sin conexión [Oficial, E1].
- **Desarrollador:** Keith Gabriel Badulis, una persona individual registrada en Manila, Filipinas [Oficial, E5]. [Inferencia] Es un desarrollador solo, como en Finanzas.
- **Precio:** Premium de por vida a **US$4,99**, o 5,99 € en España, sin suscripción ni anuncios [Oficial, E1, E5; Medio, E9].
- **Valoraciones:**
  - Google Play: 4,5 con unas 620 valoraciones y más de 10 mil descargas [Medio, E9].
  - App Store EE. UU.: 4,7 con 13 valoraciones [E1].
  - Es una app pequeña, así que la muestra es reducida.

**Funciones principales** [Oficial, E1, E7; notas de versión vía el espejo E10].
- **Plantillas reutilizables** para registrar rápido.
- **Varias billeteras,** incluidas **tarjetas de crédito con ciclo de corte y fecha de pago**.
- **Presupuestos por categoría,** metas de ahorro y **deudas por cobrar y por pagar**.
- **Subcategorías y etiquetas,** recurrentes que terminan tras N repeticiones, respaldo en JSON y exportación CSV.
- **Notas de versión de 2026:**
  - multimoneda;
  - **abrir el teclado de monto automáticamente al crear un gasto**;
  - notificaciones de pagos planificados;
  - transacciones divididas;
  - «recibos» de deuda para compartir;
  - respaldo en Google Drive;
  - lista de inicio interactiva.
- **No encontré:** widgets, Atajos, Apple Wallet ni sincronización entre dispositivos. Dos reseñas piden widgets [E2, E9].

**Qué elogian los usuarios.**
- **Interfaz limpia e intuitiva:** unas 9 reseñas en 4 tiendas [E2–E4, E9].
- **Pago único y barato:** 4 reseñas. En EE. UU., una persona dice que la mejora a $5 vale la pena por ser un solo pago [E2].
- **Desarrollador activo:** unas 9 versiones entre junio y noviembre de 2026 [E10].

**Quejas y fricciones.**
- **Respaldo en la nube y sincronización:** 4 reseñas. Es el único patrón con 3 o más fuentes [E4, E9].
- **Widgets:** 2 reseñas.
- **Más íconos:** 2 reseñas.
- **Pedidos sueltos:**
  - presupuesto compartido con la pareja;
  - importar datos;
  - **reembolso rápido de un gasto**;
  - metas vinculadas a una cuenta;
  - inversiones.
- **Funciones difíciles de encontrar:** una persona no supo cómo registrar un abono parcial a una deuda hasta que se lo explicó el desarrollador [E2].

**Qué la diferencia.** Pago único bajo, diseño local, ciclos de tarjeta, deudas con recibos y buena calidad visual para una app de una sola persona.

**Ideas pertinentes para Finanzas** [Inferencia].
1. **Plantillas de un toque,** como widget y acción de Atajos. eXpend no las tiene fuera de la app y le piden widgets.
2. **Abrir el teclado de monto automáticamente.** Finanzas ya enfoca el monto al abrir la hoja de un gasto nuevo, así que esto ya está cubierto.
3. **Botón «Registrar reembolso» dentro del gasto,** útil cuando te devuelven por SINPE Móvil la parte de una cuenta compartida.
4. **Deudas personales con abonos visibles.**
5. **Fin de los fijos tras N cobros.**

**Qué no copiar.**
- **Cobrar el respaldo o la exportación.**
- **Promesas de privacidad absolutas que no cuadran con lo que hace la app.** Dice que los datos nunca salen del teléfono, pero ofrece respaldo en Drive y declara recolección de diagnósticos.
- **Muchos idiomas «experimentales».**
- **Acciones frecuentes escondidas en formularios.**

**Fuentes consultadas:** E1–E16 (sección 12).

---

## 5. Tabla comparativa

Leyenda: «Sí» está confirmado por una fuente oficial, salvo que se indique otra cosa. «No» significa que la fuente oficial dice que no existe. «No encontrado» significa que lo busqué y no apareció. «No verificado» significa que hay indicios, pero no pude confirmarlo. La columna de Finanzas viene del código, revisado el 6‑nov‑2026.

| Función / rasgo | MonAi | Monefy | Goin | eXpend («Expende») | Wallet | Fintonic | YNAB | Finanzas |
|---|---|---|---|---|---|---|---|---|
| Registro manual rápido | Sí (voz, texto libre) | Sí (tocar categoría) | No encontrado | Sí (plantillas) | Sí (plantillas) | No verificado (usuarios dicen que quitaron el efectivo) | Sí | Sí |
| Apple Pay vía Atajos de iOS | Sí (solo presencial) | No encontrado | No | No encontrado | Sí | No encontrado | No (FinanceKit, solo EE. UU./RU) | Sí |
| Notificaciones de compra en Android | Sí | No encontrado (pedido) | No | No encontrado | Sí (Google Wallet) | No | No encontrado | Sí (MacroDroid) |
| SMS/correo del banco | Sí (iOS, Atajos) | No (pedido) | No | No encontrado | No encontrado | No | No | No |
| Conexión bancaria | No (por diseño) | No | Sí, PSD2 (desactivada para ahorro) | No | Sí, Premium (sin BAC) | Sí, PSD2 (solo España) | Sí (EE. UU., CA, RU, UE) | No |
| Presupuesto por categoría | Sí | No (solo total, según FAQ) | No encontrado | Sí | Sí (no en web) | Previsión por categoría (estado actual no verificado) | Sí (base cero) | Sí, más total |
| Pronóstico del mes | No encontrado | No | No | No encontrado | Sí (gasto previsto) | Sí antes; ¿eliminado? (usuarios) | No (objetivos) | No |
| Metas u objetivos | No encontrado | No encontrado | Sí (núcleo) | Sí | Sí | No verificado | Sí (targets) | No |
| Recurrentes | Sí (alcance al editar) | Sí (alcance al editar; Premium) | Sí (ahorro periódico) | Sí (fin tras N veces) | Sí | No encontrado | Sí (emparejan con lo importado) | Sí (sin fecha de fin) |
| Multimoneda | Una moneda por lista | Sí, tasa manual (1:1 si falta) | No aplica | Sí (2026) | Sí, tasa automática | No encontrado | No (una por plan) | US$ por movimiento con tasa BCCR |
| Dividir un movimiento | No encontrado | No encontrado | No | Sí | No verificado (pedido) | Sí | No verificado | No |
| Plantillas | No encontrado | No (solo autocompletado) | No | Sí | Sí | No | No encontrado | No |
| Autocategorización / reglas | IA por comercio | No encontrado | No aplica | No encontrado | Reglas (solo registros bancarios) + IA | Automática (usuarios: no aprende) | «2 de 3» + reglas | Reglas por comercio |
| Widgets / Siri | Widget de voz | Widgets en Android | No encontrado | No (pedido) | Widgets de saldo | No (pedido) | Sí, amplio | No |
| Ocultar montos | No encontrado | No encontrado | No | No encontrado | No verificado | No encontrado | Sí (Hide Amounts) | Sí (modo discreto) |
| Uso sin conexión | No verificado (la IA requiere red) | Sí, local (arranque lento reportado) | No verificado | Sí, local | Limitado (hay que estar en línea para guardar) | No verificado | Mencionado, alcance no verificado | Sí (caché + cola de cambios) |
| Importar CSV | Solo su propio formato | No verificado | No | No (pedido) | Solo desde la web | No | Solo web/iPad | No |
| Exportar CSV | Sí | No verificado | No encontrado | Sí (Premium) | No verificado | Fallos reportados | No verificado | Sí |
| Español | Sí | Sí | Sí | «Experimental» | Sí | Sí (solo español) | **No** | Sí (es‑CR) e inglés |
| Modelo | Suscripción (prueba 7 días, planes de 12 meses) | Freemium + Premium | Gratis + Pro 1,33 €/mes + comisiones | Freemium + vitalicio US$4,99 | Freemium + Lifetime | Gratis; cobra a entidades por préstamos | Suscripción US$109/año | Gratis |
| App Store Costa Rica | 4,8 (215) | 4,8 (426) | No verificado | No verificado | 4,8 (487) | No verificado (opera solo en España) | 4,5 (24) | No aplica |

---

## 6. Temas que se repiten entre apps

### 6.1 Rapidez de registro
- **Evidencia:** es el elogio más repetido en las apps de registro manual.
  - Monefy: más de 10 reseñas en 5 tiendas y 3 medios.
  - eXpend: unas 9 reseñas sobre la interfaz.
  - MonAi: 4 tiendas sobre la voz.
  - Wallet: 5 fuentes sobre lo fácil que es usarla.
- **Excepciones:**
  - En YNAB y Fintonic la rapidez no es el valor principal: YNAB vende el método y Fintonic la automatización bancaria.
  - Ninguna fuente compara mecanismos (tocar categoría, plantillas, voz) en tiempo real de registro.
- **Lectura** [Inferencia]: «registrar en segundos» ya es el principio n.º 2 de Finanzas. La evidencia lo respalda, pero no dice qué mecanismo conviene más.

### 6.2 Captura automática sin banco y su fiabilidad
- **Evidencia:** tres apps usan el mismo enfoque que Finanzas: Wallet, MonAi y ShareCost. Las quejas son de fiabilidad:
  - MonAi: 5 tiendas, y la FAQ reconoce un error de Apple.
  - Wallet: problemas documentados en su ayuda.
  - Una usuaria tica de Wallet pagó Premium por la captura de Apple Pay y las reglas, y no le funcionaron.
- **Lo que mejor resuelve el problema:** confirmar que funciona, avisar cuando se detiene y preguntar por tarjetas nuevas (ShareCost).
- **Excepción:** Monefy y eXpend no la tienen. Un usuario de Monefy pide que detecte los SMS del banco.

### 6.3 Confianza, privacidad y modelo de negocio
- **Evidencia:** las quejas más fuertes vienen de cómo gana dinero cada app, no de sus funciones.
  - Fintonic: rediseño orientado a préstamos y venta cruzada.
  - MonAi: muro de pago y compromiso de 12 meses.
  - Monefy: promociones y Premium perdido.
  - YNAB: subidas de precio.
  - Goin: comisiones y retiradas bloqueadas.
- **Contraste:** el pago único de eXpend y la opción Lifetime de Wallet reciben elogios explícitos (4 y 3 fuentes).
- **Lectura** [Inferencia]: para Finanzas, que es gratis, el riesgo está en el futuro, si algún día decide monetizar.

### 6.4 Sincronización, respaldo y pérdida de datos
- **Evidencia:**
  - Wallet: 4 fuentes de pérdida de datos o sincronización rota, una de Costa Rica.
  - Monefy: 5 reseñas, más la FAQ.
  - eXpend: la queja más repetida es la falta de respaldo en la nube (4).
  - Fintonic: 13 reseñas de histórico perdido.
- **Lectura** [Inferencia]: Finanzas guarda los datos en Supabase y tiene una cola sin conexión. Eso evita la pérdida al cambiar de teléfono, el problema de Monefy y eXpend. Sigue siendo pertinente que la exportación sea completa y fácil de encontrar.

### 6.5 Presupuestos que anticipan
- **Evidencia:**
  - Wallet: gasto previsto con semáforo (oficial).
  - Fintonic: 13 reseñas lamentan perder la previsión por categoría.
  - Monefy: 4 reseñas critican que el presupuesto diario no reacciona.
  - YNAB: objetivos que convierten gastos anuales en cuotas mensuales (oficial), y elogios a que «cambia hábitos».
- **Fuerza:** moderada. Casi toda la demanda se expresa como queja por algo que falta o se perdió.

### 6.6 Curva de aprendizaje frente a minimalismo
- **Evidencia:**
  - YNAB: 7 fuentes sobre la curva de aprendizaje.
  - MonAi: se define como minimalista y le elogian la sencillez en 6 tiendas.
  - eXpend: tiene funciones que la gente no encuentra (1 reseña).
- **Lectura** [Inferencia]: cada función nueva de Finanzas debe poder ignorarse sin costo.

### 6.7 Categorización que aprende y control del usuario
- **Evidencia:**
  - Fintonic: 25 reseñas de categorización que no aprende.
  - Wallet: 1 reseña similar, y sus reglas no se aplican a los registros manuales (oficial).
  - YNAB: introdujo la regla «2 de 3» (oficial).
- **Lectura:** se valoran las reglas que se ven y se pueden corregir. Finanzas ya las tiene.

### 6.8 Varias monedas
- **Evidencia:**
  - Wallet: la multimoneda es elogiada (5 fuentes).
  - YNAB: se critica que solo admite una moneda.
  - Wallet: no permitir cambiar la moneda base genera quejas.
  - MonAi: obliga a separar monedas en listas distintas.
- **Pertinencia para Costa Rica** [Inferencia]: alta, pero no verifiqué cuántas cuentas en dólares usa la usuaria de referencia.

### 6.9 Soporte
- **Evidencia:** el soporte lento aparece en Wallet (5), Monefy (6), Goin (2) y Fintonic. El soporte cercano se elogia en MonAi y eXpend, ambas de equipos pequeños.

---

## 7. Oportunidades para Finanzas (evaluadas)

Criterios:
- **Valor:** valor potencial para la usuaria de referencia.
- **Evidencia:** evidencia de demanda (alta, media o baja).
- **Esfuerzo:** S pequeño, M medio, L grande.
- **Riesgo:** de privacidad y seguridad.
- **Compatibilidad:** con Costa Rica, el colón, iOS y Android y el uso sin conexión.

La evaluación es [Inferencia] del investigador a partir de la evidencia citada.

| # | Oportunidad | Valor | Evidencia | Esfuerzo | Riesgo | Compatibilidad |
|---|---|---|---|---|---|---|
| O1 | Estado visible de la captura automática (último pago capturado, aviso si se detiene) | Alto | Alta (ShareCost oficial; MonAi 5 tiendas + FAQ; ayuda de Wallet) | S | Bajo | Alta; usa datos que ya existen |
| O2 | Guía de configuración con verificación («se recibió tu pago de prueba») | Alto | Media‑alta (FAQ de MonAi, ShareCost, Wallet) | S | Bajo | Alta |
| O3 | Aprender la tarjeta al revisar un pendiente («¿siempre a esta cuenta?») | Medio‑alto | Media (ShareCost oficial) | S | Bajo | Alta; las cuentas ya tienen `last4` y `wallet_name` |
| O4 | Revisión en serie de pendientes (deslizar, confirmar varios, deshacer) | Medio | Media (YNAB y ShareCost oficiales; sin reseñas propias) | S‑M | Bajo | Alta; la cola sin conexión ya lo permite |
| O5 | Fijos con fecha de fin o número de cobros (cuotas, tasa cero) | Medio | Baja‑media (eXpend oficial; MonAi: 1 pedido + testimonios) | S‑M | Bajo | Alta |
| O6 | Emparejar gasto manual o fijo con el automático, y avisar de posibles duplicados | Alto | Media (YNAB y Fintonic oficiales; duplicados en Wallet, YNAB y Fintonic) | M | Bajo | Alta |
| O7 | Plantillas o favoritos de un toque | Alto | Media (Monefy >10 sobre la rapidez; eXpend y Wallet oficiales) | M | Bajo | Alta |
| O8 | Pronóstico del mes y «disponible por día» en el Resumen | Alto | Media (Wallet oficial; Fintonic 13; Monefy 4) | M | Bajo | Alta |
| O9 | Metas para gastos irregulares (marchamo, RTV, seguros, diciembre) | Medio‑alto | Media (YNAB, Goin, eXpend y Wallet oficiales; elogios en YNAB y Goin) | M | Bajo | Alta |
| O10 | Recordatorios locales (fijos próximos, pago de tarjeta, resumen del lunes) | Medio | Media (Fintonic, Wallet y eXpend oficiales) | M | Bajo | Media: nativo sí; PWA en iPhone requiere push con servidor |
| O11 | Dividir un movimiento y registrar reembolsos | Medio | Media (Fintonic oficial; Wallet 3 pedidos; eXpend 1 pedido + oficial) | M‑L | Bajo | Alta; impacta vistas y estadísticas |
| O12 | Consumo del ciclo de la tarjeta («a pagar el día X») | Medio | Baja (eXpend oficial; [Inferencia] costumbre local) | M | Bajo | Alta; los campos ya existen |
| O13 | Registrar desde texto o voz con intérprete local; Atajo para SMS o correos del banco | Alto (cubre compras en línea y tarjetas fuera de Wallet) | Media (MonAi elogios 4 + oficial; Monefy 1 pedido) | L | Medio (el contenido de SMS es sensible) | Media: formatos de bancos ticos no verificados |
| O14 | Importar CSV de estados de cuenta | Medio | Baja‑media (YNAB lo recomienda fuera de sus regiones; respuesta de Wallet en CR) | L | Bajo | Formatos no verificados |
| O15 | Cuentas en dólares (saldo en US$) | Medio (depende de la usuaria) | Media (Wallet 5; queja contra YNAB) | L | Bajo | Alta, pero cambia vistas y presupuestos |
| O16 | Widgets nativos (cómo va el mes, registrar) | Medio | Baja‑media (pedidos en Fintonic 1, eXpend 2, Monefy 1; YNAB oficial) | L | Medio (datos en pantalla bloqueada) | Solo nativo |

---

## 8. Lista priorizada de propuestas

### 8.1 Mejoras pequeñas

**P1. «Última captura automática» y aviso cuando se detiene** (O1)
- **Problema:** si el Atajo de iOS o MacroDroid dejan de funcionar, la usuaria no se entera hasta que nota que faltan gastos. Esto rompe el principio «lo automático le gana a lo manual».
- **Evidencia:**
  - ShareCost muestra «Verified — a payment was captured on…» y «Transaction import paused» [W8].
  - MonAi tiene quejas de captura fallida en 5 tiendas y su FAQ reconoce un error de Apple [M13].
  - La ayuda de Wallet lista fallos de permisos y batería [W6].
- **Encaje:**
  - Mostrar en el Resumen, junto a la tarjeta de pendientes, y en Ajustes → Wallet: «Último pago automático: hace 3 h».
  - Si pasa N días sin capturas cuando antes llegaban con regularidad, mostrar un aviso con enlace a la guía.
  - El dato sale de `transactions.source = 'wallet'` y de `api_tokens.last_used_at`, que Ajustes ya muestra.
- **Dependencias:** ninguna en el servidor. Solo se calcula en el cliente y funciona sin conexión con la caché.
- **Validar antes:**
  - Con qué frecuencia le falla el Atajo a la dueña.
  - Qué umbral de días evita falsos avisos, por ejemplo en semanas en que paga en efectivo.

**P2. Verificación de la configuración** (O2)
- **Problema:** configurar Atajos o MacroDroid tiene pasos fáciles de olvidar.
  - En iOS, el teléfono debe estar desbloqueado en el primer pago para aceptar «Permitir siempre» [M13].
  - En Android, el ahorro de batería y el acceso a notificaciones pueden detener la captura [W6].
- **Evidencia:** FAQ de MonAi [M13], ayuda de Google Pay Sync [W6] y flujo de ShareCost [W8].
- **Encaje:** al final de cada guía de Ajustes, mostrar «Esperando tu primer pago…» y luego «Listo: se recibió ₡X en Y». Agregar una lista de verificación por sistema.
- **Dependencias:** ninguna nueva. Se puede consultar la lista de pendientes o movimientos con `source='wallet'`.
- **Validar antes:** que el mensaje «Permitir siempre» aplique a la versión de iOS actual.

**P3. Aprender la tarjeta al revisar un pendiente** (O3)
- **Problema:** un pago de una tarjeta que Finanzas no reconoce cae en la primera tarjeta y queda por revisar. Además mueve el saldo de esa tarjeta hasta que alguien lo corrija.
- **Evidencia:** reglas por tarjeta nueva de ShareCost: «Always add to… / Ignore this card / Not now» [W8].
- **Encaje:**
  - Al confirmar un pendiente cuyo texto de tarjeta (en `note`) no coincidió con ninguna cuenta, ofrecer: «¿Guardar "Visa •••• 1234" en la cuenta X?». Eso escribe `wallet_name` o `last4` en esa cuenta.
  - La opción «Ignorar esta tarjeta» sería una idea aparte, que requiere una regla en el servidor.
- **Dependencias:**
  - Hace falta saber si la tarjeta empató. Hoy no se guarda; se puede inferir comparando `note` con la cuenta asignada, o agregar una columna.
- **Validar antes:** cuántas tarjetas usa la dueña en Wallet y si sus nombres cambian.

**P4. Confirmar en serie y en lote** (O4)
- **Problema:** con varios pendientes, revisarlos uno por uno toma tiempo. Según YNAB, si se acumulan pendientes, la gente deja de abrir la app [Y6, Y11, Y12].
- **Evidencia:** Card Mode de YNAB [Y2] y selección múltiple de ShareCost [W8], ambos oficiales. No hay reseñas de usuarios de Finanzas.
- **Encaje:**
  - Desde la bandeja, «Revisar en serie»: al confirmar uno se abre el siguiente.
  - «Confirmar todos los que ya tienen categoría» con deshacer.
  - Las confirmaciones pasan por la cola sin conexión que ya existe.
- **Dependencias:** ninguna en el esquema.
- **Validar antes:** cuántos pendientes se acumulan en una semana típica.

**P5. Fijos con fin** (O5)
- **Problema:** las compras a cuotas, como la tasa cero, son fijos que terminan. Hoy hay que pausarlos o borrarlos a mano.
- **Evidencia:** eXpend permite terminar tras N repeticiones [E10]. En MonAi piden la fecha de fin (testimonios) y compras a cuotas (1 reseña, México) [M8, M12].
- **Encaje:** campo opcional «Termina después de N cobros» o «el día X» en `recurring`. `applyRecurring` deja de generar cobros al llegar al fin.
- **Dependencias:** una migración nueva, cambios en `types.ts`, `api.ts` y `demoApi.ts`, y pruebas en `supabase/tests/`.
- **Validar antes:** si la dueña tiene compras a cuotas activas.

### 8.2 Funciones de tamaño medio

**M1. Emparejar el gasto manual con el automático** (O6)
- **Problema:** si la dueña anota un gasto a mano y luego llega el mismo pago de Wallet o de una notificación, queda contado dos veces. Lo mismo pasa con un fijo y su cobro real.
- **Evidencia:**
  - YNAB empareja recurrentes con lo importado [Y22] (oficial).
  - Fintonic alerta de cargos duplicados [F7] (oficial).
  - Wallet documenta duplicados cuando se combinan fuentes [W6].
  - Hay quejas de duplicados en Wallet, YNAB y Fintonic, aunque todas por conexión bancaria.
- **Encaje:**
  - Al llegar un pago automático, buscar un movimiento manual o fijo con el mismo monto y fecha cercana (por ejemplo ±2 días) que no haya venido de Wallet.
  - Si existe, dejarlo por revisar con la pregunta: «¿Es el mismo que "Súper ₡12.500" de ayer?». Ofrecer «Unir» (quedarse con uno y completar comercio y tarjeta) o «Son distintos».
- **Dependencias:** lógica en `_shared/ingest.ts` o en el cliente al revisar, y probablemente una columna que apunte al posible duplicado.
- **Validar antes:** si la dueña registra a mano pagos que luego llegan automáticamente, y con qué frecuencia.

**M2. Plantillas o favoritos** (O7)
- **Problema:** muchos gastos manuales se repiten, como el bus, el café, la soda o el parqueo.
- **Evidencia:**
  - Plantillas en eXpend [E1] y Wallet [W11], oficiales.
  - La rapidez de registro es el elogio más fuerte de Monefy (más de 10 reseñas).
- **Encaje:**
  - Una fila de favoritos en la hoja de gasto nuevo (comercio, categoría, cuenta y monto opcional) que se crea a partir de los gastos manuales más repetidos.
  - Una segunda fase: un acceso directo (`?agregar&plantilla=…`) que se pueda poner en la pantalla de inicio o en un Atajo. La app ya abre la hoja con `?agregar`.
- **Dependencias:**
  - Guardarlas en las preferencias (`user_settings.prefs`) evita una migración, pero el tamaño máximo es de 8 KB.
  - Un widget nativo sería la propuesta L5.
- **Validar antes:** medir en los datos de la dueña cuántos gastos manuales comparten comercio y monto.

**M3. Pronóstico del mes y «disponible por día»** (O8)
- **Problema:** el Resumen dice cuánto se gastó, pero no hacia dónde va el mes.
- **Evidencia:**
  - Wallet calcula el gasto previsto [W12] (oficial).
  - En Fintonic, 13 reseñas lamentan perder la previsión [F3].
  - En Monefy, 4 reseñas critican que el presupuesto diario no reaccione [Mo10].
- **Encaje:**
  - Una cuarta opción para la cifra de la tarjeta del Resumen: «Proyección del mes» = lo gastado + los fijos que faltan este mes + el ritmo diario actual × los días restantes.
  - Una línea «Puedes gastar ₡X por día hasta fin de mes».
  - Debe usar la regla de color del presupuesto que ya existe.
  - Debe poder excluir gastos excepcionales del ritmo, que es la crítica a Wallet [W25].
- **Dependencias:** solo cliente (`stats.ts` y `recurring.ts`). Funciona sin conexión.
- **Validar antes:**
  - Que la dueña entienda la cifra sin explicación.
  - Qué método de ritmo da menos sorpresas: promedio, mediana o meses anteriores.

**M4. Metas para gastos irregulares** (O9)
- **Problema:** gastos anuales como el marchamo, la RTV, los seguros, la matrícula o diciembre llegan de golpe.
- **Evidencia:**
  - Objetivos de YNAB [Y22], oficiales y elogiados.
  - Objetivos de Goin [G14, G18], con 4 fuentes de elogio a «ahorrar sin darse cuenta».
  - Metas en eXpend y Wallet.
- **Encaje:**
  - Una meta con nombre, monto en ₡ y fecha, que muestra cuánto apartar por mes («₡25.000/mes para el marchamo de diciembre»).
  - El progreso se ligaría a una cuenta de ahorro existente o a transferencias hacia ella.
  - Finanzas no mueve dinero: solo lleva la cuenta.
- **Dependencias:** una tabla nueva con su RLS (la política MFA y el trigger de dueño), sus dos implementaciones y una sección nueva en el Resumen.
- **Validar antes:** si la dueña ya separa ese dinero en una cuenta de ahorro y si prefiere ver la meta o una cuota mensual en el presupuesto.

**M5. Recordatorios locales** (O10)
- **Problema:** los fijos y el pago de la tarjeta pasan sin aviso. Finanzas ya guarda el día de corte y el día de pago.
- **Evidencia:**
  - Notificaciones de pagos planificados en eXpend [E10].
  - Informe semanal de los lunes en Fintonic [F6].
  - Recordatorios en Wallet [W1].
  - No encontré reseñas que los pidan explícitamente.
- **Encaje:** en la app nativa, notificaciones locales programadas en el teléfono, sin servidor: «Mañana se cobra Netflix ₡6.990» y «El día 2 vence la Visa: ₡185.000».
- **Dependencias:**
  - El plugin `@capacitor/local-notifications`.
  - En la PWA del iPhone, las notificaciones requieren Web Push con servidor, así que quedarían solo para la app nativa.
- **Validar antes:** la tolerancia de la dueña a recibir notificaciones.

**M6. Dividir y reembolsar** (O11)
- **Problema:** una compra en el súper mezcla comida y limpieza. Cuando a la dueña le devuelven su parte de una cuenta, hoy solo puede registrarlo como ingreso, lo que infla los ingresos y no reduce el gasto de la categoría.
- **Evidencia:**
  - Fintonic permite dividir y marcar «no computable» [F8] (oficial).
  - En Wallet, 3 reseñas piden dividir.
  - eXpend tiene dividir [E10] y le piden el reembolso rápido (1) [E3].
- **Encaje:**
  - Reembolso: un movimiento que referencia al original y resta del gasto de su categoría en presupuestos y estadísticas.
  - División: varios movimientos ligados por un identificador de grupo.
- **Dependencias:** las de mayor impacto de esta lista, porque tocan `budget_progress`, `account_balances`, `stats.ts`, la exportación y las dos implementaciones de `Api`.
- **Validar antes:** con qué frecuencia la dueña divide cuentas o recibe reembolsos por SINPE Móvil.

**M7. Consumo del ciclo de la tarjeta** (O12)
- **Problema:** la tarjeta se paga por ciclo (corte y pago), no por mes calendario.
- **Evidencia:** eXpend tiene ciclos de tarjeta [E1] (oficial). La demanda local es una [Inferencia]: no encontré reseñas que la pidan.
- **Encaje:** en Cuentas y en el detalle de una tarjeta, «Ciclo actual (16 oct – 15 nov): ₡X · a pagar el 2 dic». Usa `cutoff_day` y `payment_day`, que ya existen y hoy no se usan en ningún cálculo.
- **Validar antes:** si a la dueña le sirve más que el mes calendario.

### 8.3 Apuestas grandes o exploratorias

**L1. Registrar desde texto o voz, y SMS o correos de bancos en iOS** (O13)
- **Problema:**
  - Las compras en línea y con tarjetas que no están en Wallet no se capturan solas (MonAi también lo admite [M13]).
  - Escribir un gasto a mano toma más toques que decirlo.
- **Evidencia:**
  - MonAi: la voz se elogia en 4 tiendas, y la acción «Transaction from prompt» para SMS y correo es oficial [M13].
  - Monefy: 1 usuario pide detectar SMS [Mo12].
- **Encaje:**
  - Finanzas ya tiene un intérprete de notificaciones de compra (`_shared/notification.ts`) y el endpoint `wallet-sync?formato=notificacion`, que recibe texto plano.
  - [Inferencia] Una automatización de iOS de tipo «Mensaje» o «Correo», filtrada por remitente, podría mandar ese texto al mismo endpoint, sin IA.
  - Para la voz: el dictado del sistema más un intérprete local de frases como «súper 45 mil ayer».
- **Dependencias:**
  - Los formatos de SMS y correos de BAC, BCR, BN y otros bancos (no verificados).
  - Qué datos expone la automatización de Mensajes de iOS (no verificado).
  - Para la voz o Siri, App Intents nativos en Swift.
- **Riesgos:** el contenido de los SMS es sensible. Hay que filtrar por remitente y no guardar el texto completo, como ya hace la rama de notificaciones.
- **Validar antes:**
  - Juntar ejemplos reales de SMS y correos de los bancos de la dueña.
  - Comprobar en un iPhone que la automatización entrega el texto sin pedir confirmación cada vez.

**L2. Importar estados de cuenta en CSV** (O14)
- **Problema:** no hay open banking en Costa Rica, y para conciliar o completar meses pasados hay que escribirlo todo a mano.
- **Evidencia:**
  - YNAB recomienda importar archivos fuera de sus regiones [Y1].
  - El desarrollador de Wallet sugirió a un usuario tico importar el extracto de BAC [W24].
  - MonAi: 1 pedido de conciliar con el estado de cuenta [M9].
- **Encaje:**
  - Importar en el teléfono, no solo en la web, que es justo la carencia de YNAB y Wallet.
  - Mapear columnas, aceptar `₡1.234,56` (Wallet no acepta separadores de miles) y recordar el formato por banco.
  - Detectar lo que ya llegó por Wallet y permitir deshacer el lote completo.
- **Dependencias:** formatos reales de los bancos y una lógica de duplicados (comparte trabajo con M1).
- **Validar antes:** qué bancos exportan CSV o Excel y con qué columnas.

**L3. Cuentas en dólares** (O15)
- **Problema:** las cuentas en US$ (ahorro, algunas tarjetas) hoy no se pueden registrar con su saldo en dólares. Finanzas solo convierte cada movimiento a colones.
- **Evidencia:**
  - Wallet: la multimoneda se elogia en 5 fuentes.
  - YNAB: se critica que solo admite una moneda (fuente oficial y usuarios).
  - MonAi: sus usuarios en Colombia tienen que separar COP y USD en listas distintas.
- **Encaje:** una moneda por cuenta, con saldo en su moneda y totales en ₡ al tipo del BCCR.
  - Lección de Wallet: no bloquear la moneda base.
  - Lección de Monefy: no usar 1:1 si falta la tasa.
- **Dependencias:** las de mayor alcance, porque cambian las vistas de saldos, las transferencias entre monedas, los presupuestos, las estadísticas y la exportación.
- **Validar antes:** si la dueña tiene cuentas en dólares y cuánto pesan en su mes.

**L4. Widgets y Siri** (O16)
- **Problema:** ver cómo va el mes o registrar sin abrir la app.
- **Evidencia:**
  - YNAB los tiene (oficial).
  - Hay pedidos aislados en Fintonic (1), eXpend (2) y Monefy (1).
- **Encaje:** un widget de «cómo va el mes», compatible con el modo discreto, y uno de registro rápido con favoritos (M2).
- **Dependencias:**
  - WidgetKit en Swift y widgets nativos en Android.
  - Compartir datos y sesión fuera del WebView de Capacitor.
  - No existe en la PWA.
- **Riesgos:** mostrar montos en la pantalla bloqueada. El widget debe respetar el modo discreto.
- **Validar antes:** la viabilidad técnica con Capacitor 8 y si la dueña usa widgets.

---

## 9. Ideas descartadas o de baja prioridad

| Idea (dónde aparece) | Por qué no encaja o queda en baja prioridad |
|---|---|
| Presupuesto de base cero obligatorio y su jerga (YNAB) | Es la causa de la curva de aprendizaje (7 fuentes) y choca con registrar en segundos. Si algo se toma, que sea opcional (metas, M4). |
| Conexión bancaria o agregador (Fintonic, Wallet, YNAB, Goin) | No existe en Costa Rica para una app así. Donde existe, es la fuente principal de quejas, y en Goin su caída dejó sin función a la app. |
| Puntuación crediticia, marketplace de préstamos, venta cruzada (Fintonic) | Requiere negocio y licencias que Finanzas no tiene. Es la causa principal de rechazo en las reseñas de Fintonic. |
| Ahorro real, redondeo que mueve dinero, custodia, inversión, cripto, cashback (Goin) | Finanzas no es entidad financiera. [Inferencia] En Costa Rica requeriría supervisión, un punto que no verifiqué. El redondeo ya es común en la banca [G29]. El redondeo simulado queda como exploración de baja prioridad, sin evidencia de demanda de la usuaria. |
| Sorteos con aportación y comisiones por retirada o inactividad (Goin) | Riesgo regulatorio y son la peor fuente de quejas. |
| Chat con IA en la nube sobre el historial (MonAi, Fintonic en ChatGPT) | Costo por uso, rompe el funcionamiento sin conexión y envía datos financieros a terceros. Además, no encontré evidencia de usuarios que lo valoren: en MonAi está en beta. |
| Canal de WhatsApp (MonAi) | Otro procesador de datos, costo de API y montos que quedan en el historial del chat. |
| Muro de pago, compromiso de 12 meses, créditos de IA (MonAi), promociones al abrir (Monefy) | Generan las quejas más repetidas y Finanzas es gratis. |
| Servidor MCP o API con escritura (Wallet, YNAB) | [Inferencia] Es una superficie de seguridad poco justificada para una persona. Ya existe exportación CSV. |
| Muchos tipos de cuenta: hipotecas, inversiones, patrimonio (Wallet, eXpend) | Aleja la app de «cómo va el mes». Los pedidos son aislados. |
| Listas o presupuestos compartidos en pareja (MonAi, YNAB, Wallet) | Tiene evidencia (3 fuentes en MonAi y 3 en YNAB), pero cambia el modelo de privacidad de Finanzas (una persona, sus datos, RLS por usuario). Baja prioridad hasta saber si las usuarias nuevas lo piden. |
| Dona como teclado de registro (Monefy) | La idea de tocar la categoría sirve, pero una dona arriba de la pantalla queda lejos del pulgar en iPhones grandes. Se adapta en M2, no se copia. |
| Saldo que vuelve a 0 cada mes por defecto (MonAi) | Su propia FAQ tiene que explicarlo. Finanzas ya muestra los saldos por cuenta sin reiniciarlos. |
| Decenas de idiomas «experimentales» (eXpend, Wallet) | Mejor español de Costa Rica e inglés bien hechos. |
| Gamificación con rachas y retos (Goin) | Solo 2 fuentes de elogio, ambas antiguas, y sin evidencia en la usuaria de referencia. Si algún día se hace, que se pueda desactivar. |

---

## 10. Preguntas de investigación pendientes

**Sobre la usuaria de referencia** (es lo que más cambia las prioridades):
1. ¿Con qué frecuencia deja de funcionar el Atajo de Wallet? ¿Cuántos pendientes se acumulan por semana? (P1, P4)
2. ¿Registra a mano pagos que luego llegan automáticamente? (M1)
3. ¿Tiene cuentas o tarjetas en dólares? ¿Cuánto pesan en su mes? (L3)
4. ¿Cuántos de sus gastos manuales se repiten (mismo comercio y monto)? (M2)
5. ¿Paga compras a cuotas o tasa cero? ¿Divide cuentas y recibe reembolsos por SINPE Móvil? (P5, M6)
6. ¿Separa dinero para gastos anuales? ¿Le sirve ver el ciclo de la tarjeta en vez del mes calendario? (M4, M7)
7. ¿Acepta recibir notificaciones? ¿Usa widgets? (M5, L4)

**Técnicas:**
8. Formatos reales de los SMS, correos y notificaciones de compra de BAC, BCR, BN, Promerica, Davivienda y Scotiabank. La documentación del proyecto ya advierte que los formatos de notificaciones de Android son supuestos.
9. ¿La automatización «Mensaje» o «Correo» de Atajos en la versión actual de iOS entrega el texto sin pedir confirmación cada vez?
10. ¿Exponen los Atajos de iOS algún identificador de tarjeta además del nombre, para P3?
11. ¿Es viable compartir datos y sesión con WidgetKit desde Capacitor 8?
12. ¿Qué bancos de Costa Rica exportan CSV o Excel y con qué columnas?

**Sobre la competencia** (no se pudo cerrar):
13. Reseñas de Google Play de las siete apps, que no fueron accesibles directamente.
14. Opiniones en Reddit y YouTube, que estuvieron bloqueados o no dieron resultados.
15. ¿Funciona MonAi con colones y con frases en español de Costa Rica?
16. Precio de Wallet en Costa Rica y lista de bancos ticos soportados.
17. Estado final de Goin (resolución del expediente del Banco de España) y si el ahorro automático vuelve.
18. Confirmar con la usuaria si «Expende» era eXpend u otra app.

---

## 11. Limitaciones

- **Acceso a fuentes:**
  - Reddit devolvió 403 o resultados vacíos para todas las apps. Trustpilot, PCMag (EE. UU.) y USA Today estuvieron bloqueados; de ellos solo hay fragmentos del buscador.
  - No pude ver ningún video de YouTube, así que no hay evidencia de demostraciones en video.
  - El centro de ayuda de YNAB es dinámico y solo se usaron fragmentos oficiales del buscador.
- **Reseñas de tiendas:**
  - Las fichas de la App Store muestran unas 10 reseñas destacadas por país y **sin fecha visible**. No es una muestra representativa ni permite separar reseñas recientes de antiguas.
  - Google Play no mostró reseñas ni valoraciones directamente. Los datos de Android vienen de agregadores (AppBrain, Wealthy Pot, Finder).
  - La excepción es Fintonic: 500 reseñas con fecha del RSS de Apple, contadas por palabras clave. Los conteos son aproximados y las reseñas escritas tienden a ser negativas.
- **Países y versiones:** las funciones cambian por país (conexión bancaria, Apple Wallet, precios) y por plataforma (web, iOS y Android tienen funciones distintas en Wallet y YNAB). Los precios se tomaron de las tiendas de EE. UU., España y Costa Rica el 6‑nov‑2026.
- **Identidad de los productos:** «Expende» no existe con ese nombre exacto, y la sección 4.7 trata de la candidata más probable. «monAI» y «Wallet» se interpretaron como MonAi y Wallet de BudgetBakers.
- **Noticias con un solo medio:** la suspensión cautelar de Goin la publicó un solo medio original, Crónica Global. Lo que sí está confirmado en fuente oficial es que el ahorro automático está desactivado [G6].
- **Sesgos:**
  - Algunas fuentes de YNAB son competidores (EnvelopeBudget, Aspire) o tienen enlaces de referido.
  - Los testimonios de los sitios oficiales están seleccionados.
  - MonAi y eXpend responden casi todas sus reseñas.
- **No se probó ninguna app.** Los flujos se describen a partir de documentación, medios y reseñas.
- **Método:** la investigación por app la hicieron siete agentes con las mismas instrucciones. El investigador principal volvió a comprobar las afirmaciones más delicadas (sección 2), pero no cada dato. Los conteos de «fuentes independientes» los hizo cada agente y no se auditaron uno por uno.
- **Volumen:** unas 150 búsquedas y más de 140 páginas en total. No es una revisión exhaustiva de internet.

---

## 12. Bibliografía

Formato de cada entrada: título — autor o canal — sitio — fecha — URL — qué aporta. «Sin fecha» significa que la página no muestra fecha. Una fecha con «~» viene de los metadatos del buscador. Marcadas con † las fuentes de las que solo se leyó el fragmento del buscador. Las marcadas como verificadas las abrió directamente el investigador principal.

### YNAB
- [Y1] Pricing — YNAB — ynab.com — sin fecha, consultado el 6‑nov‑2026 — https://www.ynab.com/pricing — Precio, prueba, 6 personas, regiones de importación, una moneda por plan. Verificado.
- [Y2] What's New — YNAB — ynab.com — sep–oct 2026 — https://www.ynab.com/whats-new — Card Mode, Plan Reset, CSV, regla 2 de 3, intereses de tarjeta.
- [Y3] YNAB's API Gets Even Better — YNAB — ynab.com — 29‑abr‑2026 — https://www.ynab.com/whats-new/ynabs-api-gets-even-better — API y asistentes de IA.
- [Y4] Features — YNAB — ynab.com — sin fecha — https://www.ynab.com/app — Funciones, sin anuncios, reportes.
- [Y5] YNAB (ficha) — YNAB — App Store EE. UU. — v26.42, nov‑2026 — https://apps.apple.com/us/app/ynab/id1010865877 — 4,8 con 62 mil, requisitos, Siri, Watch, idioma.
- [Y6] Ratings & Reviews (EE. UU.) — usuarios — App Store — sin fecha — https://apps.apple.com/us/app/ynab/id1010865877?platform=iphone&see-all=reviews — Elogios, reconciliación tediosa, tarjetas, reportes.
- [Y7] Calificaciones y reseñas (Costa Rica) — usuarios — App Store — sin fecha — https://apps.apple.com/cr/app/ynab/id1010865877?platform=iphone&see-all=reviews — 4,5 con 24.
- [Y8] Calificaciones y reseñas (República Dominicana) — usuarios y YNAB — App Store — ~sep‑2025 — https://apps.apple.com/do/app/ynab/id1010865877?platform=iphone&see-all=reviews — Piden español.
- [Y9] Ratings & Reviews (Finlandia) — usuarios — App Store — sin fecha — https://apps.apple.com/fi/app/ynab/id1010865877?platform=iphone&see-all=reviews — GDPR, rediseño, precio, reportes.
- [Y10] YNAB — YNAB — Google Play — sin fecha — https://play.google.com/store/apps/details?id=com.youneedabudget.evergreen.app&hl=en_US — Descripción.
- [Y11] YNAB Review (2026) — Wealthy Pot Editorial — wealthypot.com — 18‑oct‑2026 — https://wealthypot.com/budgeting-apps/ynab/ — Limitaciones, valoraciones.
- [Y12] YNAB Reddit: What r/ynab says — «Amara» — aitooldiscovery.com — ~1‑oct‑2026 — https://www.aitooldiscovery.com/guides/ynab-reddit — Resumen de hilos de Reddit. Fiabilidad baja.
- [Y13] Is YNAB Worth It in 2026? — EnvelopeBudget (competidor) — envelopebudget.com — ~16‑feb‑2026 — https://envelopebudget.com/blog/ynab-alternative-cheaper/ — Historial de precios. Sesgo comercial.
- [Y14] YNAB Review: Still Paying For It A Decade Later — Turtle Investor — turtleinvestor.net — ~13‑oct‑2026 — https://www.turtleinvestor.net/ynab-review-singapore/ — Uso fuera de EE. UU. y curva de aprendizaje.
- [Y15] YNAB adds a Home screen… is it accessible? — Rachele DiTullio — racheleditullio.com — sep‑2025 — https://racheleditullio.com/blog/2025/09/ynab-adds-a-home-screen-to-its-ios-mobile-app-but-is-it-accessible/ — Home, Hide Amounts, VoiceOver.
- [Y16] YNAB† — PCMag Australia — au.pcmag.com — ~jul‑2024 — https://au.pcmag.com/software/44919/ynab — Subida a US$109.
- [Y17] YNAB Review† — PCMag — pcmag.com — ~jul‑2026 — https://www.pcmag.com/reviews/ynab/ — Curva de aprendizaje.
- [Y18] YNAB review† — USA Today — usatoday.com — 17‑jun‑2026 — https://www.usatoday.com/story/money/personalfinance/budget-and-spending/2026/06/17/ynab-review/90596137007/ — Valoraciones.
- [Y19] YNAB Review 2026† — The Penny Hoarder — thepennyhoarder.com — ~jun‑2026 — https://www.thepennyhoarder.com/budgeting/ynab-review/ — Precio.
- [Y20] YNAB Review 2026† — Investormint — investormint.com — ~31‑oct‑2026 — https://investormint.com/software-tools/ynab-review-2026 — Curva de aprendizaje.
- [Y21] You Need a Budget App Review† — Experian — pcdn.co — ~ene‑2026 — https://s28126.pcdn.co/blogs/ask-experian/you-need-a-budget-app-review/ — Curva y precio.
- [Y22] Centro de ayuda (targets, Age of Money, reconciliación, recurrentes, tarjetas, importación, Apple Wallet, Siri, widgets, Hide Amounts)† — YNAB — support.ynab.com — 2026 — https://support.ynab.com/en_us/age-of-money-H1ZS84W1s ; https://support.ynab.com/en_us/formatting-a-csv-file-an-overview-BJvczkuRq ; https://support.ynab.com/en_us/hide-amounts-ry0jgLaOJg — Detalle de funciones.
- [Y23] Free Zero-Based Budgeting Alternatives† — Aspire Budgeting (competidor) — aspirebudget.com — ~jun‑2026 — https://aspirebudget.com/blog/ynab-too-expensive/ — Historial de precios.
- [Y24] YNAB Review† — Mapped Out Money — mappedoutmoney.com — ~dic‑2024 (contenido antiguo) — https://mappedoutmoney.com/blog/ynab-review — Reportes limitados.
- [Y25] YNAB, la app que salvó mi vida económica† — Ceci de Viaje — cecideviaje.com — ~ago‑2015 — https://www.cecideviaje.com/ynab-la-aplicacion-que-salvo-mi-vida-economica/ — Experiencia en español.
- [Y26] YNAB 4 General Discussions — usuarios — Steam Community — 2022–2026 — https://steamcommunity.com/app/227320/discussions/0/5226999188080655782/ — YNAB 4 todavía en uso.
- [Y27] Reseñas App Store Suiza y Países Bajos† — usuarios — App Store — ~feb‑2025 y ~jun‑2021 — https://apps.apple.com/ch/app/ynab/id1010865877?platform=iphone&see-all=reviews — Quejas por rediseños.

### Fintonic
- [F1] Fintonic | Ahorra y finánciate — Fintonic Servicios Financieros S.L. — App Store España — v10.0.10 del 27‑oct‑2026 — https://apps.apple.com/es/app/fintonic-ahorra-y-fin%C3%A1nciate/id672220319 — Descripción, 4,3 con 26 mil, nota de versión, privacidad, iOS 18. Verificado.
- [F2] Valoraciones y reseñas — usuarios — App Store España — sin fecha — https://apps.apple.com/es/app/fintonic-ahorra-y-fin%C3%A1nciate/id672220319?see-all=reviews — Reseñas destacadas, incluida una de 2021.
- [F3] RSS de reseñas (10 páginas, 500 reseñas) — Apple — itunes.apple.com — 31‑ago‑2024 a 4‑nov‑2026 — https://itunes.apple.com/es/rss/customerreviews/id=672220319/sortBy=mostRecent/json — Estrellas, temas y fechas.
- [F4] Fintonic — Fintonic — Google Play — sin fecha — https://play.google.com/store/apps/details?hl=es&id=com.fintonic — Modelo, condiciones de préstamo.
- [F5] ¿Es Fintonic gratis? — Fintonic — fintonic.com/blog — 6‑may‑2025 — https://www.fintonic.com/blog/es-fintonic-gratis/ — Modelo de negocio.
- [F6] Descubriendo la app de Fintonic: Presupuestos — Fintonic — fintonic.com/blog — ~ago‑2024 — https://www.fintonic.com/blog/descubriendo-la-app-de-fintonic-presupuestos/ — Previsión por categoría e informes.
- [F7] Control y Alertas — Fintonic — fintonic.com — sin fecha — https://www.fintonic.com/es-ES/alertas/ — Alertas.
- [F8] Mis movimientos — Fintonic — fintonic.ladesk.com — sin fecha — https://fintonic.ladesk.com/240230-Mis-movimientos — Dividir, «no computable».
- [F9] Ya he dado las claves de mi banco… — Fintonic — fintonic.ladesk.com — 13‑feb‑2023 — https://fintonic.ladesk.com/066056-Ya-he-dado-las-claves-de-mi-banco-por-qu%C3%A9-debo-darlas-de-nuevo — Renovación PSD2.
- [F10] Cierre de Tarjeta Fintonic — Fintonic — fintonic.ladesk.com — sin fecha — https://fintonic.ladesk.com/297057-Cierre-de-Tarjeta-Fintonic — Tarjeta cerrada en 2023.
- [F11] Fintonic llega a ChatGPT… — Fintonic — fintonic.com/blog — jun‑2026 — https://www.fintonic.com/blog/fintonic-llega-a-chatgpt-la-primera-app-que-evalua-tu-scoring-crediticio-y-simula-prestamos-con-ia/ — App en ChatGPT.
- [F12] Mejora tu salud financiera de la mano de expertos — Fintonic — fintonic.com/blog — ~mar‑2025 — https://www.fintonic.com/blog/programa-salud-financiera-fintonic/ — Programa de coach.
- [F13] Fintonic tiene nuevo CEO… — Roams — roams.es — ~20‑ago‑2026 — https://roams.es/actualidad/finanzas/fintonic-nuevo-ceo-banco-santander-eneko-fonseca/ — CreditBuilder, rentabilidad, salida de Latinoamérica.
- [F14] Fintonic cierra su reestructuración… — Cinco Días — cincodias.elpais.com — 27‑mar‑2025 — https://cincodias.elpais.com/companias/2025-03-27/fintonic-cierra-su-reestructuracion-y-ficha-como-ceo-al-ex-jefe-de-seguros-del-santander-para-su-nueva-etapa.html — «Fintonic 2.0», usuarios.
- [F15] «Nuestro viaje ha terminado»: Fintonic cierra en Chile — Diario Financiero — df.cl — 31‑mar‑2023 — https://www.df.cl/mercados/banca-fintech/nuestro-viaje-ha-terminado-fintech-espanola-fintonic-cierra-sus — Cierre en Chile.
- [F16] Fintonic México: ya no opera — Pablo Padilla — asesoresinversion.com — ~jul‑2026 — https://asesoresinversion.com/academia/finanzas-personales/fintonic-el-app-para-controlar-gastos/ — Estado en México.
- [F17] Foro Fintonic — usuarios — Rankia — 2013–2022 — https://www.rankia.com/foro/fintonic — Spam, seguridad.
- [F18] Mejora tu salud financiera… por 59,70 € — usuario — Rankia — 13‑abr‑2022 — https://www.rankia.com/foros/bancos-cajas/temas/5368255-mejora-salud-financiera-mano-expertos-por-59-70-fintonic — Precio del curso.
- [F19] ¿Opinión SPENDEE? Me voy de Fintonic — usuario — Forocoches — ~28‑feb‑2026 — https://forocoches.com/foro/showthread.php?t=9794112 — Abandono.
- [F20] 11 apps de banca que permiten controlar todos tus gastos — Genbeta — genbeta.com — ~17‑feb‑2023 — https://www.genbeta.com/a-fondo/gestionar-todos-tus-bancos-unico-sitio-11-apps-banca-que-permiten-controlar-todos-tus-gastos — Valoración como agregador.
- [F21] 19 apps… para controlar los gastos — Xataka — xataka.com — ~20‑mar‑2021 — https://www.xataka.com/basics/19-apps-herramientas-programas-para-controlar-gastos-tu-economia-domestica — Comisiones y duplicados.
- [F22] Neolista, Sikayetvar, fintonic.com/prestamos† — varios — sin fecha — https://neolista.com/es/neobancos/fintonic ; https://www.sikayetvar.com/es/fintonic-es/al-usar-fintonic-recibi-spam-de-bancos-asociados-que-nunca-autorice-como-puedo-cancelar-esto-q-21203 — Nota en Google Play (no verificada) y quejas de spam.

### Wallet (BudgetBakers)
- [W1] Wallet – Personal & Family Finance Manager — BudgetBakers — budgetbakers.com — sin fecha — https://budgetbakers.com/en/products/wallet/ — FAQ, plan gratis, multimoneda, Lifetime.
- [W2] Todo sobre Premium — BudgetBakers — support.budgetbakers.com — ~1‑abr‑2026 — https://support.budgetbakers.com/hc/es/articles/7151349344018-Todo-sobre-Premium — Planes, diferencias por plataforma.
- [W3] Wallet by BudgetBakers Review (2026) — Wealthy Pot Editorial — wealthypot.com — 18‑oct‑2026 — https://wealthypot.com/budgeting-apps/wallet-budgetbakers/ — Precios, valoraciones, contras.
- [W4] Wallet by BudgetBakers review — Rachel Wait — Finder UK — oct‑2026 — https://www.finder.com/uk/budgeting/wallet-budgetbakers-review — Gratis frente a Premium, veredicto.
- [W5] Suivi des dépenses — BudgetBakers — budgetbakers.com — sin fecha — https://budgetbakers.com/fr/products/wallet/features/expense-tracking/ — Importación de Apple Pay y Google Pay.
- [W6] Google Pay Sync — BudgetBakers — help.budgetbakers.com — sin fecha — https://help.budgetbakers.com/wallet/a/google-pay-sync-27454807191058 — Países (incluido Costa Rica), permisos, problemas conocidos.
- [W7] Apple Pay Integration — BudgetBakers — help.budgetbakers.com — ~oct‑2026 — https://help.budgetbakers.com/wallet/a/apple-pay-integration-26593713953554 — Flujo con Atajos.
- [W8] Import Apple Pay and Google Pay payments automatically — BudgetBakers (ShareCost) — help.budgetbakers.com — ~oct‑2026 — https://help.budgetbakers.com/sharecost/a/import-apple-pay-and-google-pay-payments — Bandeja, reglas por tarjeta, «import paused», «Verified». Verificado.
- [W9] Adding an Account — BudgetBakers — help.budgetbakers.com — sin fecha — https://help.budgetbakers.com/wallet/a/adding-an-account-34453128217618 — Tipos de cuenta.
- [W10] Automatic Rules — BudgetBakers — help.budgetbakers.com — ~27‑mar‑2026 — https://help.budgetbakers.com/wallet/a/automatic-rules-7149319175826 — Reglas solo para registros bancarios.
- [W11] Using Templates — BudgetBakers — help.budgetbakers.com — ~31‑mar‑2026 — https://help.budgetbakers.com/wallet/a/using-templates-7077050225042 — Plantillas.
- [W12] Setup Budgets — BudgetBakers — help.budgetbakers.com — ~29‑jul‑2026 — https://help.budgetbakers.com/wallet/a/setup-budgets-7076953735314 — Gasto previsto y semáforo.
- [W13] Multiple Currencies & Exchange Rates — BudgetBakers — help.budgetbakers.com — ~27‑mar‑2026 — https://help.budgetbakers.com/wallet/a/multiple-currencies-exchange-rates-7149418777746 — Multimoneda.
- [W14] Import your transactions or files — BudgetBakers — help.budgetbakers.com — ~12‑dic‑2025 — https://help.budgetbakers.com/wallet/a/import-your-transactions-or-files-7077275632274 — Importación solo desde la web.
- [W15] Data not syncing between devices — BudgetBakers — help.budgetbakers.com — ~27‑mar‑2026 — https://help.budgetbakers.com/wallet/a/data-not-syncing-between-devices-7183819864850 — Hay que estar en línea para guardar.
- [W16] What is the Wallet app? — BudgetBakers — help.budgetbakers.com — sin fecha — https://help.budgetbakers.com/wallet/a/what-is-the-wallet-app-12212428113810 — Descripción.
- [W17] Bank Sync — BudgetBakers — budgetbakers.com — sin fecha — https://budgetbakers.com/en/products/wallet/features/bank-sync/ — Sincronización diaria, PSD2.
- [W18] Wallet Features — BudgetBakers — budgetbakers.com — sin fecha — https://budgetbakers.com/en/products/wallet/features/ — Funciones.
- [W19] MCP Integration — BudgetBakers — budgetbakers.com — sin fecha — https://budgetbakers.com/en/products/wallet/integrations/mcp/ — API y MCP.
- [W20] Wallet: Budget Expense Tracker — BudgetBakers — Google Play — consultado el 6‑nov‑2026 — https://play.google.com/store/apps/details?id=com.droid4you.application.wallet&hl=en — Funciones.
- [W21] Wallet (ficha EE. UU.) — BudgetBakers s.r.o. — App Store — v5.7.5 del 15‑oct — https://apps.apple.com/us/app/wallet-budget-expense-tracker/id1032467659 — Precios, 4,6 con 5,9 mil.
- [W22] Reseñas EE. UU. — usuarios — App Store — sin fecha — https://apps.apple.com/us/app/wallet-budget-expense-tracker/id1032467659?see-all=reviews — Elogios y quejas.
- [W23] Reseñas Reino Unido — usuarios — App Store — sin fecha — https://apps.apple.com/gb/app/wallet-budget-expense-tracker/id1032467659?see-all=reviews — Elogios y quejas.
- [W24] Reseñas Costa Rica — usuarios y desarrollador — App Store — sin fecha — https://apps.apple.com/cr/app/wallet-budget-expense-tracker/id1032467659?see-all=reviews — 4,8 con 487, BAC no soportado.
- [W25] Flaws in Budgetbaker's Wallet — 7gorn — Medium — 29‑nov‑2020 — https://7gorn.medium.com/flaws-in-budgetbakers-wallet-c185a3fb8f5 — Críticas a estadísticas y presupuestos (antiguo).
- [W26] Trustpilot budgetbakers.com† — usuarios — Trustpilot — ~jul‑2026 — https://ca.trustpilot.com/review/budgetbakers.com — Sincronización bancaria.
- [W27] Cambiare la valuta principale y otros artículos de ayuda† — BudgetBakers — support.budgetbakers.com — ~mar‑2026 — https://support.budgetbakers.com/hc/it/articles/9663226850706 — La moneda base no se puede cambiar.
- [W28] Wallet by BudgetBakers app review: best app for expats?† — USA Today — usatoday.com — 26‑jul‑2026 — https://www.usatoday.com/story/money/personalfinance/budget-and-spending/2026/07/26/wallet-by-budgetbakers-review/91042751007/ — Público expatriado.

### Monefy
- [Mo1] Budget & Track Your Money — Monefy — monefy.com — sin fecha — https://www.monefy.com/ — Cifras de marketing, «dos toques».
- [Mo2] Monefy: Bills & Money Tracker — Reflective Technologies ApS — App Store EE. UU. — v1.10.11 del 30‑oct‑2026 — https://apps.apple.com/us/app/monefy-bills-money-tracker/id1212024409 — Vendedor, precio, 4,7 con 6,8 mil.
- [Mo3] Monefy: Money & Budget App — Reflective Technologies — Google Play — sin fecha — https://play.google.com/store/apps/details?id=com.monefy.app.lite&hl=en_US — Descripción.
- [Mo4] Help Center (FAQ) — Monefy — monefy.com — sin fecha — https://www.monefy.com/faq — Flujos, presupuesto, monedas, sincronización, PIN.
- [Mo5] Terms of Service — Reflective Technologies ApS — monefy.com — sin fecha — https://www.monefy.com/terms-of-service — Propietario y modelos de pago.
- [Mo6] Reflective Apps — Reflective Apps — reflectiveapps.com — sin fecha — https://www.reflectiveapps.com/ — Estudio que adquiere apps.
- [Mo7] Ratings & Reviews (EE. UU.) — usuarios — App Store — sin fecha — https://apps.apple.com/us/app/monefy-bills-money-tracker/id1212024409?see-all=reviews — Elogios, anuncios, arranque sin conexión.
- [Mo8] Valoraciones y reseñas (España) — usuarios — App Store — sin fecha — https://apps.apple.com/es/app/monefy-control-de-gastos/id1212024409?see-all=reviews — Pro perdido, promoción.
- [Mo9] Monefy Reviews (2026) — JustUseApp — justuseapp.com — 2026 — https://justuseapp.com/en/app/1212024409/monefy-money-tracker/reviews — Precios reportados.
- [Mo10] Ratings & Reviews (Reino Unido) — usuarios — App Store — sin fecha — https://apps.apple.com/gb/app/monefy-money-tracker/id1212024409?see-all=reviews — Presupuesto diario, tipo de cambio.
- [Mo11] Monefy – Budget & Expenses app — AppCompare — appcompare.net — sin fecha — https://monefy-budget-expenses-app.appcompare.net/ — Datos generales. Fiabilidad baja.
- [Mo12] Monefy for Android — AppBrain — appbrain.com — datos del 4‑nov‑2026 — https://www.appbrain.com/app/monefy-budget-expenses-app/com.monefy.app.lite — 3,98 con 190.525, reseñas con fecha.
- [Mo13] Calificaciones y reseñas (México) — usuarios — App Store — sin fecha — https://apps.apple.com/mx/app/monefy-budget-planner/id1212024409?see-all=reviews — Cancelación, promociones, pérdida de datos.
- [Mo14] Monefy (About) — AlternativeTo — alternativeto.net — sin fecha — https://alternativeto.net/software/monefy--expense-manager/about/ — Desarrollador anterior.
- [Mo15] Back to basics for expense tracking — The Edge Malaysia — theedgemalaysia.com — 15‑oct‑2018 — https://theedgemalaysia.com/article/back-basics-expense-tracking — Flujo de tocar la categoría.
- [Mo16] Monefy - Budget Planner (Costa Rica) — Reflective Technologies ApS — App Store CR — v1.10.11 — https://apps.apple.com/cr/app/monefy-budget-planner/id1212024409 — 4,8 con 426, precios.
- [Mo17] Personal Finance Apps: Features That Matter Most — Monefy (blog) — monefy.com — sin fecha — https://www.monefy.com/article/personal-finance-apps-features-that-matter-most — Contradicciones con la FAQ.
- [Mo18] Reflectly Monefy Pro review — CHOICE — choice.com.au — sin fecha — https://www.choice.com.au/products/money/financial-planning-and-investing/creating-a-budget/reflectly-monefy-pro — Ficha técnica.
- [Mo19] Mejores apps para controlar gastos en España 2026 — Gestionia — gestionia.net — 2026 — https://gestionia.net/mejores-apps-controlar-gastos-espana-2026 — Monefy como opción manual.
- [Mo20] Monefy (appdir) y apps de nombre parecido — varios — sin fecha — https://monefy.appdir.co/ ; https://apps.apple.com/br/app/monefy/id6451156972 — Ambigüedad de nombre.
- [Mo21] Charges and inability to cancel the subscription — Apple Discussions — discussions.apple.com — 2021 — https://discussions.apple.com/thread/252893102 — No se confirmó que sea de Monefy.

### MonAi
- [M1] Finanzas personales - MonAi — Florian Vates — App Store España — v1.10.3 del 28 oct — https://apps.apple.com/es/app/finanzas-personales-monai/id6447112647 — Descripción, privacidad, precios en EUR.
- [M2] Finanzas personales - MonAi — Florian Vates — App Store Costa Rica — sin fecha — https://apps.apple.com/cr/app/finanzas-personales-monai/id6447112647 — Precios en USD, 4,8 con 215.
- [M3] Expense Tracker - MonAi — Florian Vates — App Store EE. UU. — sin fecha — https://apps.apple.com/us/app/expense-tracker-monai/id6447112647 — 4,8 con 891.
- [M4] Reseñas EE. UU. — usuarios — App Store — sin fecha — https://apps.apple.com/us/app/expense-tracker-monai/id6447112647?platform=iphone&see-all=reviews — Voz, atajos, fallos.
- [M5] Reseñas Chile — usuarios — App Store — sin fecha — https://apps.apple.com/cl/app/finanzas-personales-monai/id6447112647?platform=iphone&see-all=reviews — Muro de pago.
- [M6] Reseñas España — usuarios — App Store — sin fecha — https://apps.apple.com/es/app/finanzas-personales-monai/id6447112647?platform=iphone&see-all=reviews — Precio, «antes era gratis».
- [M7] Reseñas Colombia — usuarios — App Store — sin fecha — https://apps.apple.com/co/app/finanzas-personales-monai/id6447112647?platform=iphone&see-all=reviews — COP y USD, prueba, 12 meses.
- [M8] Reseñas México — usuarios — App Store — sin fecha — https://apps.apple.com/mx/app/finanzas-personales-monai/id6447112647?platform=iphone&see-all=reviews — Compromiso anual, compras a meses.
- [M9] Reseñas Costa Rica — usuarios — App Store — sin fecha — https://apps.apple.com/cr/app/finanzas-personales-monai/id6447112647?platform=iphone&see-all=reviews — Uso en el hogar, error de Atajos, conciliación.
- [M10] Reseñas Ecuador — usuarios y desarrollador — App Store — sin fecha — https://apps.apple.com/ec/app/finanzas-personales-monai/id6447112647?platform=ipad&see-all=reviews — «No tiene versión gratuita».
- [M11] Finanzas personales - MonAi — Florian Vates — Google Play — sin fecha — https://play.google.com/store/apps/details?hl=es_CR&id=app.getmonai.android — Descripción.
- [M12] MonAi – See your spending clearly — Florian Vates — get-monai.app — sin fecha — https://get-monai.app/ — Funciones, equipo, testimonios.
- [M13] MonAi – Frequently Asked Questions — Florian Vates — get-monai.app — sin fecha, consultado el 6‑nov‑2026 — https://get-monai.app/faq — Automatización, monedas, rollover, problemas conocidos. Verificado.
- [M14] MonAi – Legal (términos y privacidad) — Florian Vates — get-monai.app — 16‑sep‑2026 — https://www.get-monai.app/terms — Niveles, créditos de IA, proveedores de IA y datos enviados.
- [M15] MonAi: AI powered expense tracker — Product Hunt — producthunt.com — sin fecha — https://www.producthunt.com/products/monai-2 — Solo el lema.
- [M16] MonAi: la app que reinventa el seguimiento de gastos — EducaColombia — educacolombia.com — sin fecha — https://educacolombia.com/noticias/monai-app-gestion-dinero — Creador de contenido.
- [M17] MonAI: registra gastos y controla tu dinero — adonde.com — adonde.com — 23‑sep‑2026 — https://adonde.com/ia/app/monai/ — Resumen. Poco fiable.
- [M18] app.getmonai.android† — Sensor Tower — sensortower.com — sin fecha — https://app.sensortower.com/overview/app.getmonai.android — Estimación de descargas.
- [M19] Control de gastos - Mona AI — Google Play — sin fecha — https://play.google.com/store/apps/details?id=ai.moneytracker.app&hl=es — Candidata descartada.

### Goin
- [G1] Goin, la «fintech» catalana que desafió a la banca, acaba suspendida — Crónica Global — cronicaglobal.elespanol.com — 9‑ago‑2026 — https://cronicaglobal.elespanol.com/business/20260809/goin-fintech-catalana-desafio-banca-acaba-suspendida/1003742785272_0.html — Suspensión, finanzas, versión de Goin. Verificado.
- [G1b] David Riudor (opinión) — Crónica Global — cronicaglobal.elespanol.com — 10‑ago‑2026 — https://cronicaglobal.elespanol.com/examen-protagonistas/20260810/david-riudor/1003742785636_0.html — Valoración crítica.
- [G2] Goin suspendida: Banco de España corta fintech catalana… — El Ecosistema Startup — ecosistemastartup.com — 9‑ago‑2026 — https://ecosistemastartup.com/goin-suspendida-banco-de-espana-corta-fintech-catalana-con-perdidas-de-10m/ — Repite G1; no es independiente.
- [G3] Goin — Goin — goin.app — sin fecha — https://www.goin.app/ — Entidades reguladas.
- [G4] Centro de ayuda — Goin — faqs.goin.app — sin fecha — https://faqs.goin.app/es/ — Colecciones.
- [G5] Goin: Ahorro. Compras. Premios — Prakma Innovation SL — App Store España — v8.44.0 del 15 oct — https://apps.apple.com/es/app/goin-ahorrar-e-invertir/id1297902849 — Descripción, Pro 1,33 €, 4,6 con 11 mil, privacidad.
- [G6] ¿Por qué mi banco no está sincronizado? — Goin — faqs.goin.app — ~20‑oct‑2026 — https://faqs.goin.app/es/articles/15923938-por-que-mi-banco-no-esta-sincronizado — Ahorro automático desactivado. Verificado.
- [G7] ¿Cómo puedo desconectar mi cuenta bancaria de Goin? — Goin — faqs.goin.app — ~20‑oct‑2026 — https://faqs.goin.app/es/articles/9844278-como-puedo-desconectar-mi-cuenta-bancaria-de-goin — Confirma la desactivación.
- [G8] Goin — Goin — Google Play — sin fecha — https://play.google.com/store/apps/details?hl=es&id=one.goin.mobile.android — Descripción.
- [G9] No puedo retirar mis ahorros — Goin — faqs.goin.app — ~2024 — https://faqs.goin.app/es/articles/9844292-no-puedo-retirar-mis-ahorros — Requisitos para retirar.
- [G10] Tu cuenta — Goin — faqs.goin.app — sin fecha — https://faqs.goin.app/es/collections/10391856-tu-cuenta — Tasa por inactividad.
- [G11] Qué es EURc — Goin — faqs.goin.app — ~13‑mar‑2026 — https://faqs.goin.app/es/articles/14038831-que-es-eurc — Stablecoin.
- [G12] No puedo acceder a la app — Goin — faqs.goin.app — ~oct‑2026 — https://faqs.goin.app/es/articles/9844314-no-puedo-acceder-a-la-app — Soporte.
- [G13] Cashback† — Goin — faqs.goin.app — sin fecha — https://faqs.goin.app/es/collections/10391867-cashback — Limitaciones del cashback.
- [G14] Goin y huchas virtuales — Android Ayuda — androidayuda.com — 4‑dic‑2025 (contenido antiguo) — https://androidayuda.com/ahorra-sin-darte-cuenta-con-goin/ — Métodos de ahorro y objetivos.
- [G15] Reclamación por eliminación de transferencias SEPA gratuitas (y respuesta de Goin) — usuario y soporte de Goin — ocu.org — 12‑jun‑2025 — https://www.ocu.org/reclamar/lista-reclamaciones-publicas/reclamaci-C3-B3n-por-eliminaci-C3-B3n-ab/81717be2d96cef161b — Una retirada gratis al mes.
- [G16] Opiniones Goin — Roams — roams.es — sin fecha clara — https://roams.es/finanzas/entidades-financieras/goin/ — Métodos, comisiones de cripto, quejas.
- [G17] ¿Es seguro ahorrar con Goin app? — Via Kaizen — viakaizen.com — ~feb‑2022 — https://viakaizen.com/goin-app-ahorro-automatico/ — Modelo de negocio.
- [G18] ¿Cómo ahorrar dinero con la Goin App? — Mi Solvencia — misolvencia.es — ~ago‑2021 — https://misolvencia.es/como-ahorrar-dinero-goin-opiniones — Retención, «Ahorra jugando», cargo diario agrupado.
- [G19] Goin in 2026: Pricing, Plans and Alternatives — Laptops251 — laptops251.com — leído el 30‑sep‑2026 — https://laptops251.com/programs/goin/ — Pro, inactividad (agregador).
- [G20] Goin App — Wikipedia — es.wikipedia.org — sin fecha — https://es.wikipedia.org/wiki/Goin_App — Historia, KernelPay.
- [G21] Goin, la app que llegó al número 1 de la App Store en España† — WWWhat's new — wwwhatsnew.com — 30‑may‑2018 — https://wwwhatsnew.com/2018/05/30/goin-la-app-que-llego-al-numero-1-de-la-app-store-en-espana/ — Historia.
- [G22] GOin (Francia) — GOin — goin-invest.com — sin fecha — https://goin-invest.com/ — Ambigüedad de nombre.
- [G23] Goin' – Connecting Students — Goin' — goinconnect.com — sin fecha — https://goinconnect.com/ — Ambigüedad de nombre.
- [G24] Goin me retira toda mi inversión de roboadvisor† — usuario — Forocoches — 30‑jun‑2022 — https://forocoches.com/foro/index.php/showthread.php?p=432883822 — Cierre del roboadvisor.
- [G25] ¿Alguien puede contar su experiencia sobre GOIN? — usuarios — Rankia — 2021–2023 — https://www.rankia.com/foros/bancos-cajas/temas/4937545-alguien-puede-contar-experiencia-goin — Experiencias y riesgo de custodia.
- [G26] Opiniones y dudas sobre la app Goin† — usuarios — foro de Balio — 2020–2021 — https://foro.balio.app/t/opiniones-y-dudas-sobre-la-app-goin/772 — Uso real.
- [G27] Prisma Payments EP SA† — Empresite / elEconomista — empresite.eleconomista.es — sin fecha — https://empresite.eleconomista.es/EASY-REMITTANCE.html — Posible cambio de nombre de la entidad de pago.
- [G28] No me ingresas el dinero de mi cuenta — usuario — ocu.org — ~22‑abr‑2026 — https://www.ocu.org/reclamar/lista-reclamaciones-publicas/no-me-ingresas-el-dinero-de-mi/0018ddfe5c23435582 — Retirada retenida.
- [G29] Las mejores aplicaciones para ahorrar dinero: ahorro por redondeo — Finect (AsunInfante) — finect.com — ~27‑oct‑2026 — https://www.finect.com/usuario/AsunInfante/articulos/aplicaciones-ahorro-redondeo-microahorro — El redondeo en bancos y neobancos.
- [G30] Problemas de Goin — JustUseApp — justuseapp.com — 2025–2026 — https://justuseapp.com/fr/app/1297902849/goin-save-invest-achieve/problems — Pocos reportes.

### eXpend («Expende»)
- [E1] eXpend: Make Budgeting a Habit — Keith Gabriel Badulis — App Store EE. UU. — v1.15.23, ~3‑nov‑2026 — https://apps.apple.com/us/app/id6747117634 — Descripción, US$4,99, 4,7 con 13, privacidad.
- [E2] Ratings & Reviews (EE. UU.) — usuarios y desarrollador — App Store — sin fecha — https://apps.apple.com/us/app/6747117634?platform=iphone&see-all=reviews — Elogios y pedidos.
- [E3] Ratings & Reviews (Filipinas) — usuarios — App Store — sin fecha — https://apps.apple.com/ph/app/6747117634?platform=iphone&see-all=reviews — Reembolso rápido, metas vinculadas.
- [E4] Valutazioni e recensioni (Italia) — usuarios — App Store — sin fecha — https://apps.apple.com/it/app/6747117634?platform=iphone&see-all=reviews — Respaldo en iCloud, pago único.
- [E5] eXpend (España, en‑GB) — Keith Gabriel Badulis — App Store — consultado el 6‑nov‑2026 — https://apps.apple.com/es/app/expend-make-budgeting-a-habit/id6747117634?l=en-GB — 5,99 €, comerciante individual en Manila.
- [E6] Reseñas Reino Unido y Australia — App Store — sin fecha — https://apps.apple.com/gb/app/6747117634?platform=iphone&see-all=reviews — Sin valoraciones suficientes.
- [E7] eXpend — subdial — Google Play (en) — sin fecha — https://play.google.com/store/apps/details?id=com.subdial.expend&hl=en — Funciones, Premium.
- [E8] eXpend: Presupuesto un hábito — subdial — Google Play (es_MX) — sin fecha — https://play.google.com/store/apps/details?id=com.subdial.expend&hl=es_MX — Ficha en español.
- [E9] eXpend for Android — AppBrain — appbrain.com — 6‑nov‑2026 — https://www.appbrain.com/app/expend-make-budgeting-a-habit/com.subdial.expend — 4,50 con unas 620, reseñas con fecha.
- [E10] Make Budgeting a Habit (historial de versiones) — Soft112 — soft112.com — 2‑nov‑2026 — https://expend-make-budgeting-a-habit.soft112.com/ — Notas de versión de junio a octubre de 2026.
- [E11] eXpend — UpdateStar — updatestar.com — fecha ambigua — https://expend-make-budgeting-a-habit.updatestar.com/ — Idiomas «experimentales».
- [E12] eXpend — MWM — mwm.ai — sin fecha — https://mwm.ai/apps/expend-make-budgeting-a-habit/6747117634 — Lanzamiento en iOS.
- [E13] Expendee: Budget Collaboration — Sze Kwok Cheung — App Store — v1.01, 29‑may‑2023 — https://apps.apple.com/us/app/expendee-budget-collaboration/id6447471409 — Candidata descartada.
- [E14] Expend: Effortless Expenses† — Expend (Reino Unido) — App Store y expend.com — sin fecha — https://apps.apple.com/us/app/expend-effortless-expenses/id1235576771 — Candidata descartada (B2B).
- [E15] Expendo† — naexo — Google Play — sin fecha — https://play.google.com/store/apps/details?id=com.naexo.expendo — Candidata alternativa.
- [E16] Expendy: Voice Expense Tracker† — App Store — sin fecha — https://apps.apple.com/us/app/expendy-voice-expense-tracker/id6759892984 — Candidata alternativa.
