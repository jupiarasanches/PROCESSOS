// Utilitários para filtros e formatação de datas
import { format, isToday, isTomorrow, isThisWeek, isPast, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date, formatStr = 'dd/MM/yyyy') {
  if (!date) return null;
  return format(new Date(date), formatStr, { locale: ptBR });
}

export function formatDateTime(date) {
  if (!date) return null;
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function formatRelativeDate(date) {
  if (!date) return null;
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return 'Hoje';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Amanhã';
  }
  
  if (isPast(dateObj)) {
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  }
  
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE', { locale: ptBR });
  }
  
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

export function filterAppointmentsByDate(appointments, filterType) {
  if (!appointments || !Array.isArray(appointments)) return [];
  
  switch (filterType) {
    case 'today':
      return appointments.filter(apt => {
        if (!apt.date) return false;
        return isToday(new Date(apt.date));
      });
      
    case 'tomorrow':
      return appointments.filter(apt => {
        if (!apt.date) return false;
        return isTomorrow(new Date(apt.date));
      });
      
    case 'this_week':
      return appointments.filter(apt => {
        if (!apt.date) return false;
        return isThisWeek(new Date(apt.date));
      });
      
    case 'upcoming':
      return appointments.filter(apt => {
        if (!apt.date) return false;
        return !isPast(new Date(apt.date));
      });
      
    case 'past':
      return appointments.filter(apt => {
        if (!apt.date) return false;
        return isPast(new Date(apt.date));
      });
      
    default:
      return appointments;
  }
}

export function getDateRangeFilter(startDate, endDate) {
  return {
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : null,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null
  };
}

export function isDateInRange(date, startDate, endDate) {
  if (!date) return false;
  
  const dateObj = new Date(date);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && dateObj < start) return false;
  if (end && dateObj > end) return false;
  
  return true;
}

export function getBusinessDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  
  let count = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Não domingo nem sábado
      count++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return count;
}

export function getDeadlineStatus(dueDate, status) {
  if (!dueDate || ['finalizado', 'cancelado'].includes(status)) {
    return 'completed';
  }
  
  const now = new Date();
  const due = new Date(dueDate);
  
  if (due < now) {
    return 'overdue';
  }
  
  const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntil <= 1) {
    return 'urgent';
  }
  
  if (daysUntil <= 3) {
    return 'warning';
  }
  
  return 'normal';
}