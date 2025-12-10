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
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";
import { AuthService } from "@/services";

export default function NewProcessModal({ isOpen, onClose, onSubmit, process }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'ativo',
    owner: ''
  });
 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCurrentUser();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && process) {
      setFormData({
        name: process.name || '',
        description: process.description || '',
        category: process.category || '',
        status: process.status || 'ativo',
        owner: process.owner || currentUser?.email || ''
      });
    }
  }, [isOpen, process]);

  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({ ...prev, owner: user.email || '' }));
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      setCurrentUser(null);
    }
  };

  // Etapas removidas deste formulário

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!currentUser) {
        setIsSubmitting(false);
        return;
      }
      await onSubmit(formData, process?.id);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        status: 'ativo',
        owner: currentUser?.email || ''
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
      owner: ''
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
                  <SelectItem value="agrimensura_topografico">Agrimensura/Levantamento Topográfico</SelectItem>
                  <SelectItem value="regularizacao_fundiaria">Regularização Fundiária</SelectItem>
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

          {/* Campos removidos: Prioridade, Status, SLA e Etapas */}

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
              {isSubmitting ? (process ? 'Atualizando...' : 'Criando...') : (process ? 'Atualizar Processo' : 'Criar Processo')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

NewProcessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  process: PropTypes.object,
}
