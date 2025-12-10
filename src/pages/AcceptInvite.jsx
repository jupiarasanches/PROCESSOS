import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AuthService from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const token = params.get('token');
  const email = params.get('email');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function run() {
      if (!token) { setStatus('missing'); return; }
      setStatus('awaiting_signup');
    }
    run();
  }, [token]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
      {status === 'processing' && (<div className="text-gray-700">Processando convite...</div>)}
      {status === 'missing' && (
        <div className="text-red-600">Token de convite ausente.</div>
      )}
      {status === 'awaiting_signup' && (
        <div className="bg-white p-6 rounded shadow w-full max-w-sm">
          <h2 className="text-lg font-semibold mb-3">Criar acesso</h2>
          <p className="text-sm text-gray-600 mb-4">Email: {email || '—'}</p>
          <Input type="password" placeholder="Defina sua senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="mt-3 w-full" onClick={async () => {
            try {
              // Usar a nova Edge Function para definir a senha e ativar o usuário
              const { error } = await supabase.functions.invoke('accept-invite', {
                body: { token, email, password }
              });

              if (error) throw error;

              setStatus('accepted');
              toast.success('Conta ativada com sucesso! Redirecionando...');
              
              // Login automático após definir senha
              setTimeout(async () => {
                await supabase.auth.signInWithPassword({ email, password });
                window.location.href = '/';
              }, 2000);

            } catch (e) {
              setStatus('error');
              toast.error(e?.message || 'Falha ao ativar conta');
            }
          }}>Criar acesso</Button>
        </div>
      )}
      {status === 'accepted' && (<div className="text-green-600">Convite aceito! Você já pode fazer login.</div>)}
      {status === 'error' && (
        <div className="text-red-600">Não foi possível aceitar o convite. Tente novamente.</div>
      )}
    </div>
  );
}
