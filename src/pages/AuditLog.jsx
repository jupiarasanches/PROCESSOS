import React, { useState, useEffect } from "react";
import { AuditLog } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AuditLogViewer from "../components/audit/AuditLogViewer";
import { Search, Filter, Download, Shield, Loader2 } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    entityType: 'all',
    action: 'all',
    searchTerm: '',
    userEmail: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await AuditLog.list('-created_date', 500);
      setLogs(allLogs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.entityType !== 'all') {
      filtered = filtered.filter(log => log.entity_type === filters.entityType);
    }

    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.description?.toLowerCase().includes(search) ||
        log.user_name?.toLowerCase().includes(search) ||
        log.entity_id?.toLowerCase().includes(search)
      );
    }

    if (filters.userEmail) {
      filtered = filtered.filter(log => 
        log.user_email?.toLowerCase().includes(filters.userEmail.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Usuário', 'Email', 'Entidade', 'Ação', 'Descrição'];
    const rows = filteredLogs.map(log => [
      new Date(log.created_date).toLocaleString('pt-BR'),
      log.user_name,
      log.user_email,
      log.entity_type,
      log.action,
      log.description
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = {
    total: logs.length,
    today: logs.filter(log => {
      const logDate = new Date(log.created_date);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    byAction: logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {}),
    uniqueUsers: new Set(logs.map(log => log.user_email)).size
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Log de Auditoria
            </h1>
            <p className="text-gray-500 mt-1">
              Rastreamento completo de todas as alterações no sistema
            </p>
          </div>
          <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Total de Registros</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Hoje</div>
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Usuários Ativos</div>
              <div className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">Atualizações</div>
              <div className="text-2xl font-bold text-orange-600">{stats.byAction.updated || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Buscar</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Descrição, usuário, ID..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Tipo de Entidade</Label>
                <Select 
                  value={filters.entityType} 
                  onValueChange={(value) => handleFilterChange('entityType', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Process">Processo</SelectItem>
                    <SelectItem value="ProcessInstance">Instância de Processo</SelectItem>
                    <SelectItem value="User">Usuário</SelectItem>
                    <SelectItem value="Appointment">Compromisso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Ação</Label>
                <Select 
                  value={filters.action} 
                  onValueChange={(value) => handleFilterChange('action', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="created">Criado</SelectItem>
                    <SelectItem value="updated">Atualizado</SelectItem>
                    <SelectItem value="deleted">Excluído</SelectItem>
                    <SelectItem value="status_changed">Status Alterado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Email do Usuário</Label>
                <Input
                  placeholder="usuario@email.com"
                  value={filters.userEmail}
                  onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {filteredLogs.length} de {logs.length} registros
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  entityType: 'all',
                  action: 'all',
                  searchTerm: '',
                  userEmail: ''
                })}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Logs */}
      <AuditLogViewer logs={filteredLogs} />
    </div>
  );
}