import { OrderStatus, STATUS_LABELS } from '@/types';

const statusStyles: Record<OrderStatus, string> = {
  pendente: 'bg-status-pendente text-status-pendente-fg',
  em_producao: 'bg-status-producao text-status-producao-fg',
  pronto: 'bg-status-pronto text-status-pronto-fg',
  entregue: 'bg-status-entregue text-status-entregue-fg',
  cancelado: 'bg-status-cancelado text-status-cancelado-fg',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
