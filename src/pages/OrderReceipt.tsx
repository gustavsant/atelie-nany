import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceiptData {
  clientName: string;
  orderDate: string;
  deliveryDate: string | null;
  notes: string;
  items: { name: string; variantName?: string; quantity: number; unitPrice: number; subtotal: number }[];
  total: number;
}

export default function OrderReceipt() {
  const [params] = useSearchParams();
  const saleId = params.get('id');
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!saleId) return;

    async function load() {
      const { data: sale } = await supabase.from('sales').select('*').eq('id', saleId).single();
      if (!sale) { setLoading(false); return; }

      const { data: client } = await supabase.from('clients').select('name').eq('id', sale.client_id).single();
      const { data: items } = await supabase.from('sale_items').select('*, products(name)').eq('sale_id', saleId!);

      setData({
        clientName: client?.name || 'Cliente',
        orderDate: sale.order_date,
        deliveryDate: sale.delivery_date,
        notes: sale.notes,
        items: (items || []).map((i: any) => ({
          name: i.products?.name || 'Produto',
          variantName: i.variant_name || undefined,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          subtotal: Number(i.subtotal),
        })),
        total: Number(sale.total),
      });
      setLoading(false);
    }

    load();
  }, [saleId]);

  useEffect(() => {
    if (data) {
      setTimeout(() => window.print(), 500);
    }
  }, [data]);

  if (loading) return <p style={{ textAlign: 'center', padding: '20px', fontFamily: 'monospace' }}>Carregando...</p>;
  if (!data) return <p style={{ textAlign: 'center', padding: '20px', fontFamily: 'monospace' }}>Pedido não encontrado</p>;

  const fmtDate = (d: string) => format(new Date(d), "dd/MM/yyyy", { locale: ptBR });

  return (
    <>
      <style>{`
        @media print {
          @page { size: 58mm auto; margin: 2mm; }
          body { margin: 0; padding: 0; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #fff; }
        .receipt { width: 58mm; margin: 0 auto; padding: 3mm; font-family: 'Courier New', monospace; font-size: 10px; color: #000; line-height: 1.4; }
        .receipt-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
        .receipt-logo { font-size: 14px; font-weight: bold; letter-spacing: 1px; }
        .receipt-sub { font-size: 8px; color: #555; margin-top: 2px; }
        .receipt-divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
        .receipt-row { display: flex; justify-content: space-between; gap: 4px; }
        .receipt-label { font-size: 8px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
        .receipt-value { font-size: 10px; font-weight: bold; }
        .item-row { margin-bottom: 4px; }
        .item-name { font-size: 10px; }
        .item-variant { font-size: 8px; color: #555; font-style: italic; }
        .item-detail { display: flex; justify-content: space-between; font-size: 9px; color: #333; }
        .receipt-total { text-align: right; font-size: 14px; font-weight: bold; padding-top: 4px; border-top: 2px solid #000; margin-top: 4px; }
        .receipt-footer { text-align: center; font-size: 8px; color: #555; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #000; }
        .no-print { display: block; text-align: center; margin: 10px auto; }
        @media print { .no-print { display: none !important; } }
      `}</style>
      <div className="receipt">
        <div className="receipt-header">
          <div className="receipt-logo">🧁 Ateliê Nany Souza</div>
          <div className="receipt-sub">Doces & Confeitaria Artesanal</div>
        </div>

        <hr className="receipt-divider" />

        <div>
          <div className="receipt-label">Cliente</div>
          <div className="receipt-value">{data.clientName}</div>
        </div>

        <div className="receipt-row" style={{ marginTop: '4px' }}>
          <div>
            <div className="receipt-label">Pedido</div>
            <div style={{ fontSize: '9px' }}>{fmtDate(data.orderDate)}</div>
          </div>
          {data.deliveryDate && (
            <div style={{ textAlign: 'right' }}>
              <div className="receipt-label">Entrega</div>
              <div style={{ fontSize: '9px' }}>{fmtDate(data.deliveryDate)}</div>
            </div>
          )}
        </div>

        <hr className="receipt-divider" />

        <div className="receipt-label" style={{ marginBottom: '4px' }}>Itens</div>
        {data.items.map((item, idx) => (
          <div key={idx} className="item-row">
            <div className="item-name">{item.name}</div>
            {item.variantName && <div className="item-variant">↳ {item.variantName}</div>}
            <div className="item-detail">
              <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          </div>
        ))}

        <div className="receipt-total">{formatCurrency(data.total)}</div>

        {data.notes && (
          <>
            <hr className="receipt-divider" />
            <div className="receipt-label">Obs</div>
            <div style={{ fontSize: '9px', fontStyle: 'italic' }}>{data.notes}</div>
          </>
        )}

        <div className="receipt-footer">Obrigada pela preferência! 💕</div>
      </div>
    </>
  );
}
