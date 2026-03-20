import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { SaleItem, OrderStatus, Product } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Search, Plus, Minus, X, ArrowLeft, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function NewSale() {
  const navigate = useNavigate();
  const { products, clients, addClient, addSale } = useStore();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientForm, setQuickClientForm] = useState({ name: '', phone: '', notes: '' });
  const [variantDialogProduct, setVariantDialogProduct] = useState<Product | null>(null);

  const filteredClients = useMemo(() =>
    clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch)),
    [clients, clientSearch]
  );

  const activeProducts = useMemo(() =>
    products.filter(p => p.active && p.name.toLowerCase().includes(productSearch.toLowerCase())),
    [products, productSearch]
  );

  const total = useMemo(() => items.reduce((sum, i) => sum + i.subtotal, 0), [items]);
  const selectedClient = clients.find(c => c.id === selectedClientId);

  function getItemKey(item: SaleItem) {
    return item.variantId ? `${item.productId}__${item.variantId}` : item.productId;
  }

  function addItem(productId: string, variantId?: string, variantName?: string, variantPrice?: number) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const price = variantPrice ?? product.price;
    const key = variantId ? `${productId}__${variantId}` : productId;

    setItems(prev => {
      const existing = prev.find(i => getItemKey(i) === key);
      if (existing) {
        return prev.map(i =>
          getItemKey(i) === key
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [...prev, {
        id: Date.now().toString(36),
        productId, quantity: 1, unitPrice: price, subtotal: price,
        variantId, variantName,
      }];
    });
    setVariantDialogProduct(null);
  }

  function handleProductClick(product: Product) {
    if (product.variants && product.variants.length > 0) {
      setVariantDialogProduct(product);
    } else {
      addItem(product.id);
    }
  }

  function updateQuantity(item: SaleItem, delta: number) {
    const key = getItemKey(item);
    setItems(prev => prev.map(i => {
      if (getItemKey(i) !== key) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      return { ...i, quantity: newQty, subtotal: newQty * i.unitPrice };
    }).filter(Boolean) as SaleItem[]);
  }

  function removeItem(item: SaleItem) {
    const key = getItemKey(item);
    setItems(prev => prev.filter(i => getItemKey(i) !== key));
  }

  async function handleQuickClient() {
    if (!quickClientForm.name.trim()) { toast.error('Informe o nome'); return; }
    await addClient(quickClientForm);
    setQuickClientOpen(false);
    toast.success('Cliente cadastrado! 💕');
  }

  async function handleSave() {
    if (!selectedClientId) { toast.error('Selecione um cliente'); return; }
    if (items.length === 0) { toast.error('Adicione pelo menos um produto'); return; }

    await addSale({
      clientId: selectedClientId, items, total,
      deliveryDate: deliveryDate || new Date().toISOString(),
      status: 'pendente' as OrderStatus, notes,
    });

    toast.success('Venda registrada com carinho! 🧁');
    navigate('/admin/pedidos');
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-button hover:bg-muted/50 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-2xl font-display font-semibold">Nova Venda</h1>
      </div>

      {/* Client Selection */}
      <div className="bg-card rounded-card p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Cliente</Label>
          <button onClick={() => setQuickClientOpen(true)} className="text-xs text-primary font-medium hover:underline">+ Novo cliente</button>
        </div>
        {selectedClient ? (
          <div className="flex items-center justify-between bg-primary/5 rounded-button px-3 py-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <span className="text-sm font-medium">{selectedClient.name}</span>
            </div>
            <button onClick={() => setSelectedClientId('')} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Buscar cliente..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="pl-10 rounded-button" />
            </div>
            {clientSearch && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredClients.map(c => (
                  <button key={c.id} onClick={() => { setSelectedClientId(c.id); setClientSearch(''); }} className="w-full text-left px-3 py-2 rounded-button hover:bg-muted/50 text-sm transition-colors">
                    {c.name} <span className="text-muted-foreground">· {c.phone}</span>
                  </button>
                ))}
                {filteredClients.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">Nenhum cliente encontrado</p>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Products */}
      <div className="bg-card rounded-card p-4 shadow-card space-y-3">
        <Label className="text-sm font-medium">Produtos</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input placeholder="Buscar produto..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="pl-10 rounded-button" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {activeProducts.map(product => {
            const inCartCount = items.filter(i => i.productId === product.id).reduce((s, i) => s + i.quantity, 0);
            return (
              <motion.button key={product.id} whileTap={{ scale: 0.97 }} onClick={() => handleProductClick(product)}
                className={`relative text-left p-3 rounded-2xl border transition-all text-sm ${inCartCount > 0 ? 'border-primary/30 bg-primary/5' : 'border-border/50 hover:border-primary/20 hover:bg-muted/30'}`}>
                {product.photo && (
                  <div className="aspect-square rounded-button overflow-hidden mb-2 bg-muted/50">
                    <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-primary text-xs font-semibold tabular-nums">
                  {product.variants && product.variants.length > 0
                    ? `a partir de ${formatCurrency(Math.min(product.price, ...product.variants.map(v => v.price)))}`
                    : formatCurrency(product.price)}
                </p>
                {inCartCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{inCartCount}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Cart Items */}
        {items.length > 0 && (
          <div className="border-t border-border/50 pt-3 space-y-2">
            <AnimatePresence>
              {items.map(item => {
                const product = products.find(p => p.id === item.productId);
                const displayName = item.variantName ? `${product?.name} (${item.variantName})` : product?.name;
                return (
                  <motion.div key={getItemKey(item)} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between">
                    <span className="text-sm flex-1 truncate">{displayName}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item, -1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium tabular-nums w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item, 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><Plus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium tabular-nums w-20 text-right">{formatCurrency(item.subtotal)}</span>
                      <button onClick={() => removeItem(item)} className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors"><X className="w-3 h-3 text-destructive" /></button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delivery & Notes */}
      <div className="bg-card rounded-card p-4 shadow-card space-y-3">
        <div>
          <Label className="text-sm font-medium">Data de entrega</Label>
          <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="mt-1 rounded-button" />
        </div>
        <div>
          <Label className="text-sm font-medium">Observações</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Alguma observação sobre o pedido..." className="mt-1 rounded-button resize-none" rows={2} />
        </div>
      </div>

      {/* Footer Total */}
      <div className="sticky bottom-20 md:bottom-4 bg-card rounded-card p-4 shadow-soft flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total do pedido</p>
          <p className="text-xl font-semibold tabular-nums">{formatCurrency(total)}</p>
        </div>
        <button onClick={handleSave} disabled={items.length === 0 || !selectedClientId}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5">
          Confirmar Pedido
        </button>
      </div>

      {/* Variant Selection Dialog */}
      <Dialog open={!!variantDialogProduct} onOpenChange={open => { if (!open) setVariantDialogProduct(null); }}>
        <DialogContent className="sm:max-w-sm rounded-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display">Escolha a versão</DialogTitle>
          </DialogHeader>
          {variantDialogProduct && (
            <div className="space-y-2 mt-2">
              <button onClick={() => addItem(variantDialogProduct.id)}
                className="w-full flex items-center justify-between p-3 rounded-button border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
                <span className="text-sm font-medium">{variantDialogProduct.name}</span>
                <span className="text-sm font-semibold text-primary tabular-nums">{formatCurrency(variantDialogProduct.price)}</span>
              </button>
              {variantDialogProduct.variants?.map(v => (
                <button key={v.id} onClick={() => addItem(variantDialogProduct.id, v.id, v.name, v.price)}
                  className="w-full flex items-center justify-between p-3 rounded-button border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <span className="text-sm font-medium">{v.name}</span>
                  <span className="text-sm font-semibold text-primary tabular-nums">{formatCurrency(v.price)}</span>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Client Dialog */}
      <Dialog open={quickClientOpen} onOpenChange={setQuickClientOpen}>
        <DialogContent className="sm:max-w-sm rounded-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-display">Cliente rápido</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Nome</Label>
              <Input value={quickClientForm.name} onChange={e => setQuickClientForm({ ...quickClientForm, name: e.target.value })} className="mt-1 rounded-button" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={quickClientForm.phone} onChange={e => setQuickClientForm({ ...quickClientForm, phone: e.target.value })} className="mt-1 rounded-button" />
            </div>
            <button onClick={handleQuickClient} className="w-full py-3 bg-primary text-primary-foreground rounded-button font-medium text-sm shadow-soft transition-all">Cadastrar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
