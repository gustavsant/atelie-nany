import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ClipboardList,
  CalendarDays,
  Settings,
  Plus,
  Menu,
  X,
  Cake } from
'lucide-react';

const navItems = [
{ label: 'Início', icon: LayoutDashboard, path: '/' },
{ label: 'Produtos', icon: ShoppingBag, path: '/produtos' },
{ label: 'Clientes', icon: Users, path: '/clientes' },
{ label: 'Pedidos', icon: ClipboardList, path: '/pedidos' },
{ label: 'Entregas', icon: CalendarDays, path: '/entregas' },
{ label: 'Configurações', icon: Settings, path: '/configuracoes' }];


const mobileNavItems = navItems.slice(0, 5);

export default function AppLayout({ children }: {children: React.ReactNode;}) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      







































      

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        












        

        {/* Mobile Slide Menu */}
        <AnimatePresence>
          {sidebarOpen &&
          <>
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)} />
            
              <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-card shadow-soft z-50 md:hidden p-4 pt-16">
              
                <nav className="space-y-1">
                  {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium transition-all ${
                      active ?
                      'bg-primary/15 text-foreground' :
                      'text-muted-foreground hover:bg-muted/50'}`
                      }>
                      
                        <item.icon className="w-5 h-5" strokeWidth={1.5} />
                        {item.label}
                      </Link>);

                })}
                </nav>
              </motion.div>
            </>
          }
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 pb-24 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 z-30 px-2 py-1 safe-area-pb">
          <div className="flex items-center justify-around">
            {mobileNavItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg text-xs transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground'}`
                  }>
                  
                  <item.icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
                  <span className="font-medium">{item.label}</span>
                </Link>);

            })}
          </div>
        </nav>

        {/* FAB - Mobile */}
        <Link
          to="/nova-venda"
          className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-fab flex items-center justify-center active:scale-95 transition-transform">
          
          <Plus className="w-6 h-6" strokeWidth={2} />
        </Link>
      </div>
    </div>);

}