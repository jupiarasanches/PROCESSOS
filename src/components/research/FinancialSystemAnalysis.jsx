import { InvokeLLM } from "@/api/integrations";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, TrendingUp } from "lucide-react";

export default function FinancialSystemAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const researchFinancialSystems = async () => {
    setLoading(true);
    try {
      const research = await InvokeLLM({
        prompt: `Pesquise e analise os melhores sistemas financeiros integrados para empresas de consultoria e serviços profissionais. 
        
        Foque em:
        1. ERP Financeiros como SAP, Oracle NetSuite, Microsoft Dynamics
        2. Sistemas para consultorias como Deltek, Unanet, Mavenlink
        3. Plataformas brasileiras como TOTVS, Sankhya, Senior
        4. Funcionalidades avançadas de Cash Flow Management
        5. Integração com gestão de projetos
        6. KPIs financeiros específicos para consultoria
        7. Automação de cobrança por etapas de projeto
        8. Análise de lucratividade por projeto/cliente
        
        Traga exemplos concretos de funcionalidades, interfaces e fluxos de trabalho.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            systems_analyzed: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  key_features: { type: "array", items: { type: "string" } },
                  target_audience: { type: "string" },
                  pricing_model: { type: "string" }
                }
              }
            },
            best_practices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  practice: { type: "string" },
                  description: { type: "string" },
                  implementation_tips: { type: "array", items: { type: "string" } }
                }
              }
            },
            features_to_implement: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feature: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  technical_requirements: { type: "array", items: { type: "string" } }
                }
              }
            },
            kpis_and_metrics: {
              type: "array", 
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  description: { type: "string" },
                  calculation_method: { type: "string" },
                  importance: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(research);
    } catch (error) {
      console.error('Erro na pesquisa:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análise de Sistemas Financeiros</h2>
          <p className="text-gray-600">Pesquisa de mercado para melhorar nosso sistema</p>
        </div>
        <Button onClick={researchFinancialSystems} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          {loading ? 'Pesquisando...' : 'Iniciar Pesquisa'}
        </Button>
      </div>

      {analysis && (
        <div className="grid gap-6">
          {/* Sistemas Analisados */}
          <Card>
            <CardHeader>
              <CardTitle>Sistemas Financeiros Analisados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.systems_analyzed?.map((system, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg">{system.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{system.category}</p>
                    <p className="text-sm mb-2">{system.target_audience}</p>
                    <div className="space-y-1">
                      {system.key_features?.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="text-xs bg-gray-100 rounded px-2 py-1">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades Prioritárias */}
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades para Implementar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.features_to_implement?.map((feature, index) => (
                  <div key={index} className={`border-l-4 pl-4 ${
                    feature.priority === 'high' ? 'border-red-500' :
                    feature.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{feature.feature}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        feature.priority === 'high' ? 'bg-red-100 text-red-800' :
                        feature.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {feature.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* KPIs e Métricas */}
          <Card>
            <CardHeader>
              <CardTitle>KPIs Financeiros Essenciais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.kpis_and_metrics?.map((kpi, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <h4 className="font-medium">{kpi.metric}</h4>
                    <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Cálculo:</strong> {kpi.calculation_method}
                    </p>
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