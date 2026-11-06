# Propuesta: Ajustes más compacto (versión 2)

**Fecha:** 6 de noviembre de 2026. **Estado:** para valorar; no está implementada.
**Maqueta:** `propuesta-ajustes.svg` muestra, lado a lado y a 390×844, la pantalla de hoy, la propuesta y la nueva página Cuenta.

**Qué cambió desde la versión 1:** se mantiene la página **Cuenta** aparte. Se quitan los accesos en cuadrícula: Cuentas y tarjetas, Categorías y Reglas de comercios **quedan como filas, igual que hoy**.

## El problema

Ajustes (`src/features/settings/MorePage.tsx`) tiene hoy **15 filas en 6 secciones**. Mide unos **1.175 px**, cuando un iPhone deja unos 700 px útiles entre el título y la barra de pestañas. Para llegar a Seguridad, Datos y Eliminar cuenta hay que desplazar unos 330 px. Cada función nueva lo alarga más.

## La propuesta

```
Ajustes
┌──────────────────────────────────────┐
│ [N] tu@correo.com                  › │  ← nueva: lleva a la página Cuenta
│     Cuenta, seguridad y datos        │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ Cuentas y tarjetas               3 › │  ← igual que hoy
│ Categorías                         › │
│ Reglas de comercios                › │
└──────────────────────────────────────┘
Automático
┌──────────────────────────────────────┐
│ Registro automático                › │
│ Último pago: hace 3 h                │  ← el estado se ve sin entrar
│ Gastos e ingresos fijos            › │
│ Alquiler, salario, suscripciones     │
└──────────────────────────────────────┘
Apariencia
┌──────────────────────────────────────┐
│ Tema, idioma y Resumen             › │  ← 3 filas en 1
│ Negra · Automático                   │
│ Modo discreto                  (○  ) │
└──────────────────────────────────────┘
```

**Página Cuenta** (`/mas/cuenta`):

```
‹ Ajustes
Cuenta
┌──────────────────────────────────────┐
│ [N] tu@correo.com                    │
│     Verificación en dos pasos activada│
└──────────────────────────────────────┘
Seguridad
│ Cambiar contraseña                 › │
│ Verificación en dos pasos   Activa › │
Datos
│ Exportar movimientos (CSV)           │
│ Privacidad                         › │
┌──────────────────────────────────────┐
│ Cerrar sesión                        │  (en rojo)
│ Eliminar cuenta                      │  (en rojo)
└──────────────────────────────────────┘
```

### Qué cambia respecto de hoy

1. **Tarjeta de la cuenta arriba.** Muestra el correo y lleva a **Cuenta**, que reúne lo que casi no se usa:
   - Cambiar contraseña y verificación en dos pasos (con su estado).
   - Exportar CSV y Privacidad.
   - Cerrar sesión y Eliminar cuenta, juntas al final.

   Saca **7 filas** de la pantalla principal. En el modo demo, la tarjeta dice «Modo demo» y la página tiene Exportar y Reiniciar datos de ejemplo.
2. **Cuentas y tarjetas, Categorías y Reglas de comercios:** sin cambios.
3. **Automático:** las mismas dos filas. El subtítulo de Registro automático pasa a mostrar el estado («Último pago: hace 3 h»). Eso adelanta la propuesta P1 de `propuestas-finanzas.md`. Mientras P1 no exista, se deja el subtítulo actual.
4. **Apariencia:** Tema, Idioma y Resumen se juntan en una fila que muestra lo elegido («Negra · Automático»).
   - Abre una página que tiene **los temas arriba**, como la pantalla de Tema de hoy, así que elegir tema sigue a 1 toque.
   - Debajo de los temas, las filas Idioma y Resumen.
   - **Modo discreto** sigue en su fila con el interruptor, sin subtítulo. La explicación pasa al pie de la sección.

**Altura:** 1 tarjeta y 7 filas, unos **700 px**. Cabe sin desplazar en un iPhone de 390×844. En el iPhone SE (375×667) se desplaza poco.

### Toques para llegar a cada ajuste (desde Ajustes)

| Ajuste | Hoy | Propuesta |
|---|---|---|
| Cuentas y tarjetas, Categorías, Reglas de comercios | 1 | 1 |
| Registro automático, Gastos e ingresos fijos | 1 | 1 |
| Modo discreto | 0 (interruptor) | 0 (interruptor) |
| Tema | 1 | 1 (la página abre con los temas) |
| Idioma, Resumen | 1 | 2 |
| Cambiar contraseña, Verificación en dos pasos, Exportar CSV | 1, desplazando | 2, sin desplazar |
| Cerrar sesión, Eliminar cuenta, Privacidad | 1, desplazando | 2, sin desplazar |

Nada de lo frecuente pierde toques. Lo que pasa a 2 toques hoy ya obliga a desplazar.

### Dónde irían las funciones futuras

Como no hay cuadrícula, lo nuevo entra como filas en la sección que le corresponde:

| Propuesta (`propuestas-finanzas.md`) | Lugar |
|---|---|
| M5 Metas | Fila en la primera sección, junto a Cuentas y Categorías |
| M3 Favoritos | Dentro de Categorías (son atajos de registro) o fila en la primera sección |
| M6 Recordatorios | Fila «Avisos» en Automático |
| P1, P2 Estado de la captura | Subtítulo de Registro automático; la verificación vive dentro de esa página |
| M4 Proyección del mes | Dentro de Apariencia → Resumen (es una opción de la tarjeta) |
| L1 SMS y correos, L2 Importar CSV | Dentro de Registro automático y de Cuenta → Datos |

**Límite honesto:** con Metas, Favoritos y Avisos como filas, la pantalla subiría a unos 850 px, y en un iPhone de 390×844 habría que desplazar unos 150 px. Sigue siendo menos que hoy (330 px) y lo frecuente queda arriba. Si en el futuro crece más, la siguiente agrupación natural es «Cuentas, categorías y reglas» como una sola entrada.

## Cómo implementarlo

1. **`MorePage.tsx`:**
   - Agregar la tarjeta de la cuenta arriba.
   - Quitar las secciones Seguridad y Datos y la última (Privacidad y Eliminar cuenta).
   - Juntar Tema, Idioma y Resumen en una fila.
   - Sacar `exportCsv` a un módulo propio (por ejemplo `src/lib/format/exportCsv.ts` o un hook), porque lo usan Cuenta y la hoja de Eliminar cuenta.
2. **Página nueva `/mas/cuenta`** (`src/features/settings/security/AccountPage.tsx`):
   - Recibe las tres hojas (`ChangePasswordSheet`, `TwoFactorSheet`, `DeleteAccountSheet`) con su lógica de `key` para reiniciarlas.
   - Recibe la exportación y el cierre de sesión global con respaldo local, tal como están hoy.
   - El correo sale de la sesión de Supabase. El estado de los dos pasos sale de `supabase.auth.mfa.listFactors()`, que ya usa `TwoFactorSheet`; sin conexión, se oculta.
3. **Página `/mas/apariencia`:** reutiliza la cuadrícula de temas de `ThemePage` y agrega debajo las filas Idioma (`/mas/idioma`) y Resumen (`/mas/resumen`). La ruta vieja `/mas/tema` redirige a `/mas/apariencia`.
4. **Rutas** en `App.tsx`: agregar `/mas/cuenta` y `/mas/apariencia`.
5. **Textos** nuevos en `src/i18n/locales/es/more.ts` y `en/more.ts`:
   - el título de la página Cuenta;
   - «Cuenta, seguridad y datos»;
   - «Tema, idioma y Resumen»;
   - el resumen «Negra · Automático»;
   - la nota del modo discreto en el pie.
6. **Verificar:**
   - `npx tsc -b` y `npm test`.
   - `node scripts/capturas.mjs` contra un servidor con `VITE_DEMO=1`, para medir desborde, toques de menos de 44 px y texto de menos de 12 px en todos los tamaños.
   - El e2e de la demo ya recorre `/mas`.

**Esfuerzo:** pequeño. No toca la base de datos ni la lógica, solo reorganiza pantallas. Se puede hacer en un cambio y revertir fácilmente.

## Qué validar

- **El correo en la tarjeta:** con el modo discreto activo, ¿se muestra o se difumina? No es un monto, pero es un dato personal.
- **Idioma y Resumen a 2 toques:** confirmar que no los cambias seguido.
- **iPhone SE:** medir con `scripts/capturas.mjs` cuánto se desplaza.
