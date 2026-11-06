import { ArrowLeftRight, CircleDot } from 'lucide-react';
import { CategoryIcon, IconTile, Row, Stamp } from '../../components/ui';
import { useT } from '../../i18n';
import { crTime } from '../../lib/dates';
import { formatUSD } from '../../lib/fx';
import { formatCRC } from '../../lib/money';
import type { Account, Category, Transaction } from '../../lib/types';
import { useEditor } from './editor';

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
  const t = useT();
  const { openEdit } = useEditor();
  const cat = tx.category_id ? categories.get(tx.category_id) : undefined;
  const acc = accounts.get(tx.account_id);
  const to = tx.to_account_id ? accounts.get(tx.to_account_id) : undefined;
  const pending = tx.status === 'por_revisar';

  const title =
    tx.type === 'transferencia'
      ? (tx.merchant ?? tx.note ?? `${acc?.name ?? t.transactions.account} → ${to?.name ?? t.transactions.account}`)
      : (tx.merchant ?? cat?.name ?? (tx.type === 'ingreso' ? t.transactions.types.income : t.transactions.types.expense));

  const meta = [
    // Con el sello «Revisar» no cabe todo: se queda la hora (identifica el cobro) y la tarjeta se ve al abrirlo.
    tx.type === 'transferencia' ? `${acc?.name ?? ''} → ${to?.name ?? ''}` : pending ? null : acc?.name,
    showTime ? crTime(new Date(tx.occurred_at)) : null,
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
            <Stamp>{t.transactions.reviewStamp}</Stamp>
            {meta}
          </>
        ) : (
          meta
        )
      }
      trailing={
        // Pago de Wallet que llegó sin monto: se completa al revisarlo.
        tx.amount === 0 ? (
          <span className="text-subhead text-label-2">{t.transactions.noAmount}</span>
        ) : (
        <span className="block text-right">
          <span
            className={
              'tnum block font-semibold ' +
              (tx.type === 'ingreso' ? 'text-green' : tx.type === 'transferencia' ? 'text-label-2' : 'text-label')
            }
          >
            {tx.type === 'ingreso' ? formatCRC(tx.amount, { sign: true }) : tx.type === 'gasto' ? formatCRC(-tx.amount) : formatCRC(tx.amount)}
          </span>
          {/* Pagado en dólares: lo que se pagó de verdad, debajo de los colones que cuentan. */}
          {tx.original_currency === 'USD' && tx.original_amount ? (
            <span className="tnum block text-footnote text-label-2">{formatUSD(tx.original_amount)}</span>
          ) : null}
        </span>
        )
      }
    />
  );
}
