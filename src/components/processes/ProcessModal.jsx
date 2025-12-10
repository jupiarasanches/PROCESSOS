
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatFileSize } from "../utils/formatters";
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
import { CalendarIcon, Save, X, Upload, FileText, Trash2, Mail, MessageCircle, Clock, Loader2 } from "lucide-react";
import { UsersService } from "@/services";
import { FileService } from "@/services/fileService";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function ProcessModal({
  process,
  isOpen,
  onClose,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    title: '',
    client_company: '',
    technician_responsible: '',
    priority: 'media',
    property_name: '',
    area_hectares: '',
    municipality: '',
    due_date: null,
    description: '',
    recurring_notification_enabled: false,
    recurring_notification_frequency: 'daily',
    recurring_notification_email: '',
    recurring_notification_whatsapp: false,
    recurring_notification_time: '09:00'
  });

  const [technicians, setTechnicians] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const frequencyOptions = [
    { value: '30_minutes', label: '30 em 30 minutos', description: 'A cada 30 minutos' },
    { value: '1_hour', label: '1 em 1 hora', description: 'A cada hora' },
    { value: '2_hours', label: '2 em 2 horas', description: 'A cada 2 horas' },
    { value: '4_hours', label: '4 em 4 horas', description: 'A cada 4 horas' },
    { value: '8_hours', label: '8 em 8 horas', description: 'A cada 8 horas' },
    { value: 'daily', label: 'Diariamente', description: 'Uma vez por dia no horário escolhido' },
    { value: '2_days', label: '2 em 2 dias', description: 'A cada 2 dias' },
    { value: '3_days', label: '3 em 3 dias', description: 'A cada 3 dias' },
    { value: 'weekly', label: 'Semanalmente', description: 'Uma vez por semana' },
    { value: 'biweekly', label: 'Quinzenalmente', description: 'A cada 15 dias' },
    { value: 'monthly', label: 'Mensalmente', description: 'Uma vez por mês' }
  ];

  useEffect(() => {
    if (isOpen && process) {
      setFormData({
        title: `${process.name} - `,
        client_company: '',
        technician_responsible: '',
        priority: 'media',
        property_name: '',
        area_hectares: '',
        municipality: '',
        due_date: null,
        description: '',
        recurring_notification_enabled: false,
        recurring_notification_frequency: 'daily',
        recurring_notification_email: '',
        recurring_notification_whatsapp: false,
        recurring_notification_time: '09:00'
      });
      setDocuments([]);
      loadTechnicians();
    }
  }, [isOpen, process]);

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
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.client_company.trim()) newErrors.client_company = 'Cliente/Empresa é obrigatório';
    if (!formData.technician_responsible) newErrors.technician_responsible = 'Técnico responsável é obrigatório';
    if (!formData.property_name.trim()) newErrors.property_name = 'Propriedade é obrigatória';
    if (!formData.municipality.trim()) newErrors.municipality = 'Município é obrigatório';
    if (!formData.due_date) newErrors.due_date = 'Prazo final é obrigatório';

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
      console.error('Erro ao criar processo:', error);
      toast.error('Erro ao criar processo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      client_company: '',
      technician_responsible: '',
      priority: 'media',
      property_name: '',
      area_hectares: '',
      municipality: '',
      due_date: null,
      description: '',
      recurring_notification_enabled: false,
      recurring_notification_frequency: 'daily',
      recurring_notification_email: '',
      recurring_notification_whatsapp: false,
      recurring_notification_time: '09:00'
    });
    setDocuments([]);
    setErrors({});
    onClose();
  };

  const getFrequencyDescription = (frequency) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option ? option.description : '';
  };

  if (!process) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Save className="w-5 h-5 text-blue-600" />
            </div>
            Iniciar: {process.name}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {process.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título do Processo */}
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
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

            {/* Cliente/Empresa */}
            <div>
              <Label htmlFor="client" className="text-sm font-semibold text-slate-700">
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

            {/* Técnico Responsável */}
            <div>
              <Label htmlFor="technician" className="text-sm font-semibold text-slate-700">
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
                          <span className="text-xs text-slate-500 capitalize">({tech.department})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.technician_responsible && <p className="text-red-500 text-xs mt-1">{errors.technician_responsible}</p>}
            </div>

            {/* Propriedade */}
            <div>
              <Label htmlFor="property_name" className="text-sm font-semibold text-slate-700">
                Propriedade
              </Label>
              <Input
                id="property_name"
                value={formData.property_name}
                onChange={(e) => handleInputChange('property_name', e.target.value)}
                className={`mt-1 ${errors.property_name ? 'border-red-500' : ''}`}
                placeholder="Ex: Fazenda Eldorado I"
              />
              {errors.property_name && <p className="text-red-500 text-xs mt-1">{errors.property_name}</p>}
            </div>

            {/* Área em Hectares */}
            <div>
              <Label htmlFor="area" className="text-sm font-semibold text-slate-700">
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

            {/* Município */}
            <div>
              <Label htmlFor="municipality" className="text-sm font-semibold text-slate-700">
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

            {/* Prazo Final */}
            <div>
              <Label htmlFor="due_date" className="text-sm font-semibold text-slate-700">
                Prazo Final *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full mt-1 justify-start text-left font-normal ${errors.due_date ? 'border-red-500' : ''} ${!formData.due_date && 'text-muted-foreground'}`}
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
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1 h-24"
              placeholder="Informações adicionais sobre o processo..."
            />
          </div>

          {/* SEÇÃO DE NOTIFICAÇÕES RECORRENTES */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Notificações Recorrentes</h4>
                <p className="text-xs text-blue-600">Receba lembretes automáticos sobre o progresso deste processo</p>
              </div>
            </div>

            {/* Switch para ativar notificações recorrentes */}
            <div className="flex items-center justify-between p-3 border border-blue-300 rounded-lg bg-white mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <Label className="text-sm font-medium text-blue-900">Ativar Notificações Recorrentes</Label>
                  <p className="text-xs text-blue-600">Receba lembretes automáticos sobre este processo</p>
                </div>
              </div>
              <Switch
                checked={formData.recurring_notification_enabled}
                onCheckedChange={(checked) => handleInputChange('recurring_notification_enabled', checked)}
              />
            </div>

            {/* Configurações das notificações recorrentes - aparecem apenas se ativadas */}
            {formData.recurring_notification_enabled && (
              <div className="space-y-4">
                {/* Frequência das notificações */}
                <div>
                  <Label htmlFor="recurring_frequency" className="text-sm font-medium text-blue-900">
                    Com que frequência deseja ser notificado?
                  </Label>
                  <Select
                    value={formData.recurring_notification_frequency}
                    onValueChange={(value) => handleInputChange('recurring_notification_frequency', value)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-blue-600 mt-1">
                    {getFrequencyDescription(formData.recurring_notification_frequency)}
                  </p>
                </div>

                {/* Seleção de horário - aparece apenas para frequência diária */}
                {formData.recurring_notification_frequency === 'daily' && (
                  <div>
                    <Label htmlFor="notification_time" className="text-sm font-medium text-blue-900">
                      Horário de preferência para notificação diária
                    </Label>
                    <Input
                      id="notification_time"
                      type="time"
                      value={formData.recurring_notification_time}
                      onChange={(e) => handleInputChange('recurring_notification_time', e.target.value)}
                      className="mt-1 border-blue-300 focus:border-blue-500"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Você receberá as notificações diárias todos os dias às {formData.recurring_notification_time}
                    </p>
                  </div>
                )}

                {/* Canais de notificação recorrente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* E-mail recorrente */}
                  <div className="flex items-center justify-between p-3 border border-blue-300 rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <Label className="text-sm font-medium text-blue-900">E-mail</Label>
                        <p className="text-xs text-blue-600">Receber por e-mail</p>
                      </div>
                    </div>
                    <div className="text-blue-600 font-medium text-sm">Ativo</div>
                  </div>

                  {/* WhatsApp recorrente */}
                  <div className="flex items-center justify-between p-3 border border-green-300 rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <Label className="text-sm font-medium text-green-900">WhatsApp</Label>
                        <p className="text-xs text-green-600">Receber por WhatsApp</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.recurring_notification_whatsapp}
                      onCheckedChange={(checked) => handleInputChange('recurring_notification_whatsapp', checked)}
                    />
                  </div>
                </div>

                {/* E-mail personalizado para notificações recorrentes */}
                <div>
                  <Label htmlFor="recurring_notification_email" className="text-sm font-medium text-blue-900">
                    E-mail para receber notificações recorrentes (opcional)
                  </Label>
                  <Input
                    id="recurring_notification_email"
                    type="email"
                    value={formData.recurring_notification_email}
                    onChange={(e) => handleInputChange('recurring_notification_email', e.target.value)}
                    className="mt-1 border-blue-300 focus:border-blue-500"
                    placeholder="Se vazio, usará seu e-mail de login"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Deixe em branco para usar seu e-mail de login no sistema
                  </p>
                </div>

                {/* Informação adicional */}
                <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Como funciona:</strong> Você receberá e-mails automáticos sobre o progresso deste processo na frequência escolhida
                    {formData.recurring_notification_frequency === 'daily' && ` às ${formData.recurring_notification_time}`}.
                    As notificações incluirão status atual, próximos passos e informações importantes.
                    Você pode desativar essas notificações a qualquer momento editando o processo.
                  </p>
                </div>
              </div>
            )}
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
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${uploading ? 'opacity-50' : ''}`}
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="text-sm text-gray-600">
                    {uploading ? 'Enviando arquivos...' : 'Clique para selecionar arquivos ou arraste aqui'}
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
                    Arquivos Selecionados ({documents.length})
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

          {/* Botões */}
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
              {isSubmitting ? 'Criando...' : 'Criar Processo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ProcessModal.propTypes = {
  process: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
