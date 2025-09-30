
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  BarChart3,
  Zap,
  Calendar,
  DollarSign,
  Activity
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate } from "../utils/formatters";
import { InvokeLLM } from "@/api/integrations";

export default function CashFlowPredictor({ transactions = [], instances = [], accounts = [] }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [horizon, setHorizon] = useState(90);

  const generatePrediction = useCallback(async () => {
    setLoading(true);
    try {
      // Preparar dados históricos
      const historicalData = transactions
        .filter(t => t.status === 'pago')
        .sort((a, b) => new Date(a.paid_date || a.created_date) - new Date(b.paid_date || b.created_date))
        .slice(-90); // Últimos 90 dias

      const projectPipeline = instances
        .filter(i => !['finalizado', 'cancelado'].includes(i.status))
        .map(i => ({
          title: i.title,
          client: i.client_company,
          status: i.status,
          due_date: i.due_date,
          estimated_value: i.estimated_value || (i.area_hectares ? i.area_hectares * 1000 : 10000)
        }));

      const currentBalance = accounts
        .filter(acc => acc.is_active)
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);

      // Gerar previsão usando IA
      const aiPrediction = await InvokeLLM({
        prompt: `Analise os dados financeiros e gere uma previsão de fluxo de caixa para ${horizon} dias.

        DADOS HISTÓRICOS (últimos 90 dias):
        - Transações: ${JSON.stringify(historicalData.slice(-10))}
        - Saldo atual: ${currentBalance}
        
        PIPELINE DE PROJETOS:
        ${JSON.stringify(projectPipeline)}

        CONTEXTO:
        - Empresa de consultoria ambiental/agronegócio
        - Receitas variam por tipo de projeto (SIMCAR: R$ 8-15k, Licenciamento: R$ 15-30k)
        - Sazonalidade: maior demanda entre março-setembro
        - Gastos fixos mensais: ~R$ 25.000 (salários, infraestrutura)
        - Taxa de conversão do pipeline: ~70%

        Gere previsões dia a dia com base em:
        1. Tendências históricas
        2. Projetos em andamento
        3. Sazonalidade típica
        4. Gastos fixos projetados
        5. Análise de risco por concentração de clientes`,

        response_json_schema: {
          type: "object",
          properties: {
            daily_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  predicted_inflow: { type: "number" },
                  predicted_outflow: { type: "number" },
                  predicted_balance: { type: "number" },
                  confidence_level: { type: "number" },
                  key_factors: { type: "array", items: { type: "string" } }
                }
              }
            },
            risk_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  alert_type: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  description: { type: "string" },
                  projected_date: { type: "string" },
                  suggested_actions: { type: "array", items: { type: "string" } }
                }
              }
            },
            summary_insights: {
              type: "object",
              properties: {
                total_predicted_inflow: { type: "number" },
                total_predicted_outflow: { type: "number" },
                net_cash_flow: { type: "number" },
                lowest_balance_date: { type: "string" },
                lowest_balance_amount: { type: "number" },
                average_confidence: { type: "number" }
              }
            }
          }
        }
      });

      setPrediction(aiPrediction);
    } catch (error) {
      console.error('Erro na previsão:', error);
    } finally {
      setLoading(false);
    }
  }, [transactions, instances, accounts, horizon]); // Added all dependencies used inside generatePrediction

  useEffect(() => {
    generatePrediction();
  }, [generatePrediction]); // useEffect now depends on the memoized generatePrediction function

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low': return <Target className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      case 'high': return <TrendingDown className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Gerando previsão inteligente de cash flow...</p>
            <p className="text-sm text-gray-500">Analisando {transactions.length} transações e {instances.length} projetos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análise Preditiva de Cash Flow</h2>
          <p className="text-gray-500">Previsões baseadas em IA para os próximos {horizon} dias</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={horizon} 
            onChange={(e) => setHorizon(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
            <option value={180}>180 dias</option>
          </select>
          
          <Button onClick={generatePrediction} disabled={loading}>
            <Zap className="w-4 h-4 mr-2" />
            Atualizar Previsão
          </Button>
        </div>
      </div>

      {prediction && (
        <>
          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Entradas Previstas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(prediction.summary_insights?.total_predicted_inflow || 0)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Saídas Previstas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(prediction.summary_insights?.total_predicted_outflow || 0)}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${
                      (prediction.summary_insights?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(prediction.summary_insights?.net_cash_flow || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Confiança Média</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {((prediction.summary_insights?.average_confidence || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList>
              <TabsTrigger value="chart">Gráfico de Previsão</TabsTrigger>
              <TabsTrigger value="alerts">Alertas de Risco</TabsTrigger>
              <TabsTrigger value="details">Detalhes Diários</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-6">
              {/* Gráfico Principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Projeção de Fluxo de Caixa ({horizon} dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prediction.daily_predictions?.slice(0, horizon)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} 
                        />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value)]}
                          labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                        />
                        <Legend />
                        
                        <Area 
                          type="monotone" 
                          dataKey="predicted_inflow" 
                          stackId="1"
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6}
                          name="Entradas Previstas" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="predicted_outflow" 
                          stackId="2"
                          stroke="#ef4444" 
                          fill="#ef4444" 
                          fillOpacity={0.6}
                          name="Saídas Previstas" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted_balance" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Saldo Projetado" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              {/* Alertas de Risco */}
              <div className="grid gap-4">
                {prediction.risk_alerts?.map((alert, index) => (
                  <Card key={index} className={`border-l-4 ${
                    alert.severity === 'critical' ? 'border-red-500' :
                    alert.severity === 'high' ? 'border-orange-500' :
                    alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{alert.alert_type}</h3>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{alert.description}</p>
                            
                            {alert.projected_date && (
                              <p className="text-sm text-gray-500 mb-3">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Data projetada: {formatDate(alert.projected_date)}
                              </p>
                            )}

                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Ações Sugeridas:</p>
                              <ul className="space-y-1">
                                {alert.suggested_actions?.map((action, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {!prediction.risk_alerts?.length && (
                  <Card className="border-2 border-dashed border-green-300 bg-green-50">
                    <CardContent className="p-8 text-center">
                      <Target className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Nenhum risco identificado</h3>
                      <p className="text-green-600">Sua projeção de cash flow está saudável para o período analisado.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Detalhes Diários */}
              <Card>
                <CardHeader>
                  <CardTitle>Previsão Detalhada por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {prediction.daily_predictions?.slice(0, 30).map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium">{formatDate(day.date)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="text-green-600">↗ {formatCurrency(day.predicted_inflow)}</span>
                            <span className="text-red-600">↘ {formatCurrency(day.predicted_outflow)}</span>
                            <Badge variant="outline" className="text-xs">
                              {(day.confidence_level * 100).toFixed(0)}% confiança
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            day.predicted_balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(day.predicted_balance)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
