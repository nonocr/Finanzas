import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Política de privacidad: se puede abrir sin cuenta (/privacidad), desde «Crear cuenta» y desde Ajustes. Las tiendas
// de apps piden un enlace público a ella. Si cambia lo que la app guarda o con quién lo comparte, actualízala aquí.
const UPDATED = '6 de noviembre de 2026';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-title3 font-bold">{title}</h2>
      <div className="mt-2 space-y-3 text-body text-pretty text-label-2 [&_strong]:font-semibold [&_strong]:text-label">{children}</div>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <main className="mx-auto max-w-xl px-4 pt-[calc(var(--safe-top)+12px)] pb-[calc(var(--safe-bottom)+48px)]">
      <Link to="/" className="-ml-1 inline-flex min-h-11 items-center gap-0.5 text-body text-accent">
        <ChevronLeft size={22} strokeWidth={2.25} />
        Volver
      </Link>
      <h1 className="text-large-title font-bold">Privacidad</h1>
      <p className="mt-1 text-subhead text-label-2">Actualizada el {UPDATED}.</p>

      <Block title="En resumen">
        <p>
          Finanzas guarda lo que tú registras para mostrártelo a ti. <strong>No vende ni comparte tus datos</strong>, no
          muestra publicidad y no usa herramientas de rastreo de terceros.
        </p>
      </Block>

      <Block title="Qué se guarda">
        <p>
          <strong>Tu cuenta:</strong> tu correo y tu contraseña. La contraseña se guarda cifrada; nadie puede leerla.
        </p>
        <p>
          <strong>Lo que registras:</strong> cuentas y tarjetas (nombre y, si lo escribes, los últimos 4 dígitos),
          movimientos, categorías, presupuestos, gastos fijos y reglas de comercios.
        </p>
        <p>
          <strong>Si usas el Atajo de Apple Wallet:</strong> el monto, el comercio y la tarjeta de cada pago que el
          Atajo envía, y una clave personal para el Atajo, guardada cifrada.
        </p>
        <p>Nunca se guardan números completos de tarjeta, PIN ni claves de tu banco.</p>
      </Block>

      <Block title="Quién puede verlo">
        <p>
          Solo tú. La base de datos separa la información de cada persona y no deja que nadie vea ni cambie la de otra.
        </p>
        <p>
          Quien administra la app tiene acceso técnico a la base de datos para mantenerla funcionando. No revisa tus
          datos, salvo que se lo pidas para resolver un problema.
        </p>
      </Block>

      <Block title="Dónde se guarda">
        <p>
          En <strong>Supabase</strong> (base de datos y cuentas de usuario), en servidores de Estados Unidos. La app se
          sirve desde <strong>Vercel</strong>. Los correos de la app (confirmar la cuenta, recuperar la contraseña) se
          envían por <strong>Gmail</strong>. Todas las conexiones van cifradas (HTTPS).
        </p>
        <p>
          Para las compras en dólares, la app consulta el tipo de cambio en el sitio público del Ministerio de Hacienda;
          esa consulta no lleva ningún dato tuyo.
        </p>
      </Block>

      <Block title="Lo que puedes hacer">
        <p>
          <strong>Descargar tus datos:</strong> Ajustes → Exportar movimientos (CSV).
        </p>
        <p>
          <strong>Eliminar tu cuenta:</strong> Ajustes → Eliminar cuenta. Se borran de inmediato tu cuenta y todo lo
          que registraste. Las copias de respaldo de la base, si las hay, se eliminan solas en un máximo de 30 días.
        </p>
        <p>
          <strong>Pedir acceso, corrección o eliminación</strong> de tus datos: responde a cualquier correo que te haya
          enviado Finanzas.
        </p>
      </Block>

      <Block title="Cambios">
        <p>Si esta política cambia, se actualiza esta página y su fecha.</p>
      </Block>
    </main>
  );
}
