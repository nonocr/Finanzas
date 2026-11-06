# Declaraciones para App Store Connect y Google Play Console

Respuestas propuestas a partir de lo verificado en el código (ver `docs/legal/revision-legal.md`, §2). Revísalas en cada consola antes de enviarlas: los formularios cambian. Si cambia lo que la app guarda, actualiza este archivo, `ios/App/App/PrivacyInfo.xcprivacy` y la Política de privacidad.

## Enlaces públicos

| Uso | URL |
|---|---|
| Política de privacidad | https://finanzas-nono-0784.vercel.app/privacidad |
| Términos de uso (EULA propio, opcional en Apple) | https://finanzas-nono-0784.vercel.app/terminos |
| Eliminar la cuenta (Google Play: «Delete account URL») | https://finanzas-nono-0784.vercel.app/eliminar-cuenta |
| Licencias de terceros | https://finanzas-nono-0784.vercel.app/licencias.txt |

Estas páginas se publican al desplegar `main`. Comprueba que abran sin sesión antes de pegarlas en las consolas.

## Apple: App Privacy («Etiquetas de privacidad»)

**¿Se recogen datos?** Sí. **¿Se usan para rastrear?** No: no hay SDK de anuncios ni de analítica, y no se cruzan datos con terceros.

| Categoría → tipo | ¿Ligado a la persona? | ¿Rastreo? | Finalidad | Qué es en Finanzas |
|---|---|---|---|---|
| Contact Info → Email Address | Sí | No | App Functionality | Correo de la cuenta |
| Identifiers → User ID | Sí | No | App Functionality | Id de la cuenta en Supabase |
| Financial Info → Other Financial Info | Sí | No | App Functionality | Saldos, ingresos, presupuestos, límites de crédito |
| Financial Info → Payment Info | Sí | No | App Functionality | Nombre de la tarjeta y últimos 4 dígitos (opcional). Es una interpretación conservadora: Apple pone como ejemplo «form of payment» |
| Purchases → Purchase History | Sí | No | App Functionality | Movimientos (comercio, monto, fecha) |

**No recogidos:** ubicación, contactos, fotos, salud, historial de navegación, datos de uso (no hay analítica), diagnósticos (no hay reporte de fallos) e identificador del dispositivo. La IP y el user agent que guarda Supabase Auth no son tipos de la lista de Apple.

**Otros puntos de App Store Connect:**

- **Eliminación de cuenta:** dentro de la app (Ajustes → Eliminar cuenta). Cumple la guía 5.1.1(v).
- **App Review:** da una cuenta de prueba con datos de ejemplo (correo y contraseña) en «App Review Information». Explica que el registro automático depende de un Atajo de iOS que configura la persona.
- **Cumplimiento de exportación:** `ITSAppUsesNonExemptEncryption=false` ya está en `Info.plist` (solo HTTPS del sistema).
- **Clasificación por edad:** responde el cuestionario de contenido con honestidad. Los Términos piden 18 años o más; **verifica** si App Store Connect deja fijar una edad mínima superior a la que da el cuestionario.
- **Disponibilidad:** recomendación: solo Costa Rica al inicio. Si incluyes países de la UE, Apple exige declarar el estatus de «trader» (DSA) y aplica el RGPD.
- **Riesgo de la guía 5.1.1(ix):** con una cuenta individual, App Review podría pedir que publique una persona jurídica, porque la app guarda información financiera (ver `revision-legal.md`, §3.5).
- **Manifiesto de privacidad:** `ios/App/App/PrivacyInfo.xcprivacy` (UserDefaults, CA92.1, más los tipos de arriba).

## Google Play: Seguridad de los datos

**¿Recoge o comparte datos de los tipos requeridos?** Sí, los recoge. **¿Los comparte?** No: Supabase, Vercel y Google son proveedores que tratan los datos por cuenta de Finanzas, y eso no cuenta como compartir según Google.

| Categoría → tipo | Recogido | Compartido | ¿Obligatorio u opcional? | Finalidad |
|---|---|---|---|---|
| Información personal → Dirección de correo | Sí | No | Obligatorio | Funcionalidad de la app, Administración de la cuenta |
| Información personal → IDs de usuario | Sí | No | Obligatorio | Funcionalidad de la app, Administración de la cuenta |
| Información financiera → Historial de compras | Sí | No | Obligatorio (es la función principal) | Funcionalidad de la app |
| Información financiera → Otra información financiera | Sí | No | Opcional (saldos, presupuestos, ingresos) | Funcionalidad de la app |
| Información financiera → Información de pago del usuario | Sí | No | Opcional (últimos 4 dígitos y nombre de tarjeta) | Funcionalidad de la app |
| Mensajes / contenido del usuario → Otro contenido generado por el usuario | Sí | No | Opcional (notas de los movimientos) | Funcionalidad de la app. **Revisa** si prefieres incluirlo en «Otra información financiera» |

**No recogidos:** ubicación, contactos, fotos, actividad en apps (no hay analítica), información y rendimiento de la app (no hay reporte de fallos) e IDs del dispositivo.

**Prácticas de seguridad:**

- Datos cifrados en tránsito: **Sí** (todo por HTTPS).
- Las personas pueden pedir que se eliminen sus datos: **Sí**, dentro de la app y en https://finanzas-nono-0784.vercel.app/eliminar-cuenta.
- Revisión de seguridad independiente: No.

**Eliminación de datos:** la app permite crear cuentas. La URL web es `/eliminar-cuenta`, que nombra la app, muestra los pasos, deja pedir la eliminación por correo y dice qué se conserva.

**Otros puntos de Play Console:**

- **Declaración de funciones financieras:** Finanzas no presta servicios financieros (no hay préstamos, pagos, inversión ni banca). Elige la opción que corresponda a «la app no ofrece funciones financieras». Si la consola tiene una categoría para herramientas de presupuesto personal, úsala. **Verifica las opciones** en Política → Contenido de la app.
- **Público objetivo:** 18 años o más.
- **Anuncios:** la app no tiene anuncios.
- **Acceso a la app:** da credenciales de prueba para la revisión.
- **Permisos:** solo `INTERNET`. Finanzas no usa acceso a notificaciones (lo hace MacroDroid, otra app), así que no hace falta declarar permisos sensibles.
- **Disponibilidad por países:** recomendación: solo Costa Rica al inicio.
- **Datos de contacto del desarrollador:** Google los muestra en la ficha. Usa el mismo correo que pongas en `src/lib/legal/owner.ts`.
