import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Product, ProductCategory, ProductVariant, CATEGORY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Plus, Search, Edit2, Trash2, Package, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface VariantForm {
  name: string;
  price: number;
}

const emptyProduct = {
  name: '', description: '', price: 0, photo: '', category: 'doces' as ProductCategory, active: true, stock: undefined as number | undefined,
};

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [variants, setVariants] = useState<VariantForm[]>([]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditing(null);
    setForm(emptyProduct);
    setVariants([]);
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, photo: p.photo, category: p.category, active: p.active, stock: p.stock });
    setVariants((p.variants || []).map(v => ({ name: v.name, price: v.price })));
    setDialogOpen(true);
  }

  function addVariant() {
    setVariants(prev => [...prev, { name: '', price: 0 }]);
  }

  function updateVariant(index: number, field: keyof VariantForm, value: string | number) {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  }

  function removeVariant(index: number) {
    setVariants(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Informe o nome do produto'); return; }
    if (form.price <= 0) { toast.error('Informe um preço válido'); return; }

    const validVariants = variants.filter(v => v.name.trim() && v.price > 0);
    const productVariants: Omit<ProductVariant, 'id'>[] = validVariants.map(v => ({
      productId: '', name: v.name, price: v.price,
    }));

    if (editing) {
      await updateProduct(editing.id, {
        ...form,
        variants: productVariants as ProductVariant[],
      });
      toast.success('Produto atualizado!');
    } else {
      await addProduct({
        ...form,
        variants: productVariants as ProductVariant[],
      });
      toast.success('Produto cadastrado com carinho! 🧁');
    }
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    await deleteProduct(id);
    toast.success('Produto removido');
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">Produtos</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-button text-sm font-medium shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Novo Produto</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border/50 rounded-button" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground">Nenhum produto cadastrado</p>
          <button onClick={openNew} className="text-primary text-sm font-medium mt-2 hover:underline">Cadastrar primeiro produto</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <AnimatePresence>
            {filtered.map(product => (
              <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-card rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group ${!product.active ? 'opacity-60' : ''}`}>
                <div className="aspect-square bg-muted/50 relative overflow-hidden">
                  {product.photo ? (
                    <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground/30" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors">
                      <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" strokeWidth={1.5} />
                    </button>
                  </div>
                  {!product.active && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <span className="text-xs font-medium bg-card px-2 py-1 rounded-full">Inativo</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{CATEGORY_LABELS[product.category]}</span>
                  <p className="font-medium text-sm mt-0.5 truncate">{product.name}</p>
                  <p className="text-primary font-semibold text-sm mt-1 tabular-nums">{formatCurrency(product.price)}</p>
                  {product.variants && product.variants.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{product.variants.length} {product.variants.length === 1 ? 'versão' : 'versões'}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-card border-border/50 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Bolo de Pote" className="mt-1 rounded-button" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição do produto" className="mt-1 rounded-button resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preço base (R$)</Label>
                <Input type="number" step="0.01" min="0" value={form.price || ''} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="mt-1 rounded-button tabular-nums" />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v: ProductCategory) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1 rounded-button"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>URL da foto</Label>
              <Input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} placeholder="https://..." className="mt-1 rounded-button" />
            </div>
            <div>
              <Label>Estoque (opcional)</Label>
              <Input type="number" min="0" value={form.stock ?? ''} onChange={e => setForm({ ...form, stock: e.target.value ? parseInt(e.target.value) : undefined })} className="mt-1 rounded-button" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Produto ativo</Label>
              <Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} />
            </div>

            {/* Variants */}
            <div className="border-t border-border/30 pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Versões (tamanhos, sabores...)</Label>
                <button onClick={addVariant} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">Opcional. Cada versão tem seu próprio nome e preço.</p>
              
              {variants.length > 0 && (
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-button p-2">
                      <Input
                        placeholder="Ex: Grande"
                        value={v.name}
                        onChange={e => updateVariant(i, 'name', e.target.value)}
                        className="flex-1 h-8 text-sm rounded-button"
                      />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.price || ''}
                          onChange={e => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm pl-7 rounded-button tabular-nums"
                        />
                      </div>
                      <button onClick={() => removeVariant(i)} className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSave} className="w-full py-3 bg-primary text-primary-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover transition-all">
              {editing ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
