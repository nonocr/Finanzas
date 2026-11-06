# Revisión legal y regulatoria de Finanzas

Fecha de la revisión: **6 de noviembre de 2026**. Versión de los documentos legales: `2026-11-06` (`src/lib/legal/version.ts`).

> **Esto no es asesoría legal.** Es un análisis técnico preparado para que una persona abogada lo revise. Distingue lo que dicen las fuentes, lo que interpreto y lo que recomiendo. No afirma que Finanzas cumpla la ley de forma integral: solo describe lo que se pudo verificar en el código, la configuración y las fuentes citadas.

Marcas usadas:

- **Fuente:** lo que dice el texto citado.
- **Interpretación:** mi lectura de cómo aplica a Finanzas.
- **Certeza:** alta (texto oficial leído y hecho verificado en el proyecto), media (fuente oficial parcial o inferencia razonable) o baja (fuente secundaria o sin verificar).

---

## 1. Las fuentes del encargo (carpeta `leyes/`)

La carpeta tiene 10 accesos directos `.url`. No hay PDF, Word, Markdown ni hojas de cálculo. Todos apuntan a páginas de un curso en la plataforma Moodle *ocTo-Do*:

| Acceso directo | URL de destino |
|---|---|
| Regulaciones aplicadas a las Web Apps | https://octo-do.com/mod/page/view.php?id=342 |
| Políticas de privacidad | https://octo-do.com/mod/page/view.php?id=341 |
| Protecciones jurídicas | https://octo-do.com/mod/page/view.php?id=340 |
| Tipos de aplicaciones Web | https://octo-do.com/mod/page/view.php?id=339 |
| Distribución y publicaciones legales de Web Apps | https://octo-do.com/mod/page/view.php?id=338 |
| Permisos en aplicaciones web e híbridas | https://octo-do.com/mod/page/view.php?id=337 |
| Términos y condiciones de uso | https://octo-do.com/mod/page/view.php?id=336 |
| Certificados digitales y HTTPS | https://octo-do.com/mod/page/view.php?id=335 |
| Procesos de distribución y publicación para la puesta en marcha de las Web Apps | https://octo-do.com/mod/page/view.php?id=334 |
| Derechos de autor | https://octo-do.com/mod/page/view.php?id=343 |

**No pude leer ninguna.** La página principal (id=342) redirige a la pantalla de inicio de sesión de Moodle. No usé credenciales, y el intento de entrar como invitado quedó bloqueado por los permisos de esta sesión. **No inventé su contenido.** Usé sus títulos solo como lista de temas a cubrir: privacidad, términos, derechos de autor, permisos, HTTPS, distribución y publicación, y regulación aplicable. Cada tema está tratado abajo con fuentes oficiales.

**Pendiente:** si el contenido del curso importa, expórtalo a PDF dentro de `leyes/` para cotejarlo con este análisis.

---

## 2. Qué datos trata Finanzas (verificado en el proyecto)

### 2.1 Quién y cómo

- **Responsable:** una persona física. No hay empresa (`PRODUCT.md`, `CLAUDE.md`). Su nombre, dirección y correo de contacto **no constan en el proyecto** (ver §5).
- **Gratuita, sin publicidad ni analítica:** no hay pagos en la app. `package.json` no tiene SDK de analítica, anuncios ni reporte de fallos. La CSP de `vercel.json` solo permite conectarse a Supabase y a `api.hacienda.go.cr`.
- **Registro abierto** con confirmación de correo (`mailer_autoconfirm=false`, verificado en la configuración de Auth).
- **Permisos del sistema:** Android solo pide `INTERNET` (`android/app/src/main/AndroidManifest.xml`). iOS no pide permisos (`Info.plist` no tiene textos de propósito). La web bloquea cámara, micrófono, ubicación, etc. con `Permissions-Policy`. **Finanzas no lee notificaciones:** en Android lo hace MacroDroid, una app de terceros que la persona instala y configura.

### 2.2 Inventario de datos

| Dato | Dónde | Para qué | ¿Obligatorio? | Cuánto tiempo | Evidencia |
|---|---|---|---|---|---|
| Correo | Supabase Auth (`auth.users`) | Entrar, confirmar, recuperar, avisos de seguridad | Sí | Mientras exista la cuenta | `LoginPage.tsx` |
| Contraseña (hash bcrypt) | Supabase Auth | Entrar | Sí | Ídem | `delete_my_account` usa `crypt()` sobre `encrypted_password` |
| Idioma (`user_metadata.lang`) | Supabase Auth | Correos y categorías iniciales en ese idioma | Automático | Ídem | `syncAuthLang`, migración `20261108000000_idioma` |
| Cuentas, categorías, movimientos, presupuestos, fijos, reglas | `public.*` | La función de la app | Lo decide la persona | Hasta que la persona los borre o elimine la cuenta | `20261029000000_init.sql` y siguientes |
| Últimos 4 dígitos y nombre de tarjeta en Wallet | `accounts.last4`, `wallet_name` | Empatar pagos automáticos | Opcional | Ídem | `init.sql` |
| Pagos del Atajo / notificaciones | `transactions` (`merchant`, `note` «Wallet · tarjeta», `amount_raw`, `external_id`) | Registro automático | Opcional | Ídem | `_shared/ingest.ts`, `_shared/notification.ts` (Android guarda «Visa •••• 1234») |
| Huella de la clave del Atajo | `api_tokens.token_hash` (SHA-256), `last_used_at` | Autenticar el registro automático | Opcional | Hasta revocarla | `create_api_token` |
| Preferencias | `user_settings.prefs` | Apariencia igual en todos los dispositivos | Automático | Mientras exista la cuenta | `20261107000000_preferencias` |
| Constancia de aceptación | `legal_acceptances` (**nuevo**) | Probar el consentimiento (Ley 8968, art. 5) | Sí | Mientras exista la cuenta | `20261109000000_aceptacion_legal` |
| Factor TOTP (secreto) | `auth.mfa_factors` | Verificación en dos pasos | Opcional | Hasta quitarlo o eliminar la cuenta | `TwoFactorSheet` |
| IP y tipo de navegador por sesión | `auth.sessions.ip`, `user_agent` | Sesión y seguridad (lo hace Supabase Auth) | Automático | Mientras la sesión exista | **Verificado** con una consulta de solo lectura al esquema (`information_schema.columns`) |
| IP del cliente del webhook y user_id en claves de límite | `private.rate_limits.key` («wallet:ip:…», «borrar-cuenta:<uuid>») | Contra abusos | Automático | La limpieza es probabilística (1 % de las llamadas borra ventanas de más de 1 día) | `20261031000000_seguridad.sql`, `_shared/security.ts` |
| Registro de auditoría de Auth en la base | — | — | — | **Desactivado** (`audit_log_disable_postgres=true`) | Configuración de Auth (lectura) |
| En el dispositivo: sesión, copia sin conexión (7 días), cola de cambios, preferencias | localStorage (web) / `@capacitor/preferences` (nativo) | Funcionar sin conexión y no pedir la contraseña cada vez | Automático | La copia de datos se borra al cerrar sesión o eliminar la cuenta | `offline.ts`, `supabase.ts`, `MorePage.tsx` |

**Nunca se guardan:** números completos de tarjeta, PIN ni claves bancarias. No hay conexión con bancos.

### 2.3 Proveedores y transferencias

| Proveedor | Qué recibe | Dónde | Verificación |
|---|---|---|---|
| Supabase | Todo lo anterior | **us-east-1 (Virginia del Norte, EE. UU.)** | Leído con la Management API (GET de solo lectura, 2026-11-06) |
| Vercel | Peticiones a la app web (IP, user agent) | No verificado | `vercel.json` |
| Google (Gmail, SMTP) | Correo de la persona y contenido de los correos de Auth | Google | `CLAUDE.md`. La cuenta es un Gmail personal |
| Ministerio de Hacienda (`api.hacienda.go.cr`) | IP del dispositivo (la consulta del tipo de cambio la hace el teléfono) y, desde la Edge Function, la IP del servidor | Costa Rica | `queries.ts` importa `fetchUsdRate`; la CSP permite el dominio |

**Corrección hecha:** la política anterior decía que la consulta a Hacienda «no lleva ningún dato tuyo». Como la hace el propio dispositivo, Hacienda recibe su IP. La política nueva lo dice así.

**No verificado:**

- **Plan de Supabase.** La lectura de la organización devolvió 403. De él depende cuánto duran las copias de respaldo: según la documentación de Supabase, Pro guarda 7 días, Team 14 y Enterprise hasta 30, y Free no tiene respaldos automáticos accesibles. La política anterior decía «máximo 30 días»; la nueva no da una cifra hasta que se confirme el plan.
- **Retención de registros (logs) de Supabase y Vercel.** La documentación consultada no da cifras por plan.
- **Copia en Enviados.** Si los correos de la app quedan en la carpeta Enviados del Gmail que los manda: falta comprobarlo en esa cuenta. La política lo menciona de forma general.

---

## 3. Normas y políticas: qué aplica

### 3.1 Costa Rica: Ley 8968, Protección de la Persona frente al tratamiento de sus datos personales

- **Estado:** vigente. Según la página de normativa de Prodhab, la ley no ha tenido reformas. Su reglamento (Decreto 37554-JP, 2012) se reformó con los decretos 40008-JP (2016) y 41582 (2019). **Certeza alta** sobre el texto de la ley: lo leí completo en la versión del Archivo Nacional.
- **¿Aplica?** **Fuente:** el art. 2 excluye las bases «mantenidas por personas físicas … con fines exclusivamente internos, personales o domésticos». **Interpretación:** esa excepción cubriría la app si solo la usara la dueña, pero desde el 2026-11-05 cualquiera puede crear una cuenta. Ahora la dueña administra datos de terceros, así que la ley aplica. **Certeza alta.**

| Artículo | Requisito (fuente) | Cómo se atiende | Estado |
|---|---|---|---|
| 5.1 | Informar «de modo expreso, preciso e inequívoco»: a) existencia de la base; b) fines; c) destinatarios; d) carácter obligatorio u optativo; e) tratamiento; f) consecuencias de negarse; g) derechos; h) **identidad y dirección del responsable** | Política reescrita con una sección por punto. h) usa `src/lib/legal/owner.ts` | a–g hechos. **h pendiente** (§5) |
| 5.2 | Consentimiento **expreso**, «por escrito, ya sea en un documento físico o electrónico», revocable sin efecto retroactivo | Casilla sin marcar en «Crear cuenta» + tabla `legal_acceptances` + pantalla `LegalGate` para cuentas anteriores y versiones nuevas. Se revoca eliminando la cuenta | Hecho |
| 6 | Datos actuales, veraces y exactos; eliminar los que ya no son necesarios; máximo 10 años para datos que puedan afectar al titular | La persona edita y borra todo. Al eliminar la cuenta se borra todo en cascada | Hecho (el plazo de 10 años no aplica en la práctica) |
| 7 | Acceso, rectificación y supresión **gratis, en 5 días hábiles**. El informe de acceso debe ser completo, «exento de codificaciones» y explicar los términos técnicos | **Nuevo: «Exportar todos mis datos»** (JSON con notas que explican cada campo). Edición en la app, eliminación de la cuenta, plazo de 5 días hábiles escrito en la política | Hecho (falta el correo de contacto, §5) |
| 9.1 y 3 e) | «Datos sensibles» incluye la **«condición socioeconómica»**. El art. 9 prohíbe tratarlos salvo excepciones, y el **art. 31 a)** hace falta gravísima que una persona privada los trate | Ver §6 | **Riesgo: para revisión legal** |
| 9.2 | Datos de acceso restringido: solo con consentimiento expreso | Consentimiento expreso (casilla) | Hecho |
| 10 | Medidas técnicas y organizativas de seguridad | RLS, MFA exigida por la base, HTTPS/HSTS, CSP, hashes, límites, `allowBackup=false` | Hecho (descritas en la política). El reglamento puede pedir más (no leído) |
| 11 | Deber de confidencialidad | Declarado en la política | Hecho |
| 14 y 31 f) | Transferir datos solo con autorización **expresa**. Llevarlos a bases de **terceros países** sin consentimiento es falta gravísima | La casilla menciona expresamente «servidores de Estados Unidos», y hay una sección «Datos fuera de Costa Rica» | Hecho, con duda (§6) |
| 21 | Inscribirse en Prodhab si la base se administra «con fines de distribución, difusión o comercialización» | Finanzas no vende ni difunde datos. **Interpretación:** no necesita inscribirse. **Certeza media** (no leí la definición del reglamento) | Para revisión legal |
| 12 | Protocolo de actuación (opcional) | No hecho | Recomendación opcional |

### 3.2 Reglamento de la Ley 8968 (Decreto 37554-JP y reformas)

**No lo pude leer.** El SCIJ carga el texto con JavaScript, y la copia de informatica-juridica.com no respondió. Una resolución de Prodhab citada en la búsqueda menciona que el art. 11 del reglamento fija el plazo de 10 años. Falta verificar en el texto consolidado:

- Aviso de incidentes de seguridad (a quién y en qué plazo). La política se compromete a avisar por correo, sin plazo.
- Reglas para personas menores de edad.
- Requisitos formales del consentimiento.
- Qué cuenta como «comercialización» para la inscripción.
- Medidas mínimas de seguridad y documentación exigida.
- Si usar proveedores (encargados) cuenta como «transferencia».

### 3.3 Costa Rica: normas nuevas o en trámite

- **Proyecto de ley 23.097** (nueva ley de datos, cercana al RGPD): según fuentes secundarias, **sigue en trámite y no está aprobado**. Hay que vigilarlo. **Certeza media.**
- **Ley 10.946, «Ley para la Gobernanza de los Servicios Digitales y Comercio Electrónico»:** publicada el **24 de junio de 2026** (Alcance 80 a La Gaceta 116). Entra en vigor **12 meses después** (alrededor de junio de 2027). Fuentes: KPMG y Consortium Legal. **No leí el texto oficial.** Según esas fuentes:
  - Define el servicio de la sociedad de la información como «servicio **oneroso**». Finanzas es gratuita, así que probablemente no le aplica hoy, pero aplicaría si se cobrara.
  - Pide identificar al comerciante, términos en español y prohíbe los «patrones oscuros».
  - Los contratos electrónicos se tienen por celebrados en el domicilio del consumidor, lo que limita las cláusulas de foro.

  Los Términos ya siguen esas pautas como buena práctica. **Certeza baja.**

### 3.4 Costa Rica: consumidor, documentos electrónicos, derechos de autor y accesibilidad

| Norma | Estado de la verificación | Interpretación y acción |
|---|---|---|
| Ley 7472 (consumidor) y su reglamento 37899-MEIC, con el capítulo de comercio electrónico del 40703-MEIC | Solo resúmenes secundarios (MEIC, justia). Texto no leído | No está claro que aplique a un servicio gratuito. Los Términos no excluyen toda responsabilidad y dejan a salvo los derechos de ley. Para revisión legal |
| Ley 8454 (firma digital y documentos electrónicos) | No consultada en esta sesión | Respaldaría el consentimiento electrónico que pide el art. 5.2 de la Ley 8968, que ya admite el «documento electrónico» |
| Ley 6683 (derechos de autor) | No consultada | Acción concreta: las licencias MIT/ISC de las dependencias piden conservar su aviso. Se genera `licencias.txt` en cada build y los Términos lo enlazan. La licencia de GSAP («Standard No Charge», Webflow, vigente desde el 30 de abril de 2025) permite el uso comercial gratis, sin atribución, salvo en constructores visuales de animaciones (no es el caso) |
| Ley 7600 (accesibilidad) | No consultada | No confirmé una obligación para una app privada. Buena práctica: WCAG 2.2 AA. El proyecto ya prueba contraste WCAG/APCA en los temas |

### 3.5 Servicios financieros

**Interpretación:** Finanzas no capta ni mueve dinero, no da crédito, no inicia pagos y no se conecta a bancos. No encontré una regulación financiera costarricense que le aplique. No lo verifiqué con SUGEF. **Certeza media.**

Las tiendas sí tienen reglas de este campo:

- **Apple 3.2.1(viii):** «Apps used for financial trading, investing, or money management should be submitted by the financial institution». **Interpretación:** «money management» apunta a gestionar dinero ajeno o inversiones, no a un registro personal de gastos. Riesgo bajo.
- **Apple 5.1.1(ix):** apps en campos regulados («banking and financial services») **«or that require sensitive user information should be submitted by a legal entity … and not by an individual developer»**. **Interpretación:** Finanzas no presta servicios financieros, pero guarda información financiera personal. Existe **riesgo de rechazo** si se publica con una cuenta de desarrollador individual. Ver §5 y §6.

### 3.6 Otras jurisdicciones (si la app se publica fuera de Costa Rica)

- **Unión Europea (RGPD, art. 3.2):** aplica a quien ofrece servicios a personas en la UE, aunque esté fuera. Texto no consultado en esta sesión. Si la app se ofrece en la UE haría falta, entre otras cosas, una base jurídica por cada finalidad y un representante en la UE (art. 27). Además, Apple exige declarar el estatus de «trader» (DSA) para distribuir en la UE; desde el 17 de febrero de 2025 retira las apps que no lo declaran.
- **Recomendación:** en ambas tiendas, **limitar la distribución a Costa Rica** (o a una lista corta de países revisados) hasta que una persona abogada evalúe otros mercados. La política y los términos están escritos para Costa Rica.

### 3.7 Cookies y tecnologías similares

Finanzas no usa cookies. Usa localStorage y `@capacitor/preferences` solo para funcionar (sesión, copia sin conexión, preferencias). **Interpretación:** no hay una norma costarricense específica sobre cookies que exija un banner, y aun bajo la regla europea de ePrivacy el almacenamiento estrictamente necesario está exento. No hace falta banner. La política describe lo que se guarda en el dispositivo. **Certeza media.**

### 3.8 Seguridad, HTTPS y certificados

Verificado:

- HTTPS con HSTS de 2 años e `includeSubDomains`, CSP estricta, `frame-ancestors 'none'`, `Referrer-Policy: no-referrer` (`vercel.json`).
- La base exige SSL (`CLAUDE.md`).
- Los certificados TLS los administran Vercel y Supabase.
- `ITSAppUsesNonExemptEncryption=false` en iOS: la app solo usa el cifrado estándar del sistema.

### 3.9 App Store (Apple)

| Guía | Requisito (fuente) | Estado |
|---|---|---|
| 5.1.1(i) | Enlace a la política en App Store Connect **y dentro de la app**. La política debe decir qué se recoge, cómo y para qué, confirmar que los terceros dan una protección igual, y explicar la retención, cómo revocar el consentimiento y cómo pedir la eliminación | Política dentro de la app (Ajustes, «Crear cuenta», `LegalGate`). Sobre los terceros, la política dice que cada proveedor trata los datos según sus condiciones: **revisar** si eso basta para la exigencia de «same or equal protection» |
| 5.1.1(ii) | Consentimiento para recoger datos y forma fácil de retirarlo | Casilla y eliminación de cuenta |
| 5.1.1(v) | Si hay creación de cuenta, **eliminación dentro de la app** | Ya existía (`DeleteAccountSheet`) |
| 5.1.1(ix) y 3.2.1(viii) | Ver §3.5 | **Riesgo** |
| 5.1.2 | No compartir sin permiso; no reutilizar para otro fin | No se comparte; la política lo dice |
| Manifiesto de privacidad (desde el 1 de mayo de 2024) | Declarar las «required reason APIs». `@capacitor/preferences` usa `UserDefaults` → `CA92.1` (README del plugin) | **Nuevo:** `ios/App/App/PrivacyInfo.xcprivacy`, agregado al proyecto de Xcode |
| App Privacy (etiquetas) | Declarar los tipos de datos | Respuestas propuestas en `docs/legal/declaraciones-tiendas.md` |

### 3.10 Google Play

| Política | Requisito (fuente) | Estado |
|---|---|---|
| Eliminación de cuenta | Ruta dentro de la app **y** un enlace web que nombre la app, muestre los pasos y deje pedir la eliminación sin reinstalar. Debe aclarar qué se conserva | **Nuevo:** `/eliminar-cuenta` (pública). Va en Play Console |
| Seguridad de los datos | Formulario: recogida, compartición, cifrado en tránsito y eliminación | Respuestas propuestas en `declaraciones-tiendas.md` |
| Declaración de funciones financieras | Todas las apps la completan, aunque no tengan funciones financieras | Respuesta propuesta en `declaraciones-tiendas.md` |
| Permisos | Solo `INTERNET`. No usa `NotificationListenerService` (eso lo hace MacroDroid) | No requiere declaraciones de permisos sensibles |

---

## 4. Cambios hechos en el proyecto

| Archivo | Cambio | Requisito |
|---|---|---|
| `src/i18n/locales/{es,en}/legal.ts` | Política de privacidad reescrita: responsable, datos y fines, qué es obligatorio, dispositivo, proveedores, transferencia a EE. UU., retención, seguridad, derechos (5 días hábiles y Prodhab), menores, cambios. Se corrigió lo de Hacienda y se quitó el «máximo 30 días» sin verificar | Ley 8968 arts. 5, 7, 10, 11, 14; Apple 5.1.1(i) |
| `src/i18n/locales/{es,en}/terms.ts` (nuevo) y `src/features/legal/TermsPage.tsx` (nuevo) | Términos de uso en `/terminos` | Buena práctica; base del consentimiento; Ley 10.946 (futura) |
| `src/features/legal/AccountDeletionPage.tsx` (nuevo) | `/eliminar-cuenta`, pública | Google Play (eliminación de cuenta) |
| `src/features/legal/LegalLayout.tsx` (nuevo), `PrivacyPage.tsx` | Armazón común; bloque «Quién es responsable»; «Atrás» vuelve a la pantalla anterior | Ley 8968 art. 5.1 h |
| `src/lib/legal/owner.ts` (nuevo) | Datos del responsable. **Vacíos**: el texto queda genérico hasta completarlos | Ley 8968 art. 5.1 h |
| `src/lib/legal/version.ts` (nuevo) + prueba | `LEGAL_VERSION`; fecha mostrada; `hasAcceptedLegal` | Ley 8968 art. 5.2 |
| `supabase/migrations/20261109000000_aceptacion_legal.sql` (nuevo) + `supabase/tests/aceptacion-legal.test.ts` | Tabla `legal_acceptances` (RLS, MFA restrictiva, insertar solo `version`, sin update ni delete, cascada) y trigger al registrarse | Ley 8968 art. 5.2 (constancia electrónica) |
| `src/lib/data/{types,api,demoApi,queries}.ts` | `listLegalAcceptances`, `acceptLegal`, `listAllBudgets`; hooks `useLegalAcceptances` y `useAcceptLegal` | — |
| `src/features/auth/LoginPage.tsx`, `src/features/legal/ConsentCheck.tsx` (nuevo) | Casilla obligatoria sin marcar: 18+, Términos, Privacidad y servidores en EE. UU. Manda `legal_version` al registrarse | Ley 8968 arts. 5.2 y 14 |
| `src/features/legal/LegalGate.tsx` (nuevo), `src/App.tsx` | Pide aceptar si falta la versión vigente. Deja descargar los datos, eliminar la cuenta o cerrar sesión. Si no hay conexión o la consulta falla, deja pasar | Ley 8968 art. 5.2; Apple 5.1.1(ii) |
| `src/features/settings/exports.ts` (nuevo), `MorePage.tsx` | **«Exportar todos mis datos»** (JSON con notas); el CSV se mudó aquí; fila «Términos de uso» | Ley 8968 art. 7 |
| `src/lib/auth/signOut.ts` (nuevo) | Cerrar sesión compartido entre Ajustes y `LegalGate` | — |
| `src/i18n/Rich.tsx` + prueba | Enlaces a rutas internas (`[texto](/terminos)`); sigue rechazando `//` y `http:` | — |
| `src/i18n/locales/{es,en}/{more,auth}.ts` | Textos nuevos; se quitaron los del aviso anterior | — |
| `ios/App/App/PrivacyInfo.xcprivacy` (nuevo), `project.pbxproj` | Manifiesto de privacidad | Apple |
| `vite.config.ts` | `build.license` → `dist/licencias.txt`; el service worker no lo reemplaza por la app | Licencias MIT/ISC (derechos de autor) |
| `docs/legal/declaraciones-tiendas.md` (nuevo) | Respuestas para App Store Connect y Play Console | Apple y Google |
| `CLAUDE.md` | Sección «Legal» | — |

**Efecto al desplegar:** cada cuenta existente, incluida la de la dueña, verá una vez la pantalla «Términos y privacidad», porque no hay constancia previa. Es lo esperado.

**Orden de despliegue:** aplicar la migración `20261109000000_aceptacion_legal` en producción **antes** de publicar el frontend. Sin ella, la casilla no deja constancia y «Aceptar» falla; la app sigue funcionando porque la pantalla deja pasar cuando la consulta falla. **No apliqué nada en producción.**

---

## 5. Datos que faltan y decisiones de la dueña

1. **Identidad, dirección y correo del responsable** (`src/lib/legal/owner.ts`). Sin esto no se cumple del todo el art. 5.1 h. Las tiendas también piden un correo de contacto.
2. **Edad mínima.** Puse **18 años** como opción conservadora (mayoría de edad y una app financiera). Confírmalo.
3. **Plan de Supabase.** Define cuánto duran los respaldos; con él, la política puede dar una cifra.
4. **Correo por Gmail personal.** Una cuenta Gmail de consumo no tiene acuerdo de tratamiento de datos (DPA). Considera un proveedor de correo transaccional con DPA y define cuánto tiempo se guardan los correos enviados y recibidos.
5. **DPA de Supabase y Vercel.** Confirma que estén aceptados. No lo verifiqué.
6. **Compromisos escritos en los textos:** avisar por correo si hay un incidente de seguridad, avisar antes de cerrar el servicio y avisar antes de suspender una cuenta. Confirma que puedes cumplirlos.
7. **Países de distribución** en las tiendas (recomendación: solo Costa Rica al inicio).
8. **Tipo de cuenta de desarrollador de Apple** (individual o empresa), por la guía 5.1.1(ix).
9. **Fecha de `LEGAL_VERSION`.** Si cambias los textos antes de publicar, pon la fecha de publicación.

---

## 6. Para revisión de una persona abogada

1. **Datos sensibles (riesgo principal).** La Ley 8968 define dato sensible incluyendo la «condición socioeconómica» (art. 3 e). El art. 9.1 prohíbe tratarlos salvo excepciones que no calzan claramente, y el art. 31 a) hace falta gravísima que una persona privada los recoja o almacene. ¿Un registro de ingresos y gastos que la persona lleva voluntariamente para sí misma revela su «condición socioeconómica» en el sentido de la ley? ¿Basta el consentimiento expreso? ¿Hay criterios de Prodhab al respecto?
2. **Proveedores en EE. UU.:** ¿usar Supabase y Vercel es una «transferencia» (art. 14) o un encargo de tratamiento? ¿Es válido pedir esa autorización en la misma casilla que acepta los términos (consentimiento «libre»), si sin ella el servicio no puede funcionar?
3. **Inscripción en Prodhab (art. 21):** confirmar que no hace falta.
4. **Reglamento 37554-JP y reformas:** aviso de incidentes, menores, protocolo y medidas mínimas (§3.2).
5. **Términos:** la cláusula de responsabilidad frente a las cláusulas abusivas de la Ley 7472; si la ley del consumidor aplica a un servicio gratuito; los efectos de la Ley 10.946 si se monetiza.
6. **Publicar la identidad de una persona física:** qué dirección mostrar (por ejemplo, un domicilio para notificaciones) sin exponer de más a la dueña.
7. **Edad mínima de 18** y manejo de menores.
8. **Apple 5.1.1(ix):** si conviene publicar con una persona jurídica.
9. **Distribución fuera de Costa Rica** (RGPD/DSA y otros).

---

## 7. Fuentes que no pude consultar o verificar

- Las 10 páginas del curso en octo-do.com (requieren inicio de sesión).
- El texto consolidado del Reglamento de la Ley 8968 (SCIJ con JavaScript; informatica-juridica.com sin respuesta).
- El texto oficial de la Ley 10.946 en La Gaceta (solo resúmenes de KPMG y Consortium Legal).
- El texto de la Ley 7472 y del Decreto 37899-MEIC (solo resúmenes).
- Leyes 8454, 6683 y 7600, y el RGPD: citadas como referencia, no leídas en esta sesión.
- Plan de Supabase (403), retención de logs de Supabase y Vercel, y la copia en Enviados de Gmail.
- La versión actual completa de las App Store Review Guidelines: la lectura se cortó en los 100 000 caracteres, pero las secciones 5.1.1, 5.1.2 y 3.2.1 sí se leyeron.

---

## 8. Bibliografía (todas consultadas el 2026-11-06)

| Fuente | Jurisdicción | Qué respalda |
|---|---|---|
| Ley 8968, texto del Archivo Nacional: https://www.archivonacional.go.cr/web/normativa/ley8968.docx | Costa Rica | Arts. 2, 3, 5, 6, 7, 9, 10, 11, 14, 21, 28–31 (texto leído completo) |
| Ficha de la Ley 8968 en SCIJ/SINALEVI: https://sinalevi.go.cr/ResultadosNormativa/Informacion?param1=70975&param2=&param3=1&param4= | Costa Rica | Referencia oficial (no se pudo leer el texto, se carga con JavaScript) |
| Prodhab, normativa: https://www.prodhab.go.cr/acercade/normativa/ | Costa Rica | Ley sin reformas; reglamento 37554-JP reformado por 40008-JP y 41582 (resumen del buscador) |
| Delfino, expediente 23.097: https://delfino.cr/asamblea/proyecto/23097 | Costa Rica | Proyecto de ley de datos en trámite (fuente secundaria) |
| KPMG Costa Rica, Newsflash 30 jun 2026: https://kpmg.com/cr/es/insights/2026/06/newsflash-jun-30.html | Costa Rica | Ley 10.946: publicación, vigencia y alcance (secundaria) |
| Consortium Legal, «Nueva Ley de Comercio Electrónico»: https://consortiumlegal.com/2026/07/03/ley-comercio-electronico-costa-rica/ | Costa Rica | Ley 10.946: «servicio oneroso», obligaciones (secundaria) |
| Apple, App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/ | Global | 5.1.1 (i)–(x), 5.1.2, 3.2.1(viii) |
| Apple, App privacy details: https://developer.apple.com/app-store/app-privacy-details/ | Global | Tipos de datos, «linked», «tracking», divulgación opcional |
| Apple, App Review – eliminación de cuenta: https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion | Global | Eliminación dentro de la app |
| Apple, trader status (DSA): https://developer.apple.com/news/?id=einwn76m | UE | Retiro de apps sin estatus de trader desde el 17-02-2025 |
| Capacitor, Privacy Manifest: https://capacitorjs.com/docs/ios/privacy-manifest | Global | Manifiesto; ejemplo con UserDefaults y CA92.1 |
| README de `@capacitor/preferences` 8.0.1 (en `node_modules`) | Global | Clave `NSPrivacyAccessedAPICategoryUserDefaults`, motivo CA92.1 |
| Google Play, eliminación de cuenta: https://support.google.com/googleplay/android-developer/answer/13327111 | Global | Ruta en la app + enlace web, contenido, retención |
| Google Play, Seguridad de los datos: https://support.google.com/googleplay/android-developer/answer/10787469 | Global | Definiciones de recogida y compartición, tipos de datos, prácticas de seguridad |
| Google Play, Servicios financieros: https://support.google.com/googleplay/android-developer/answer/9876821 | Global | Declaración de funciones financieras (resumen del buscador) |
| Supabase, Backups: https://supabase.com/docs/guides/platform/backups | Global | Retención por plan (Pro 7, Team 14, Enterprise 30 días) |
| Supabase, Logs: https://supabase.com/docs/guides/telemetry/logs | Global | La retención depende del plan (sin cifras) |
| GSAP Standard License: https://gsap.com/standard-license | Global | Uso comercial gratis; usos prohibidos |
| Supabase Management API (lectura del proyecto `qdrkbocandltwfvofngt` y de la configuración de Auth) | — | Región us-east-1, `audit_log_disable_postgres=true`, `mailer_autoconfirm=false`, columnas de `auth.sessions` |
