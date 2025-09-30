
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus } from "lucide-react";

const specialtyOptions = [
  'Licenciamento Ambiental',
  'Georreferenciamento', 
  'CAR - Cadastro Ambiental Rural',
  'CC-SEMA',
  'Plano de Exploração Florestal (PEF)',
  'Declaração de Atividade de Aceiro no Pantanal (DAAP)',
  'PRONAF',
  'Regularização Florestal',
  'Laudos Técnicos',
  'Consultoria Jurídica',
  'Perícia Ambiental',
  'Gestão de Projetos',
  'Análise de Solo',
  'Topografia',
  'Engenharia Florestal'
];

export default function TechnicianForm({ 
  technician, 
  isOpen, 
  onClose, 
  onSubmit,
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'user',
    is_technician: true,
    specialties: []
  });
  
  const [newSpecialty, setNewSpecialty] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (technician && isEditing) {
        setFormData({
          full_name: technician.full_name || '',
          email: technician.email || '',
          phone: technician.phone || '',
          department: technician.department || '',
          position: technician.position || '',
          role: technician.role || 'user',
          is_technician: technician.is_technician !== false,
          specialties: technician.specialties || []
        });
      } else {
        // Limpa o formulário para evitar a criação
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          role: 'user',
          is_technician: true,
          specialties: []
        });
      }
      setErrors({});
    }
  }, [isOpen, technician, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSpecialty = (specialty) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialtyToRemove) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialtyToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isEditing) {
      // Validações para edição
      if (!formData.department) newErrors.department = 'Departamento é obrigatório';
    } else {
      // Validações para criação (embora não será submetido, mantém a UI consistente)
      if (!formData.full_name.trim()) newErrors.full_name = 'Nome completo é obrigatório';
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      if (!formData.department) newErrors.department = 'Departamento é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar técnico:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      role: 'user',
      is_technician: true,
      specialties: []
    });
    setErrors({});
    setNewSpecialty('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {isEditing ? 'Editar Técnico' : 'Cadastrar Novo Técnico'}
          </DialogTitle>
          {!isEditing && (
            <p className="text-sm text-slate-500 pt-2">
              Para cadastrar um novo técnico, convide-o para a aplicação no seu painel de controle. Após o convite, você poderá editar os detalhes dele aqui.
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700">
                Nome Completo
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`mt-1 bg-slate-50`}
                placeholder="Nome completo do técnico"
                disabled
              />
               <p className="text-xs text-slate-500 mt-1">O nome é definido no momento do convite.</p>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 bg-slate-50`}
                placeholder="email@empresa.com"
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">O email é definido no momento do convite.</p>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="department" className="text-sm font-semibold text-slate-700">
                Departamento *
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger className={`mt-1 ${errors.department ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambiental">Ambiental</SelectItem>
                  <SelectItem value="agronegocio">Agronegócio</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="juridico">Jurídico</SelectItem>
                  <SelectItem value="qualidade">Qualidade</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            <div>
              <Label htmlFor="position" className="text-sm font-semibold text-slate-700">
                Cargo
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="mt-1"
                placeholder="Ex: Engenheiro Ambiental"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-semibold text-slate-700">
                Nível de Acesso
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Especialidades */}
          <div>
            <Label className="text-sm font-semibold text-slate-700">
              Especialidades
            </Label>
            
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Select value={newSpecialty} onValueChange={setNewSpecialty}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyOptions.filter(s => !formData.specialties.includes(s)).map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addSpecialty(newSpecialty)}
                  disabled={!newSpecialty}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="flex items-center gap-1"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-1 text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isEditing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Atualizar Técnico'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
