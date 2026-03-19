import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import StatusBadge from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { Package, Users, CalendarDays, TrendingUp, ArrowRight } from 'lucide-react';
import { isToday, parseISO, startOfMonth, isAfter } from 'date-fns';

const softPop = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
};

export default function Dashboard() {
  const { sales, clients, products, getClient, getProduct } = useStore();

  const stats = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);

    const salesToday = sales.filter(s => isToday(parseISO(s.orderDate)));
    const salesMonth = sales.filter(s => isAfter(parseISO(s.orderDate), monthStart));
    const pending = sales.filter(s => s.status === 'pendente' || s.status === 'em_producao');
    const deliveriesToday = sales.filter(s =>
      s.deliveryDate && isToday(parseISO(s.deliveryDate)) && s.status !== 'entregue' && s.status !== 'cancelado'
    );

    return {
      salesToday: salesToday.length,
      salesMonth: salesMonth.length,
      revenueMonth: salesMonth.reduce((sum, s) => sum + s.total, 0),
      pending: pending.length,
      deliveriesToday: deliveriesToday.length,
      nextDeliveries: sales
        .filter(s => s.status !== 'entregue' && s.status !== 'cancelado' && s.deliveryDate)
        .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
        .slice(0, 5),
    };
  }, [sales]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const metricCards = [
    { label: 'Vendas hoje', value: stats.salesToday, icon: Package, color: 'bg-primary/10 text-primary' },
    { label: 'Vendas no mês', value: stats.salesMonth, icon: TrendingUp, color: 'bg-secondary text-secondary-foreground' },
    { label: 'Pedidos pendentes', value: stats.pending, icon: CalendarDays, color: 'bg-status-pendente text-status-pendente-fg' },
    { label: 'Faturamento mensal', value: formatCurrency(stats.revenueMonth), icon: TrendingUp, color: 'bg-accent text-accent-foreground' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div {...softPop}>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">
          {greeting}, Nany! 🧁
        </h1>
        <p className="text-muted-foreground mt-1">
          {stats.deliveriesToday > 0
            ? `Você tem ${stats.deliveriesToday} entrega${stats.deliveriesToday > 1 ? 's' : ''} para hoje.`
            : 'Nenhuma entrega para hoje. Que tal postar uma foto no Instagram?'}
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-card rounded-card p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-9 h-9 rounded-button flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
            <p className="text-xl font-semibold tabular-nums mt-0.5">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Next Deliveries */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Próximas entregas</h2>
          <Link to="/admin/entregas" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.nextDeliveries.length === 0 ? (
          <div className="bg-card rounded-card p-8 shadow-card text-center">
            <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">Nenhuma entrega pendente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.nextDeliveries.map(sale => {
              const client = getClient(sale.clientId);
              return (
                <Link
                  key={sale.id}
                  to={`/admin/pedidos`}
                  className="flex items-center justify-between bg-card rounded-card p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{client?.name || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} · {formatCurrency(sale.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDate(sale.deliveryDate)}
                    </span>
                    <StatusBadge status={sale.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/produtos"
          className="bg-card rounded-card p-4 shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-button bg-secondary flex items-center justify-center">
            <Package className="w-5 h-5 text-secondary-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">{products.length}</p>
            <p className="text-xs text-muted-foreground">Produtos</p>
          </div>
        </Link>
        <Link
          to="/clientes"
          className="bg-card rounded-card p-4 shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-button bg-accent flex items-center justify-center">
            <Users className="w-5 h-5 text-accent-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-semibold tabular-nums">{clients.length}</p>
            <p className="text-xs text-muted-foreground">Clientes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
