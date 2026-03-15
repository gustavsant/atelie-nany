import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate, formatFullDate } from '@/lib/formatters';
import StatusBadge from '@/components/StatusBadge';
import { CalendarDays, MessageCircle } from 'lucide-react';
import { isToday, isTomorrow, parseISO, isBefore, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

export default function DeliverySchedule() {
  const { sales, getClient, getProduct } = useStore();

  const grouped = useMemo(() => {
    const upcoming = sales
      .filter(s => s.deliveryDate && s.status !== 'entregue' && s.status !== 'cancelado')
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    const groups: Record<string, typeof upcoming> = {};
    upcoming.forEach(sale => {
      const dateKey = sale.deliveryDate.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(sale);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      label: formatDate(date + 'T00:00:00'),
      fullLabel: formatFullDate(date + 'T00:00:00'),
      isToday: isToday(parseISO(date)),
      isPast: isBefore(parseISO(date), startOfDay(new Date())),
      items,
    }));
  }, [sales]);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-display font-semibold">Agenda de Entregas</h1>

      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground">Nenhuma entrega agendada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${group.isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {group.label}
                </span>
                {group.isToday && (
                  <span className="text-[10px] uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                    Hoje
                  </span>
                )}
                {group.isPast && (
                  <span className="text-[10px] uppercase tracking-wider bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">
                    Atrasado
                  </span>
                )}
                <span className="text-xs text-muted-foreground">· {group.items.length} pedido{group.items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {group.items.map(sale => {
                  const client = getClient(sale.clientId);
                  return (
                    <motion.div
                      key={sale.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-card rounded-card p-4 shadow-card transition-all duration-200 ${group.isToday ? 'ring-1 ring-primary/20' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{client?.name || 'Cliente'}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {sale.items.map(i => {
                              const p = getProduct(i.productId);
                              return `${i.quantity}x ${p?.name || 'Produto'}`;
                            }).join(', ')}
                          </p>
                          <p className="text-sm font-semibold tabular-nums mt-2">{formatCurrency(sale.total)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={sale.status} />
                          {client?.phone && (
                            <a
                              href={`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Olá ${client.name}! Seu pedido está pronto para entrega 🧁`}
                              target="_blank"
                              rel="noopener"
                              className="flex items-center gap-1 text-xs text-accent-foreground bg-accent px-2.5 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
                            >
                              <MessageCircle className="w-3 h-3" strokeWidth={1.5} />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
