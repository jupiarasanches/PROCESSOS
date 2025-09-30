import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Leaf, 
  FileCheck, 
  MapPin, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  Zap,
  Target,
  CheckCircle2,
  Clock
} from "lucide-react";
import { formatCurrency, formatDate } from "../utils/formatters";
import { AutomatedBilling, ProcessInstance } from "@/api/entities";
import { toast } from "sonner";

export default function EnvironmentalBillingSystem({ instances = [], onRefresh }) {
  const [billingPlans, setBillingPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newPlan, setNewPlan] = useState({
    process_instance_id: '',
    total_amount: '',
    billing_plan: 'milestone_based',
    service_type: 'licenciamento_ambiental',
    billing_stages: [
      { stage_name: 'Contratação e Diagnóstico (35%)', percentage: 35, trigger_condition: 'contract_signed', due_days: 7, description: 'Assinatura do contrato e início dos estudos' },
      { stage_name: 'Elaboração de Estudos (40%)', percentage: 40, trigger_condition: 'studies_development', due_days: 30, description: 'Desenvolvimento dos estudos ambientais' },
      { stage_name: 'Protocolo e Acompanhamento (25%)', percentage: 25, trigger_condition: 'submission_complete', due_days: 15, description: 'Protocolo no órgão e acompanhamento' }
    ],
    auto_invoice_enabled: true,
    notification_settings: {
      email_notifications: true,
      whatsapp_notifications: false,
      days_before_due: 5,
      overdue_reminder_frequency: 3
    }
  });

  // Templates de cobrança específicos para consultoria ambiental
  const billingTemplates = {
    licenciamento_ambiental: {
      name: 'Licenciamento Ambiental',
      stages: [
        { stage_name: 'Contratação e Vistoria Inicial (30%)', percentage: 30, trigger_condition: 'contract_signed', due_days: 7 },
        { stage_name: 'Elaboração de Estudos (45%)', percentage: 45, trigger_condition: 'studies_development', due_days: 30 },
        { stage_name: 'Protocolo e Licença Emitida (25%)', percentage: 25, trigger_condition: 'license_issued', due_days: 60 }
      ]
    },
    simcar: {
      name: 'Sistema SIMCAR',
      stages: [
        { stage_name: 'Contratação e Coleta de Dados (40%)', percentage: 40, trigger_condition: 'contract_signed', due_days: 5 },
        { stage_name: 'Elaboração do CAR (35%)', percentage: 35, trigger_condition: 'car_development', due_days: 15 },
        { stage_name: 'Protocolo e Aprovação (25%)', percentage: 25, trigger_condition: 'car_approved', due_days: 30 }
      ]
    },
    auditoria_ambiental: {
      name: 'Auditoria Ambiental',
      stages: [
        { stage_name: 'Contratação e Planejamento (30%)', percentage: 30, trigger_condition: 'contract_signed', due_days: 7 },
        { stage_name: 'Execução da Auditoria (40%)', percentage: 40, trigger_condition: 'audit_execution', due_days: 20 },
        { stage_name: 'Relatório Final (30%)', percentage: 30, trigger_condition: 'final_report', due_days: 10 }
      ]
    },
    estudo_impacto: {
      name: 'Estudo de Impacto Ambiental (EIA/RIMA)',
      stages: [
        { stage_name: 'Contratação e Diagnóstico (25%)', percentage: 25, trigger_condition: 'contract_signed', due_days: 7 },
        { stage_name: 'Estudos de Campo (35%)', percentage: 35, trigger_condition: 'field_studies', due_days: 45 },
        { stage_name: 'Elaboração EIA/RIMA (25%)', percentage: 25, trigger_condition: 'eia_development', due_days: 30 },
        { stage_name: 'Aprovação e Licença (15%)', percentage: 15, trigger_condition: 'license_approved', due_days: 90 }
      ]
    },
    monitoramento: {
      name: 'Monitoramento Ambiental',
      stages: [
        { stage_name: 'Contratação e Setup (50%)', percentage: 50, trigger_condition: 'contract_signed', due_days: 7 },
        { stage_name: 'Relatórios Periódicos (50%)', percentage: 50, trigger_condition: 'monitoring_complete', due_days: 90 }
      ]
    }
  };

  useEffect(() => {
    loadBillingPlans();
  }, []);

  const loadBillingPlans = async () => {
    try {
      const plans = await AutomatedBilling.list('-created_date');
      setBillingPlans(plans || []);
    } catch (error) {
      console.error('Erro ao carregar planos de cobrança:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (serviceType) => {
    const template = billingTemplates[serviceType];
    if (template) {
      setNewPlan({
        ...newPlan,
        service_type: serviceType,
        billing_stages: template.stages.map(stage => ({
          ...stage,
          description: `Etapa: ${stage.stage_name}`
        }))
      });
    }
  };

  const handleCreatePlan = async () => {
    try {
      const selectedInstance = instances.find(i => i.id === newPlan.process_instance_id);
      if (!selectedInstance) {
        toast.error('Selecione uma instância de processo válida');
        return;
      }

      const totalAmount = parseFloat(newPlan.total_amount);
      const billingStages = newPlan.billing_stages.map(stage => ({
        ...stage,
        amount: (totalAmount * stage.percentage) / 100,
        status: 'pending'
      }));

      const planData = {
        ...newPlan,
        total_amount: totalAmount,
        billing_stages: billingStages,
        client_company: selectedInstance.client_company,
        is_active: true
      };

      await AutomatedBilling.create(planData);
      toast.success('Plano de cobrança ambiental criado com sucesso!');
      
      loadBillingPlans();
      setIsModalOpen(false);
      resetNewPlan();

    } catch (error) {
      console.error('Erro ao criar plano de cobrança:', error);
      toast.error('Erro ao criar plano de cobrança');
    }
  };

  const handleTriggerStage = async (planId, stageIndex) => {
    try {
      const plan = billingPlans.find(p => p.id === planId);
      const updatedStages = [...plan.billing_stages];
      
      updatedStages[stageIndex] = {
        ...updatedStages[stageIndex],
        status: 'triggered',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + updatedStages[stageIndex].due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoice_number: `AMB-${planId.slice(0, 8)}-${stageIndex + 1}`
      };

      await AutomatedBilling.update(planId, { billing_stages: updatedStages });
      
      toast.success(`Etapa "${updatedStages[stageIndex].stage_name}" disparada!`, {
        description: `Fatura ${updatedStages[stageIndex].invoice_number} gerada`
      });

      loadBillingPlans();
    } catch (error) {
      console.error('Erro ao disparar etapa:', error);
      toast.error('Erro ao disparar etapa de cobrança');
    }
  };

  const resetNewPlan = () => {
    setNewPlan({
      process_instance_id: '',
      total_amount: '',
      billing_plan: 'milestone_based',
      service_type: 'licenciamento_ambiental',
      billing_stages: billingTemplates.licenciamento_ambiental.stages,
      auto_invoice_enabled: true,
      notification_settings: {
        email_notifications: true,
        whatsapp_notifications: false,
        days_before_due: 5,
        overdue_reminder_frequency: 3
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'triggered': return 'bg-blue-100 text-blue-800';
      case 'invoiced': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'triggered': return <Zap className="w-4 h-4" />;
      case 'invoiced': return <Send className="w-4 h-4" />;
      case 'paid': return <CheckCircle2 className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'licenciamento_ambiental': return <FileCheck className="w-5 h-5 text-green-600" />;
      case 'simcar': return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'auditoria_ambiental': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'estudo_impacto': return <Leaf className="w-5 h-5 text-emerald-600" />;
      case 'monitoramento': return <Target className="w-5 h-5 text-purple-600" />;
      default: return <Leaf className="w-5 h-5 text-green-600" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando sistema de cobrança ambiental...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Leaf className="w-6 h-6 text-green-600" />
            Sistema de Cobrança Ambiental
          </h2>
          <p className="text-gray-500">Cobrança automatizada por etapas de projetos ambientais</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano Ambiental
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Plano de Cobrança - Consultoria Ambiental</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Tipo de Serviço Ambiental */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">Tipo de Serviço Ambiental</Label>
                  <Select 
                    value={newPlan.service_type} 
                    onValueChange={(value) => {
                      setNewPlan({...newPlan, service_type: value});
                      applyTemplate(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="licenciamento_ambiental">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4" />
                          Licenciamento Ambiental
                        </div>
                      </SelectItem>
                      <SelectItem value="simcar">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Sistema SIMCAR
                        </div>
                      </SelectItem>
                      <SelectItem value="auditoria_ambiental">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Auditoria Ambiental
                        </div>
                      </SelectItem>
                      <SelectItem value="estudo_impacto">
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4" />
                          EIA/RIMA
                        </div>
                      </SelectItem>
                      <SelectItem value="monitoramento">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Monitoramento Ambiental
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="process">Projeto Ambiental</Label>
                  <Select value={newPlan.process_instance_id} onValueChange={(value) => setNewPlan({...newPlan, process_instance_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {instances.filter(i => !['finalizado', 'cancelado'].includes(i.status)).map((instance) => (
                        <SelectItem key={instance.id} value={instance.id}>
                          {instance.title} - {instance.client_company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="total">Valor Total do Projeto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newPlan.total_amount}
                  onChange={(e) => setNewPlan({...newPlan, total_amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              {/* Etapas Específicas do Serviço Ambiental */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  {getServiceIcon(newPlan.service_type)}
                  Etapas do {billingTemplates[newPlan.service_type]?.name}
                </Label>
                <div className="space-y-4 mt-3">
                  {newPlan.billing_stages.map((stage, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <Label className="text-sm">Etapa do Projeto</Label>
                          <Input
                            value={stage.stage_name}
                            onChange={(e) => {
                              const updatedStages = [...newPlan.billing_stages];
                              updatedStages[index].stage_name = e.target.value;
                              setNewPlan({...newPlan, billing_stages: updatedStages});
                            }}
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Percentual (%)</Label>
                          <Input
                            type="number"
                            value={stage.percentage}
                            onChange={(e) => {
                              const updatedStages = [...newPlan.billing_stages];
                              updatedStages[index].percentage = parseFloat(e.target.value) || 0;
                              setNewPlan({...newPlan, billing_stages: updatedStages});
                            }}
                            className="text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Prazo (dias)</Label>
                          <Input
                            type="number"
                            value={stage.due_days}
                            onChange={(e) => {
                              const updatedStages = [...newPlan.billing_stages];
                              updatedStages[index].due_days = parseInt(e.target.value) || 30;
                              setNewPlan({...newPlan, billing_stages: updatedStages});
                            }}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {newPlan.total_amount && (
                        <div className="mt-3 p-2 bg-white rounded border-l-4 border-green-500">
                          <p className="text-sm font-medium text-green-800">
                            Valor desta etapa: {formatCurrency((parseFloat(newPlan.total_amount) * stage.percentage) / 100)}
                          </p>
                          <p className="text-xs text-green-600">{stage.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Configurações de Notificação */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <Label className="text-base font-semibold">Configurações de Notificação</Label>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center justify-between">
                    <Label>Notificações por E-mail</Label>
                    <Switch
                      checked={newPlan.notification_settings.email_notifications}
                      onCheckedChange={(checked) => setNewPlan({
                        ...newPlan,
                        notification_settings: {...newPlan.notification_settings, email_notifications: checked}
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Cobrança Automática</Label>
                    <Switch
                      checked={newPlan.auto_invoice_enabled}
                      onCheckedChange={(checked) => setNewPlan({...newPlan, auto_invoice_enabled: checked})}
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePlan} className="bg-green-600 hover:bg-green-700">
                  Criar Plano Ambiental
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Planos */}
      <div className="grid gap-6">
        {billingPlans.map((plan) => {
          const instance = instances.find(i => i.id === plan.process_instance_id);
          const totalPaid = plan.billing_stages?.filter(s => s.status === 'paid').reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
          const progress = plan.total_amount > 0 ? (totalPaid / plan.total_amount) * 100 : 0;

          return (
            <Card key={plan.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getServiceIcon(plan.service_type)}
                    <div>
                      <CardTitle className="text-lg">{instance?.title || 'Projeto não encontrado'}</CardTitle>
                      <p className="text-sm text-gray-600">{plan.client_company}</p>
                      <Badge variant="outline" className="mt-1">
                        {billingTemplates[plan.service_type]?.name || 'Consultoria Ambiental'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(plan.total_amount)}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(totalPaid)} recebido ({progress.toFixed(0)}%)
                    </p>
                  </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {plan.billing_stages?.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stage.status)}
                          <Badge className={getStatusColor(stage.status)}>
                            {stage.status === 'pending' ? 'Aguardando' :
                             stage.status === 'triggered' ? 'Faturado' :
                             stage.status === 'paid' ? 'Pago' :
                             stage.status === 'overdue' ? 'Atrasado' : 'Aguardando'}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="font-medium">{stage.stage_name}</p>
                          <p className="text-sm text-gray-500">
                            {stage.invoice_number && `Fatura: ${stage.invoice_number}`}
                            {stage.due_date && ` • Vence: ${formatDate(stage.due_date)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-green-700">{formatCurrency(stage.amount || (plan.total_amount * stage.percentage) / 100)}</p>
                          <p className="text-sm text-gray-500">{stage.percentage}%</p>
                        </div>

                        {stage.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTriggerStage(plan.id, index)}
                            className="text-green-600 hover:text-green-700 border-green-200"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Faturar
                          </Button>
                        )}

                        {stage.status === 'triggered' && (
                          <Button size="sm" variant="outline" className="text-orange-600">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Fatura
                          </Button>
                        )}

                        {stage.status === 'paid' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ações do Plano */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {plan.auto_invoice_enabled && (
                      <Badge variant="outline" className="text-xs bg-green-50">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto-Faturamento
                      </Badge>
                    )}
                    {plan.notification_settings?.email_notifications && (
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        <Send className="w-3 h-3 mr-1" />
                        E-mail Ativo
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-green-200">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {billingPlans.length === 0 && (
          <Card className="border-2 border-dashed border-green-300 bg-green-50">
            <CardContent className="p-12 text-center">
              <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 mb-2">Nenhum plano de cobrança ambiental encontrado</h3>
              <p className="text-green-700 mb-6">Crie seu primeiro plano de cobrança automatizada para projetos ambientais.</p>
              <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}