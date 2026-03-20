
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product_variants" ON public.product_variants FOR SELECT TO public USING (true);
CREATE POLICY "Public insert product_variants" ON public.product_variants FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update product_variants" ON public.product_variants FOR UPDATE TO public USING (true);
CREATE POLICY "Public delete product_variants" ON public.product_variants FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;

ALTER TABLE public.sale_items ADD COLUMN variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL;
ALTER TABLE public.sale_items ADD COLUMN variant_name text;
