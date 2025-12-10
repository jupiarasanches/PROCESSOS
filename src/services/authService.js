// Serviço de autenticação - separado da entidade User
import { supabase } from '@/lib/supabaseClient';

class AuthService {
  async login(email, password) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;

    const session = signInData?.session || null;
    const authUser = signInData?.user || signInData?.session?.user || null;
    if (!authUser) throw new Error('Falha ao obter usuário autenticado');

    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .limit(1)
      .maybeSingle();
    if (profileErr) throw profileErr;

    const combinedUser = {
      id: profile?.id || authUser.id,
      email: authUser.email,
      full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
      role: profile?.role || 'technician',
      profile_picture_url: profile?.profile_picture_url || authUser.user_metadata?.avatar_url || null,
      status: profile?.status || 'active'
    };

    return { user: combinedUser, token: session?.access_token || null };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    // Limpeza agressiva do LocalStorage para garantir que não sobrem resquícios de sessão
    localStorage.clear(); 
    if (error) throw error;
    return { success: true };
  }

  async acceptInvite(token) {
    const { data: invite, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!invite) throw new Error('Convite inválido');
    if (invite.status && invite.status !== 'pending') throw new Error('Convite já utilizado ou inválido');
    if (new Date(invite.expires_at).getTime() < Date.now()) throw new Error('Convite expirado');

    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', invite.email)
      .limit(1)
      .maybeSingle();
    if (existing) {
      if (existing.status === 'active') throw new Error('Usuário já ativo');
      await supabase.from('users').update({ status: 'active' }).eq('id', existing.id);
    } else {
      await supabase.from('users').insert({ email: invite.email, status: 'active', role: 'technician' });
    }
    await supabase.from('invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invite.id);
    return { success: true };
  }

  async getCurrentUser() {
    try {
      const { data: userRes, error } = await supabase.auth.getUser();
      
      // Se houver erro de sessão inválida (AuthSessionMissingError ou similar), forçar limpeza
      if (error || !userRes?.user) {
        // Se temos um token no storage mas o servidor diz que é inválido, limpa tudo.
        const hasToken = Object.keys(localStorage).some(k => k.includes('supabase'));
        if (hasToken && error) {
            console.warn("Sessão inválida detectada, limpando storage...");
            localStorage.clear();
        }
        return null;
      }

      const authUser = userRes.user;

      const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .limit(1)
      .maybeSingle();

      return {
      id: profile?.id || authUser.id,
      email: authUser.email,
      full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
      role: profile?.role || 'technician',
      profile_picture_url: profile?.profile_picture_url || authUser.user_metadata?.avatar_url || null,
      status: profile?.status || 'active'
      };
    } catch {
      return null;
    }
  }

  async updateMyUserData(data) {
    const { data: userRes, error: getErr } = await supabase.auth.getUser();
    if (getErr) throw getErr;
    const authUser = userRes?.user || null;
    if (!authUser) throw new Error('Não autenticado');

    const { data: updated, error: updErr } = await supabase
      .from('users')
      .update({ ...data })
      .eq('email', authUser.email)
      .select('*')
      .maybeSingle();
    if (updErr) throw updErr;
    return {
      id: updated?.id || authUser.id,
      email: authUser.email,
      full_name: updated?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
      role: updated?.role || 'technician',
      profile_picture_url: updated?.profile_picture_url || authUser.user_metadata?.avatar_url || null,
      status: updated?.status || 'active'
    };
  }

  getCurrentUserSync() {
    return null;
  }
}

export default new AuthService();
