// Serviço de gerenciamento de usuários - separado da autenticação
import { supabase } from '@/lib/supabaseClient';
import AuditLogService from '@/services/auditLogService';
import EmailService from '@/services/emailService';
import AuthService from '@/services/authService';

class UsersService {
  async getAllUsers(options = {}) {
    const sortFieldRaw = options.orderBy?.replace('-', '') || 'created_at';
    const sortField = sortFieldRaw === 'created_date' ? 'created_at' : sortFieldRaw;
    const ascending = !options.orderBy?.startsWith('-');
    let query = supabase
      .from('users')
      .select('*')
      .order(sortField, { ascending });
    if (options.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao obter usuário por ID:', error);
      throw error;
    }
  }

  async getTechnicians() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['technician', 'admin']); // Allow both roles
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao obter técnicos:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  async filterUsers(filters) {
    try {
      let query = supabase.from('users').select('*');
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao filtrar usuários:', error);
      throw error;
    }
  }

  async inviteTechnician({ email, full_name, department, position, role = 'technician' }) {
    if (!email || !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) {
      throw new Error('E-mail inválido');
    }
    const { data: existing } = await supabase.from('users').select('*').eq('email', email).limit(1).maybeSingle();
    let userId = existing?.id || null;
    if (!existing) {
      const { data: inserted, error: insertErr } = await supabase.from('users').insert({ email, full_name, department, role, status: 'invited' }).select('*').maybeSingle();
      if (insertErr) throw insertErr;
      userId = inserted.id;
    }
    const token = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).slice(2);
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const { data: invitation, error: invErr } = await supabase.from('invitations').insert({ user_id: userId, email, token, expires_at: expiresAt, status: 'pending' }).select('*').maybeSingle();
    if (invErr) throw invErr;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const inviteLink = `${origin}/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const admin = await AuthService.getCurrentUser().catch(() => ({ email: 'admin@local', name: 'Administrador' }));
    await AuditLogService.logCustomAction('user', userId, 'invite', 'Convite enviado para técnico', admin, { email, token, expires_at: expiresAt });

    const subject = 'Convite para acessar o ProcessFlow';
    const html = `
      <h2>Olá ${full_name || ''},</h2>
      <p>Você foi convidado a acessar o ProcessFlow.</p>
      <p>Clique para criar seu acesso: <a href="${inviteLink}">${inviteLink}</a></p>
      <p>Este convite expira em 48 horas.</p>
    `;
    await EmailService.sendInviteEmail({ to: email, subject, html });
    try {
      await supabase.functions.invoke('provision-auth-user', {
        body: { email, role, metadata: { full_name, department, position } },
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.warn('Falha ao provisionar usuário no Auth (funcion):', e?.message || e);
    }
    return { user_id: userId, invitation, link: inviteLink };
  }

  async resendInvitation(email) {
    if (!email || !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) {
      throw new Error('E-mail inválido');
    }
    const { data: user } = await supabase.from('users').select('*').eq('email', email).limit(1).maybeSingle();
    if (!user) throw new Error('Usuário não encontrado');
    const token = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).slice(2);
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const { data: invitation, error: invErr } = await supabase
      .from('invitations')
      .insert({ user_id: user.id, email, token, expires_at: expiresAt, status: 'pending' })
      .select('*')
      .maybeSingle();
    if (invErr) throw invErr;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const link = `${origin}/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const subject = 'Reenvio de convite de acesso ao ProcessFlow';
    const html = `
      <h2>Convite de Acesso</h2>
      <p>Use o link para criar seu acesso: <a href="${link}">${link}</a></p>
      <p>Este link expira em 48 horas.</p>
    `;
    await EmailService.sendInviteEmail({ to: email, subject, html });
    const admin = await AuthService.getCurrentUser().catch(() => ({ email: 'admin@local', name: 'Administrador' }));
    await AuditLogService.logCustomAction('user', user.id, 'invite_resend', 'Reenvio de convite ao usuário', admin, { email, token, expires_at: expiresAt });
    return { invitation, link };
  }

  async generateAccessLink(email) {
    if (!email || !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(email)) {
      throw new Error('E-mail inválido');
    }
    const { data: user } = await supabase.from('users').select('*').eq('email', email).limit(1).maybeSingle();
    if (!user) throw new Error('Usuário não encontrado');
    if (user.status === 'active') throw new Error('Usuário já ativo');

    const token = crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).slice(2);
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const { data: invitation, error: invErr } = await supabase
      .from('invitations')
      .insert({ user_id: user.id, email, token, expires_at: expiresAt, status: 'pending' })
      .select('*')
      .maybeSingle();
    if (invErr) throw invErr;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const link = `${origin}/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const admin = await AuthService.getCurrentUser().catch(() => ({ email: 'admin@local', name: 'Administrador' }));
    await AuditLogService.logCustomAction('user', user.id, 'access_link', 'Link de acesso gerado para usuário', admin, { email, token, expires_at: expiresAt });
    return { invitation, link };
  }

  async setAdminRole(id, makeAdmin) {
    const { data, error } = await supabase.from('users').update({ role: makeAdmin ? 'admin' : 'technician' }).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    const admin = await AuthService.getCurrentUser().catch(() => ({ email: 'admin@local', name: 'Administrador' }));
    await AuditLogService.logCustomAction('user', id, 'role_change', makeAdmin ? 'Promovido a admin' : 'Rebaixado para técnico', admin, { new_role: data.role });
    return data;
  }
}

export default new UsersService();
