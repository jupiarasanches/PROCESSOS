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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Save, X, Mail, MessageCircle } from "lucide-react";

export default function AppointmentModal({
  appointment,
  processes,
  isOpen,
  onClose,
  onSubmit,
  selectedDate
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    process_id: '',
    scheduled_date: selectedDate || new Date(),
    duration_hours: 1,
    priority: 'media',
    notification_email_enabled: true,
    notification_email: '',
    notification_whatsapp_enabled: false,
    notification_minutes_before: 0,
    location: '',
    client_company: '',
    notes: ''
  });

  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        const appointmentDate = new Date(appointment.scheduled_date);
        setFormData({
          title: appointment.title || '',
          description: appointment.description || '',
          process_id: appointment.process_id || '',
          scheduled_date: appointmentDate,
          duration_hours: appointment.duration_hours || 1,
          priority: appointment.priority || 'media',
          notification_email_enabled: appointment.notification_email_enabled !== false,
          notification_email: appointment.notification_email || '',
          notification_whatsapp_enabled: appointment.notification_whatsapp_enabled || false,
          notification_minutes_before: appointment.notification_minutes_before || 0,
          location: appointment.location || '',
          client_company: appointment.client_company || '',
          notes: appointment.notes || ''
        });
        setScheduledTime(format(appointmentDate, 'HH:mm'));
      } else {
        setFormData({
          title: '',
          description: '',
          process_id: '',
          scheduled_date: selectedDate || new Date(),
          duration_hours: 1,
          priority: 'media',
          notification_email_enabled: true,
          notification_email: '',
          notification_whatsapp_enabled: false,
          notification_minutes_before: 0,
          location: '',
          client_company: '',
          notes: ''
        });
        setScheduledTime('09:00');
      }
      setErrors({});
    }
  }, [isOpen, appointment, selectedDate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeChange = (time) => {
    setScheduledTime(time);
    const [hours, minutes] = time.split(':');
    const newDate = new Date(formData.scheduled_date);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    handleInputChange('scheduled_date', newDate);
  };

  const handleDateChange = (date) => {
    if (date) {
      const [hours, minutes] = scheduledTime.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
      handleInputChange('scheduled_date', date);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.scheduled_date) newErrors.scheduled_date = 'Data é obrigatória';
    if (formData.duration_hours <= 0) newErrors.duration_hours = 'Duração deve ser maior que 0';

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
        scheduled_date: formData.scheduled_date.toISOString()
      });
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      process_id: '',
      scheduled_date: new Date(),
      duration_hours: 1,
      priority: 'media',
      notification_email_enabled: true,
      notification_email: '',
      notification_whatsapp_enabled: false,
      notification_minutes_before: 0,
      location: '',
      client_company: '',
      notes: ''
    });
    setScheduledTime('09:00');
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            {appointment ? 'Editar Compromisso' : 'Novo Compromisso'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Título *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Ex: Reunião SIMCAR - Fazenda São José"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Processo */}
            <div>
              <Label htmlFor="process" className="text-sm font-medium text-gray-700">
                Processo *
              </Label>
              <Select
                value={formData.process_id}
                onValueChange={(value) => handleInputChange('process_id', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um processo" />
                </SelectTrigger>
                <SelectContent>
                  {processes.map((process) => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div>
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
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
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Data *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full mt-1 justify-start text-left font-normal ${!formData.scheduled_date && 'text-muted-foreground'}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_date ? format(formData.scheduled_date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Horário */}
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Duração */}
            <div>
              <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                Duração (horas)
              </Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.duration_hours}
                onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>

            {/* Cliente/Empresa */}
            <div>
              <Label htmlFor="client" className="text-sm font-medium text-gray-700">
                Cliente/Empresa
              </Label>
              <Input
                id="client"
                value={formData.client_company}
                onChange={(e) => handleInputChange('client_company', e.target.value)}
                className="mt-1"
                placeholder="Nome da empresa"
              />
            </div>
          </div>

          {/* Local */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Local
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="mt-1"
              placeholder="Local do compromisso"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1 h-24"
              placeholder="Descreva o que será feito neste compromisso..."
            />
          </div>

          {/* Configurações de Notificação */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Configurações de Notificação</h4>

            <div className="space-y-4">
              {/* E-mail */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ativar notificações por E-mail</Label>
                    <p className="text-xs text-gray-500">Receba lembretes por e-mail antes do compromisso</p>
                  </div>
                </div>
                <Switch
                  checked={formData.notification_email_enabled}
                  onCheckedChange={(checked) => handleInputChange('notification_email_enabled', checked)}
                />
              </div>

              {/* E-mail personalizado */}
              {formData.notification_email_enabled && (
                <div>
                  <Label htmlFor="notification_email" className="text-sm font-medium text-gray-700">
                    E-mail para receber notificações (opcional)
                  </Label>
                  <Input
                    id="notification_email"
                    type="email"
                    value={formData.notification_email}
                    onChange={(e) => handleInputChange('notification_email', e.target.value)}
                    className="mt-1"
                    placeholder="Se vazio, usará seu e-mail de login"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para usar seu e-mail de login no sistema
                  </p>
                </div>
              )}

              {/* WhatsApp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ativar notificações por WhatsApp</Label>
                    <p className="text-xs text-gray-500">Receba lembretes por WhatsApp</p>
                  </div>
                </div>
                <Switch
                  checked={formData.notification_whatsapp_enabled}
                  onCheckedChange={(checked) => handleInputChange('notification_whatsapp_enabled', checked)}
                />
              </div>

              {/* Minutos antes */}
              {(formData.notification_email_enabled || formData.notification_whatsapp_enabled) && (
                <div>
                  <Label htmlFor="notification_time" className="text-sm font-medium text-gray-700">
                    Notificar quantos minutos antes?
                  </Label>
                  <Select
                    value={formData.notification_minutes_before.toString()}
                    onValueChange={(value) => handleInputChange('notification_minutes_before', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No horário exato</SelectItem>
                      <SelectItem value="10">10 minutos antes</SelectItem>
                      <SelectItem value="15">15 minutos antes</SelectItem>
                      <SelectItem value="20">20 minutos antes</SelectItem>
                      <SelectItem value="30">30 minutos antes</SelectItem>
                      <SelectItem value="60">1 hora antes</SelectItem>
                      <SelectItem value="120">2 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.notification_minutes_before === 0 
                      ? `Você será notificado exatamente às ${scheduledTime}` 
                      : `Você será notificado ${formData.notification_minutes_before} minutos antes do compromisso`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="mt-1 h-20"
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {isSubmitting ? 'Salvando...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {appointment ? 'Atualizar' : 'Agendar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AppointmentModal.propTypes = {
  appointment: PropTypes.object,
  processes: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
}
