import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { OrderStatus, STATUS_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import StatusBadge from '@/components/StatusBadge';
import { ClipboardList, Search, Filter, Download, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/formatters';

const allStatuses: (OrderStatus | 'todos')[] = ['todos', 'pendente', 'em_producao', 'pronto', 'entregue', 'cancelado'];

export default function Orders() {
  const { sales, getClient, getProduct, updateSaleStatus } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');

  const filtered = useMemo(() => {
    return sales
      .filter(s => {
        if (statusFilter !== 'todos' && s.status !== statusFilter) return false;
        if (search) {
          const client = getClient(s.clientId);
          return client?.name.toLowerCase().includes(search.toLowerCase()) || false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [sales, search, statusFilter, getClient]);

  function handleStatusChange(saleId: string, newStatus: OrderStatus) {
    updateSaleStatus(saleId, newStatus);
    if (newStatus === 'entregue') {
      toast.success('Pedido entregue! 🎉');
    } else {
      toast.success('Status atualizado!');
    }
  }

  function handleExport() {
    const data = filtered.map(s => {
      const client = getClient(s.clientId);
      return {
        Pedido: s.id,
        Cliente: client?.name || '',
        Total: s.total,
        Status: STATUS_LABELS[s.status],
        'Data do Pedido': s.orderDate.split('T')[0],
        'Data de Entrega': s.deliveryDate?.split('T')[0] || '',
      };
    });
    exportToCSV(data, `vendas_${new Date().toISOString().split('T')[0]}`);
    toast.success('Exportação concluída! 📄');
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">Pedidos</h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-button hover:bg-muted/50 transition-colors">
          <Download className="w-4 h-4" strokeWidth={1.5} /> Exportar
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border/50 rounded-button" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'todos')}>
          <SelectTrigger className="w-40 rounded-button bg-card border-border/50">
            <Filter className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(sale => {
              const client = getClient(sale.clientId);
              return (
                <motion.div
                  key={sale.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-card rounded-card p-4 shadow-card hover:shadow-card-hover transition-all duration-200"
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
                      {sale.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{sale.notes}"</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Pedido: {formatDate(sale.orderDate)}
                        </span>
                        {sale.deliveryDate && (
                          <span className="text-xs text-muted-foreground">
                            Entrega: {formatDate(sale.deliveryDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-semibold text-sm tabular-nums">{formatCurrency(sale.total)}</p>
                      <StatusBadge status={sale.status} />
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => window.open(`/comanda?id=${sale.id}`, '_blank')}
                          className="w-7 h-7 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors"
                          title="Imprimir comanda"
                        >
                          <Printer className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                        </button>
                        <Select value={sale.status} onValueChange={(v: OrderStatus) => handleStatusChange(sale.id, v)}>
                          <SelectTrigger className="h-7 text-xs rounded-full border-border/50 w-auto min-w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
