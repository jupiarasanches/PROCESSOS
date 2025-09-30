
import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MapPin, Edit, Clock, AlertCircle, Play, Pause, CheckCircle, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DocumentViewer from './DocumentViewer';

const statusConfig = {
  aguardando_analise: {
    title: "Aguardando Análise",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-yellow-700 border border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    iconColor: "text-yellow-600",
    accentBorder: "border-l-yellow-500"
  },
  em_andamento: {
    title: "Em Andamento",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-blue-700 border border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
    icon: Play,
    iconColor: "text-blue-600",
    accentBorder: "border-l-blue-500"
  },
  pendente: {
    title: "Pendente", 
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-orange-700 border border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800",
    icon: Pause,
    iconColor: "text-orange-600",
    accentBorder: "border-l-orange-500"
  },
  finalizado: {
    title: "Finalizado/Protocolado",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-green-700 border border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-600",
    accentBorder: "border-l-green-500"
  },
  cancelado: {
    title: "Cancelados",
    color: "bg-white border-gray-200",
    headerColor: "bg-white text-red-700 border border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    icon: X,
    iconColor: "text-red-600",
    accentBorder: "border-l-red-500"
  }
};

const priorityColors = {
  baixa: "bg-gray-100 text-gray-700",
  media: "bg-orange-100 text-orange-700",
  alta: "bg-red-100 text-red-700",
  critica: "bg-red-200 text-red-800"
};

function ProcessCard({ instance, processName, technicians, onEdit, index }) {
  const [showDocuments, setShowDocuments] = useState(false);

  if (!instance?.id) return null;

  const isOverdue = instance.due_date && 
    new Date(instance.due_date) < new Date() && 
    !['finalizado', 'cancelado'].includes(instance.status);

  const responsibleTechnician = technicians?.find(
    tech => tech.email === instance.technician_responsible
  );
  
  return (
    <Draggable draggableId={String(instance.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
        >
          <Card className={`bg-white border-l-4 ${statusConfig[instance.status]?.accentBorder || 'border-l-gray-300'} hover:shadow-md transition-shadow`}>
            {isOverdue && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-2 h-2 text-white" />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 leading-tight truncate">
                    {instance.title || 'Sem título'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {processName || 'N/A'}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 hover:bg-gray-100 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(instance);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex gap-1 mt-2 flex-wrap">
                <Badge className={`${priorityColors[instance.priority] || priorityColors.media} text-xs border-0`}>
                  {instance.priority || 'media'}
                </Badge>
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-700 text-xs border-0">
                    Atrasado
                  </Badge>
                )}
                {instance.documents?.length > 0 && (
                  <Badge 
                    className="bg-blue-100 text-blue-700 text-xs border-0 cursor-pointer hover:bg-blue-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDocuments(true);
                    }}
                  >
                    📎 {instance.documents.length} doc{instance.documents.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{instance.client_company || 'N/A'}</span>
              </div>
              
              {instance.municipality && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{instance.municipality}</span>
                </div>
              )}
              
              {responsibleTechnician && (
                <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded-lg">
                  <img 
                    src={
                      responsibleTechnician.profile_picture_url || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        responsibleTechnician.full_name || instance.technician_responsible || 'Técnico'
                      )}&background=random&size=32`
                    }
                    alt="Técnico"
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {responsibleTechnician.full_name || instance.technician_responsible || 'N/A'}
                    </div>
                    {responsibleTechnician.position && (
                      <div className="text-gray-500 truncate">
                        {responsibleTechnician.position}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {instance.created_date ? format(new Date(instance.created_date), "dd/MM/yy", { locale: ptBR }) : 'N/A'}
                  </span>
                </div>
                {instance.due_date && (
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {format(new Date(instance.due_date), "dd/MM/yy", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>

            {showDocuments && (
              <DocumentViewer
                documents={instance.documents}
                isOpen={showDocuments}
                onClose={() => setShowDocuments(false)}
                processTitle={instance.title}
              />
            )}
          </Card>
        </div>
      )}
    </Draggable>
  );
}

function Column({ status, instances = [], processes = [], technicians = [], onEdit }) {
  const config = statusConfig[status];
  const count = instances.length;
  const IconComponent = config?.icon || X;
  
  if (!config) return null;
  
  return (
    <div className={`${config.color} rounded-lg border p-4 min-h-96`}>
      <div className={`${config.headerColor} rounded-md p-3 mb-4 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
          <div className="font-semibold text-sm">{config.title}</div>
        </div>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
          {count}
        </Badge>
      </div>
      
      <Droppable droppableId={status} type="PROCESS">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-64 rounded-lg ${
              snapshot.isDraggingOver 
                ? 'bg-gray-50 border-2 border-dashed border-gray-300' 
                : ''
            }`}
          >
            {instances.map((instance, index) => {
              if (!instance?.id) return null;
              
              const processName = processes.find(p => p.id === instance.process_id)?.name || 'N/A';
              
              return (
                <ProcessCard
                  key={instance.id}
                  instance={instance}
                  processName={processName}
                  technicians={technicians}
                  onEdit={onEdit}
                  index={index}
                />
              );
            })}
            {provided.placeholder}
            
            {instances.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">Nenhum processo</div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function ProcessKanban({ instances = [], processes = [], technicians = [], onStatusChange, onEdit }) {
  const statusOrder = ['aguardando_analise', 'em_andamento', 'pendente', 'finalizado', 'cancelado'];
  
  const groupedInstances = useMemo(() => {
    if (!Array.isArray(instances)) {
      return {
        aguardando_analise: [],
        em_andamento: [],
        pendente: [],
        finalizado: [],
        cancelado: []
      };
    }

    return {
      aguardando_analise: instances.filter(i => i?.status === 'aguardando_analise'),
      em_andamento: instances.filter(i => i?.status === 'em_andamento'),
      pendente: instances.filter(i => i?.status === 'pendente'),
      finalizado: instances.filter(i => i?.status === 'finalizado'),
      cancelado: instances.filter(i => i?.status === 'cancelado')
    };
  }, [instances]);

  const handleDragEnd = (result) => {
    if (!result?.destination) return;
    
    const { destination, source, draggableId } = result;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    const newStatus = destination.droppableId;
    onStatusChange?.(draggableId, newStatus);
  };

  if (!Array.isArray(instances) || !Array.isArray(processes)) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {statusOrder.map(status => (
            <Column
              key={status}
              status={status}
              instances={groupedInstances[status]}
              processes={processes}
              technicians={technicians}
              onEdit={onEdit}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
