// Serviço de gerenciamento de compromissos/appointments
import { supabase } from '@/lib/supabaseClient';

class AppointmentService {
  async getAllAppointments(options = {}) {
    try {
      const { sort, orderBy, limit } = options;
      let query = supabase.from('appointments').select('*');
      const sortField = sort ? Object.keys(sort)[0] : (orderBy || 'scheduled_date');
      const sortDir = sort ? sort[sortField] : 'desc';
      query = query.order(sortField, { ascending: String(sortDir).toLowerCase() === 'asc' });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao obter compromissos:', error);
      throw error;
    }
  }

  async getAppointmentById(id) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao obter compromisso por ID:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          title: appointmentData.title,
          process_id: appointmentData.process_id || null,
          client_company: appointmentData.client_company || null,
          scheduled_date: appointmentData.scheduled_date,
          status: appointmentData.status || 'pendente',
          assigned_to: appointmentData.assigned_to || null,
          notification_email_enabled: !!appointmentData.notification_email_enabled,
          notification_minutes_before: appointmentData.notification_minutes_before || 0,
          notification_sent: false
        })
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar compromisso:', error);
      throw error;
    }
  }

  async updateAppointment(id, appointmentData) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...appointmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar compromisso:', error);
      throw error;
    }
  }

  async deleteAppointment(id) {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar compromisso:', error);
      throw error;
    }
  }

  async filterAppointments(filters) {
    try {
      let query = supabase.from('appointments').select('*');
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao filtrar compromissos:', error);
      throw error;
    }
  }

  async findAppointments(filters = {}) {
    return this.filterAppointments(filters);
  }
}

export default new AppointmentService();
