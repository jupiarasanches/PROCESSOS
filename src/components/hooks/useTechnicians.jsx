import { useState, useEffect } from 'react';
import { UsersService } from '@/services';

export function useTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTechnicians = async () => {
    setLoading(true);
    setError(null);
    try {
      const techniciansData = await UsersService.getTechnicians();
      setTechnicians(techniciansData || []);
      console.log('✅ Técnicos carregados:', techniciansData?.length || 0);
    } catch (err) {
      console.error('❌ Erro ao carregar técnicos:', err);
      setError(err);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const updateTechnician = (technicianId, updateData) => {
    setTechnicians(prev => 
      prev.map(tech => 
        tech.id === technicianId ? { ...tech, ...updateData } : tech
      )
    );
  };

  const removeTechnician = (technicianId) => {
    setTechnicians(prev => prev.filter(tech => tech.id !== technicianId));
  };

  const refetch = () => loadTechnicians();

  return {
    technicians,
    loading,
    error,
    updateTechnician,
    removeTechnician,
    refetch
  };
}