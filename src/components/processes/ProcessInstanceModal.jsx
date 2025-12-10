
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Save, X, Upload, FileText, Trash2 } from "lucide-react";
import { UsersService } from "@/services";
import { FileService } from "@/services/fileService";
import { toast } from "sonner";

export default function ProcessInstanceModal({ 
  instance, 
  isOpen, 
  onClose, 
  onSubmit 
}) {
  const [formData, setFormData] = useState({
    title: '',
    client_company: '',
    technician_responsible: '',
    priority: 'media',
    status: 'pendente',
    area_hectares: '',
    municipality: '',
    due_date: null,
    notes: ''
  });
  
  const [technicians, setTechnicians] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && instance) {
      setFormData({
        title: instance.title || '',
        client_company: instance.client_company || '',
        technician_responsible: instance.technician_responsible || '',
        priority: instance.priority || 'media',
        status: instance.status || 'pendente',
        area_hectares: instance.area_hectares || '',
        municipality: instance.municipality || '',
        due_date: instance.due_date ? new Date(instance.due_date) : null,
        notes: instance.notes || ''
      });
      setDocuments(instance.documents || []);
      loadTechnicians();
    }
  }, [isOpen, instance]);

  const loadTechnicians = async () => {
    try {
      const users = await UsersService.getTechnicians();
      setTechnicians(users);
    } catch (error) {
      setTechnicians([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'text/plain',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Arquivo ${file.name} não é suportado. Use PDF, JPEG, PNG, TXT, XLSX ou DOCX.`);
          return null;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} é muito grande. Máximo 10MB.`);
          return null;
        }

        try {
          const [result] = await FileService.uploadFiles([file]);
          if (!result?.success) throw new Error(result?.errors?.[0] || 'Falha no upload');
          const doc = result.document;
          return {
            name: doc.name,
            url: doc.file_url || doc.url,
            type: doc.type,
            size: doc.size,
            uploaded_at: doc.uploaded_at
          };
        } catch (error) {
          toast.error(`Erro ao fazer upload de ${file.name}.`);
          return null;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(file => file !== null);

      setDocuments(prev => [...prev, ...validFiles]);
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} arquivo(s) enviado(s) com sucesso!`);
      }
    } catch (error) {
      toast.error("Erro ao fazer upload dos arquivos.");
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    toast.info("Documento removido.");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.client_company.trim()) newErrors.client_company = 'Cliente/Empresa é obrigatório';
    if (!formData.technician_responsible) newErrors.technician_responsible = 'Técnico responsável é obrigatório';
    if (!formData.municipality.trim()) newErrors.municipality = 'Município é obrigatório';
    
    if (formData.area_hectares && isNaN(Number(formData.area_hectares))) {
      newErrors.area_hectares = 'Área deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        area_hectares: formData.area_hectares ? Number(formData.area_hectares) : null,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        documents: documents
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!instance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Save className="w-5 h-5 text-blue-600" />
            </div>
            Editar Processo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Título do Processo *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Ex: SIMCAR - Fazenda São José"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="client" className="text-sm font-semibold text-gray-700">
                Cliente/Empresa *
              </Label>
              <Input
                id="client"
                value={formData.client_company}
                onChange={(e) => handleInputChange('client_company', e.target.value)}
                className={`mt-1 ${errors.client_company ? 'border-red-500' : ''}`}
                placeholder="Nome do cliente ou empresa"
              />
              {errors.client_company && <p className="text-red-500 text-xs mt-1">{errors.client_company}</p>}
            </div>

            <div>
              <Label htmlFor="technician" className="text-sm font-semibold text-gray-700">
                Técnico Responsável *
              </Label>
              <Select
                value={formData.technician_responsible}
                onValueChange={(value) => handleInputChange('technician_responsible', value)}
              >
                <SelectTrigger className={`mt-1 ${errors.technician_responsible ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecione um técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.email} value={tech.email}>
                      <div className="flex items-center gap-2">
                        <span>{tech.full_name || tech.email}</span>
                        {tech.department && (
                          <span className="text-xs text-gray-500 capitalize">({tech.department})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.technician_responsible && <p className="text-red-500 text-xs mt-1">{errors.technician_responsible}</p>}
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguardando_analise">Aguardando Análise</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="finalizado">Finalizado/Protocolado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">
                Prioridade
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger className="mt-1">
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
              <Label htmlFor="area" className="text-sm font-semibold text-gray-700">
                Área (hectares)
              </Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                value={formData.area_hectares}
                onChange={(e) => handleInputChange('area_hectares', e.target.value)}
                className={`mt-1 ${errors.area_hectares ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.area_hectares && <p className="text-red-500 text-xs mt-1">{errors.area_hectares}</p>}
            </div>

            <div>
              <Label htmlFor="municipality" className="text-sm font-semibold text-gray-700">
                Município *
              </Label>
              <Input
                id="municipality"
                value={formData.municipality}
                onChange={(e) => handleInputChange('municipality', e.target.value)}
                className={`mt-1 ${errors.municipality ? 'border-red-500' : ''}`}
                placeholder="Nome do município"
              />
              {errors.municipality && <p className="text-red-500 text-xs mt-1">{errors.municipality}</p>}
            </div>

            <div>
              <Label htmlFor="due_date" className="text-sm font-semibold text-gray-700">
                Prazo Final
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full mt-1 justify-start text-left font-normal ${!formData.due_date && 'text-muted-foreground'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => handleInputChange('due_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="mt-1 h-24"
              placeholder="Observações sobre o processo..."
            />
          </div>

          {/* Upload de Documentos */}
          <div>
            <Label className="text-sm font-semibold text-slate-700">
              Documentos (PDF, JPEG, PNG, TXT, XLSX, DOCX)
            </Label>
            <div className="mt-2">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpeg,.jpg,.png,.txt,.xlsx,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-edit"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload-edit"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${uploading ? 'opacity-50' : ''}`}
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="text-sm text-gray-600">
                    {uploading ? 'Enviando arquivos...' : 'Clique para adicionar mais arquivos'}
                  </div>
                  <div className="text-xs text-gray-500">
                    PDF, JPEG, PNG, TXT, XLSX, DOCX (máximo 10MB cada)
                  </div>
                </label>
              </div>

              {/* Lista de documentos */}
              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Arquivos Anexados ({documents.length})
                  </Label>
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] md:max-w-none">{doc.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || uploading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ProcessInstanceModal.propTypes = {
  instance: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
