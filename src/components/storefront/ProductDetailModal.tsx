import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product, SaleItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Package, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (items: SaleItem[]) => void;
}

export default function ProductDetailModal({ product, open, onClose, onAddToCart }: ProductDetailModalProps) {
  const [baseQty, setBaseQty] = useState(0);
  const [variantQtys, setVariantQtys] = useState<Record<string, number>>({});

  function resetState() {
    setBaseQty(product?.variants?.length ? 0 : 1);
    setVariantQtys({});
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) onClose();
    else resetState();
  }

  if (!product) return null;

  const hasVariants = product.variants && product.variants.length > 0;

  function handleAdd() {
    const items: SaleItem[] = [];

    if (!hasVariants && baseQty > 0) {
      items.push({
        id: Date.now().toString(36),
        productId: product!.id,
        quantity: baseQty,
        unitPrice: product!.price,
        subtotal: baseQty * product!.price,
      });
    }

    if (hasVariants) {
      if (baseQty > 0) {
        items.push({
          id: Date.now().toString(36) + '_base',
          productId: product!.id,
          quantity: baseQty,
          unitPrice: product!.price,
          subtotal: baseQty * product!.price,
        });
      }
      for (const v of product!.variants!) {
        const qty = variantQtys[v.id] || 0;
        if (qty > 0) {
          items.push({
            id: Date.now().toString(36) + '_' + v.id,
            productId: product!.id,
            quantity: qty,
            unitPrice: v.price,
            subtotal: qty * v.price,
            variantId: v.id,
            variantName: v.name,
          });
        }
      }
    }

    if (items.length === 0) {
      toast.error('Selecione pelo menos 1 item');
      return;
    }

    onAddToCart(items);
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    toast.success(`${totalItems} item(ns) adicionado(s)! 🛒`);
    onClose();
  }

  const totalSelected = baseQty + Object.values(variantQtys).reduce((s, q) => s + q, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-card border-border/50 max-h-[90vh] overflow-hidden p-0 [&>button]:hidden">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-sm md:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col md:flex-row md:h-[75vh] max-h-[90vh]">
          {/* Left: Product Image — scrolls away on mobile, fixed on desktop */}
          <div className="md:w-1/2 md:h-full shrink-0 bg-muted/50 relative overflow-hidden">
            {product.photo ? (
              <img src={product.photo} alt={product.name} className="w-full object-cover aspect-square md:aspect-auto md:absolute md:inset-0 md:h-full" />
            ) : (
              <div className="w-full min-h-[200px] md:h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/30" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="md:w-1/2 md:h-full overflow-y-auto px-5 py-5 space-y-4">
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-xl">{product.name}</DialogTitle>
            </DialogHeader>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Base product row */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {hasVariants ? 'Versão original' : 'Quantidade'}
              </h4>
              <div className="flex items-center justify-between p-3 rounded-button border border-border/50 bg-muted/20 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">{product.name}</p>
                  <p className="text-sm font-semibold text-primary tabular-nums">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setBaseQty(q => Math.max(0, q - 1))} className="w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-medium tabular-nums w-6 text-center">{baseQty}</span>
                  <button onClick={() => setBaseQty(q => q + 1)} className="w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Variants */}
            {hasVariants && (
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Outras versões</h4>
                {product.variants!.map(v => {
                  const qty = variantQtys[v.id] || 0;
                  return (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-button border border-border/50 bg-muted/20 gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium break-words">{v.name}</p>
                        <p className="text-sm font-semibold text-primary tabular-nums">{formatCurrency(v.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setVariantQtys(prev => ({ ...prev, [v.id]: Math.max(0, (prev[v.id] || 0) - 1) }))} className="w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-medium tabular-nums w-6 text-center">{qty}</span>
                        <button onClick={() => setVariantQtys(prev => ({ ...prev, [v.id]: (prev[v.id] || 0) + 1 }))} className="w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add to cart button */}
            <button
              onClick={handleAdd}
              disabled={totalSelected === 0}
              className="w-full py-3.5 bg-sage text-sage-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              {totalSelected > 0
                ? `Adicionar ${totalSelected} ao carrinho`
                : 'Selecione a quantidade'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
