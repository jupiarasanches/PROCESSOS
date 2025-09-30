
import React, { useState, useEffect, useCallback } from "react";
import { Appointment, Process, ProcessInstance, Notification } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Calendar, CalendarDays, Clock, Plus, Bell, Filter, CheckCircle, AlertCircle, Trash2 } from "lucide-react"; // Added Trash2
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User } from "@/api/entities";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AppointmentModal from "../components/agenda/AppointmentModal";
import NotificationCenter from "../components/agenda/NotificationCenter";
import CalendarView from "../components/agenda/CalendarView";

export default function AgendaPage() {
  const [appointments, setAppointments] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false); // Renamed from isAppointmentModal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [filterStatus, setFilterStatus] = useState("all");

  const checkNotifications = useCallback(async () => {
    try {
      const user = currentUser; // Use currentUser state
      if (!user) return; // Ensure user is loaded

      const now = new Date();
      
      // Buscar compromissos que precisam de notificação e pertencem ao usuário logado
      const upcomingAppointments = appointments.filter(apt => {
        if (!apt.notification_email_enabled || apt.notification_sent) return false;
        
        const scheduledTime = new Date(apt.scheduled_date);
        const notificationTime = new Date(scheduledTime.getTime() - (apt.notification_minutes_before * 60000));
        
        // Ensure notification is only for the current user's assigned appointments
        return now >= notificationTime && now < scheduledTime && apt.assigned_to === user.email;
      });

      // Criar notificações para compromissos
      for (const appointment of upcomingAppointments) {
        const scheduledTime = format(new Date(appointment.scheduled_date), "HH:mm 'do dia' dd/MM/yyyy", { locale: ptBR });
        
        // Criar notificação no sistema (será específica para o usuário no sistema de notificação)
        const notification = {
          title: "Compromisso Agendado",
          message: `${appointment.title} está agendado para ${scheduledTime}`,
          type: "compromisso",
          user_email: user.email, // Specific to the user
          related_id: appointment.id,
          scheduled_for: new Date().toISOString(),
          priority: appointment.priority,
          action_url: "/agenda"
        };

        await Notification.create(notification);
        
        // Enviar e-mail de notificação se habilitado
        if (appointment.notification_email_enabled) {
          try {
            // Usar e-mail personalizado se fornecido, senão usar e-mail de login
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

            await SendEmail({
              to: targetEmail,
              subject: `🔔 Lembrete: ${appointment.title} em ${appointment.notification_minutes_before} minutos`,
              body: emailBody,
              from_name: "ProcessFlow - Sistema de Agendamento"
            });

            console.log(`E-mail de notificação enviado para: ${targetEmail}`);
            
          } catch (emailError) {
            console.error("Erro ao enviar e-mail de notificação:", emailError);
            // Não quebra o fluxo se o e-mail falhar
          }
        }
        
        // Marcar como notificado
        await Appointment.update(appointment.id, { notification_sent: true });
      }

      // Recarregar notificações (o outline pede para carregar todas as notificações, mas o NotificationCenter é pessoal)
      // Para manter a coerência com o carregamento global de notificações, recarregaremos todas aqui também.
      // Se a intenção for que o NotificationCenter seja apenas para o usuário atual, esta linha precisaria ser 'Notification.filter({ user_email: user.email }, '-created_date');'
      const updatedNotifications = await Notification.list('-created_date'); // TODAS as notificações - SEM FILTRO para ser consistente com loadData
      setNotifications(updatedNotifications || []);
      
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  }, [appointments, processes, currentUser]); // Added currentUser to dependencies

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // CARREGAR DADOS GLOBAIS - TODOS OS COMPROMISSOS, PROCESSOS E NOTIFICAÇÕES
      const [appointmentData, processData, notificationData] = await Promise.all([
        Appointment.list('-scheduled_date'),  // TODOS os compromissos - SEM FILTRO
        Process.list('-created_date'),        // TODOS os processos - SEM FILTRO
        Notification.list('-created_date')    // TODAS as notificações - SEM FILTRO
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
    // Only run checkNotifications if appointments are available and user is loaded
    if (appointments.length > 0 && currentUser) {
      checkNotifications();
      
      // Verificar notificações a cada minuto
      const interval = setInterval(checkNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [appointments, checkNotifications, currentUser]); // Added currentUser to dependencies

  const handleCreateAppointment = async (appointmentData) => {
    try {
      const user = await User.me();
      const newAppointment = await Appointment.create({
        ...appointmentData,
        assigned_to: user.email // New appointments are assigned to the current user
      });

      setAppointments(prev => [newAppointment, ...prev]);
      toast.success("Compromisso agendado com sucesso!", {
        description: appointmentData.notification_email_enabled 
          ? `Você receberá um e-mail ${appointmentData.notification_minutes_before} minutos antes do compromisso.`
          : ""
      });
      
      setIsAppointmentModalOpen(false); // Changed from setIsAppointmentModal
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erro ao criar compromisso:', error);
      toast.error("Erro ao agendar compromisso");
      throw error;
    }
  };

  const handleUpdateAppointment = async (appointmentData) => {
    try {
      await Appointment.update(selectedAppointment.id, appointmentData);
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id ? { ...apt, ...appointmentData } : apt
        )
      );
      
      toast.success("Compromisso atualizado com sucesso!");
      setIsAppointmentModalOpen(false); // Changed from setIsAppointmentModal
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erro ao atualizar compromisso:', error);
      toast.error("Erro ao atualizar compromisso");
      throw error;
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await Appointment.delete(appointmentId);
      
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      
      toast.success("Compromisso excluído com sucesso!");
    } catch (error) {
      console.error('Erro ao excluir compromisso:', error);
      toast.error("Erro ao excluir compromisso");
    }
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true); // Changed from setIsAppointmentModal
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await Appointment.update(appointmentId, { status: newStatus });
      
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

  // Filtrar compromissos
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

  // If notifications state is global, this will count all unread system notifications
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Agenda de Compromissos
            </h1>
            <p className="text-gray-500 mt-1">Gerencie seus agendamentos e receba notificações por e-mail.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NotificationCenter 
                    notifications={notifications} // These are now global notifications
                    unreadCount={unreadNotifications} // Counts all unread system notifications
                    onNotificationRead={(id) => {
                      // Mark as read globally
                      Notification.update(id, { is_read: true });
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
                    setIsAppointmentModalOpen(true); // Changed from setIsAppointmentModal
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Compromisso
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Agendar novo compromisso com notificações automáticas</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Hoje</p>
                      <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
                    </div>
                    <CalendarDays className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compromissos agendados para hoje</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Próximos</p>
                      <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compromissos agendados para os próximos dias</p>
              </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {filteredAppointments.filter(a => a.status === 'agendado').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compromissos pendentes de execução</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Notificações</p>
                      <p className="text-2xl font-bold text-gray-900">{unreadNotifications}</p>
                    </div>
                    <Bell className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notificações não lidas no sistema</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content */}
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-fit grid-cols-3 bg-white border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="calendar">Calendário</TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visualização em calendário mensal</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lista completa de compromissos</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="today">Hoje</TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compromissos de hoje e próximos</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>

            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="agendado">Agendado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrar compromissos por status</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <TabsContent value="calendar">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <CalendarView
                    appointments={filteredAppointments}
                    processes={processes}
                    onAppointmentClick={handleEditAppointment}
                    onDateClick={(date) => {
                      setSelectedDate(date);
                      setSelectedAppointment(null);
                      setIsAppointmentModalOpen(true); // Changed from setIsAppointmentModal
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clique em uma data para criar novo compromisso</p>
              </TooltipContent>
            </Tooltip>
          </TabsContent>

          <TabsContent value="list">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Todos os Compromissos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.map(appointment => (
                    <Tooltip key={appointment.id}>
                      <TooltipTrigger asChild>
                        <div>
                          <AppointmentCard
                            appointment={appointment}
                            processes={processes}
                            onEdit={handleEditAppointment}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteAppointment}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clique para editar este compromisso</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum compromisso encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Compromissos de Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayAppointments.map(appointment => (
                      <Tooltip key={appointment.id}>
                        <TooltipTrigger asChild>
                          <div>
                            <AppointmentCard
                              appointment={appointment}
                              processes={processes}
                              onEdit={handleEditAppointment}
                              onStatusChange={handleStatusChange}
                              onDelete={handleDeleteAppointment}
                              compact
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Compromisso agendado para hoje - clique para editar</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {todayAppointments.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Nenhum compromisso para hoje
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Próximos Compromissos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 5).map(appointment => (
                      <Tooltip key={appointment.id}>
                        <TooltipTrigger asChild>
                          <div>
                            <AppointmentCard
                              appointment={appointment}
                              processes={processes}
                              onEdit={handleEditAppointment}
                              onStatusChange={handleStatusChange}
                              onDelete={handleDeleteAppointment}
                              compact
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Próximo compromisso - clique para editar</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {upcomingAppointments.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Nenhum compromisso próximo
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal para criar/editar compromissos */}
        <AppointmentModal
          appointment={selectedAppointment}
          processes={processes}
          isOpen={isAppointmentModalOpen} // Changed from isAppointmentModal
          onClose={() => {
            setIsAppointmentModalOpen(false); // Changed from setIsAppointmentModal
            setSelectedAppointment(null);
          }}
          onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
          selectedDate={selectedDate}
        />
      </div>
    </TooltipProvider>
  );
}

function AppointmentCard({ appointment, processes, onEdit, onStatusChange, onDelete, compact = false }) {
  const process = processes.find(p => p.id === appointment.process_id);
  
  const statusColors = {
    agendado: "bg-blue-100 text-blue-800",
    em_andamento: "bg-yellow-100 text-yellow-800", 
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
    atrasado: "bg-red-100 text-red-800"
  };

  const priorityColors = {
    baixa: "bg-gray-100 text-gray-700",
    media: "bg-blue-100 text-blue-700",
    alta: "bg-orange-100 text-orange-700",
    urgente: "bg-red-100 text-red-700"
  };

  const confirmDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o compromisso "${appointment.title}"? Esta ação não pode ser desfeita.`)) {
      onDelete(appointment.id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{appointment.title}</h4>
          <p className="text-sm text-gray-600">{process?.name || 'Processo personalizado'}</p>
          {appointment.client_company && (
            <p className="text-sm text-gray-500">Cliente: {appointment.client_company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Badge className={priorityColors[appointment.priority]}>
            {appointment.priority}
          </Badge>
          <Badge className={statusColors[appointment.status]}>
            {appointment.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(appointment.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {appointment.duration_hours}h
          </span>
          {appointment.notification_email_enabled && (
            <span className="flex items-center gap-1 text-blue-600">
              <Bell className="w-4 h-4" />
              E-mail ativo
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {appointment.status === 'agendado' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(appointment.id, 'em_andamento')}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Iniciar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marcar compromisso como em andamento</p>
              </TooltipContent>
            </Tooltip>
          )}
          {appointment.status === 'em_andamento' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(appointment.id, 'concluido')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Concluir
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marcar compromisso como concluído</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(appointment)}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Editar
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar detalhes do compromisso</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={confirmDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir este compromisso permanentemente</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
