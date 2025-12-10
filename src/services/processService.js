// Serviço de gerenciamento de processos
import { supabase } from '@/lib/supabaseClient';

class ProcessService {
  async getAllProcesses(options = {}) {
    try {
      const { sort, orderBy, limit } = options;
      let query = supabase.from('processes').select('*');
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
      return data || [];
    } catch (error) {
      console.error('Erro ao obter processos:', error);
      throw error;
    }
  }

  async getProcessById(id) {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao obter processo por ID:', error);
      throw error;
    }
  }

  async createProcess(processData) {
    try {
      const { data, error } = await supabase
        .from('processes')
        .insert({
          name: processData.name,
          description: processData.description,
          category: processData.category,
          status: processData.status || 'ativo',
          owner_id: processData.owner_id || null
        })
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      throw error;
    }
  }

  async updateProcess(id, processData) {
    try {
      const { data, error } = await supabase
        .from('processes')
        .update({
          name: processData.name,
          description: processData.description,
          category: processData.category,
          status: processData.status,
          owner_id: processData.owner_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      throw error;
    }
  }

  async deleteProcess(id) {
    try {
      const { error } = await supabase.from('processes').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar processo:', error);
      throw error;
    }
  }

  async filterProcesses(filters) {
    try {
      let query = supabase.from('processes').select('*');
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao filtrar processos:', error);
      throw error;
    }
  }

  async findProcesses(filters = {}) {
    return this.filterProcesses(filters);
  }
}

export default new ProcessService();
