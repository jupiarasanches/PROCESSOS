import { useState, useEffect } from 'react';
import { Process } from '@/api/entities';

export function useProcesses() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const processData = await Process.list('-created_date');
      setProcesses(processData || []);
      console.log('✅ Processos carregados:', processData?.length || 0);
    } catch (err) {
      console.error('❌ Erro ao carregar processos:', err);
      setError(err);
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  const refetch = () => loadProcesses();

  return {
    processes,
    loading,
    error,
    refetch
  };
}

export function useProcessById(processId) {
  const { processes, loading } = useProcesses();
  const process = processes.find(p => p.id === processId);
  
  return {
    process,
    loading
  };
}