// Utilitários para cálculos de insights e análises de dashboard
export function calculateAvgCompletionTime(instances) {
  if (!instances || instances.length === 0) return 0;
  
  const completedInstances = instances.filter(instance => 
    instance.status === 'finalizado' && instance.created_date
  );
  
  if (completedInstances.length === 0) return 0;
  
  const totalDays = completedInstances.reduce((total, instance) => {
    const created = new Date(instance.created_date);
    const updated = new Date(instance.updated_date || instance.created_date);
    const diffTime = Math.abs(updated - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return total + diffDays;
  }, 0);
  
  return Math.round(totalDays / completedInstances.length);
}

export function calculateTechnicianWorkload(instances) {
  if (!instances || instances.length === 0) return {};
  
  const workload = {};
  
  instances.forEach(instance => {
    const technician = instance.technician_responsible;
    if (technician) {
      if (!workload[technician]) {
        workload[technician] = {
          total: 0,
          em_andamento: 0,
          pendente: 0,
          finalizado: 0,
          atrasado: 0
        };
      }
      
      workload[technician].total++;
      workload[technician][instance.status] = (workload[technician][instance.status] || 0) + 1;
      
      // Verificar se está atrasado
      if (isOverdue(instance)) {
        workload[technician].atrasado++;
      }
    }
  });
  
  return workload;
}

export function getRecentTrend(instances) {
  if (!instances || instances.length === 0) return 'stable';
  
  // Agrupar por semana
  const weeklyData = {};
  
  instances.forEach(instance => {
    if (instance.created_date) {
      const date = new Date(instance.created_date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = 0;
      }
      weeklyData[weekKey]++;
    }
  });
  
  const weeks = Object.keys(weeklyData).sort();
  if (weeks.length < 2) return 'stable';
  
  const recentWeeks = weeks.slice(-4); // Últimas 4 semanas
  const values = recentWeeks.map(week => weeklyData[week]);
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 10) return 'up';
  if (change < -10) return 'down';
  return 'stable';
}

export function getProcessStatusDistribution(instances) {
  if (!instances || instances.length === 0) return {};
  
  const distribution = {};
  
  instances.forEach(instance => {
    const status = instance.status || 'unknown';
    distribution[status] = (distribution[status] || 0) + 1;
  });
  
  return distribution;
}

export function getPriorityDistribution(instances) {
  if (!instances || instances.length === 0) return {};
  
  const distribution = {};
  
  instances.forEach(instance => {
    const priority = instance.priority || 'media';
    distribution[priority] = (distribution[priority] || 0) + 1;
  });
  
  return distribution;
}

export function isOverdue(instance) {
  if (!instance.due_date) return false;
  
  const dueDate = new Date(instance.due_date);
  const now = new Date();
  
  return dueDate < now && !['finalizado', 'cancelado'].includes(instance.status);
}

export function getOverdueCount(instances) {
  if (!instances || instances.length === 0) return 0;
  
  return instances.filter(instance => isOverdue(instance)).length;
}

export function getCompletionRate(instances) {
  if (!instances || instances.length === 0) return 0;
  
  const completedCount = instances.filter(instance => 
    instance.status === 'finalizado'
  ).length;
  
  return Math.round((completedCount / instances.length) * 100);
}

export function getAverageTimeByStatus(instances, status) {
  if (!instances || instances.length === 0) return 0;
  
  const filteredInstances = instances.filter(instance => 
    instance.status === status && instance.created_date
  );
  
  if (filteredInstances.length === 0) return 0;
  
  const totalHours = filteredInstances.reduce((total, instance) => {
    const created = new Date(instance.created_date);
    const updated = new Date(instance.updated_date || instance.created_date);
    const diffHours = Math.abs(updated - created) / (1000 * 60 * 60);
    return total + diffHours;
  }, 0);
  
  return Math.round(totalHours / filteredInstances.length);
}