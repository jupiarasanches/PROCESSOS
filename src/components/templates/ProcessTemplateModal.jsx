import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Loader2 } from "lucide-react";
import StepBuilder from "./StepBuilder";
import { base44 } from "@/api/base44Client";

export default function ProcessTemplateModal({ template, isOpen, onClose, onSubmit }) {
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

  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadCurrentUser();
      if (template) {
        setFormData({
          name: template.name || '',
          description: template.description || '',
          category: template.category || '',
          status: template.status || 'ativo',
          owner: template.owner || '',
          priority: template.priority || 'media',
          sla_hours: template.sla_hours || 48,
          steps: template.steps || []
        });
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, template]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      if (!template) {
        setFormData(prev => ({ ...prev, owner: user.email }));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const resetForm = () => {
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
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {template ? 'Editar Modelo de Processo' : 'Novo Modelo de Processo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="steps">Etapas do Processo</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome do Modelo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Ex: SIMCAR, PEF, CC-SEMA..."
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Categoria */}
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ambiental">Ambiental</SelectItem>
                      <SelectItem value="agronegocio">Agronegócio</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="florestal">Florestal</SelectItem>
                      <SelectItem value="georreferenciamento">Georreferenciamento</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="ti">TI</SelectItem>
                      <SelectItem value="agrimensura_topografico">Agrimensura/Levantamento Topográfico</SelectItem>
                      <SelectItem value="regularizacao_fundiaria">Regularização Fundiária</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
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

                {/* Prioridade */}
                <div>
                  <Label htmlFor="priority">Prioridade Padrão</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
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

                {/* SLA */}
                <div>
                  <Label htmlFor="sla">SLA (horas)</Label>
                  <Input
                    id="sla"
                    type="number"
                    value={formData.sla_hours}
                    onChange={(e) => handleInputChange('sla_hours', parseInt(e.target.value) || 0)}
                    placeholder="48"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`h-32 ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Descreva detalhadamente o que este processo faz..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </TabsContent>

            <TabsContent value="steps" className="mt-6">
              <StepBuilder
                steps={formData.steps}
                onChange={(steps) => handleInputChange('steps', steps)}
              />
            </TabsContent>
          </Tabs>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
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
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Salvando...' : (template ? 'Atualizar' : 'Criar Modelo')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ProcessTemplateModal.propTypes = {
  template: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
