import { useState, useEffect } from 'react';
import { ProcessInstance } from '@/api/entities';

export function useInstances(autoLoad = true) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const loadInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const instanceData = await ProcessInstance.list('-created_date');
      setInstances(instanceData || []);
      console.log('✅ Instâncias carregadas:', instanceData?.length || 0);
    } catch (err) {
      console.error('❌ Erro ao carregar instâncias:', err);
      setError(err);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadInstances();
    }
  }, [autoLoad]);

  const addInstance = (newInstance) => {
    setInstances(prev => [newInstance, ...prev]);
  };

  const updateInstance = (instanceId, updateData) => {
    setInstances(prev => 
      prev.map(inst => 
        inst.id === instanceId ? { ...inst, ...updateData } : inst
      )
    );
  };

  const removeInstance = (instanceId) => {
    setInstances(prev => prev.filter(inst => inst.id !== instanceId));
  };

  const refetch = () => loadInstances();

  return {
    instances,
    loading,
    error,
    addInstance,
    updateInstance,
    removeInstance,
    refetch
  };
}