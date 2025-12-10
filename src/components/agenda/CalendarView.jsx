import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarView({ appointments, processes, onAppointmentClick, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  // const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Adicionar dias da semana anterior e próxima para completar o calendário
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.scheduled_date), date)
    );
  };

  // const priorityColors = {
  //   baixa: "bg-gray-100 text-gray-700",
  //   media: "bg-blue-100 text-blue-700",
  //   alta: "bg-orange-100 text-orange-700",
  //   urgente: "bg-red-100 text-red-700"
  // };

  const statusColors = {
    agendado: "bg-blue-100 text-blue-800",
    em_andamento: "bg-yellow-100 text-yellow-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800"
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        {/* Header do calendário */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isDayToday = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
                } ${isDayToday ? 'bg-blue-50 border-blue-300' : ''}`}
                onClick={() => onDateClick(date)}
              >
                <div className={`text-sm mb-1 ${isDayToday ? 'font-bold text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {format(date, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map(appointment => (
                    <div
                      key={appointment.id}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${statusColors[appointment.status]}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      <div className="font-medium truncate">
                        {format(new Date(appointment.scheduled_date), 'HH:mm')} - {appointment.title}
                      </div>
                      <div className="truncate opacity-75">
                        {processes.find(p => p.id === appointment.process_id)?.name || 'Processo'}
                      </div>
                    </div>
                  ))}
                  
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legendas */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Status:</span>
              <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
              <Badge className="bg-green-100 text-green-800">Concluído</Badge>
              <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

CalendarView.propTypes = {
  appointments: PropTypes.array.isRequired,
  processes: PropTypes.array.isRequired,
  onAppointmentClick: PropTypes.func.isRequired,
  onDateClick: PropTypes.func.isRequired,
}
