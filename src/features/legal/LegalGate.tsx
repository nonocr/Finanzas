import { FileCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '../../components/ui';
import { useT } from '../../i18n';
import { signOutEverywhere } from '../../lib/auth/signOut';
import { isDemo } from '../../lib/data/api';
import { useAcceptLegal, useLegalAcceptances } from '../../lib/data/queries';
import { formatLegalDate, hasAcceptedLegal, LEGAL_VERSION } from '../../lib/legal/version';
import { useExports } from '../settings/exports';
import { DeleteAccountSheet } from '../settings/security/DeleteAccountSheet';
import { ConsentCheck } from './ConsentCheck';

/**
 * Pide aceptar los Términos y la Privacidad cuando la cuenta no aceptó la versión vigente (LEGAL_VERSION): cuentas
 * creadas antes de que existiera la constancia, o cuando los documentos cambian. Quien no acepta puede descargar sus
 * datos y eliminar su cuenta, o cerrar sesión: retirar el consentimiento no debe quedar bloqueado.
 *
 * Solo bloquea cuando SABE que falta la aceptación. Si la consulta aún no llega, falla o está en pausa sin conexión,
 * deja pasar: la app sin señal tiene que seguir funcionando con su copia local. La demo no tiene cuenta: no pide nada.
 */
export function LegalGate({ children }: { children: ReactNode }) {
  const { data, isSuccess } = useLegalAcceptances();
  if (isDemo || !isSuccess || hasAcceptedLegal(data)) return <>{children}</>;
  return <LegalUpdatePage />;
}

function LegalUpdatePage() {
  const t = useT();
  const g = t.legal.gate;
  const accept = useAcceptLegal();
  const { exportJson } = useExports();
  const [checked, setChecked] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState(0);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="mb-8 grid size-16 place-items-center rounded-[16px] black-card text-accent">
        <FileCheck size={34} strokeWidth={2} />
      </div>
      <h1 className="text-large-title font-bold">{g.title}</h1>
      <p className="mt-1 text-body text-pretty text-label-2">{g.subtitle(formatLegalDate())}</p>

      <div className="mt-8">
        <ConsentCheck checked={checked} onChange={setChecked} text={g.consent} />
      </div>
      {accept.isError && (
        <p role="alert" className="mt-3 text-subhead text-red">
          {g.error}
        </p>
      )}
      <Button className="mt-4 w-full" disabled={!checked || accept.isPending} onClick={() => accept.mutate(LEGAL_VERSION)}>
        {g.accept}
      </Button>

      <p className="mt-8 text-footnote text-pretty text-label-2">{g.declineHint}</p>
      <div className="mt-2 flex flex-col">
        <Button variant="plain" className="w-full text-body font-normal" onClick={() => void exportJson()}>
          {g.export}
        </Button>
        <Button
          variant="plain"
          className="w-full text-body font-normal text-red"
          onClick={() => {
            setDeleteKey((k) => k + 1);
            setDeleteOpen(true);
          }}
        >
          {g.deleteAccount}
        </Button>
        <Button variant="plain" className="w-full text-body font-normal" onClick={() => void signOutEverywhere()}>
          {g.signOut}
        </Button>
      </div>
      <DeleteAccountSheet key={deleteKey} open={deleteOpen} onClose={() => setDeleteOpen(false)} onExport={() => void exportJson()} />
    </main>
  );
}
