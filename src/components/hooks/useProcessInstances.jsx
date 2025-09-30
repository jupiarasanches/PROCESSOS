import { useState, useEffect } from 'react';
import { ProcessInstanceService } from '../services/processService';
import { User } from "@/api/entities";

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

  const createInstance = async (data) => {
    try {
      const currentUser = await User.me();
      
      const instanceData = {
        ...data,
        requester: currentUser.email,
        status: 'pendente',
        current_step: 0,
        history: [{
          step: 0,
          action: 'criado',
          user: currentUser.email,
          timestamp: new Date().toISOString(),
          comment: `Processo iniciado${data.documents?.length ? ` com ${data.documents.length} documento(s)` : ''}`
        }]
      };

      const newInstance = await ProcessInstanceService.createInstance(instanceData);
      setInstances(prev => [newInstance, ...prev]);
      return newInstance;
    } catch (error) {
      throw error;
    }
  };

  const updateInstance = async (id, data) => {
    try {
      const updatedInstance = await ProcessInstanceService.updateInstance(id, data);
      setInstances(prev => prev.map(inst => inst.id === id ? updatedInstance : inst));
      return updatedInstance;
    } catch (error) {
      throw error;
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const instance = instances.find(i => i && i.id === id);
      if (!instance) throw new Error('Instância não encontrada');

      const optimisticInstance = { ...instance, status: newStatus };
      setInstances(prev => prev.map(inst => inst && inst.id === id ? optimisticInstance : inst));

      return optimisticInstance;
    } catch (error) {
      await loadInstances();
      throw error;
    }
  };

  const deleteInstance = async (id) => {
    try {
      await ProcessInstanceService.deleteInstance(id);
      setInstances(prev => prev.filter(inst => inst.id !== id));
    } catch (error) {
      throw error;
    }
  };

  return {
    instances,
    loading,
    error,
    loadInstances,
    createInstance,
    updateInstance,
    updateStatus,
    deleteInstance
  };
};