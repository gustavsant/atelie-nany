import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/store/useStore";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Clients from "@/pages/Clients";
import Orders from "@/pages/Orders";
import NewSale from "@/pages/NewSale";
import DeliverySchedule from "@/pages/DeliverySchedule";
import SettingsPage from "@/pages/SettingsPage";
import OrderReceipt from "@/pages/OrderReceipt";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(340 100% 99%)',
            border: '1px solid hsl(340 30% 94%)',
            color: 'hsl(340 20% 25%)',
          },
        }}
      />
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/comanda" element={<OrderReceipt />} />
            <Route element={<AppLayout><Outlet /></AppLayout>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/nova-venda" element={<NewSale />} />
              <Route path="/entregas" element={<DeliverySchedule />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
