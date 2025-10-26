import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Search, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Users,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";

export default function SedepAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSedep = async () => {
    setLoading(true);
    try {
      const research = await InvokeLLM({
        prompt: `Analise detalhadamente a plataforma SEDEP FAZ disponível em www.sedep.com.br/teste/?utm_source=openai

        Foque especificamente nos seguintes módulos:
        
        1. GESTÃO DE PROCESSOS JURÍDICOS/CONSULTORIA
        - Como funciona o fluxo de trabalho
        - Automações disponíveis
        - Campos e dados rastreados
        - Organização por etapas
        - Notificações e alertas
        - Integração entre módulos
        
        2. AGENDA INTELIGENTE
        - Funcionalidades de agendamento
        - Lembretes automáticos
        - Integração com processos
        - Visualização de compromissos
        - Gestão de prazos
        - Sincronização com equipe
        
        3. CONTROLE FINANCEIRO
        - Gestão de receitas e despesas
        - Faturamento por etapas
        - Controle de honorários
        - Fluxo de caixa
        - Relatórios financeiros
        - Integração bancária
        
        4. CRM (GESTÃO DE CLIENTES)
        - Cadastro de clientes
        - Histórico de interações
        - Pipeline de vendas
        - Gestão de contratos
        - Comunicação com clientes
        - Análise de relacionamento
        
        Para cada módulo, identifique:
        - Funcionalidades principais
        - Diferenciais competitivos
        - Como adaptar para consultoria ambiental/agronegócio
        - Prioridade de implementação (alta/média/baixa)
        - Complexidade técnica (baixa/média/alta)
        - Impacto no negócio (baixo/médio/alto)`,
        
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            platform_overview: {
              type: "object",
              properties: {
                description: { type: "string" },
                target_market: { type: "string" },
                key_differentiators: { type: "array", items: { type: "string" } },
                technology_stack: { type: "array", items: { type: "string" } }
              }
            },
            process_management: {
              type: "object",
              properties: {
                features: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      how_it_works: { type: "string" },
                      adaptation_for_consultancy: { type: "string" },
                      priority: { type: "string", enum: ["alta", "media", "baixa"] },
                      complexity: { type: "string", enum: ["baixa", "media", "alta"] },
                      business_impact: { type: "string", enum: ["baixo", "medio", "alto"] }
                    }
                  }
                },
                workflow_automation: { type: "array", items: { type: "string" } },
                integration_points: { type: "array", items: { type: "string" } }
              }
            },
            intelligent_agenda: {
              type: "object",
              properties: {
                features: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      automation_level: { type: "string" },
                      adaptation_for_consultancy: { type: "string" },
                      priority: { type: "string", enum: ["alta", "media", "baixa"] },
                      complexity: { type: "string", enum: ["baixa", "media", "alta"] },
                      business_impact: { type: "string", enum: ["baixo", "medio", "alto"] }
                    }
                  }
                },
                notification_types: { type: "array", items: { type: "string" } },
                integration_with_processes: { type: "string" }
              }
            },
            financial_control: {
              type: "object",
              properties: {
                features: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      billing_model: { type: "string" },
                      adaptation_for_consultancy: { type: "string" },
                      priority: { type: "string", enum: ["alta", "media", "baixa"] },
                      complexity: { type: "string", enum: ["baixa", "media", "alta"] },
                      business_impact: { type: "string", enum: ["baixo", "medio", "alto"] }
                    }
                  }
                },
                reports_available: { type: "array", items: { type: "string" } },
                payment_integrations: { type: "array", items: { type: "string" } }
              }
            },
            crm_module: {
              type: "object",
              properties: {
                features: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      client_journey: { type: "string" },
                      adaptation_for_consultancy: { type: "string" },
                      priority: { type: "string", enum: ["alta", "media", "baixa"] },
                      complexity: { type: "string", enum: ["baixa", "media", "alta"] },
                      business_impact: { type: "string", enum: ["baixo", "medio", "alto"] }
                    }
                  }
                },
                communication_channels: { type: "array", items: { type: "string" } },
                analytics_kpis: { type: "array", items: { type: "string" } }
              }
            },
            implementation_roadmap: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  duration_weeks: { type: "number" },
                  features_included: { type: "array", items: { type: "string" } },
                  dependencies: { type: "array", items: { type: "string" } },
                  expected_outcomes: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setAnalysis(research);
    } catch (error) {
      console.error('Erro na análise SEDEP:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'alta': return 'bg-purple-100 text-purple-800';
      case 'media': return 'bg-blue-100 text-blue-800';
      case 'baixa': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'alto': return 'bg-emerald-100 text-emerald-800';
      case 'medio': return 'bg-amber-100 text-amber-800';
      case 'baixo': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Análise: Plataforma SEDEP FAZ
          </h2>
          <p className="text-gray-600">Pesquisa completa para implementação de funcionalidades CRM</p>
        </div>
        <Button onClick={analyzeSedep} disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          {loading ? 'Analisando SEDEP...' : 'Iniciar Análise Completa'}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-8">
          {/* Visão Geral da Plataforma */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Visão Geral: SEDEP FAZ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-700">{analysis.platform_overview?.description}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mercado-Alvo</h4>
                    <p className="text-gray-700">{analysis.platform_overview?.target_market}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Diferenciais Competitivos</h4>
                    <ul className="space-y-1">
                      {analysis.platform_overview?.key_differentiators?.map((diff, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          {diff}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs com os Módulos */}
          <Tabs defaultValue="processos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="processos" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Processos
              </TabsTrigger>
              <TabsTrigger value="agenda" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agenda
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="crm" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                CRM
              </TabsTrigger>
            </TabsList>

            {/* Gestão de Processos */}
            <TabsContent value="processos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funcionalidades de Gestão de Processos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {analysis.process_management?.features?.map((feature, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">{feature.name}</h4>
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={getPriorityColor(feature.priority)} variant="outline">
                                Prioridade: {feature.priority}
                              </Badge>
                              <Badge className={getComplexityColor(feature.complexity)}>
                                Complexidade: {feature.complexity}
                              </Badge>
                              <Badge className={getImpactColor(feature.business_impact)}>
                                Impacto: {feature.business_impact}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">📋 Descrição</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{feature.description}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">⚙️ Como Funciona</h5>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">{feature.how_it_works}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Adaptação para Consultoria Ambiental
                            </h5>
                            <p className="text-sm text-green-700 bg-green-50 p-3 rounded font-medium">
                              {feature.adaptation_for_consultancy}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.process_management?.workflow_automation?.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">Automações de Workflow</h4>
                      <ul className="space-y-2">
                        {analysis.process_management.workflow_automation.map((auto, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-blue-800">
                            <ArrowRight className="w-4 h-4" />
                            {auto}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agenda Inteligente */}
            <TabsContent value="agenda" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funcionalidades de Agenda Inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {analysis.intelligent_agenda?.features?.map((feature, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">{feature.name}</h4>
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={getPriorityColor(feature.priority)} variant="outline">
                                Prioridade: {feature.priority}
                              </Badge>
                              <Badge className={getComplexityColor(feature.complexity)}>
                                Complexidade: {feature.complexity}
                              </Badge>
                              <Badge className={getImpactColor(feature.business_impact)}>
                                Impacto: {feature.business_impact}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">📋 Descrição</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{feature.description}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">🤖 Nível de Automação</h5>
                            <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded">{feature.automation_level}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Adaptação para Consultoria
                            </h5>
                            <p className="text-sm text-green-700 bg-green-50 p-3 rounded font-medium">
                              {feature.adaptation_for_consultancy}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Controle Financeiro */}
            <TabsContent value="financeiro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funcionalidades de Controle Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {analysis.financial_control?.features?.map((feature, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">{feature.name}</h4>
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={getPriorityColor(feature.priority)} variant="outline">
                                Prioridade: {feature.priority}
                              </Badge>
                              <Badge className={getComplexityColor(feature.complexity)}>
                                Complexidade: {feature.complexity}
                              </Badge>
                              <Badge className={getImpactColor(feature.business_impact)}>
                                Impacto: {feature.business_impact}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">📋 Descrição</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{feature.description}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">💰 Modelo de Cobrança</h5>
                            <p className="text-sm text-gray-600 bg-emerald-50 p-3 rounded">{feature.billing_model}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Adaptação para Consultoria
                            </h5>
                            <p className="text-sm text-green-700 bg-green-50 p-3 rounded font-medium">
                              {feature.adaptation_for_consultancy}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.financial_control?.reports_available?.length > 0 && (
                    <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-semibold text-emerald-900 mb-3">Relatórios Disponíveis</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {analysis.financial_control.reports_available.map((report, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-emerald-800 bg-white p-2 rounded">
                            <CheckCircle2 className="w-4 h-4" />
                            {report}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CRM */}
            <TabsContent value="crm" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funcionalidades de CRM</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {analysis.crm_module?.features?.map((feature, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">{feature.name}</h4>
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={getPriorityColor(feature.priority)} variant="outline">
                                Prioridade: {feature.priority}
                              </Badge>
                              <Badge className={getComplexityColor(feature.complexity)}>
                                Complexidade: {feature.complexity}
                              </Badge>
                              <Badge className={getImpactColor(feature.business_impact)}>
                                Impacto: {feature.business_impact}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">📋 Descrição</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{feature.description}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">🎯 Jornada do Cliente</h5>
                            <p className="text-sm text-gray-600 bg-indigo-50 p-3 rounded">{feature.client_journey}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Adaptação para Consultoria
                            </h5>
                            <p className="text-sm text-green-700 bg-green-50 p-3 rounded font-medium">
                              {feature.adaptation_for_consultancy}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.crm_module?.analytics_kpis?.length > 0 && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-3">KPIs de Analytics</h4>
                      <div className="grid md:grid-cols-3 gap-2">
                        {analysis.crm_module.analytics_kpis.map((kpi, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-indigo-800 bg-white p-2 rounded">
                            <TrendingUp className="w-4 h-4" />
                            {kpi}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Roadmap de Implementação */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Roadmap de Implementação Sugerido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.implementation_roadmap?.map((phase, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg text-purple-900">{phase.phase}</h4>
                      <Badge className="bg-purple-100 text-purple-800">
                        {phase.duration_weeks} semanas
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Features Incluídas:</h5>
                        <ul className="space-y-1">
                          {phase.features_included?.map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-purple-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Resultados Esperados:</h5>
                        <ul className="space-y-1">
                          {phase.expected_outcomes?.map((outcome, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}