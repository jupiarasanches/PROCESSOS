import { supabase } from '@/lib/supabaseClient';

class SimcarService {
  async getSimcarProcesses() {
    try {
      // 1. Busca processos com "SIMCAR" no título
      const { data: instances, error: instancesError } = await supabase
        .from('process_instances')
        .select(`
          *,
          simcar_details (*)
        `)
        .ilike('title', '%SIMCAR%')
        .order('created_at', { ascending: false });

      if (instancesError) throw instancesError;

      // 2. Busca informações dos técnicos para exibir nome em vez de email
      // Coleta todos os emails únicos de técnicos
      const technicianEmails = [...new Set(instances.map(i => 
        i.simcar_details?.[0]?.technician_responsible || i.technician_responsible
      ).filter(Boolean))];

      let techniciansMap = {};
      if (technicianEmails.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('email, full_name')
          .in('email', technicianEmails);
        
        if (users) {
          users.forEach(u => {
            techniciansMap[u.email] = u.full_name;
          });
        }
      }

      return instances.map(instance => {
        const details = instance.simcar_details?.[0] || {}; 
        const techEmail = details.technician_responsible || instance.technician_responsible;
        const techName = techniciansMap[techEmail] || techEmail; // Usa nome se tiver, senão email
        const title = instance.title || '';
        const carFromTitleMatch = title.match(/MT[-\s]?\d+(?:\/\d{2,4})?/i);
        const propertyFromTitleMatch = title.match(/SIMCAR\s*-\s*(.+?)\s*-\s*MT/i);

        return {
          ...instance,
          simcar_id: details.id,
          car_number: details.car_number || (carFromTitleMatch ? carFromTitleMatch[0].toUpperCase().replace(/\s+/g, '') : ''), 
          property_name: details.property_name || (propertyFromTitleMatch ? propertyFromTitleMatch[1].trim() : ''),
          analysis_date: details.analysis_date,
          simcar_due_date: details.due_date,
          pendency_status: details.pendency_status,
          process_type: details.process_type,
          simcar_technician: techName, // Nome do técnico
          last_submission_date: details.last_submission_date,
          notes: details.notes,
          simcar_technician_email: techEmail, // Mantém email para referência se precisar
          days_remaining: details.days_remaining // Será recalculado no front ou mantido se salvo manual
        };
      });
    } catch (error) {
      console.error('Erro ao buscar processos SIMCAR:', error);
      throw error;
    }
  }

  async updateSimcarDetails(instanceId, data) {
    try {
      // Verifica se já existe detalhe
      const { data: existing } = await supabase
        .from('simcar_details')
        .select('id')
        .eq('instance_id', instanceId)
        .maybeSingle();

      let result;
      if (existing) {
        const { data: updated, error } = await supabase
          .from('simcar_details')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('instance_id', instanceId)
          .select()
          .single();
        if (error) throw error;
        result = updated;
      } else {
        const { data: created, error } = await supabase
          .from('simcar_details')
          .insert({
            instance_id: instanceId,
            ...data
          })
          .select()
          .single();
        if (error) throw error;
        result = created;
      }
      return result;
    } catch (error) {
      console.error('Erro ao atualizar detalhes SIMCAR:', error);
      throw error;
    }
  }
}

export default new SimcarService();
