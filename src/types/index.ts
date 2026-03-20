export type ProductCategory = 'bolos' | 'doces' | 'kits' | 'encomendas' | 'outros';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  photo: string;
  category: ProductCategory;
  active: boolean;
  stock?: number;
  variants?: ProductVariant[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export type OrderStatus = 'pendente' | 'em_producao' | 'pronto' | 'entregue' | 'cancelado';

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variantId?: string;
  variantName?: string;
}

export interface Sale {
  id: string;
  clientId: string;
  items: SaleItem[];
  total: number;
  orderDate: string;
  deliveryDate: string;
  status: OrderStatus;
  notes: string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: 'Pendente',
  em_producao: 'Em Produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bolos: 'Bolos',
  doces: 'Doces',
  kits: 'Kits',
  encomendas: 'Encomendas',
  outros: 'Outros',
};
