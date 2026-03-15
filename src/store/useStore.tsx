import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Client, Sale, SaleItem, OrderStatus } from '@/types';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;

  // Clients
  clients: Client[];
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;

  // Sales
  sales: Sale[];
  addSale: (s: Omit<Sale, 'id' | 'orderDate'>) => void;
  updateSale: (id: string, s: Partial<Sale>) => void;
  updateSaleStatus: (id: string, status: OrderStatus) => void;
  deleteSale: (id: string) => void;
  getSale: (id: string) => Sale | undefined;
  getClientSales: (clientId: string) => Sale[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('nany_products', []));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('nany_clients', []));
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('nany_sales', []));

  useEffect(() => saveToStorage('nany_products', products), [products]);
  useEffect(() => saveToStorage('nany_clients', clients), [clients]);
  useEffect(() => saveToStorage('nany_sales', sales), [sales]);

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...p, id: generateId() }]);
  }, []);

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setProducts(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
  }, []);

  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products]);

  const addClient = useCallback((c: Omit<Client, 'id' | 'createdAt'>) => {
    setClients(prev => [...prev, { ...c, id: generateId(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateClient = useCallback((id: string, c: Partial<Client>) => {
    setClients(prev => prev.map(item => item.id === id ? { ...item, ...c } : item));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(item => item.id !== id));
  }, []);

  const getClient = useCallback((id: string) => clients.find(c => c.id === id), [clients]);

  const addSale = useCallback((s: Omit<Sale, 'id' | 'orderDate'>) => {
    const newSale: Sale = { ...s, id: generateId(), orderDate: new Date().toISOString() };
    setSales(prev => [...prev, newSale]);
    // Decrease stock
    s.items.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id === item.productId && p.stock !== undefined) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      }));
    });
  }, []);

  const updateSale = useCallback((id: string, s: Partial<Sale>) => {
    setSales(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
  }, []);

  const updateSaleStatus = useCallback((id: string, status: OrderStatus) => {
    setSales(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  }, []);

  const deleteSale = useCallback((id: string) => {
    setSales(prev => prev.filter(item => item.id !== id));
  }, []);

  const getSale = useCallback((id: string) => sales.find(s => s.id === id), [sales]);

  const getClientSales = useCallback((clientId: string) => sales.filter(s => s.clientId === clientId), [sales]);

  return (
    <StoreContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, getProduct,
      clients, addClient, updateClient, deleteClient, getClient,
      sales, addSale, updateSale, updateSaleStatus, deleteSale, getSale, getClientSales,
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
