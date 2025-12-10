import { useState, useEffect, useCallback } from "react";
import { Calendar, CalendarDays, Clock, Plus, Filter, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import PropTypes from "prop-types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AppointmentModal from "../components/agenda/AppointmentModal";
import NotificationCenter from "../components/agenda/NotificationCenter";
import CalendarView from "../components/agenda/CalendarView";
import AuthService from '@/services/authService';
import AppointmentService from '@/services/appointmentService';
import ProcessService from '@/services/processService';
import { notificationService } from '@/services/notificationService';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [filterStatus, setFilterStatus] = useState("all");

  const checkNotifications = useCallback(async () => {
    try {
      const user = currentUser;
      if (!user) return;

      const now = new Date();
      
      const upcomingAppointments = appointments.filter(apt => {
        if (!apt.notification_email_enabled || apt.notification_sent) return false;
        
        const scheduledTime = new Date(apt.scheduled_date);
        const notificationTime = new Date(scheduledTime.getTime() - (apt.notification_minutes_before * 60000));
        
        return now >= notificationTime && now < scheduledTime && apt.assigned_to === user.email;
      });

      for (const appointment of upcomingAppointments) {
        await notificationService.createAppointmentNotification(appointment, user.id);
        
        if (appointment.notification_email_enabled) {
          try {
            const targetEmail = appointment.notification_email || user.email;
            
            const processName = appointment.process_id 
              ? processes.find(p => p.id === appointment.process_id)?.name || 'Processo personalizado'
              : 'Processo personalizado';

            const emailBody = `
              <h2>🔔 Lembrete de Compromisso</h2>
              <p>Olá <strong>${user.full_name}</strong>,</p>
              <p>Este é um lembrete do seu compromisso agendado:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">${appointment.title}</h3>
                <p><strong>📅 Data:</strong> ${format(new Date(appointment.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p><strong>⏰ Duração:</strong> ${appointment.duration_hours}h</p>
                <p><strong>🔧 Processo:</strong> ${processName}</p>
                ${appointment.client_company ? `<p><strong>🏢 Cliente:</strong> ${appointment.client_company}</p>` : ''}
                ${appointment.location ? `<p><strong>📍 Local:</strong> ${appointment.location}</p>` : ''}
                ${appointment.description ? `<p><strong>📝 Descrição:</strong> ${appointment.description}</p>` : ''}
              </div>
              
              ${appointment.notes ? `<p><strong>Observações:</strong> ${appointment.notes}</p>` : ''}
              
              <p>Acesse o sistema para mais detalhes: <a href="${window.location.origin}/agenda">Ver Agenda</a></p>
              
              <hr>
              <p style="font-size: 12px; color: #6b7280;">
                Esta é uma notificação automática do ProcessFlow.<br>
                Você está recebendo este e-mail porque tem um compromisso agendado em nossa plataforma.
                ${appointment.notification_email ? `<br>Notificação enviada para: ${targetEmail}` : ''}
              </p>
            `;

            // TODO: Implementar serviço de e-mail quando disponível
            console.log('E-mail seria enviado para:', targetEmail);
            console.log('Assunto:', `🔔 Lembrete: ${appointment.title}${appointment.notification_minutes_before > 0 ? ` em ${appointment.notification_minutes_before} minutos` : ''}`);
            console.log('Corpo do e-mail:', emailBody);

            toast.success(`E-mail enviado para ${targetEmail}`);
            
          } catch (emailError) {
            console.error("Erro ao enviar e-mail de notificação:", emailError);
            toast.error("Erro ao enviar e-mail de notificação");
          }
        }
        
        await AppointmentService.updateAppointment(appointment.id, { notification_sent: true });
      }

      const updatedNotifications = await notificationService.getUnreadNotifications(user.id);
      setNotifications(updatedNotifications || []);
      
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
      toast.error("Erro ao verificar notificações");
    }
  }, [appointments, processes, currentUser]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);

      const [appointmentData, processData, notificationData] = await Promise.all([
        AppointmentService.getAllAppointments({ sort: { scheduled_date: 'desc' } }),
        ProcessService.getAllProcesses({ sort: { created_date: 'desc' } }),
        notificationService.getUnreadNotifications(user.id)
      ]);
      
      setAppointments(appointmentData || []);
      setProcesses(processData || []);
      setNotifications(notificationData || []);
      
      console.log('✅ AGENDA - DADOS GLOBAIS CARREGADOS:');
      console.log('📅 Compromissos:', appointmentData?.length || 0);
      console.log('📋 Processos:', processData?.length || 0);
      console.log('🔔 Notificações:', notificationData?.length || 0);
    } catch (error) {
      console.error("❌ Erro ao carregar dados da agenda:", error);
      toast.error("Erro ao carregar dados da agenda");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (appointments.length > 0 && currentUser) {
      checkNotifications();
      
      const interval = setInterval(checkNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [appointments, checkNotifications, currentUser]);

  const handleCreateAppointment = async (appointmentData) => {
    try {
      const user = await AuthService.getCurrentUser();
      const newAppointment = await AppointmentService.createAppointment({
        ...appointmentData,
        assigned_to: user.email
      });

      setAppointments(prev => [newAppointment, ...prev]);
      toast.success("Compromisso agendado com sucesso!", {
        description: appointmentData.notification_email_enabled 
          ? appointmentData.notification_minutes_before === 0
            ? "Você receberá um e-mail no horário exato do compromisso."
            : `Você receberá um e-mail ${appointmentData.notification_minutes_before} minutos antes do compromisso.`
          : ""
      });
      
      setIsAppointmentModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erro ao criar compromisso:', error);
      toast.error("Erro ao agendar compromisso");
      throw error;
    }
  };

  const handleUpdateAppointment = async (appointmentData) => {
    try {
      await AppointmentService.updateAppointment(selectedAppointment.id, appointmentData);
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id ? { ...apt, ...appointmentData } : apt
        )
      );
      
      toast.success("Compromisso atualizado com sucesso!");
      setIsAppointmentModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erro ao atualizar compromisso:', error);
      toast.error("Erro ao atualizar compromisso");
      throw error;
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await AppointmentService.deleteAppointment(appointmentId);
      
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      toast.success("Compromisso excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir compromisso:', error);
      toast.error("Erro ao excluir compromisso");
    }
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await AppointmentService.updateAppointment(appointmentId, { status: newStatus });
      
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
      
      toast.success(`Compromisso marcado como ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === "all") return true;
    return apt.status === filterStatus;
  });

  const todayAppointments = filteredAppointments.filter(apt => 
    isToday(new Date(apt.scheduled_date))
  );

  const upcomingAppointments = filteredAppointments.filter(apt => 
    isFuture(new Date(apt.scheduled_date)) && !isToday(new Date(apt.scheduled_date))
  );

  const pastAppointments = filteredAppointments.filter(apt => 
    new Date(apt.scheduled_date) < new Date() && !isToday(new Date(apt.scheduled_date))
  );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarDays className="w-8 h-8 text-blue-600" />
                Agenda de Compromissos
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie seus compromissos e receba notificações automáticas
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <NotificationCenter 
                      notifications={notifications}
                      unreadCount={unreadNotifications}
                      onNotificationRead={async (id) => {
                        await notificationService.markAsRead(id);
                        setNotifications(prev => 
                          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
                        );
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Centro de notificações - {unreadNotifications} não lidas</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => {
                      setSelectedAppointment(null);
                      setIsAppointmentModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Compromisso
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Agendar novo compromisso</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Filtros e Controles */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="scheduled">Agendado</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                onClick={() => setViewMode("calendar")}
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendário
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                size="sm"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Visualização em Calendário */}
        {viewMode === "calendar" && (
          <div className="mb-8">
            <CalendarView
              appointments={filteredAppointments}
              processes={processes}
              onDateClick={setSelectedDate}
              onAppointmentClick={handleEditAppointment}
            />
          </div>
        )}

        {/* Visualização em Lista */}
        {viewMode === "list" && (
          <Tabs defaultValue="today" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Hoje ({todayAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Próximos ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Passados ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              <AppointmentList
                appointments={todayAppointments}
                processes={processes}
                title="Compromissos de Hoje"
                emptyMessage="Nenhum compromisso agendado para hoje."
                onEdit={handleEditAppointment}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAppointment}
              />
            </TabsContent>

            <TabsContent value="upcoming">
              <AppointmentList
                appointments={upcomingAppointments}
                processes={processes}
                title="Próximos Compromissos"
                emptyMessage="Nenhum compromisso futuro agendado."
                onEdit={handleEditAppointment}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAppointment}
              />
            </TabsContent>

            <TabsContent value="past">
              <AppointmentList
                appointments={pastAppointments}
                processes={processes}
                title="Compromissos Passados"
                emptyMessage="Nenhum compromisso passado encontrado."
                onEdit={handleEditAppointment}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAppointment}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Modal de Compromisso */}
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
          appointment={selectedAppointment}
          processes={processes}
          selectedDate={selectedDate}
        />
      </div>
    </TooltipProvider>
  );
}

// Componente de Lista de Compromissos
function AppointmentList({ appointments, processes, title, emptyMessage, onEdit, onStatusChange, onDelete }) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <Badge variant="secondary">{appointments.length} compromissos</Badge>
      </div>
      
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          processes={processes}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

AppointmentList.propTypes = {
  appointments: PropTypes.array.isRequired,
  processes: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

// Componente de Cartão de Compromisso
function AppointmentCard({ appointment, processes, onEdit, onStatusChange, onDelete }) {
  const process = processes.find(p => p.id === appointment.process_id);
  
  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Agendado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
              <Badge className={getPriorityColor(appointment.priority)}>
                {appointment.priority === 'high' ? 'Alta' : appointment.priority === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(appointment.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                <span className="text-gray-400">•</span>
                <span>{appointment.duration_hours}h de duração</span>
              </div>
              
              {appointment.client_company && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Cliente:</span>
                  <span>{appointment.client_company}</span>
                </div>
              )}
              
              {process && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Processo:</span>
                  <span>{process.name}</span>
                </div>
              )}
              
              {appointment.location && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Local:</span>
                  <span>{appointment.location}</span>
                </div>
              )}
              
              {appointment.description && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  {appointment.description}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(appointment)}
              className="text-blue-600 hover:text-blue-700"
            >
              Editar
            </Button>
            
            <select
              value={appointment.status}
              onChange={(e) => onStatusChange(appointment.id, e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="scheduled">Agendado</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir este compromisso?')) {
                  onDelete(appointment.id);
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

AppointmentCard.propTypes = {
  appointment: PropTypes.object.isRequired,
  processes: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
