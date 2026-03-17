import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Client, Sale, SaleItem, OrderStatus } from '@/types';

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;

  // Clients
  clients: Client[];
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClient: (id: string) => Client | undefined;

  // Sales
  sales: Sale[];
  addSale: (s: Omit<Sale, 'id' | 'orderDate'>) => Promise<void>;
  updateSale: (id: string, s: Partial<Sale>) => Promise<void>;
  updateSaleStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  getSale: (id: string) => Sale | undefined;
  getClientSales: (clientId: string) => Sale[];

  loading: boolean;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    photo: row.photo,
    category: row.category,
    active: row.active,
    stock: row.stock ?? undefined,
  };
}

function mapClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapSale(row: any, items: SaleItem[]): Sale {
  return {
    id: row.id,
    clientId: row.client_id,
    items,
    total: Number(row.total),
    orderDate: row.order_date,
    deliveryDate: row.delivery_date || '',
    status: row.status,
    notes: row.notes,
  };
}

function mapSaleItem(row: any): SaleItem {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    subtotal: Number(row.subtotal),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const [prodRes, clientRes, saleRes, itemRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('sales').select('*').order('order_date', { ascending: false }),
      supabase.from('sale_items').select('*'),
    ]);

    setProducts((prodRes.data || []).map(mapProduct));
    setClients((clientRes.data || []).map(mapClient));

    const allItems = (itemRes.data || []).map(mapSaleItem);
    const salesData = (saleRes.data || []).map(row => {
      const items = allItems.filter(i => {
        // sale_id is on the raw row, but mapSaleItem doesn't have it
        const rawItem = (itemRes.data || []).find(r => r.id === i.id);
        return rawItem?.sale_id === row.id;
      });
      return mapSale(row, items);
    });
    setSales(salesData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Products
  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    const { data, error } = await supabase.from('products').insert({
      name: p.name,
      description: p.description,
      price: p.price,
      photo: p.photo,
      category: p.category,
      active: p.active,
      stock: p.stock ?? null,
    }).select().single();
    if (data) setProducts(prev => [mapProduct(data), ...prev]);
  }, []);

  const updateProduct = useCallback(async (id: string, p: Partial<Product>) => {
    const update: any = {};
    if (p.name !== undefined) update.name = p.name;
    if (p.description !== undefined) update.description = p.description;
    if (p.price !== undefined) update.price = p.price;
    if (p.photo !== undefined) update.photo = p.photo;
    if (p.category !== undefined) update.category = p.category;
    if (p.active !== undefined) update.active = p.active;
    if (p.stock !== undefined) update.stock = p.stock;

    const { data } = await supabase.from('products').update(update).eq('id', id).select().single();
    if (data) setProducts(prev => prev.map(item => item.id === id ? mapProduct(data) : item));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(item => item.id !== id));
  }, []);

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products]);

  // Clients
  const addClient = useCallback(async (c: Omit<Client, 'id' | 'createdAt'>) => {
    const { data } = await supabase.from('clients').insert({
      name: c.name,
      phone: c.phone,
      notes: c.notes,
    }).select().single();
    if (data) setClients(prev => [mapClient(data), ...prev]);
  }, []);

  const updateClient = useCallback(async (id: string, c: Partial<Client>) => {
    const update: any = {};
    if (c.name !== undefined) update.name = c.name;
    if (c.phone !== undefined) update.phone = c.phone;
    if (c.notes !== undefined) update.notes = c.notes;

    const { data } = await supabase.from('clients').update(update).eq('id', id).select().single();
    if (data) setClients(prev => prev.map(item => item.id === id ? mapClient(data) : item));
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(item => item.id !== id));
  }, []);

  const getClient = useCallback((id: string) => clients.find(c => c.id === id), [clients]);

  // Sales
  const addSale = useCallback(async (s: Omit<Sale, 'id' | 'orderDate'>) => {
    const { data: saleData } = await supabase.from('sales').insert({
      client_id: s.clientId,
      total: s.total,
      delivery_date: s.deliveryDate || null,
      status: s.status,
      notes: s.notes,
    }).select().single();

    if (!saleData) return;

    // Insert sale items
    const itemsToInsert = s.items.map(item => ({
      sale_id: saleData.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }));

    const { data: itemsData } = await supabase.from('sale_items').insert(itemsToInsert).select();
    const mappedItems = (itemsData || []).map(mapSaleItem);
    setSales(prev => [mapSale(saleData, mappedItems), ...prev]);

    // Decrease stock
    for (const item of s.items) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.stock !== undefined) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
        setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: newStock } : p));
      }
    }
  }, [products]);

  const updateSale = useCallback(async (id: string, s: Partial<Sale>) => {
    const update: any = {};
    if (s.clientId !== undefined) update.client_id = s.clientId;
    if (s.total !== undefined) update.total = s.total;
    if (s.deliveryDate !== undefined) update.delivery_date = s.deliveryDate || null;
    if (s.status !== undefined) update.status = s.status;
    if (s.notes !== undefined) update.notes = s.notes;

    const { data } = await supabase.from('sales').update(update).eq('id', id).select().single();
    if (data) {
      setSales(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, ...s, clientId: data.client_id, orderDate: data.order_date, deliveryDate: data.delivery_date || '', status: data.status, total: Number(data.total), notes: data.notes };
        }
        return item;
      }));
    }
  }, []);

  const updateSaleStatus = useCallback(async (id: string, status: OrderStatus) => {
    await supabase.from('sales').update({ status }).eq('id', id);
    setSales(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  }, []);

  const deleteSale = useCallback(async (id: string) => {
    await supabase.from('sales').delete().eq('id', id);
    setSales(prev => prev.filter(item => item.id !== id));
  }, []);

  const getSale = useCallback((id: string) => sales.find(s => s.id === id), [sales]);
  const getClientSales = useCallback((clientId: string) => sales.filter(s => s.clientId === clientId), [sales]);

  return (
    <StoreContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, getProduct,
      clients, addClient, updateClient, deleteClient, getClient,
      sales, addSale, updateSale, updateSaleStatus, deleteSale, getSale, getClientSales,
      loading, refresh: fetchAll,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
