import { useState, useEffect, useCallback } from 'react';
import { AppointmentService } from '@/services';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const appointmentData = await AppointmentService.getAllAppointments({ 
        orderBy: '-scheduled_date' 
      });
      setAppointments(appointmentData || []);
      console.log('✅ Compromissos carregados:', appointmentData?.length || 0);
    } catch (err) {
      console.error('❌ Erro ao carregar compromissos:', err);
      setError(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const addAppointment = (newAppointment) => {
    setAppointments(prev => [newAppointment, ...prev]);
  };

  const updateAppointment = (appointmentId, updateData) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId ? { ...apt, ...updateData } : apt
      )
    );
  };

  const removeAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const refetch = () => loadAppointments();

  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    removeAppointment,
    refetch
  };
}