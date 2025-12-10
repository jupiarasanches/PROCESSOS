// Utilitários para comparação de objetos e detecção de mudanças
export function getChangedFields(oldData, newData) {
  if (!oldData || !newData) return [];
  
  const changes = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  for (const key of allKeys) {
    if (oldData[key] !== newData[key]) {
      changes.push({
        field: key,
        oldValue: oldData[key],
        newValue: newData[key]
      });
    }
  }
  
  return changes;
}

export function hasChanges(oldData, newData) {
  return getChangedFields(oldData, newData).length > 0;
}

export function getSignificantChanges(oldData, newData, ignoreFields = []) {
  const changes = getChangedFields(oldData, newData);
  return changes.filter(change => !ignoreFields.includes(change.field));
}

export function createDiffSummary(oldData, newData) {
  const changes = getChangedFields(oldData, newData);
  
  if (changes.length === 0) return 'Nenhuma alteração';
  if (changes.length === 1) return `Alterado: ${changes[0].field}`;
  return `Alterados ${changes.length} campos: ${changes.map(c => c.field).join(', ')}`;
}