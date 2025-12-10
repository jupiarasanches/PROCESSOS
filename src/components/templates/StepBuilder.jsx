import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Edit, Check, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function StepBuilder({ steps, onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    responsible: '',
    estimated_duration: 24,
    required_fields: []
  });

  const handleAddStep = () => {
    if (!newStep.name || !newStep.description) return;

    const updatedSteps = [...steps, { ...newStep }];
    onChange(updatedSteps);
    setNewStep({
      name: '',
      description: '',
      responsible: '',
      estimated_duration: 24,
      required_fields: []
    });
  };

  const handleEditStep = (index) => {
    setEditingIndex(index);
  };

  const handleSaveStep = (index, updatedStep) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = updatedStep;
    onChange(updatedSteps);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    onChange(updatedSteps);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  return (
    <div className="space-y-6">
      {/* Adicionar Nova Etapa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar Nova Etapa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome da Etapa</Label>
              <Input
                value={newStep.name}
                onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                placeholder="Ex: Análise de Documentação"
              />
            </div>
            <div>
              <Label>Duração Estimada (horas)</Label>
              <Input
                type="number"
                value={newStep.estimated_duration}
                onChange={(e) => setNewStep({ ...newStep, estimated_duration: parseInt(e.target.value) || 0 })}
                placeholder="24"
              />
            </div>
          </div>

          <div>
            <Label>Descrição da Etapa</Label>
            <Textarea
              value={newStep.description}
              onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
              placeholder="Descreva o que deve ser feito nesta etapa..."
              className="h-20"
            />
          </div>

          <div>
            <Label>Responsável Padrão (opcional)</Label>
            <Input
              value={newStep.responsible}
              onChange={(e) => setNewStep({ ...newStep, responsible: e.target.value })}
              placeholder="Email ou cargo do responsável"
            />
          </div>

          <Button 
            onClick={handleAddStep}
            disabled={!newStep.name || !newStep.description}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Etapa
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Etapas */}
      {steps.length > 0 && (
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            Etapas Configuradas ({steps.length})
            <Badge variant="outline">Arraste para reordenar</Badge>
          </h4>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {steps.map((step, index) => (
                    <Draggable key={index} draggableId={`step-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                        >
                          {editingIndex === index ? (
                            <StepEditCard
                              step={step}
                              index={index}
                              onSave={handleSaveStep}
                              onCancel={handleCancelEdit}
                            />
                          ) : (
                            <Card>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline">{index + 1}</Badge>
                                      <span className="font-semibold">{step.name}</span>
                                      <Badge variant="secondary">{step.estimated_duration}h</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                                    {step.responsible && (
                                      <p className="text-xs text-gray-500">
                                        Responsável: {step.responsible}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditStep(index)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveStep(index)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {steps.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Nenhuma etapa adicionada ainda</p>
          <p className="text-sm text-gray-400">Adicione etapas para estruturar seu processo</p>
        </div>
      )}
    </div>
  );
}

function StepEditCard({ step, index, onSave, onCancel }) {
  const [editedStep, setEditedStep] = useState({ ...step });

  return (
    <Card className="border-blue-500">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-3">
          <Badge>{index + 1}</Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSave(index, editedStep)}
            >
              <Check className="w-4 h-4 mr-1" />
              Salvar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input
              value={editedStep.name}
              onChange={(e) => setEditedStep({ ...editedStep, name: e.target.value })}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Duração (horas)</Label>
            <Input
              type="number"
              value={editedStep.estimated_duration}
              onChange={(e) => setEditedStep({ ...editedStep, estimated_duration: parseInt(e.target.value) || 0 })}
              className="h-8"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Descrição</Label>
          <Textarea
            value={editedStep.description}
            onChange={(e) => setEditedStep({ ...editedStep, description: e.target.value })}
            className="h-16 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">Responsável</Label>
          <Input
            value={editedStep.responsible}
            onChange={(e) => setEditedStep({ ...editedStep, responsible: e.target.value })}
            className="h-8"
            placeholder="Email ou cargo"
          />
        </div>
      </CardContent>
    </Card>
  );
}

StepEditCard.propTypes = {
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

StepBuilder.propTypes = {
  steps: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
}
