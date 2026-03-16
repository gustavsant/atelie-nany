
-- Create product category enum
CREATE TYPE public.product_category AS ENUM ('bolos', 'doces', 'kits', 'encomendas', 'outros');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pendente', 'em_producao', 'pronto', 'entregue', 'cancelado');

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  photo TEXT NOT NULL DEFAULT '',
  category product_category NOT NULL DEFAULT 'outros',
  active BOOLEAN NOT NULL DEFAULT true,
  stock INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  status order_status NOT NULL DEFAULT 'pendente',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sale items table
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Enable RLS on all tables (public access since no auth)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Public delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Public read sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Public insert sales" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sales" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Public delete sales" ON public.sales FOR DELETE USING (true);

CREATE POLICY "Public read sale_items" ON public.sale_items FOR SELECT USING (true);
CREATE POLICY "Public insert sale_items" ON public.sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sale_items" ON public.sale_items FOR UPDATE USING (true);
CREATE POLICY "Public delete sale_items" ON public.sale_items FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_sales_client_id ON public.sales(client_id);
CREATE INDEX idx_sales_status ON public.sales(status);
CREATE INDEX idx_sales_delivery_date ON public.sales(delivery_date);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON public.sale_items(product_id);
