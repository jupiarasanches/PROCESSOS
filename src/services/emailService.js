import { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabaseClient';

class EmailService {
  async sendInviteEmail({ to, subject, html }) {
    const payload = { to, subject, html };
    const headers = {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
    const { data, error } = await supabase.functions.invoke('send-invite', {
      body: payload,
      headers
    });
    if (!error && data) return data;
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-invite`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Falha ao enviar e-mail de convite');
    }
    return await res.json().catch(() => ({}));
  }
}

export default new EmailService();
