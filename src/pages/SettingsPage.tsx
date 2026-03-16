import { useStore } from '@/store/useStore';
import { exportToCSV } from '@/lib/formatters';
import { Download, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function SettingsPage() {
  const { clients, sales, getClient, refresh } = useStore();

  function exportClients() {
    const data = clients.map(c => ({
      Nome: c.name,
      Telefone: c.phone,
      Observações: c.notes,
      'Data de Cadastro': c.createdAt.split('T')[0],
    }));
    exportToCSV(data, 'clientes');
    toast.success('Clientes exportados! 📄');
  }

  function exportSales() {
    const data = sales.map(s => ({
      Cliente: getClient(s.clientId)?.name || '',
      Total: s.total,
      Status: s.status,
      'Data do Pedido': s.orderDate.split('T')[0],
      'Data de Entrega': s.deliveryDate?.split('T')[0] || '',
    }));
    exportToCSV(data, `vendas_${new Date().toISOString().split('T')[0]}`);
    toast.success('Vendas exportadas! 📄');
  }

  async function clearAll() {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      await supabase.from('sale_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await refresh();
      toast.success('Todos os dados foram apagados.');
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-semibold">Configurações</h1>

      <div className="bg-card rounded-card p-5 shadow-card space-y-4">
        <h2 className="font-display text-lg font-semibold">Exportar Dados</h2>
        <p className="text-sm text-muted-foreground">Baixe seus dados em formato CSV para uso em planilhas.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={exportClients} className="flex items-center justify-center gap-2 px-4 py-3 rounded-button bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-80 transition-opacity">
            <Download className="w-4 h-4" strokeWidth={1.5} /> Exportar Clientes
          </button>
          <button onClick={exportSales} className="flex items-center justify-center gap-2 px-4 py-3 rounded-button bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-80 transition-opacity">
            <Download className="w-4 h-4" strokeWidth={1.5} /> Exportar Vendas
          </button>
        </div>
      </div>

      <div className="bg-card rounded-card p-5 shadow-card space-y-4">
        <h2 className="font-display text-lg font-semibold">Sobre</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Ateliê Nany Souza - Sistema de Gestão</p>
          <p>Versão 2.0 · Dados na nuvem ☁️</p>
        </div>
      </div>

      <div className="bg-card rounded-card p-5 shadow-card space-y-4 border border-destructive/20">
        <h2 className="font-display text-lg font-semibold text-destructive">Zona de Perigo</h2>
        <p className="text-sm text-muted-foreground">Apagar todos os dados do sistema. Esta ação é irreversível.</p>
        <button onClick={clearAll} className="flex items-center gap-2 px-4 py-3 rounded-button bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
          <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Apagar tudo
        </button>
      </div>
    </div>
  );
}
