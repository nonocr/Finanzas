import { ArrowLeftRight, CircleDot } from 'lucide-react';
import { CategoryIcon, IconTile, Row, Stamp } from '../../components/ui';
import { formatCRC } from '../../lib/money';
import type { Account, Category, Transaction } from '../../lib/types';
import { useEditor } from './editor';

const timeFmt = new Intl.DateTimeFormat('es-CR', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Costa_Rica' });

export function TransactionRow({
  tx,
  categories,
  accounts,
  showTime = true,
}: {
  tx: Transaction;
  categories: Map<string, Category>;
  accounts: Map<string, Account>;
  showTime?: boolean;
}) {
  const { openEdit } = useEditor();
  const cat = tx.category_id ? categories.get(tx.category_id) : undefined;
  const acc = accounts.get(tx.account_id);
  const to = tx.to_account_id ? accounts.get(tx.to_account_id) : undefined;
  const pending = tx.status === 'por_revisar';

  const title =
    tx.type === 'transferencia'
      ? (tx.merchant ?? tx.note ?? `${acc?.name ?? 'Cuenta'} → ${to?.name ?? 'Cuenta'}`)
      : (tx.merchant ?? cat?.name ?? (tx.type === 'ingreso' ? 'Ingreso' : 'Gasto'));

  const meta = [
    tx.type === 'transferencia' ? `${acc?.name ?? ''} → ${to?.name ?? ''}` : acc?.name,
    showTime ? timeFmt.format(new Date(tx.occurred_at)) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Row
      onClick={() => openEdit(tx)}
      leading={
        tx.type === 'transferencia' ? (
          <IconTile icon={ArrowLeftRight} color="var(--color-label-2)" size={36} />
        ) : pending && !cat ? (
          <IconTile icon={CircleDot} color="var(--color-accent)" size={36} />
        ) : (
          <CategoryIcon icon={cat?.icon ?? null} color={cat?.color ?? null} size={36} />
        )
      }
      title={title}
      subtitle={
        pending ? (
          <>
            <Stamp>Revisar</Stamp>
            {meta}
          </>
        ) : (
          meta
        )
      }
      trailing={
        <span
          className={
            'tnum font-semibold ' +
            (tx.type === 'ingreso' ? 'text-green' : tx.type === 'transferencia' ? 'text-label-2' : 'text-label')
          }
        >
          {tx.type === 'ingreso' ? formatCRC(tx.amount, { sign: true }) : tx.type === 'gasto' ? formatCRC(-tx.amount) : formatCRC(tx.amount)}
        </span>
      }
    />
  );
}
