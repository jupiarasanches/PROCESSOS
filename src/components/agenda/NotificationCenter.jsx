import React, { useState } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificationCenter({ notifications, unreadCount, onNotificationRead }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (notificationId) => {
    onNotificationRead(notificationId);
  };

  const priorityColors = {
    baixa: "border-l-gray-400",
    media: "border-l-blue-400",
    alta: "border-l-orange-400",
    urgente: "border-l-red-400"
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center justify-between">
            Notificações
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} não lidas</Badge>
            )}
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 border-l-4 ${priorityColors[notification.priority] || 'border-l-gray-400'} ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </h4>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 h-6 w-6"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{notification.type}</span>
                    <span>
                      {format(new Date(notification.created_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  {notification.priority === 'urgente' && (
                    <Badge className="mt-2 bg-red-100 text-red-800">
                      Urgente
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full text-sm text-blue-600 hover:text-blue-700"
              onClick={() => {
                // Marcar todas como lidas
                notifications.filter(n => !n.is_read).forEach(n => {
                  onNotificationRead(n.id);
                });
              }}
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}