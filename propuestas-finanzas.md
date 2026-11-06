# Propuestas para Finanzas

**Fecha:** 6 de noviembre de 2026.
**Origen:** la investigación competitiva de `investigacion-competitiva-apps-finanzas.md`, que compara YNAB, Fintonic, Wallet (BudgetBakers), Monefy, MonAi, Goin y eXpend. Ese documento tiene la evidencia completa y las fuentes; aquí van solo las propuestas y cómo hacerlas.
**Estado:** son propuestas, no tareas aprobadas. Ninguna está implementada.

Cada propuesta indica:
- el **problema** que resuelve;
- la **evidencia** que la motiva (con las referencias del documento de investigación, como [W8] o [M13]);
- **cómo hacerla** en el código actual;
- el **esfuerzo**: S pequeño, M medio, L grande;
- qué hay que **validar antes**.

Las reglas del proyecto (`CLAUDE.md`) aplican a todas:
- montos en céntimos;
- fechas en hora de Costa Rica;
- ningún texto escrito en los componentes: todo va en `src/i18n/locales/es` y `en`;
- colores solo con variables del tema;
- los datos solo pasan por los hooks de `queries.ts`;
- si cambia el esquema, se actualizan las dos implementaciones de `Api` (`api.ts` y `demoApi.ts`) y `types.ts`;
- las tablas nuevas llevan RLS, `require_mfa` y el trigger `enforce_same_owner`.

---

## Lo más importante de la investigación

1. **La captura automática de Finanzas ya es el estándar cuando no hay conexión con el banco.** Wallet y MonAi usan la misma automatización «Transacción» de Atajos para Apple Pay, y leen notificaciones en Android [W7, M13]. Sus usuarios no piden la función: se quejan de que **deja de funcionar sin aviso**. MonAi tiene quejas así en 5 tiendas, y su FAQ reconoce un error de Apple [M4–M10, M13].
2. **Lo más elogiado en las apps de registro manual es registrar rápido.** En Monefy son más de 10 reseñas en 5 tiendas y 3 medios.
3. **La confianza se pierde por cómo gana dinero la app.**
   - Fintonic convirtió su inicio en un escaparate de puntuación crediticia y préstamos: 65 de 120 reseñas escritas desde el 20‑ago‑2026 hablan de eso [F3].
   - MonAi tiene un muro de pago (unas 14 reseñas en 5 tiendas).
   - A YNAB le critican el precio (7 fuentes).
4. **Donde hay conexión bancaria, es la fuente principal de quejas.** Goin perdió su función central cuando se cayó su conexión [G6].
5. **Se valoran los presupuestos que anticipan.** Wallet muestra el gasto previsto del mes [W12], y los usuarios de Fintonic lamentan haber perdido su previsión (13 reseñas) [F3].

---

## Resumen de propuestas

| # | Propuesta | Esfuerzo | ¿Toca la base? |
|---|---|---|---|
| P1 | Último pago automático y aviso si deja de llegar | S | No |
| P2 | Confirmar que la configuración de la captura funciona | S | No |
| P3 | Aprender la tarjeta al revisar un pendiente | S | No |
| P4 | Revisar pendientes en serie y en lote | S | No |
| M1 | Fijos que terminan (cuotas, tasa cero) | M | Sí (columna nueva) |
| M2 | Unir el gasto manual con el que llega automático | M | Sí (columna nueva) |
| M3 | Favoritos de un toque | M | No |
| M4 | Proyección del mes en el Resumen | M | No |
| M5 | Metas para gastos anuales | M | Sí (tabla nueva) |
| M6 | Recordatorios locales | M | No (solo app nativa) |
| L1 | Gastos desde SMS o correos del banco en iPhone | L | No (reusa el endpoint) |
| L2 | Importar estados de cuenta en CSV | L | Posiblemente |
| L3 | Cuentas en dólares | L | Sí (alcance grande) |
| L4 | Widgets nativos | L | No |

**Orden sugerido para empezar:** P1, P2 y P3. Son pequeñas, no tocan la base y atacan la queja más repetida en la competencia: que la captura automática falla en silencio.

---

## Propuestas pequeñas

### P1. «Último pago automático» y aviso si deja de llegar

- **Problema:** si el Atajo de iOS o MacroDroid dejan de funcionar, la persona no se entera hasta que nota que faltan gastos. Eso rompe el principio «lo automático le gana a lo manual».
- **Evidencia:**
  - ShareCost, de la misma empresa que Wallet, muestra «Verified — a payment was captured on…» y «Transaction import paused» [W8].
  - MonAi tiene quejas de captura fallida en 5 tiendas [M4–M10].
  - La ayuda de Wallet lista fallos por permisos y batería [W6].
- **Qué se ve:**
  - Junto a la tarjeta de pendientes del Resumen y en Ajustes → Wallet: «Último pago automático: hace 3 h».
  - Si pasan varios días sin pagos cuando antes llegaban seguido: «No llegan pagos automáticos desde hace 4 días. Revisa la configuración», con enlace a la guía.
- **Cómo hacerlo:**
  1. Agregar `lastWalletPayment(): Promise<string | null>` a la interfaz `Api` (`src/lib/data/api.ts`).
     - Supabase: `transactions` con `source = 'wallet'`, ordenado por `created_at desc`, `limit 1`.
     - Demo: lo mismo en `demoApi.ts`.
  2. Hook `useLastWalletPayment()` en `queries.ts`. Funciona sin conexión gracias a la caché persistida.
  3. Para decidir el aviso, calcular la separación típica entre pagos automáticos de los últimos 30 días. Avisar si el tiempo sin pagos supera 3 veces esa separación, y nunca antes de 3 días. Mejor en una función pura con pruebas, por ejemplo en `src/lib/finance/`.
  4. Mostrarlo en `HomePage.tsx`, cerca de `PendingCard`, y en `WalletPage.tsx`. El dato de `api_tokens.last_used_at` ya aparece en Ajustes.
  5. Textos en `locales/es/wallet.ts` y `locales/en/wallet.ts`.
- **Esfuerzo:** S.
- **Validar antes:** cada cuánto le falla el Atajo a la dueña, y qué umbral evita avisos falsos en semanas en que paga en efectivo.

### P2. Confirmar que la configuración funciona

- **Problema:** configurar Atajos o MacroDroid tiene pasos fáciles de olvidar.
  - En iPhone, el teléfono debe estar desbloqueado en el primer pago para aceptar «Permitir siempre» [M13].
  - En Android, el ahorro de batería y el permiso de notificaciones pueden detener la captura [W6].
- **Evidencia:** la FAQ de MonAi [M13], la ayuda de Google Pay Sync [W6] y el flujo de ShareCost [W8].
- **Qué se ve:** al final de cada guía de Ajustes → Wallet aparece «Esperando tu primer pago…», que cambia a «Listo: llegó ₡X en Y». Además, una lista de verificación por sistema.
- **Cómo hacerlo:**
  - En `WalletPage.tsx`, mientras la pantalla está abierta, consultar cada pocos segundos el hook de P1 (`refetchInterval` de React Query), o vigilar si cambia `last_used_at` del token.
  - Agregar la lista de verificación a las guías que ya existen (`Disclosure` y `NumberedSteps`).
- **Esfuerzo:** S. Depende de P1.
- **Validar antes:** que el aviso «Permitir siempre» siga existiendo en la versión actual de iOS.

### P3. Aprender la tarjeta al revisar un pendiente

- **Problema:** un pago de una tarjeta que Finanzas no reconoce cae en la primera tarjeta (`ingest.ts`) y queda por revisar. Mientras tanto mueve el saldo de esa tarjeta, porque `account_balances` cuenta también los pendientes.
- **Evidencia:** ShareCost pregunta con cada tarjeta nueva «Always add to… / Ignore this card / Not now» [W8].
- **Qué se ve:** al confirmar el pendiente en otra cuenta, un interruptor «Guardar "Visa •••• 1234" en esta cuenta», para que los próximos pagos de esa tarjeta lleguen solos.
- **Cómo hacerlo:**
  - En `TransactionSheet.tsx`, sacar el texto de la tarjeta de `note`, que tiene la forma «Wallet · …» o «Notificación · …».
  - Si no coincide con el `wallet_name` ni el `last4` de la cuenta elegida, mostrar el interruptor.
  - Al guardar, llamar `useSaveAccount()` con `{ id, wallet_name }`, o con `last4` si el texto termina en 4 dígitos.
  - No cambia el esquema.
  - «Ignorar esta tarjeta» queda para después: requiere una regla en el servidor.
- **Esfuerzo:** S.
- **Validar antes:** cuántas tarjetas usa la dueña en Wallet y si sus nombres cambian.

### P4. Revisar pendientes en serie y en lote

- **Problema:** con varios pendientes, revisarlos uno por uno toma tiempo. En YNAB, cuando se acumulan pendientes la gente deja de abrir la app [Y6, Y11, Y12].
- **Evidencia:** el Card Mode de YNAB [Y2] (deslizar para aprobar o posponer, con deshacer) y la selección múltiple de ShareCost [W8]. Las dos son funciones oficiales; no hay reseñas de usuarios de Finanzas.
- **Qué se ve:**
  - Al confirmar un pendiente, se abre el siguiente.
  - En Movimientos con el filtro «Revisar», un botón «Confirmar los que ya tienen categoría», con «Deshacer» en el aviso.
- **Cómo hacerlo:**
  - En `src/features/transactions/editor.tsx`, al cerrar la hoja de un pendiente confirmado, abrir el siguiente de `usePendingReview()`.
  - La confirmación en lote llama `useSaveTransaction()` por cada uno con `status: 'confirmada'`. Esas escrituras ya funcionan sin conexión (`offline.ts`).
  - Para deshacer, guardar las filas anteriores y volver a escribirlas.
- **Esfuerzo:** S.
- **Validar antes:** cuántos pendientes se acumulan en una semana típica.

---

## Propuestas medianas

### M1. Fijos que terminan (compras a cuotas, tasa cero)

- **Problema:** las compras a cuotas son fijos que terminan. Hoy hay que pausarlos o borrarlos a mano.
- **Evidencia:** eXpend permite terminar un fijo tras N repeticiones [E10]. En MonAi piden la fecha de fin y compras a cuotas «con/sin interés» [M8, M12].
- **Cómo hacerlo:**
  1. Una migración nueva en `supabase/migrations/` con una columna `end_date date` o `remaining smallint` en `recurring`, con su check.
  2. `dueDates()` en `src/lib/finance/recurring.ts` deja de generar fechas después del final. Al terminar, `applyRecurring` marca el fijo como `active = false`.
  3. Un campo «Termina» en `RecurringPage.tsx`, con «nunca», «después de N cobros» o «el día X».
  4. Actualizar `types.ts`, el `select` de `listRecurring` en `api.ts` y `demoApi.ts`.
  5. Pruebas en `recurring.test.ts` y en `supabase/tests/recurring.test.ts`.
- **Esfuerzo:** S‑M.
- **Validar antes:** si la dueña tiene compras a cuotas activas.

### M2. Unir el gasto manual con el que llega automático

- **Problema:** si se anota un gasto a mano y después llega el mismo pago de Wallet o de una notificación, queda contado dos veces. Lo mismo pasa con un fijo y su cobro real.
- **Evidencia:**
  - YNAB empareja recurrentes con lo importado [Y22].
  - Fintonic avisa de cargos duplicados [F7].
  - Wallet documenta duplicados al combinar fuentes [W6].
  - En las tres hay quejas de duplicados, aunque ligadas a la conexión bancaria.
- **Qué se ve:** el pago automático queda por revisar con la pregunta «¿Es el mismo que "Súper ₡12.500" de ayer?», y dos botones:
  - **«Unir»:** borra el nuevo y pasa el comercio y la tarjeta al manual.
  - **«Son distintos»:** lo confirma como un gasto aparte.
- **Cómo hacerlo:**
  1. Una migración con la columna `possible_duplicate_of uuid` en `transactions`, que apunta a otro movimiento del mismo usuario (validado por `enforce_same_owner`) con `on delete set null`.
  2. En `supabase/functions/_shared/ingest.ts`, después de la revisión de duplicados actual, buscar un movimiento con `source <> 'wallet'`, mismo monto, mismo usuario y `occurred_at` en ±2 días. Si existe, insertar el pago como `por_revisar` con `possible_duplicate_of`.
  3. En `TransactionSheet.tsx`, mostrar la pregunta cuando el pendiente tenga `possible_duplicate_of`. «Unir» usa `useDeleteTransaction` y `useSaveTransaction`.
  4. Pruebas en `supabase/tests/webhook.test.ts`, y actualizar `types.ts`, `api.ts` y `demoApi.ts`.
- **Esfuerzo:** M.
- **Validar antes:** si la dueña anota a mano pagos que luego llegan solos, y cada cuánto.

### M3. Favoritos de un toque

- **Problema:** muchos gastos manuales se repiten (bus, café, soda, parqueo) y hay que escribirlos completos cada vez.
- **Evidencia:** eXpend [E1] y Wallet [W11] tienen plantillas. La rapidez de registro es el elogio más fuerte de Monefy.
- **Qué se ve:** en la hoja de gasto nuevo, una fila de 4 a 6 botones con los gastos más repetidos («Bus ₡600», «Café ₡1.800»). Tocar uno rellena comercio, categoría, cuenta y monto.
- **Cómo hacerlo:**
  - Primera versión sin base de datos: una función pura en `src/lib/finance/` que agrupe los gastos manuales de los últimos 90 días por comercio, categoría y cuenta, ordenados por frecuencia, y sugiera el monto si casi siempre es el mismo. Con pruebas.
  - Mostrarla en `TransactionSheet.tsx` solo para gastos nuevos (`!tx`).
  - Si después se quieren favoritos fijados a mano, se pueden guardar en `user_settings.prefs` (tiene un límite de 8 KB) sin migración, agregándolos a `normalizePrefs`.
  - Más adelante, un acceso directo `?agregar&favorito=…` para la pantalla de inicio o un Atajo. `editor.tsx` ya abre la hoja con `?agregar`.
- **Esfuerzo:** M.
- **Validar antes:** cuántos gastos manuales de la dueña comparten comercio y monto.

### M4. Proyección del mes en el Resumen

- **Problema:** el Resumen dice cuánto se gastó, pero no hacia dónde va el mes.
- **Evidencia:**
  - Wallet calcula el gasto previsto con semáforo [W12].
  - En Fintonic, 13 reseñas lamentan haber perdido la previsión [F3].
  - En Monefy critican que el presupuesto diario no se ajuste con lo gastado (4 reseñas) [Mo10].
- **Qué se ve:**
  - Una cuarta opción para la cifra de la tarjeta del Resumen: **«Proyección del mes»**.
  - Una línea debajo: «Puedes gastar ₡X por día hasta fin de mes».
  - Usa la regla de color del presupuesto que ya existe (`budgetTone`).
- **Cómo hacerlo:**
  1. Función `forecastMonth()` en `src/lib/finance/stats.ts`. La proyección es lo gastado + los fijos de gasto que faltan este mes (de `useRecurring`) + el ritmo diario × los días restantes. Que permita excluir gastos excepcionales del ritmo, por ejemplo usando la mediana diaria en vez del promedio. Con pruebas en `stats.test.ts`.
  2. Agregar `'proyeccion'` a `CARD_FIGURES` en `src/lib/prefs/prefs.ts` y aceptarlo en `normalizePrefs`. No necesita migración.
  3. La opción en `HomeLayoutPage.tsx` y el cálculo en `HomePage.tsx`.
  4. Textos en `locales/es/home.ts`, `appearance.ts` y en inglés.
- **Esfuerzo:** M. Todo en el teléfono y funciona sin conexión.
- **Validar antes:** que la dueña entienda la cifra sin explicación, y qué método de ritmo da menos sorpresas.

### M5. Metas para gastos anuales

- **Problema:** el marchamo, la RTV, los seguros, la matrícula o diciembre llegan de golpe.
- **Evidencia:**
  - Los objetivos de YNAB convierten un monto anual en una cuota mensual [Y22] y los usuarios dicen que les cambia los hábitos.
  - Los objetivos de Goin tienen 4 fuentes que elogian «ahorrar sin darse cuenta» [G5, G16, G25, G26].
  - eXpend y Wallet también tienen metas.
- **Qué se ve:** una meta con nombre, monto y fecha, por ejemplo «₡25.000/mes para el marchamo de diciembre», con progreso. Finanzas **no mueve dinero**: solo lleva la cuenta.
- **Cómo hacerlo:**
  1. Una migración con la tabla `goals (id, user_id, name, target_amount, due_date, account_id null, archived, created_at)`. Le aplican las reglas de tablas nuevas de arriba (RLS, `require_mfa`, `enforce_same_owner`), los checks de longitud y monto, y permisos solo para `authenticated`.
  2. El progreso puede ser el saldo de una cuenta de ahorro asociada, o la suma de transferencias hacia ella desde que se creó la meta.
  3. Métodos en `Api`, en las dos implementaciones, hooks en `queries.ts` y una página `/mas/metas`.
  4. Una sección `'metas'` en `HOME_SECTIONS`. `normalizePrefs` la agrega sola al final para quien ya tiene preferencias.
  5. Pruebas en `supabase/tests/`: aislamiento entre usuarios, dos pasos y cuenta de otro dueño.
- **Esfuerzo:** M.
- **Validar antes:** si la dueña ya separa ese dinero en una cuenta de ahorro, y si prefiere ver una meta o una cuota mensual dentro del presupuesto.

### M6. Recordatorios locales

- **Problema:** los fijos y el pago de la tarjeta llegan sin aviso. Finanzas ya guarda `cutoff_day` y `payment_day`, pero no los usa para nada.
- **Evidencia:**
  - eXpend avisa de pagos planificados [E10].
  - Fintonic manda un informe semanal los lunes [F6].
  - Wallet tiene recordatorios [W1].
  - No encontré reseñas que los pidan explícitamente.
- **Qué se ve:** «Mañana se cobra Netflix ₡6.990», «El día 2 vence la Visa» y, como opción, «Así va tu semana» los lunes.
- **Cómo hacerlo:**
  - Con `@capacitor/local-notifications`, programar los avisos al abrir la app. Las fechas salen de `recurring.next_date` y del `payment_day` de las tarjetas. Hay que reprogramarlos cuando cambien.
  - Un interruptor en Ajustes para activarlos.
  - Solo funciona en la app nativa: en la PWA del iPhone harían falta notificaciones push con servidor.
  - El texto de la notificación no debería mostrar montos cuando el modo discreto está activo.
- **Esfuerzo:** M.
- **Validar antes:** si la dueña quiere recibir notificaciones.

---

## Propuestas grandes o exploratorias

### L1. Gastos desde SMS o correos del banco en iPhone

- **Problema:** las compras en línea y con tarjetas que no están en Apple Wallet no se capturan solas. MonAi también lo admite [M13].
- **Evidencia:** MonAi registra gastos a partir de SMS y correos con la acción de Atajos «Transaction from prompt» [M13]. En Monefy, 1 usuario pide detectar los SMS [Mo12].
- **Cómo hacerlo:** puede salir más barato de lo que parece.
  - Una automatización de iOS de tipo «Mensaje» o «Correo», filtrada por el remitente del banco, podría mandar el texto al endpoint `wallet-sync?formato=notificacion` que ya existe.
  - `_shared/notification.ts` ya interpreta textos de compra y descarta promociones, códigos, dinero recibido y rechazos. Probablemente solo haga falta ampliarlo con los formatos de SMS.
  - Agregar la guía a `WalletPage.tsx`.
- **Dependencias:**
  - SMS y correos reales de BAC, BCR, BN y otros bancos, que se agregan a `supabase/tests/notificacion.test.ts`.
  - Confirmar que la automatización de iOS entrega el texto sin pedir confirmación cada vez.
- **Riesgo:** el texto de un SMS es sensible. Hay que filtrar por remitente y no guardar el texto completo, como ya hace la rama de notificaciones.
- **Esfuerzo:** M‑L, según cuántos formatos haya.

### L2. Importar estados de cuenta en CSV

- **Problema:** sin conexión bancaria, conciliar o completar meses pasados obliga a escribir todo a mano.
- **Evidencia:**
  - YNAB recomienda importar archivos fuera de sus regiones [Y1].
  - El desarrollador de Wallet sugirió a un usuario tico importar el extracto de BAC [W24].
  - En MonAi, 1 persona pide conciliar con el estado de cuenta [M9].
- **Cómo hacerlo:**
  - Importar en el teléfono, no solo en la web, que es la carencia de YNAB y Wallet.
  - Mapear columnas y aceptar «₡1.234,56»; `parseAmountToCents` ya lo hace.
  - Recordar el formato por banco y poder deshacer el lote completo.
  - Detectar lo que ya llegó por Wallet: comparte lógica con M2.
- **Dependencias:** columnas reales de los archivos de cada banco (no verificadas).
- **Esfuerzo:** L.

### L3. Cuentas en dólares

- **Problema:** hoy solo cada movimiento se puede pagar en US$ (con el tipo de cambio del BCCR). Una cuenta de ahorro o una tarjeta en dólares no puede llevar su saldo en dólares.
- **Evidencia:**
  - En Wallet, la multimoneda se elogia en 5 fuentes.
  - A YNAB le critican que solo admite una moneda [Y1].
  - En MonAi, sus usuarios en Colombia tienen que separar COP y USD en listas distintas [M7].
- **Cómo hacerlo:**
  - Una moneda por cuenta, con saldo en su moneda y totales en ₡ al tipo del BCCR.
  - Lecciones de la competencia: no bloquear la moneda base (Wallet) y no usar 1:1 si falta la tasa (Monefy).
- **Dependencias:** cambia `account_balances`, las transferencias entre monedas, los presupuestos, las estadísticas, la exportación y las dos implementaciones de `Api`.
- **Esfuerzo:** L.
- **Validar antes:** si la dueña tiene cuentas en dólares y cuánto pesan en su mes.

### L4. Widgets nativos

- **Problema:** ver cómo va el mes o registrar un gasto sin abrir la app.
- **Evidencia:** YNAB los tiene [Y22]. Hay pedidos aislados en Fintonic, eXpend y Monefy.
- **Cómo hacerlo:**
  - WidgetKit en Swift para iOS y widgets nativos en Android, fuera de Capacitor.
  - Habría que compartir datos y sesión con el widget, y respetar el modo discreto, porque el widget se ve con la pantalla bloqueada.
  - No existe en la PWA.
- **Esfuerzo:** L.
- **Validar antes:** que sea viable con Capacitor 8 y que la dueña use widgets.

---

## Lo que no conviene copiar

| Idea | De dónde | Por qué no |
|---|---|---|
| Presupuesto de base cero obligatorio y su jerga | YNAB | Su curva de aprendizaje aparece en 7 fuentes y choca con registrar en segundos. |
| Puntuación crediticia, préstamos o publicidad en el inicio | Fintonic | Es la causa principal de rechazo en sus reseñas. |
| Mover o guardar dinero, redondeo real, inversión, cripto, cashback | Goin | Requiere licencias y custodia. Goin perdió su función central por depender de terceros. |
| Conexión bancaria o agregador | Fintonic, Wallet, YNAB | No existe en Costa Rica para una app así, y donde existe es la fuente principal de quejas. |
| IA en servidor para registrar, o chat con todo el historial | MonAi | Cuesta por uso, no funciona sin conexión y envía datos financieros a terceros. |
| Muro de pago, compromiso de 12 meses, créditos de IA | MonAi | Generan las quejas más repetidas, y Finanzas es gratis. |
| Promociones al abrir y arranque que depende de la red | Monefy | Rompen el registro justo después de pagar. |
| Tipo de cambio 1:1 si falta la tasa | Monefy | Altera los totales sin avisar. |
| Saldo que vuelve a 0 cada mes | MonAi | Su propia FAQ tiene que explicarlo. |
| Muchos tipos de cuenta (hipotecas, inversiones) o servidor MCP con escritura | Wallet, eXpend | Aleja la app de «cómo va el mes» y aumenta el riesgo para una persona. |
| Listas compartidas en pareja | MonAi, YNAB, Wallet | Tiene evidencia, pero cambia el modelo de privacidad (una persona, sus datos). Baja prioridad. |

---

## Preguntas para decidir

Las respuestas cambian el orden de las propuestas:

1. ¿Cada cuánto deja de funcionar el Atajo de Wallet? ¿Se acumulan pendientes? (P1, P2, P4)
2. ¿Anotas a mano pagos que después llegan solos? (M2)
3. ¿Cuántos de tus gastos manuales se repiten con el mismo comercio y monto? (M3)
4. ¿Pagas compras a cuotas o tasa cero? (M1)
5. ¿Separas dinero para gastos anuales como el marchamo o diciembre? (M5)
6. ¿Quieres recibir notificaciones? ¿Usas widgets? (M6, L4)
7. ¿Tienes cuentas o tarjetas en dólares? (L3)
8. ¿Puedes juntar ejemplos de SMS o correos de compra de tus bancos? (L1)
