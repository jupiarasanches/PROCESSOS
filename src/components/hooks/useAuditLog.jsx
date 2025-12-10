import { AuditLogService, AuthService } from '@/services';

export function useAuditLog() {
  const logChange = async (entityType, entityId, action, changes, description, metadata = {}) => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      
      await AuditLogService.logCustomAction(
        entityType,
        entityId,
        action,
        description,
        currentUser,
        { ...metadata, changes }
      );
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  };

  const logCreation = async (entityType, entityId, entityData, description) => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      const details = description || 'Criado novo registro';
      await AuditLogService.logCustomAction(
        entityType,
        entityId,
        'create',
        details,
        currentUser,
        { entityData }
      );
    } catch (error) {
      console.error('Erro ao registrar criação:', error);
    }
  };

  const logUpdate = async (entityType, entityId, oldData, newData, description) => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      void description;
      await AuditLogService.logChange(entityType, entityId, oldData, newData, currentUser);
    } catch (error) {
      console.error('Erro ao registrar atualização:', error);
    }
  };

  const logDeletion = async (entityType, entityId, entityData, description) => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      void entityData; void description;
      await AuditLogService.logDeletion(entityType, entityId, currentUser);
    } catch (error) {
      console.error('Erro ao registrar deleção:', error);
    }
  };

  const logStatusChange = async (entityType, entityId, oldStatus, newStatus, description) => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      void description;
      await AuditLogService.logStatusChange(entityType, entityId, oldStatus, newStatus, currentUser);
    } catch (error) {
      console.error('Erro ao registrar mudança de status:', error);
    }
  };

  return {
    logChange,
    logCreation,
    logUpdate,
    logDeletion,
    logStatusChange
  };
}
