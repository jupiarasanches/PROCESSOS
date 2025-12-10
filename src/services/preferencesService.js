import { supabase } from '@/lib/supabaseClient';

class PreferencesService {
  async getSimcarPreferences() {
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes?.user?.email;
    if (!email) return null;
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_email', email)
      .maybeSingle();
    return data || null;
  }

  async setSimcarPreferences(prefs) {
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes?.user?.email;
    if (!email) return null;
    const payload = {
      user_email: email,
      simcar_status_filter: prefs.simcar_status_filter,
      simcar_search_term: prefs.simcar_search_term || ''
    };
    const { data } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_email' })
      .select()
      .maybeSingle();
    return data;
  }
}

export default new PreferencesService();
