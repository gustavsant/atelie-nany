import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/formatters';
import { CATEGORY_LABELS, ProductCategory, SaleItem } from '@/types';
import { ShoppingBag, Plus, Minus, X, Package, Cake, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import EasterDoodles from '@/components/EasterDoodles';

export default function Storefront() {
  const { products, addClient, addSale, clients } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', notes: '' });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeProducts = useMemo(() =>
    products.filter(p => p.active)
      .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, categoryFilter, search]
  );

  const categories = useMemo(() => {
    const cats = new Set(products.filter(p => p.active).map(p => p.category));
    return Array.from(cats);
  }, [products]);

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.subtotal, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  function addToCart(productId: string) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [...prev, { id: Date.now().toString(36), productId, quantity: 1, unitPrice: product.price, subtotal: product.price }];
    });
    toast.success(`${product.name} adicionado! 🛒`);
  }

  function updateCartQty(productId: string, delta: number) {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null as any;
      return { ...i, quantity: newQty, subtotal: newQty * i.unitPrice };
    }).filter(Boolean));
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  async function handleCheckout() {
    if (!customerForm.name.trim()) { toast.error('Informe seu nome'); return; }
    if (!customerForm.phone.trim()) { toast.error('Informe seu telefone'); return; }
    if (cart.length === 0) { toast.error('Seu carrinho está vazio'); return; }

    setSubmitting(true);
    try {
      // Find or create client
      let clientId: string;
      const existingClient = clients.find(c =>
        c.phone.replace(/\D/g, '') === customerForm.phone.replace(/\D/g, '') && c.phone.length > 3
      );

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // addClient updates local state; we need the ID from the newly created client
        await addClient({ name: customerForm.name, phone: customerForm.phone, notes: customerForm.notes });
        // Wait briefly for the state update
        await new Promise(r => setTimeout(r, 500));
        // Re-check clients after addClient
        const updatedClients = clients;
        const newClient = updatedClients.find(c => c.phone === customerForm.phone);
        if (!newClient) {
          // Fallback: fetch the client directly
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase.from('clients').select('id').eq('phone', customerForm.phone).order('created_at', { ascending: false }).limit(1).single();
          if (!data) { toast.error('Erro ao registrar cliente'); setSubmitting(false); return; }
          clientId = data.id;
        } else {
          clientId = newClient.id;
        }
      }

      await addSale({
        clientId,
        items: cart,
        total: cartTotal,
        deliveryDate: deliveryDate || new Date().toISOString(),
        status: 'pendente',
        notes: orderNotes,
      });

      toast.success('Pedido enviado com sucesso! 🎉');
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setCustomerForm({ name: '', phone: '', notes: '' });
      setDeliveryDate('');
      setOrderNotes('');
    } catch {
      toast.error('Erro ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <EasterDoodles />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-sage/20 flex items-center justify-center">
              <Cake className="w-5 h-5 text-sage" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-base font-semibold leading-tight">Ateliê Nany Souza</h1>
              <p className="text-[10px] text-muted-foreground">Doces com carinho 🧁</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center hover:bg-sage/20 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-sage" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl md:text-3xl font-display font-semibold">
            Nossos Produtos 🧁
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Escolha seus favoritos e faça seu pedido!</p>
        </motion.div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto px-4 space-y-3 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-border/50 rounded-button"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === 'all' ? 'bg-sage text-sage-foreground' : 'bg-card text-muted-foreground hover:bg-muted/50'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat ? 'bg-sage text-sage-foreground' : 'bg-card text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-32">
        {activeProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">Nenhum produto disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {activeProducts.map((product, i) => {
              const inCart = cart.find(c => c.productId === product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="bg-card rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
                >
                  <div className="aspect-square bg-muted/50 relative overflow-hidden">
                    {product.photo ? (
                      <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
                      </div>
                    )}
                    {inCart && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {CATEGORY_LABELS[product.category]}
                    </span>
                    <p className="font-medium text-sm mt-0.5 truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-primary font-semibold text-sm tabular-nums">{formatCurrency(product.price)}</p>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-8 h-8 rounded-full bg-sage text-sage-foreground flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between bg-sage text-sage-foreground rounded-card px-5 py-4 shadow-fab"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium text-sm">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
              </div>
              <span className="font-semibold tabular-nums">{formatCurrency(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-md rounded-card border-border/50 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sage" strokeWidth={1.5} />
              Seu Carrinho
            </DialogTitle>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-muted-foreground text-sm">Carrinho vazio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={item.productId} className="flex items-center gap-3 bg-muted/30 rounded-button p-3">
                    {product?.photo && (
                      <img src={product.photo} alt={product?.name} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product?.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{formatCurrency(item.unitPrice)} cada</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCartQty(item.productId, -1)} className="w-7 h-7 rounded-full bg-card flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium tabular-nums w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.productId, 1)} className="w-7 h-7 rounded-full bg-card flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.productId)} className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center ml-1">
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                <span className="font-medium text-sm">Total</span>
                <span className="text-lg font-semibold tabular-nums text-primary">{formatCurrency(cartTotal)}</span>
              </div>

              <button
                onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                className="w-full py-3 bg-sage text-sage-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover transition-all"
              >
                Finalizar Pedido
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md rounded-card border-border/50 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Finalizar Pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="bg-muted/30 rounded-button p-3 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Resumo</p>
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.quantity}x {product?.name}</span>
                    <span className="tabular-nums font-medium">{formatCurrency(item.subtotal)}</span>
                  </div>
                );
              })}
              <div className="border-t border-border/30 pt-1 mt-1 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span className="text-primary tabular-nums">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div>
              <Label>Seu nome *</Label>
              <Input
                value={customerForm.name}
                onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Maria Silva"
                className="mt-1 rounded-button"
              />
            </div>
            <div>
              <Label>Telefone / WhatsApp *</Label>
              <Input
                value={customerForm.phone}
                onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="mt-1 rounded-button"
              />
            </div>
            <div>
              <Label>Data de entrega desejada</Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="mt-1 rounded-button"
              />
            </div>
            <div>
              <Label>Observações do pedido</Label>
              <Textarea
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                placeholder="Ex: sem glúten, entregar à tarde..."
                className="mt-1 rounded-button resize-none"
                rows={2}
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3 bg-sage text-sage-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover disabled:opacity-50 transition-all"
            >
              {submitting ? 'Enviando pedido...' : 'Enviar Pedido 🎉'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
