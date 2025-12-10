// Serviço de auditoria e logs
import { supabase } from '@/lib/supabaseClient';
import { getChangedFields } from '@/utils/diff';

class AuditLogService {
  async createAuditLog(data) {
    try {
      const payload = {
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        action: data.action,
        actor_id: data.actor_id || null,
        payload: {
          details: data.details,
          changes: data.changes,
          user_email: data.user_email,
          user_name: data.user_name,
          timestamp: data.timestamp || new Date().toISOString()
        }
      };

      const { data: inserted, error } = await supabase
        .from('audit_logs')
        .insert(payload)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return inserted;
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
      throw error;
    }
  }

  async getAuditLogs(filters = {}, options = {}) {
    try {
      const { sort, orderBy, limit } = options;
      let query = supabase.from('audit_logs').select('*');
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
      const sortField = sort ? Object.keys(sort)[0] : (orderBy || 'created_at');
      const sortDir = sort ? sort[sortField] : 'desc';
      query = query.order(sortField, { ascending: String(sortDir).toLowerCase() === 'asc' });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      throw error;
    }
  }

  // Métodos auxiliares para criar logs específicos
  async logChange(entityType, entityId, oldData, newData, user) {
    try {
      const changedFields = getChangedFields(oldData, newData);
      
      if (changedFields.length === 0) return null;

      const logData = {
        action: 'update',
        entity_type: entityType,
        entity_id: entityId,
        user_email: user?.email || 'sistema',
        user_name: user?.name || 'Sistema',
        changes: changedFields,
        details: `Alterado ${changedFields.length} campo(s)`,
        timestamp: new Date().toISOString()
      };

      return await this.createAuditLog(logData);
    } catch (error) {
      console.error('Erro ao logar mudança:', error);
      throw error;
    }
  }

  async logCreation(entityType, entityId, data, user) {
    try {
      const logData = {
        action: 'create',
        entity_type: entityType,
        entity_id: entityId,
        user_email: user?.email || 'sistema',
        user_name: user?.name || 'Sistema',
        details: 'Criado novo registro',
        timestamp: new Date().toISOString()
      };

      return await this.createAuditLog(logData);
    } catch (error) {
      console.error('Erro ao logar criação:', error);
      throw error;
    }
  }

  async logDeletion(entityType, entityId, user) {
    try {
      const logData = {
        action: 'delete',
        entity_type: entityType,
        entity_id: entityId,
        user_email: user?.email || 'sistema',
        user_name: user?.name || 'Sistema',
        details: 'Registro deletado',
        timestamp: new Date().toISOString()
      };

      return await this.createAuditLog(logData);
    } catch (error) {
      console.error('Erro ao logar deleção:', error);
      throw error;
    }
  }

  async logStatusChange(entityType, entityId, oldStatus, newStatus, user) {
    try {
      const logData = {
        action: 'status_change',
        entity_type: entityType,
        entity_id: entityId,
        user_email: user?.email || 'sistema',
        user_name: user?.name || 'Sistema',
        changes: [{ field: 'status', oldValue: oldStatus, newValue: newStatus }],
        details: `Status alterado de "${oldStatus}" para "${newStatus}"`,
        timestamp: new Date().toISOString()
      };

      return await this.createAuditLog(logData);
    } catch (error) {
      console.error('Erro ao logar mudança de status:', error);
      throw error;
    }
  }

  async logCustomAction(entityType, entityId, action, details, user, extraData = {}) {
    try {
      const logData = {
        action,
        entity_type: entityType,
        entity_id: entityId,
        user_email: user?.email || 'sistema',
        user_name: user?.name || 'Sistema',
        details,
        ...extraData,
        timestamp: new Date().toISOString()
      };

      return await this.createAuditLog(logData);
    } catch (error) {
      console.error('Erro ao logar ação customizada:', error);
      throw error;
    }
  }
}

export default new AuditLogService();
