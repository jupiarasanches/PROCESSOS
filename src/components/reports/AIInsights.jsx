import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIInsights({ instances, processes, technicians }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  void processes; void technicians;

useEffect(() => {
  if (instances.length > 0) {
    generateInsights();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [instances]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Preparar dados resumidos para a IA
      const summaryData = {
        total_instances: instances.length,
        by_status: instances.reduce((acc, inst) => {
          acc[inst.status] = (acc[inst.status] || 0) + 1;
          return acc;
        }, {}),
        by_priority: instances.reduce((acc, inst) => {
          acc[inst.priority] = (acc[inst.priority] || 0) + 1;
          return acc;
        }, {}),
        overdue: instances.filter(i => i.due_date && new Date(i.due_date) < new Date() && i.status !== 'finalizado').length,
        avg_completion_time: calculateAvgCompletionTime(),
        technician_workload: calculateTechnicianWorkload(),
        recent_trend: getRecentTrend()
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise os seguintes dados de processos empresariais e forneça insights valiosos:

${JSON.stringify(summaryData, null, 2)}

Por favor, identifique:
1. ANOMALIAS: Quaisquer padrões incomuns ou preocupantes nos dados
2. TENDÊNCIAS: Tendências importantes que você observa
3. RECOMENDAÇÕES: Sugestões práticas de ação para melhorar a eficiência

Forneça uma análise concisa e acionável em português.`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            },
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  direction: { type: "string", enum: ["up", "down", "stable"] }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgCompletionTime = () => {
    const completed = instances.filter(i => i.status === 'finalizado');
    if (completed.length === 0) return 0;
    
    const totalDays = completed.reduce((acc, inst) => {
      const created = new Date(inst.created_date);
      const updated = new Date(inst.updated_date);
      return acc + Math.floor((updated - created) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return (totalDays / completed.length).toFixed(1);
  };

  const calculateTechnicianWorkload = () => {
    const workload = {};
    instances.forEach(inst => {
      const tech = inst.technician_responsible;
      if (!workload[tech]) {
        workload[tech] = { total: 0, in_progress: 0, overdue: 0 };
      }
      workload[tech].total++;
      if (inst.status === 'em_andamento') workload[tech].in_progress++;
      if (inst.due_date && new Date(inst.due_date) < new Date() && inst.status !== 'finalizado') {
        workload[tech].overdue++;
      }
    });
    return workload;
  };

  const getRecentTrend = () => {
    const last7Days = instances.filter(inst => {
      const created = new Date(inst.created_date);
      const now = new Date();
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    
    const prev7Days = instances.filter(inst => {
      const created = new Date(inst.created_date);
      const now = new Date();
      const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      return diffDays > 7 && diffDays <= 14;
    });

    return {
      current_week: last7Days.length,
      previous_week: prev7Days.length,
      change: ((last7Days.length - prev7Days.length) / (prev7Days.length || 1) * 100).toFixed(1)
    };
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-purple-100 text-purple-800'
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-600">Analisando dados com IA...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Anomalias */}
      {insights.anomalies && insights.anomalies.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Anomalias Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.anomalies.map((anomaly, index) => (
                <div key={index} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{anomaly.title}</h4>
                    <Badge className={severityColors[anomaly.severity]}>
                      {anomaly.severity === 'high' ? 'Alta' : anomaly.severity === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{anomaly.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tendências */}
      {insights.trends && insights.trends.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Tendências Identificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.trends.map((trend, index) => (
                <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{trend.title}</h4>
                    <Badge variant="outline">
                      {trend.direction === 'up' ? '↑ Crescendo' : trend.direction === 'down' ? '↓ Decrescendo' : '→ Estável'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{trend.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              Recomendações da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <Badge className={priorityColors[rec.priority]}>
                      Prioridade {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={generateInsights} variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Regenerar Insights
        </Button>
      </div>
    </div>
  );
}

AIInsights.propTypes = {
  instances: PropTypes.array.isRequired,
  processes: PropTypes.array.isRequired,
  technicians: PropTypes.array.isRequired,
}
