import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { User } from "@/api/entities";

export default function NewProcessModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'ativo',
    owner: '',
    priority: 'media',
    sla_hours: 48,
    steps: []
  });
  
  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    responsible: '',
    estimated_duration: 24,
    required_fields: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      loadCurrentUser();
    }
  }, [isOpen]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setFormData(prev => ({ ...prev, owner: user.email }));
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const addStep = () => {
    if (newStep.name && newStep.description) {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, { ...newStep, id: Date.now() }]
      }));
      setNewStep({
        name: '',
        description: '',
        responsible: '',
        estimated_duration: 24,
        required_fields: []
      });
    }
  };

  const removeStep = (stepId) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const processData = {
        ...formData,
        steps: formData.steps.map(({ id, ...step }) => step) // Remove id temporário
      };
      
      await onSubmit(processData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        status: 'ativo',
        owner: currentUser?.email || '',
        priority: 'media',
        sla_hours: 48,
        steps: []
      });
    } catch (error) {
      console.error('Erro ao criar processo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      status: 'ativo',
      owner: '',
      priority: 'media',
      sla_hours: 48,
      steps: []
    });
    setNewStep({
      name: '',
      description: '',
      responsible: '',
      estimated_duration: 24,
      required_fields: []
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Criar Novo Processo de Serviço
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Processo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: SIMCAR, PEF, CC-SEMA..."
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambiental">Ambiental</SelectItem>
                  <SelectItem value="agronegocio">Agronegócio</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="florestal">Florestal</SelectItem>
                  <SelectItem value="georreferenciamento">Georreferenciamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva detalhadamente o que este processo faz..."
              className="h-24"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="em_revisao">Em Revisão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sla_hours">SLA (horas)</Label>
              <Input
                id="sla_hours"
                type="number"
                value={formData.sla_hours}
                onChange={(e) => setFormData({...formData, sla_hours: parseInt(e.target.value)})}
                placeholder="48"
              />
            </div>
          </div>

          {/* Etapas do Processo */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Etapas do Processo</h3>
            
            {/* Adicionar Nova Etapa */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Adicionar Nova Etapa</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Nome da etapa"
                  value={newStep.name}
                  onChange={(e) => setNewStep({...newStep, name: e.target.value})}
                />
                <Input
                  placeholder="Duração estimada (horas)"
                  type="number"
                  value={newStep.estimated_duration}
                  onChange={(e) => setNewStep({...newStep, estimated_duration: parseInt(e.target.value)})}
                />
              </div>
              <Textarea
                placeholder="Descrição da etapa"
                value={newStep.description}
                onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                className="mt-3 h-20"
              />
              <Button 
                type="button" 
                onClick={addStep}
                className="mt-3"
                disabled={!newStep.name || !newStep.description}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>

            {/* Lista de Etapas */}
            {formData.steps.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Etapas Configuradas ({formData.steps.length})</h4>
                {formData.steps.map((step, index) => (
                  <div key={step.id} className="bg-white p-4 rounded-lg border flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{step.name}</span>
                        <Badge variant="secondary">{step.estimated_duration}h</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(step.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.description || !formData.category}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Criando...' : 'Criar Processo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}