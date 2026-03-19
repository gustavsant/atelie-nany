import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/store/useStore";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Clients from "@/pages/Clients";
import Orders from "@/pages/Orders";
import NewSale from "@/pages/NewSale";
import DeliverySchedule from "@/pages/DeliverySchedule";
import SettingsPage from "@/pages/SettingsPage";
import OrderReceipt from "@/pages/OrderReceipt";
import AdminLogin from "@/pages/AdminLogin";
import Storefront from "@/pages/Storefront";
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
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Storefront />} />
              <Route path="/comanda" element={<OrderReceipt />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin (protected) */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AppLayout><Outlet /></AppLayout>
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="produtos" element={<Products />} />
                <Route path="clientes" element={<Clients />} />
                <Route path="pedidos" element={<Orders />} />
                <Route path="nova-venda" element={<NewSale />} />
                <Route path="entregas" element={<DeliverySchedule />} />
                <Route path="configuracoes" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
