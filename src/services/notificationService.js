import { supabase } from '@/lib/supabaseClient'

class NotificationService {
  async getAllNotifications(options = {}) {
    try {
      const { sort, limit } = options
      let query = supabase.from('notifications').select('*')
      const sortField = sort ? Object.keys(sort)[0] : 'created_at'
      const sortDir = sort ? sort[sortField] : 'desc'
      query = query.order(sortField, { ascending: String(sortDir).toLowerCase() === 'asc' })
      if (limit) query = query.limit(limit)
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      throw error
    }
  }

  async getNotificationById(id) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Erro ao buscar notificação ${id}:`, error)
      throw error
    }
  }

  async createNotification(data) {
    try {
      const { data: inserted, error } = await supabase
        .from('notifications')
        .insert(data)
        .select('*')
        .maybeSingle()
      if (error) throw error
      return inserted
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      throw error
    }
  }

  async updateNotification(id, data) {
    try {
      const { data: updated, error } = await supabase
        .from('notifications')
        .update({ ...data })
        .eq('id', id)
        .select('*')
        .maybeSingle()
      if (error) throw error
      return updated
    } catch (error) {
      console.error(`Erro ao atualizar notificação ${id}:`, error)
      throw error
    }
  }

  async deleteNotification(id) {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id)
      if (error) throw error
      return true
    } catch (error) {
      console.error(`Erro ao deletar notificação ${id}:`, error)
      throw error
    }
  }

  async getUnreadNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`Erro ao buscar notificações não lidas para usuário ${userId}:`, error)
      throw error
    }
  }

  async markAsRead(id) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select('*')
        .maybeSingle()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error)
      throw error
    }
  }

  async markAllAsRead(userId) {
    try {
      const unreadNotifications = await this.getUnreadNotifications(userId)
      const updatePromises = unreadNotifications.map(notification => 
        this.markAsRead(notification.id)
      )
      await Promise.all(updatePromises)
      return true
    } catch (error) {
      console.error(`Erro ao marcar todas as notificações como lidas para usuário ${userId}:`, error)
      throw error
    }
  }

  async createAppointmentNotification(appointment, userId) {
    try {
      const notification = await this.createNotification({
        user_id: userId,
        type: 'appointment',
        title: `Novo compromisso: ${appointment.title}`,
        message: `Compromisso agendado para ${appointment.scheduled_date}`,
        read: false,
        data: {
          appointment_id: appointment.id,
          process_id: appointment.process_id,
          client_company: appointment.client_company
        }
      })
      return notification
    } catch (error) {
      console.error('Erro ao criar notificação de compromisso:', error)
      throw error
    }
  }

  async createProcessNotification(process, userId, action) {
    try {
      let title, message
      
      switch (action) {
        case 'created':
          title = `Novo processo criado: ${process.name}`
          message = `Processo "${process.name}" foi criado com sucesso`
          break
        case 'updated':
          title = `Processo atualizado: ${process.name}`
          message = `Processo "${process.name}" foi atualizado`
          break
        case 'deleted':
          title = `Processo removido: ${process.name}`
          message = `Processo "${process.name}" foi removido`
          break
        default:
          title = `Processo: ${process.name}`
          message = `Ação ${action} realizada no processo "${process.name}"`
      }

      const notification = await this.createNotification({
        user_id: userId,
        type: 'process',
        title,
        message,
        read: false,
        data: {
          process_id: process.id,
          action
        }
      })
      return notification
    } catch (error) {
      console.error(`Erro ao criar notificação de processo (${action}):`, error)
      throw error
    }
  }

  async createInstanceNotification(instance, userId, action) {
    try {
      let title, message
      
      switch (action) {
        case 'created':
          title = `Nova instância criada`
          message = `Instância do processo foi criada com ID ${instance.id}`
          break
        case 'status_changed':
          title = `Status da instância alterado`
          message = `Instância ${instance.id} agora está: ${instance.status}`
          break
        case 'completed':
          title = `Instância concluída`
          message = `Instância ${instance.id} foi concluída com sucesso`
          break
        default:
          title = `Instância atualizada`
          message = `Ação ${action} realizada na instância ${instance.id}`
      }

      const notification = await this.createNotification({
        user_id: userId,
        type: 'instance',
        title,
        message,
        read: false,
        data: {
          instance_id: instance.id,
          process_id: instance.process_id,
          action
        }
      })
      return notification
    } catch (error) {
      console.error(`Erro ao criar notificação de instância (${action}):`, error)
      throw error
    }
  }

  async deleteOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      const { data: oldNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .lt('created_at', cutoffDate.toISOString())
      if (error) throw error

      const deletePromises = oldNotifications.map(notification => 
        this.deleteNotification(notification.id)
      )
      
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      console.error('Erro ao deletar notificações antigas:', error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()
