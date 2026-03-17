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
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Cake className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight">Ateliê</h1>
            <p className="text-xs text-muted-foreground font-body">Nany Souza</p>
          </div>
        </div>

        

















        

        <div className="p-4">
          <Link
            to="/nova-venda"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-primary-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
            
            <Plus className="w-4 h-4" strokeWidth={2} />
            Nova Venda
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Cake className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="font-display font-semibold text-base">Ateliê Nany Souza</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-button hover:bg-muted/50 transition-colors">
            
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

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