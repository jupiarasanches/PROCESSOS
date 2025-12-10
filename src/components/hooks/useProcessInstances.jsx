import { useState, useEffect } from 'react';
import { ProcessInstanceService, AuthService } from '@/services';

export const useProcessInstances = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInstances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProcessInstanceService.getAllInstances();
      setInstances(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  const createInstance = async (formData) => {
    const currentUser = await AuthService.getCurrentUser();
    const newInstance = await ProcessInstanceService.createInstance(formData, currentUser);
    setInstances(prev => [newInstance, ...prev]);
    return newInstance;
  };

  const updateInstance = async (id, data) => {
    const currentUser = await AuthService.getCurrentUser();
    const updatedInstance = await ProcessInstanceService.updateInstance(id, data, currentUser);
    setInstances(prev => prev.map(inst => inst.id === id ? updatedInstance : inst));
    return updatedInstance;
  };

  const updateStatus = async (id, newStatus) => {
    // Snapshot do estado anterior para rollback em caso de erro
    const previousInstances = [...instances];

    // Atualização Otimista: Atualiza a UI imediatamente antes da resposta do servidor
    setInstances(prev => prev.map(inst => 
      inst.id === id ? { ...inst, status: newStatus } : inst
    ));

    try {
      const currentUser = await AuthService.getCurrentUser();
      const updatedInstance = await ProcessInstanceService.updateInstanceStatus(id, newStatus, currentUser);
      
      // Confirmação: Atualiza com os dados reais do servidor (útil para campos como updated_at)
      setInstances(prev => prev.map(inst => inst.id === id ? updatedInstance : inst));
      return updatedInstance;
    } catch (err) {
      // Rollback: Reverte para o estado anterior se a API falhar
      console.error("Erro ao atualizar status, revertendo mudança otimista:", err);
      setInstances(previousInstances);
      throw err;
    }
  };

  const deleteInstance = async (id) => {
    await ProcessInstanceService.deleteInstance(id);
    setInstances(prev => prev.filter(inst => inst.id !== id));
  };

  const addInstance = (newInstance) => {
    setInstances(prev => [newInstance, ...prev]);
  };

  return {
    instances,
    loading,
    error,
    loadInstances,
    createInstance,
    updateInstance,
    updateStatus,
    deleteInstance,
    addInstance
  };
};
