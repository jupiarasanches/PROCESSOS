// Mock client para substituir as funcionalidades do Base44 SDK
// Este arquivo fornece implementações locais das funcionalidades que estavam no Base44

// Mock de dados para simular as entidades
const mockData = {
  processes: [
    {
      id: 1,
      name: "Processo de Atendimento ao Cliente",
      description: "Fluxo completo de atendimento",
      status: "ativo",
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    },
    {
      id: 2,
      name: "Processo de Manutenção",
      description: "Manutenção preventiva e corretiva",
      status: "ativo", 
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    }
  ],
  processInstances: [],
  appointments: [],
  notifications: [],
  auditLogs: [],
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      is_technician: false,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    },
    {
      id: 2,
      name: "Técnico Silva",
      email: "tecnico@example.com",
      role: "technician",
      is_technician: true,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    }
  ],
  invitations: []
};

// Mock de autenticação
let currentUser = null;
const mockAuth = {
  login: async (email) => {
    console.log('Mock login:', email);
    // verifica se email existe na base (convidado ou ativo)
    const lower = String(email).toLowerCase();
    const id = emailIndex.get(lower);
    const user = id ? mockData.users.find(u => u.id === id) : undefined;
    if (!user) {
      throw new Error('Email não convidado. Solicite convite ao administrador.');
    }
    currentUser = user;
    return { user, token: 'mock-token' };
  },
  acceptInvite: async (token) => {
    return await mockIntegrations.Core.AcceptInvite({ token });
  },
  logout: async () => {
    console.log('Mock logout');
    currentUser = null;
    return { success: true };
  },
  getCurrentUser: () => {
    return currentUser || { id: 1, email: 'test@example.com', name: 'Usuário Teste', role: 'admin' };
  },
  // Método me() que é usado no código
  me: async () => {
    console.log('Mock auth.me()');
    return currentUser || { id: 1, email: 'test@example.com', name: 'Usuário Teste', role: 'admin' };
  }
};

// Função auxiliar para ordenar resultados
const sortByField = (data, orderBy) => {
  if (!orderBy) return data;
  const [field, direction] = orderBy.startsWith('-') 
    ? [orderBy.substring(1), 'desc'] 
    : [orderBy, 'asc'];
  
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal === bVal) return 0;
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

// Função auxiliar para filtrar resultados
const filterData = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) return data;
  
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Filtragem complexa (ex: { user_email: 'test@example.com' })
        return item[key] === value;
      }
      return item[key] === value;
    });
  });
};

// Utilitário para gerar token simples
const generateToken = () => {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

// Mock de entidades
const emailIndex = new Map();
mockData.users.forEach(u => { if (u.email) emailIndex.set(u.email.toLowerCase(), u.id); });

const mockEntities = {
  Process: {
    find: async (filters = {}) => {
      console.log('Mock Process.find:', filters);
      return filterData(mockData.processes, filters);
    },
    findOne: async (id) => {
      console.log('Mock Process.findOne:', id);
      return mockData.processes.find(p => p.id === id);
    },
    create: async (data) => {
      console.log('Mock Process.create:', data);
      const newProcess = { ...data, id: Date.now(), created_date: new Date().toISOString() };
      mockData.processes.push(newProcess);
      return newProcess;
    },
    update: async (id, data) => {
      console.log('Mock Process.update:', id, data);
      const index = mockData.processes.findIndex(p => p.id === id);
      if (index !== -1) {
        mockData.processes[index] = { ...mockData.processes[index], ...data, updated_date: new Date().toISOString() };
        return mockData.processes[index];
      }
      return null;
    },
    delete: async (id) => {
      console.log('Mock Process.delete:', id);
      mockData.processes = mockData.processes.filter(p => p.id !== id);
      return { success: true };
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock Process.list:', orderBy, limit);
      let result = sortByField(mockData.processes, orderBy);
      if (limit) result = result.slice(0, limit);
      return result;
    },
    // Método filter() que é usado no código
    filter: async (filters) => {
      console.log('Mock Process.filter:', filters);
      return filterData(mockData.processes, filters);
    }
  },
  
  ProcessInstance: {
    find: async (filters = {}) => {
      console.log('Mock ProcessInstance.find:', filters);
      return filterData(mockData.processInstances, filters);
    },
    findOne: async (id) => {
      console.log('Mock ProcessInstance.findOne:', id);
      return mockData.processInstances.find(pi => pi.id === id);
    },
    create: async (data) => {
      console.log('Mock ProcessInstance.create:', data);
      const newInstance = { ...data, id: Date.now(), created_date: new Date().toISOString() };
      mockData.processInstances.push(newInstance);
      return newInstance;
    },
    update: async (id, data) => {
      console.log('Mock ProcessInstance.update:', id, data);
      const index = mockData.processInstances.findIndex(pi => pi.id === id);
      if (index !== -1) {
        mockData.processInstances[index] = { ...mockData.processInstances[index], ...data, updated_date: new Date().toISOString() };
        return mockData.processInstances[index];
      }
      return null;
    },
    // Método delete() que é usado no código
    delete: async (id) => {
      console.log('Mock ProcessInstance.delete:', id);
      mockData.processInstances = mockData.processInstances.filter(pi => pi.id !== id);
      return { success: true };
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock ProcessInstance.list:', orderBy, limit);
      let result = sortByField(mockData.processInstances, orderBy);
      if (limit) result = result.slice(0, limit);
      return result;
    },
    // Método filter() que é usado no código
    filter: async (filters) => {
      console.log('Mock ProcessInstance.filter:', filters);
      return filterData(mockData.processInstances, filters);
    }
  },

  Appointment: {
    find: async (filters = {}) => {
      console.log('Mock Appointment.find:', filters);
      return filterData(mockData.appointments, filters);
    },
    create: async (data) => {
      console.log('Mock Appointment.create:', data);
      const newAppointment = { ...data, id: Date.now(), created_date: new Date().toISOString() };
      mockData.appointments.push(newAppointment);
      return newAppointment;
    },
    update: async (id, data) => {
      console.log('Mock Appointment.update:', id, data);
      const index = mockData.appointments.findIndex(a => a.id === id);
      if (index !== -1) {
        mockData.appointments[index] = { ...mockData.appointments[index], ...data, updated_date: new Date().toISOString() };
        return mockData.appointments[index];
      }
      return null;
    },
    delete: async (id) => {
      console.log('Mock Appointment.delete:', id);
      mockData.appointments = mockData.appointments.filter(a => a.id !== id);
      return { success: true };
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock Appointment.list:', orderBy, limit);
      let result = sortByField(mockData.appointments, orderBy);
      if (limit) result = result.slice(0, limit);
      return result;
    },
    // Método filter() que é usado no código
    filter: async (filters) => {
      console.log('Mock Appointment.filter:', filters);
      return filterData(mockData.appointments, filters);
    }
  },

  Notification: {
    find: async (filters = {}) => {
      console.log('Mock Notification.find:', filters);
      return filterData(mockData.notifications, filters);
    },
    create: async (data) => {
      console.log('Mock Notification.create:', data);
      const newNotification = { ...data, id: Date.now(), created_date: new Date().toISOString() };
      mockData.notifications.push(newNotification);
      return newNotification;
    },
    update: async (id, data) => {
      console.log('Mock Notification.update:', id, data);
      const index = mockData.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        mockData.notifications[index] = { ...mockData.notifications[index], ...data, updated_date: new Date().toISOString() };
        return mockData.notifications[index];
      }
      return null;
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock Notification.list:', orderBy, limit);
      let result = sortByField(mockData.notifications, orderBy);
      if (limit) result = result.slice(0, limit);
      return result;
    },
    // Método filter() que é usado no código
    filter: async (filters) => {
      console.log('Mock Notification.filter:', filters);
      return filterData(mockData.notifications, filters);
    }
  },

  AuditLog: {
    find: async (filters = {}) => {
      console.log('Mock AuditLog.find:', filters);
      return filterData(mockData.auditLogs, filters);
    },
    create: async (data) => {
      console.log('Mock AuditLog.create:', data);
      const newLog = { ...data, id: Date.now(), created_date: new Date().toISOString() };
      mockData.auditLogs.push(newLog);
      return newLog;
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock AuditLog.list:', orderBy, limit);
      let result = sortByField(mockData.auditLogs, orderBy);
      if (limit) result = result.slice(0, limit);
      return result;
    },
    // Método filter() que é usado no código
    filter: async (filters) => {
      console.log('Mock AuditLog.filter:', filters);
      return filterData(mockData.auditLogs, filters);
    }
  },

  TwilioConfig: {
    find: async (filters = {}) => {
      console.log('Mock TwilioConfig.find:', filters);
      return [];
    },
    create: async (data) => {
      console.log('Mock TwilioConfig.create:', data);
      return { ...data, id: Date.now(), created_date: new Date().toISOString() };
    },
    update: async (id, data) => {
      console.log('Mock TwilioConfig.update:', id, data);
      return { ...data, id, updated_date: new Date().toISOString() };
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock TwilioConfig.list:', orderBy, limit);
      return [];
    }
  },

  WhatsAppNumber: {
    find: async (filters = {}) => {
      console.log('Mock WhatsAppNumber.find:', filters);
      return filterData([], filters);
    },
    create: async (data) => {
      console.log('Mock WhatsAppNumber.create:', data);
      return { ...data, id: Date.now(), created_date: new Date().toISOString() };
    },
    update: async (id, data) => {
      console.log('Mock WhatsAppNumber.update:', id, data);
      return { ...data, id, updated_date: new Date().toISOString() };
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock WhatsAppNumber.list:', orderBy, limit);
      return [];
    }
  },

  // User como entidade separada (não confundir com auth)
  User: {
    find: async (filters = {}) => {
      console.log('Mock User.find:', filters);
      return filterData(mockData.users, filters);
    },
    findOne: async (id) => {
      console.log('Mock User.findOne:', id);
      return mockData.users.find(u => u.id === id);
    },
    create: async (data) => {
      console.log('Mock User.create:', data);
      const existing = mockData.users.find(u => u.email?.toLowerCase() === String(data.email).toLowerCase());
      if (existing) {
        Object.assign(existing, { ...data, updated_date: new Date().toISOString() });
        if (existing.email) emailIndex.set(existing.email.toLowerCase(), existing.id);
        return existing;
      }
      const newUser = { ...data, id: Date.now(), created_date: new Date().toISOString() };
      mockData.users.push(newUser);
      if (newUser.email) emailIndex.set(newUser.email.toLowerCase(), newUser.id);
      return newUser;
    },
    update: async (id, data) => {
      console.log('Mock User.update:', id, data);
      const index = mockData.users.findIndex(u => u.id === id);
      if (index !== -1) {
        mockData.users[index] = { ...mockData.users[index], ...data, updated_date: new Date().toISOString() };
        const u = mockData.users[index];
        if (u.email) emailIndex.set(u.email.toLowerCase(), u.id);
        return mockData.users[index];
      }
      return null;
    },
    delete: async (id) => {
      console.log('Mock User.delete:', id);
      const u = mockData.users.find(u => u.id === id);
      if (u?.email) emailIndex.delete(u.email.toLowerCase());
      mockData.users = mockData.users.filter(u => u.id !== id);
      return { success: true };
    },
    // Método list() que é usado no código
    list: async (orderBy, limit) => {
      console.log('Mock User.list:', orderBy, limit);
      let result = sortByField(mockData.users, orderBy);
      if (limit) result = result.slice(0, limit);
      return result;
    },
    // Método filter() que é usado no código
    filter: async (filters) => {
      console.log('Mock User.filter:', filters);
      return filterData(mockData.users, filters);
    },
    // Método me() que é usado no código (alias para auth.me)
    me: async () => {
      console.log('Mock User.me()');
      return { id: 1, email: 'test@example.com', name: 'Usuário Teste', role: 'admin' };
    },
    // Método updateMyUserData() que é usado no código
    updateMyUserData: async (data) => {
      console.log('Mock User.updateMyUserData:', data);
      return { success: true, user: { ...mockAuth.getCurrentUser(), ...data } };
    }
  }
};

// Entidade de Convites
mockEntities.Invitation = {
  create: async ({ user_id, email, expires_in = 3600 }) => {
    const token = generateToken();
    const now = Date.now();
    const invitation = {
      id: Date.now(),
      user_id,
      email,
      token,
      created_date: new Date(now).toISOString(),
      expires_at: new Date(now + expires_in * 1000).toISOString(),
      status: 'pending'
    };
    mockData.invitations.push(invitation);
    return invitation;
  },
  findByToken: async (token) => {
    return mockData.invitations.find(i => i.token === token);
  },
  accept: async (token) => {
    const inv = mockData.invitations.find(i => i.token === token);
    if (!inv) throw new Error('Convite inválido');
    if (new Date(inv.expires_at).getTime() < Date.now()) throw new Error('Convite expirado');
    const user = mockData.users.find(u => u.id === inv.user_id);
    if (!user) throw new Error('Usuário não encontrado');
    user.status = 'active';
    inv.status = 'accepted';
    return { success: true, user };
  }
};

// Mock de integrações
const mockIntegrations = {
  Core: {
    InvokeLLM: async ({ prompt }) => {
      console.log('Mock InvokeLLM:', prompt);
      
      // Mock de resposta da IA para insights
      if (prompt.includes('insights valiosos')) {
        return {
          anomalies: [
            {
              title: "Processos Atrasados",
              description: "Detectado aumento de 15% em processos com status 'atrasado' esta semana",
              severity: "medium"
            }
          ],
          trends: [
            {
              title: "Eficiência em Alta",
              description: "Tempo médio de conclusão reduziu 8% comparado ao mês anterior",
              direction: "up"
            }
          ],
          recommendations: [
            {
              title: "Revisar Alocação de Técnicos",
              description: "Considerar redistribuir carga de trabalho entre técnicos com menos demandas",
              priority: "high"
            }
          ]
        };
      }
      
      // Mock para sugestões de métricas
      if (prompt.includes('sugestões de métricas')) {
        return {
          metrics: [
            {
              name: "Taxa de Conclusão",
              description: "Percentual de processos concluídos no prazo",
              formula: "(processos_concluidos_no_prazo / total_processos) * 100",
              unit: "%"
            },
            {
              name: "Tempo Médio de Ciclo",
              description: "Tempo médio de duração dos processos",
              formula: "sum(duracao_processos) / count(processos)",
              unit: "dias"
            }
          ]
        };
      }
      
      // Mock para dashboard customizado
      if (prompt.includes('dashboard personalizado')) {
        return {
          charts: [
            {
              type: "bar",
              title: "Processos por Status",
              data: [
                { name: "Em Andamento", value: 25 },
                { name: "Concluído", value: 45 },
                { name: "Atrasado", value: 8 },
                { name: "Pendente", value: 12 }
              ]
            },
            {
              type: "line",
              title: "Tendência de Conclusão",
              data: [
                { name: "Semana 1", value: 12 },
                { name: "Semana 2", value: 18 },
                { name: "Semana 3", value: 15 },
                { name: "Semana 4", value: 22 }
              ]
            }
          ]
        };
      }
      
      return { message: "Resposta mock da IA" };
    },

    SendEmail: async ({ to, subject, body }) => {
      console.log('Mock SendEmail:', { to, subject, body });
      return { success: true, messageId: 'mock-email-id' };
    },
    AcceptInvite: async ({ token }) => {
      console.log('Mock AcceptInvite:', token);
      return await mockEntities.Invitation.accept(token);
    },

    UploadFile: async ({ file, folder }) => {
      console.log('Mock UploadFile:', { file, folder });
      // Retorna tanto url quanto file_url para compatibilidade
      const fileId = `mock-file-${Date.now()}`;
      const url = `https://example.com/${fileId}.pdf`;
      return { 
        success: true, 
        url: url,
        file_url: url, // Adicionado para compatibilidade
        fileId: fileId
      };
    },

    GenerateImage: async ({ prompt, size = "1024x1024" }) => {
      console.log('Mock GenerateImage:', { prompt, size });
      return {
        success: true,
        url: `https://via.placeholder.com/${size}/0066cc/white?text=Mock+Image`
      };
    },

    ExtractDataFromUploadedFile: async ({ fileUrl }) => {
      console.log('Mock ExtractDataFromUploadedFile:', fileUrl);
      return {
        success: true,
        data: {
          text: "Conteúdo mock extraído do arquivo",
          metadata: { pages: 5, size: "2MB" }
        }
      };
    },

    CreateFileSignedUrl: async ({ fileId, expiresIn = 3600 }) => {
      console.log('Mock CreateFileSignedUrl:', { fileId, expiresIn });
      return {
        success: true,
        signedUrl: `https://example.com/signed-url-${fileId}`,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      };
    },

    UploadPrivateFile: async ({ file, folder }) => {
      console.log('Mock UploadPrivateFile:', { file, folder });
      const fileId = `mock-private-file-${Date.now()}`;
      const url = `https://example.com/private/${fileId}.pdf`;
      return {
        success: true,
        url: url,
        file_url: url, // Adicionado para compatibilidade
        fileId: fileId
      };
    }
  }
};

// Cliente mock principal
export const mockClient = {
  entities: mockEntities,
  integrations: mockIntegrations,
  auth: mockAuth
};

// Exportar como padrão para substituir o Base44
export default mockClient;
