import { InvokeLLM } from "@/api/integrations";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Gavel, DollarSign, Target } from "lucide-react";

export default function MarketResearch() {
  const [fazAnalysis, setFazAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const researchFazSedep = async () => {
    setLoading(true);
    try {
      const research = await InvokeLLM({
        prompt: `Pesquise detalhadamente o sistema FAZ do SEDEP, focando especificamente no módulo financeiro.

        OBJETIVOS DA PESQUISA:
        1. Entender como funciona o sistema financeiro do FAZ SEDEP
        2. Analisar funcionalidades específicas para escritórios de advocacia
        3. Identificar fluxos de cobrança e faturamento jurídico
        4. Compreender a gestão de honorários advocatícios
        5. Analisar controle de custas processuais
        6. Verificar integração com tribunais e órgãos
        7. Estudar relatórios financeiros jurídicos
        8. Entender sistema de provisões e contingências

        FOQUE EM:
        - Módulos financeiros específicos
        - Fluxo de cobrança de honorários
        - Gestão de custas processuais
        - Controle de despesas por cliente/processo
        - Faturamento automático por etapas processuais
        - Relatórios de rentabilidade por caso
        - Integração com bancos e meios de pagamento
        - Controle de provisões para contingências

        Quero entender especificamente como adaptar essas funcionalidades para nosso sistema de consultoria ambiental, fazendo a devida adaptação do contexto jurídico para o contexto de consultoria técnica.`,

        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            system_overview: {
              type: "object",
              properties: {
                description: { type: "string" },
                target_audience: { type: "string" },
                main_modules: { type: "array", items: { type: "string" } },
                market_position: { type: "string" }
              }
            },
            financial_features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feature_name: { type: "string" },
                  description: { type: "string" },
                  business_value: { type: "string" },
                  adaptation_for_consultancy: { type: "string" },
                  implementation_complexity: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            },
            billing_workflows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  workflow_name: { type: "string" },
                  description: { type: "string" },
                  steps: { type: "array", items: { type: "string" } },
                  triggers: { type: "array", items: { type: "string" } },
                  consultancy_equivalent: { type: "string" }
                }
              }
            },
            integration_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  integration_type: { type: "string" },
                  description: { type: "string" },
                  benefits: { type: "string" },
                  consultancy_adaptation: { type: "string" }
                }
              }
            },
            reporting_analytics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  report_type: { type: "string" },
                  description: { type: "string" },
                  kpis_tracked: { type: "array", items: { type: "string" } },
                  consultancy_version: { type: "string" }
                }
              }
            },
            implementation_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  expected_impact: { type: "string" },
                  technical_requirements: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setFazAnalysis(research);
    } catch (error) {
      console.error('Erro na pesquisa FAZ SEDEP:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Gavel className="w-6 h-6 text-blue-600" />
            Análise: Sistema FAZ SEDEP
          </h2>
          <p className="text-gray-600">Pesquisa do módulo financeiro para adaptar ao nosso sistema</p>
        </div>
        <Button onClick={researchFazSedep} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          {loading ? 'Pesquisando FAZ SEDEP...' : 'Iniciar Pesquisa'}
        </Button>
      </div>

      {fazAnalysis && (
        <div className="space-y-8">
          {/* Visão Geral do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Visão Geral do FAZ SEDEP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Descrição do Sistema</h4>
                  <p className="text-gray-700 mb-4">{fazAnalysis.system_overview?.description}</p>
                  
                  <h4 className="font-semibold mb-3">Público-Alvo</h4>
                  <p className="text-gray-700">{fazAnalysis.system_overview?.target_audience}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Principais Módulos</h4>
                  <div className="space-y-2">
                    {fazAnalysis.system_overview?.main_modules?.map((module, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">{module}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Posição no Mercado:</strong> {fazAnalysis.system_overview?.market_position}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Funcionalidades Financeiras Identificadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {fazAnalysis.financial_features?.map((feature, index) => (
                  <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{feature.feature_name}</h4>
                        <Badge className={getComplexityColor(feature.implementation_complexity)} >
                          Complexidade: {feature.implementation_complexity}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Descrição Original (Jurídico)</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{feature.description}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Valor de Negócio</h5>
                        <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">{feature.business_value}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">💡 Adaptação para Consultoria</h5>
                        <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded font-medium">
                          {feature.adaptation_for_consultancy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fluxos de Cobrança */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxos de Cobrança Identificados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {fazAnalysis.billing_workflows?.map((workflow, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{workflow.workflow_name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium">Etapas do Fluxo:</h5>
                        <ul className="text-xs space-y-1 ml-3">
                          {workflow.steps?.map((step, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded">
                        <h5 className="text-sm font-medium text-blue-800">Equivalente em Consultoria:</h5>
                        <p className="text-xs text-blue-700 mt-1">{workflow.consultancy_equivalent}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Relatórios e Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {fazAnalysis.reporting_analytics?.map((report, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{report.report_type}</h4>
                    <p className="text-xs text-gray-600 mb-3">{report.description}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium">KPIs Rastreados:</p>
                        {report.kpis_tracked?.slice(0, 3).map((kpi, idx) => (
                          <div key={idx} className="text-xs bg-gray-100 rounded px-2 py-1 mt-1">
                            {kpi}
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs font-medium text-green-800">Versão Consultoria:</p>
                        <p className="text-xs text-green-700">{report.consultancy_version}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações de Implementação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Recomendações de Implementação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fazAnalysis.implementation_recommendations?.map((rec, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{rec.recommendation}</h4>
                      <p className="text-sm text-gray-600 mb-3">{rec.expected_impact}</p>
                      
                      <div>
                        <p className="text-xs font-medium mb-1">Requisitos Técnicos:</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.technical_requirements?.slice(0, 3).map((req, idx) => (
                            <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {req}
                            </span>
                          ))}
                        </div>
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