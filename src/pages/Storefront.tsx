import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/formatters';
import { CATEGORY_LABELS, ProductCategory, Product, SaleItem } from '@/types';
import { ShoppingBag, Plus, Minus, X, Package, Cake, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import StorefrontDoodles from '@/components/StorefrontDoodles';
import ProductDetailModal from '@/components/storefront/ProductDetailModal';

const CUSTOMER_STORAGE_KEY = 'atelie_nany_customer';

function loadSavedCustomer() {
  try {
    const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as { name: string; phone: string; notes: string; clientId?: string };
  } catch {}
  return null;
}

function saveCustomer(data: { name: string; phone: string; notes: string; clientId?: string }) {
  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(data));
}

export default function Storefront() {
  const { products, addClient, addSale, clients } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const savedCustomer = loadSavedCustomer();
  const [customerForm, setCustomerForm] = useState({
    name: savedCustomer?.name || '',
    phone: savedCustomer?.phone || '',
    notes: savedCustomer?.notes || '',
  });
  const [savedClientId, setSavedClientId] = useState<string | undefined>(savedCustomer?.clientId);

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

  function addItemsToCart(items: SaleItem[]) {
    setCart(prev => {
      let updated = [...prev];
      for (const item of items) {
        const cartKey = item.variantId ? `${item.productId}__${item.variantId}` : item.productId;
        const existingIdx = updated.findIndex(i => {
          const key = i.variantId ? `${i.productId}__${i.variantId}` : i.productId;
          return key === cartKey;
        });
        if (existingIdx >= 0) {
          const existing = updated[existingIdx];
          const newQty = existing.quantity + item.quantity;
          updated[existingIdx] = { ...existing, quantity: newQty, subtotal: newQty * existing.unitPrice };
        } else {
          updated.push(item);
        }
      }
      return updated;
    });
  }

  function getCartItemKey(item: SaleItem) {
    return item.variantId ? `${item.productId}__${item.variantId}` : item.productId;
  }

  function updateCartQty(item: SaleItem, delta: number) {
    const key = getCartItemKey(item);
    setCart(prev => prev.map(i => {
      if (getCartItemKey(i) !== key) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null as any;
      return { ...i, quantity: newQty, subtotal: newQty * i.unitPrice };
    }).filter(Boolean));
  }

  function removeFromCart(item: SaleItem) {
    const key = getCartItemKey(item);
    setCart(prev => prev.filter(i => getCartItemKey(i) !== key));
  }

  async function handleCheckout() {
    if (!customerForm.name.trim()) { toast.error('Informe seu nome'); return; }
    if (!customerForm.phone.trim()) { toast.error('Informe seu telefone'); return; }
    if (cart.length === 0) { toast.error('Seu carrinho está vazio'); return; }

    setSubmitting(true);
    try {
      let clientId = savedClientId;

      // Check if saved client still exists
      if (clientId) {
        const existing = clients.find(c => c.id === clientId);
        if (!existing) clientId = undefined;
      }

      // Try to find by phone
      if (!clientId) {
        const existingClient = clients.find(c =>
          c.phone.replace(/\D/g, '') === customerForm.phone.replace(/\D/g, '') && c.phone.length > 3
        );
        if (existingClient) clientId = existingClient.id;
      }

      // Create new client if needed
      if (!clientId) {
        await addClient({ name: customerForm.name, phone: customerForm.phone, notes: customerForm.notes });
        await new Promise(r => setTimeout(r, 500));
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase.from('clients').select('id').eq('phone', customerForm.phone).order('created_at', { ascending: false }).limit(1).single();
        if (!data) { toast.error('Erro ao registrar cliente'); setSubmitting(false); return; }
        clientId = data.id;
      }

      // Save customer data for future orders
      saveCustomer({ ...customerForm, clientId });
      setSavedClientId(clientId);

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
      setDeliveryDate('');
      setOrderNotes('');
    } catch {
      toast.error('Erro ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  }

  const isReturningCustomer = !!savedClientId;

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'hsl(340, 80%, 96%)' }}>
      <StorefrontDoodles />

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
          <button onClick={() => setCartOpen(true)} className="relative w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center hover:bg-sage/20 transition-colors">
            <ShoppingBag className="w-5 h-5 text-sage" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl md:text-3xl font-display font-semibold">Nossos Produtos 🧁</h2>
          <p className="text-muted-foreground mt-1 text-sm">Escolha seus favoritos e faça seu pedido!</p>
          {isReturningCustomer && (
            <p className="text-xs text-sage mt-1">Bem-vindo(a) de volta, {customerForm.name}! 💚</p>
          )}
        </motion.div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-5xl mx-auto px-4 space-y-3 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border/50 rounded-button" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button onClick={() => setCategoryFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === 'all' ? 'bg-sage text-sage-foreground' : 'bg-card text-muted-foreground hover:bg-muted/50'}`}>
            Todos
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${categoryFilter === cat ? 'bg-sage text-sage-foreground' : 'bg-card text-muted-foreground hover:bg-muted/50'}`}>
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
              const inCartCount = cart.filter(c => c.productId === product.id).reduce((s, c) => s + c.quantity, 0);
              return (
                <motion.div key={product.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-card rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group cursor-pointer">
                  <div className="aspect-square bg-muted/50 relative overflow-hidden">
                    {product.photo ? (
                      <img src={product.photo} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
                      </div>
                    )}
                    {inCartCount > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">{inCartCount}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{CATEGORY_LABELS[product.category]}</span>
                    <p className="font-medium text-sm mt-0.5 truncate">{product.name}</p>
                    {product.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>}
                    <div className="mt-2">
                      <p className="text-primary font-semibold text-sm tabular-nums">
                        {product.variants && product.variants.length > 0
                          ? `a partir de ${formatCurrency(Math.min(product.price, ...product.variants.map(v => v.price)))}`
                          : formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addItemsToCart}
      />

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              rotate: [0, 0, -2, 2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              scale: [1, 1, 1.03, 1.03, 1.03, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            }}
            transition={{
              y: { duration: 0.4 },
              opacity: { duration: 0.4 },
              rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto"
          >
            <button onClick={() => setCartOpen(true)} className="w-full flex items-center justify-between bg-sage text-sage-foreground rounded-card px-5 py-4 shadow-fab">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium text-sm">{cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tabular-nums">{formatCurrency(cartTotal)}</span>
                <span className="text-xs opacity-80">• Finalizar pedido</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-none sm:max-w-[70vw] rounded-card border-border/50 max-h-[85vh] overflow-y-auto [&>button]:hidden sm:[&>button]:flex">
          {/* Mobile close */}
          <button onClick={() => setCartOpen(false)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center sm:hidden">
            <X className="w-4 h-4" />
          </button>
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
                const displayName = item.variantName ? `${product?.name} (${item.variantName})` : product?.name;
                return (
                  <div key={getCartItemKey(item)} className="flex items-center gap-3 bg-muted/30 rounded-button p-3">
                    {product?.photo && (
                      <img src={product.photo} alt={displayName} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">{displayName}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{formatCurrency(item.unitPrice)} cada</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCartQty(item, -1)} className="w-7 h-7 rounded-full bg-card flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium tabular-nums w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item, 1)} className="w-7 h-7 rounded-full bg-card flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => removeFromCart(item)} className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center ml-1"><X className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                <span className="font-medium text-sm">Total</span>
                <span className="text-lg font-semibold tabular-nums text-primary">{formatCurrency(cartTotal)}</span>
              </div>

              <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} className="w-full py-3 bg-sage text-sage-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover transition-all">
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
                const displayName = item.variantName ? `${product?.name} (${item.variantName})` : product?.name;
                return (
                  <div key={getCartItemKey(item)} className="flex justify-between text-sm">
                    <span>{item.quantity}x {displayName}</span>
                    <span className="tabular-nums font-medium">{formatCurrency(item.subtotal)}</span>
                  </div>
                );
              })}
              <div className="border-t border-border/30 pt-1 mt-1 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <span className="text-primary tabular-nums">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {isReturningCustomer && (
              <div className="bg-sage/10 rounded-button p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{customerForm.name}</p>
                  <p className="text-xs text-muted-foreground">{customerForm.phone}</p>
                </div>
                <button
                  onClick={() => { setSavedClientId(undefined); localStorage.removeItem(CUSTOMER_STORAGE_KEY); }}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Não sou eu
                </button>
              </div>
            )}

            {!isReturningCustomer && (
              <>
                <div>
                  <Label>Seu nome *</Label>
                  <Input value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} placeholder="Maria Silva" className="mt-1 rounded-button" />
                </div>
                <div>
                  <Label>Telefone / WhatsApp *</Label>
                  <Input value={customerForm.phone} onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" className="mt-1 rounded-button" />
                </div>
              </>
            )}

            <div>
              <Label>Data de entrega desejada</Label>
              <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="mt-1 rounded-button" />
            </div>
            <div>
              <Label>Observações do pedido</Label>
              <Textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Ex: sem glúten, entregar à tarde..." className="mt-1 rounded-button resize-none" rows={2} />
            </div>

            <button onClick={handleCheckout} disabled={submitting} className="w-full py-3 bg-sage text-sage-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover disabled:opacity-50 transition-all">
              {submitting ? 'Enviando pedido...' : 'Enviar Pedido 🎉'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
