// Serviço de gerenciamento de instâncias de processos
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class ProcessInstanceService {
  async getAllInstances(options = {}) {
    try {
      const { sort, orderBy, limit } = options;
      let query = supabase.from('process_instances').select('*');
      let sortField = sort ? Object.keys(sort)[0] : (orderBy || 'created_at');
      let sortDir = sort ? sort[sortField] : 'desc';
      if (typeof sortField === 'string' && sortField.startsWith('-')) {
        sortField = sortField.replace(/^-/, '');
        sortDir = 'desc';
      }
      sortField = sortField === 'created_date' ? 'created_at' : sortField;
      query = query.order(sortField, { ascending: String(sortDir).toLowerCase() === 'asc' });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(this._mapInstance);
    } catch (error) {
      console.error('Erro ao obter instâncias:', error);
      throw error;
    }
  }

  async getInstanceById(id) {
    try {
      const { data, error } = await supabase
        .from('process_instances')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? this._mapInstance(data) : null;
    } catch (error) {
      console.error('Erro ao obter instância por ID:', error);
      throw error;
    }
  }

  async createInstance(formData, currentUser) {
    try {
      const history = [{
        action: 'created',
        timestamp: new Date().toISOString(),
        user: currentUser?.full_name || currentUser?.email || 'Sistema',
        details: 'Processo criado'
      }];
      const { data, error } = await supabase
        .from('process_instances')
        .insert({
          title: formData.title,
          process_id: formData.process_id,
          client_company: formData.client_company,
          status: 'aguardando_analise',
          priority: formData.priority || 'media',
          technician_responsible: formData.technician_responsible,
          municipality: formData.municipality,
          area_hectares: formData.area_hectares,
          due_date: formData.due_date,
          requester: formData.requester || currentUser?.email || 'Sistema',
          documents: formData.documents || [],
          current_step: 0,
          history,
          updated_date: new Date().toISOString()
        })
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return this._mapInstance(data);
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  }

  async updateInstance(id, data, currentUser) {
    try {
      const { data: existing } = await supabase
        .from('process_instances')
        .select('history')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      const history = Array.isArray(existing?.history) ? existing.history : [];
      history.push({
        action: 'updated',
        timestamp: new Date().toISOString(),
        user: currentUser?.full_name || currentUser?.email || 'Sistema',
        details: 'Processo atualizado'
      });

      const { data: updated, error } = await supabase
        .from('process_instances')
        .update({
          ...data,
          history,
          updated_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return this._mapInstance(updated);
    } catch (error) {
      console.error('Erro ao atualizar instância:', error);
      throw error;
    }
  }

  async updateInstanceStatus(id, newStatus, currentUser) {
    try {
      const { data: existing } = await supabase
        .from('process_instances')
        .select('history')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      const history = Array.isArray(existing?.history) ? existing.history : [];
      history.push({
        action: 'status_changed',
        timestamp: new Date().toISOString(),
        user: currentUser?.full_name || currentUser?.email || 'Sistema',
        details: `Status alterado para ${newStatus}`
      });

      const { data: updated, error } = await supabase
        .from('process_instances')
        .update({ status: newStatus, history, updated_date: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return this._mapInstance(updated);
    } catch (error) {
      console.error('Erro ao atualizar status da instância:', error);
      throw error;
    }
  }

  async deleteInstance(id) {
    try {
      const { error } = await supabase.from('process_instances').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      throw error;
    }
  }

  async filterInstances(filters) {
    try {
      let query = supabase.from('process_instances').select('*');
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(this._mapInstance);
    } catch (error) {
      console.error('Erro ao filtrar instâncias:', error);
      throw error;
    }
  }

  async findInstances(filters = {}) {
    return this.filterInstances(filters);
  }

  // Métodos utilitários para análise de dados
  getInstanceDuration(instance) {
    if (!instance.created_date) return null;
    
    const createdDate = new Date(instance.created_date);
    
    return formatDistanceToNow(createdDate, { 
      addSuffix: true, 
      locale: ptBR 
    });
  }

  isOverdue(instance) {
    if (!instance.due_date) return false;
    
    const dueDate = new Date(instance.due_date);
    const now = new Date();
    
    return dueDate < now && !['finalizado', 'cancelado'].includes(instance.status);
  }

  getInstancePriorityColor(priority) {
    const colors = {
      baixa: 'bg-gray-100 text-gray-700',
      media: 'bg-orange-100 text-orange-700',
      alta: 'bg-red-100 text-red-700',
      critica: 'bg-red-200 text-red-800'
    };
    
    return colors[priority] || colors.media;
  }

  _mapInstance(row) {
    return {
      ...row,
      created_date: row.created_at,
      updated_date: row.updated_date || row.updated_at
    };
  }
}

export default new ProcessInstanceService();
