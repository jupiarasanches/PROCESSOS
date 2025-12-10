import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  FileText, 
  User, 
  Calendar, 
  Eye,
  Plus,
  Edit,
  Trash2,
  RefreshCw
} from "lucide-react";

const actionIcons = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  status_changed: RefreshCw
};

const actionColors = {
  created: 'bg-green-100 text-green-800',
  updated: 'bg-blue-100 text-blue-800',
  deleted: 'bg-red-100 text-red-800',
  status_changed: 'bg-orange-100 text-orange-800'
};

const actionLabels = {
  created: 'Criado',
  updated: 'Atualizado',
  deleted: 'Excluído',
  status_changed: 'Status Alterado'
};

const entityLabels = {
  Process: 'Processo',
  ProcessInstance: 'Instância de Processo',
  User: 'Usuário',
  Appointment: 'Compromisso'
};

export default function AuditLogViewer({ logs, entityType, entityId }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredLogs = logs
    .filter(log => {
      if (entityType && log.entity_type !== entityType) return false;
      if (entityId && log.entity_id !== entityId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const renderChanges = (changes) => {
    if (!changes) return null;

    if (changes.fields) {
      return (
        <div className="space-y-2">
          {Object.entries(changes.fields).map(([field, values]) => (
            <div key={field} className="border-l-2 border-blue-500 pl-3">
              <div className="text-sm font-medium text-gray-700 capitalize">
                {field.replace(/_/g, ' ')}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <span className="text-xs text-gray-500">Antes:</span>
                  <div className="text-sm text-gray-900 bg-red-50 p-2 rounded mt-1">
                    {JSON.stringify(values.old, null, 2)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Depois:</span>
                  <div className="text-sm text-gray-900 bg-green-50 p-2 rounded mt-1">
                    {JSON.stringify(values.new, null, 2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
        {JSON.stringify(changes, null, 2)}
      </pre>
    );
  };

  if (filteredLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhum registro de auditoria encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const ActionIcon = actionIcons[log.action] || FileText;
          
          return (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${actionColors[log.action]} flex items-center justify-center flex-shrink-0`}>
                    <ActionIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={actionColors[log.action]}>
                        {actionLabels[log.action] || log.action}
                      </Badge>
                      <Badge variant="outline">
                        {entityLabels[log.entity_type] || log.entity_type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      {log.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.user_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(log.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(log)}
                    className="flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo de Entidade</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {entityLabels[selectedLog.entity_type] || selectedLog.entity_type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ID da Entidade</label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{selectedLog.entity_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ação</label>
                  <div className="mt-1">
                    <Badge className={actionColors[selectedLog.action]}>
                      {actionLabels[selectedLog.action] || selectedLog.action}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Data e Hora</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(selectedLog.created_date), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Usuário</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">{selectedLog.user_name}</span>
                  <span className="text-xs text-gray-500">({selectedLog.user_email})</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-900 mt-1">{selectedLog.description}</p>
              </div>

              {selectedLog.changes && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Alterações</label>
                  {renderChanges(selectedLog.changes)}
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Metadados</label>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto mt-1">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

AuditLogViewer.propTypes = {
  logs: PropTypes.array.isRequired,
  entityType: PropTypes.string,
  entityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}
