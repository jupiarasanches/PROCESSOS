import { AuditLog } from "@/api/entities";
import { User } from "@/api/entities";

export function useAuditLog() {
  const logChange = async (entityType, entityId, action, changes, description, metadata = {}) => {
    try {
      const currentUser = await User.me();
      
      await AuditLog.create({
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        changes: changes,
        description: description,
        metadata: metadata
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria:', error);
    }
  };

  const logCreation = async (entityType, entityId, entityData, description) => {
    await logChange(entityType, entityId, 'created', { new: entityData }, description);
  };

  const logUpdate = async (entityType, entityId, oldData, newData, description) => {
    const changes = {
      before: oldData,
      after: newData,
      fields: getChangedFields(oldData, newData)
    };
    await logChange(entityType, entityId, 'updated', changes, description);
  };

  const logDeletion = async (entityType, entityId, entityData, description) => {
    await logChange(entityType, entityId, 'deleted', { deleted: entityData }, description);
  };

  const logStatusChange = async (entityType, entityId, oldStatus, newStatus, description) => {
    await logChange(
      entityType, 
      entityId, 
      'status_changed', 
      { 
        before: { status: oldStatus }, 
        after: { status: newStatus } 
      }, 
      description
    );
  };

  const getChangedFields = (oldData, newData) => {
    const changed = {};
    
    Object.keys(newData).forEach(key => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changed[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    });

    return changed;
  };

  return {
    logChange,
    logCreation,
    logUpdate,
    logDeletion,
    logStatusChange
  };
}