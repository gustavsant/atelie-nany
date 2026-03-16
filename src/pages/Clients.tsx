import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Client } from '@/types';
import { formatCurrency, formatShortDate } from '@/lib/formatters';
import { Plus, Search, Users, Edit2, Trash2, Phone, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/StatusBadge';

const emptyClient = { name: '', phone: '', notes: '' };

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient, getClientSales, getProduct } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyClient);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  function openNew() {
    setEditing(null);
    setForm(emptyClient);
    setDialogOpen(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, notes: c.notes });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Informe o nome do cliente'); return; }
    if (editing) {
      await updateClient(editing.id, form);
      toast.success('Cliente atualizado!');
    } else {
      await addClient(form);
      toast.success('Cliente cadastrado! 💕');
    }
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    await deleteClient(id);
    toast.success('Cliente removido');
    if (detailClient?.id === id) setDetailClient(null);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">Clientes</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-button text-sm font-medium shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Novo Cliente</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border/50 rounded-button" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
          <button onClick={openNew} className="text-primary text-sm font-medium mt-2 hover:underline">Cadastrar primeiro cliente</button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(client => {
              const clientSales = getClientSales(client.id);
              const totalSpent = clientSales.reduce((sum, s) => sum + s.total, 0);
              return (
                <motion.div
                  key={client.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-card rounded-card p-4 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer"
                  onClick={() => setDetailClient(detailClient?.id === client.id ? null : client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{client.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" strokeWidth={1.5} /> {client.phone || '—'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {clientSales.length} pedido{clientSales.length !== 1 ? 's' : ''} · {formatCurrency(totalSpent)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {client.phone && (
                        <a
                          href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener"
                          onClick={e => e.stopPropagation()}
                          className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-accent-foreground" strokeWidth={1.5} />
                        </a>
                      )}
                      <button onClick={e => { e.stopPropagation(); openEdit(client); }} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                        <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(client.id); }} className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {detailClient?.id === client.id && clientSales.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Histórico de compras</p>
                          {clientSales.slice(0, 5).map(sale => (
                            <div key={sale.id} className="flex items-center justify-between text-xs">
                              <div>
                                <span className="text-muted-foreground">{formatShortDate(sale.orderDate)}</span>
                                <span className="mx-2">·</span>
                                <span>{sale.items.map(i => getProduct(i.productId)?.name || 'Produto').join(', ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium tabular-nums">{formatCurrency(sale.total)}</span>
                                <StatusBadge status={sale.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do cliente" className="mt-1 rounded-button" />
            </div>
            <div>
              <Label>Telefone / WhatsApp</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" className="mt-1 rounded-button" />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Alguma observação..." className="mt-1 rounded-button resize-none" rows={2} />
            </div>
            <button onClick={handleSave} className="w-full py-3 bg-primary text-primary-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover transition-all">
              {editing ? 'Salvar alterações' : 'Cadastrar cliente'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
