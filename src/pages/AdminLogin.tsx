import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cake, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error('Credenciais inválidas');
    } else {
      toast.success('Bem-vinda de volta! 🧁');
      navigate('/admin');
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-4">
            <Cake className="w-8 h-8 text-sage" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-display font-semibold">Ateliê Nany Souza</h1>
          <p className="text-muted-foreground text-sm mt-1">Área administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-card p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Lock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">Login</span>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@atelie.com"
              className="mt-1 rounded-button"
              autoComplete="email"
            />
          </div>
          <div>
            <Label>Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 rounded-button"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-sage text-sage-foreground rounded-button font-medium text-sm shadow-soft hover:shadow-card-hover disabled:opacity-50 transition-all"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
