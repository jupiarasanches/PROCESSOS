import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Bootstrap() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleBootstrap = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      if (!email || !password) {
        setError('Informe email e senha');
        setLoading(false);
        return;
      }

      const { data: signUp, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) throw signUpErr;

      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (!existing) {
        const { error: insErr } = await supabase
          .from('users')
          .insert({ email, role: 'admin', status: 'active' });
        if (insErr) throw insErr;
      }

      setMessage('Administrador criado com sucesso. Vá para Login.');
    } catch (e) {
      setError(e?.message || 'Falha ao criar admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bootstrap do Administrador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          {message && (
            <Alert><AlertDescription>{message}</AlertDescription></Alert>
          )}
          <div className="space-y-2">
            <Input type="email" placeholder="admin@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleBootstrap} disabled={loading}>{loading ? 'Criando...' : 'Criar Admin'}</Button>
          <a href="/login" className="text-blue-600 text-sm text-center block">Ir para Login</a>
        </CardContent>
      </Card>
    </div>
  );
}
