import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIMetricsSuggestion({ instances, processes, onApplySuggestion }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const dataContext = {
        total_processes: processes.length,
        total_instances: instances.length,
        process_categories: [...new Set(processes.map(p => p.category))],
        status_distribution: instances.reduce((acc, i) => {
          acc[i.status] = (acc[i.status] || 0) + 1;
          return acc;
        }, {}),
        has_due_dates: instances.some(i => i.due_date),
        has_priorities: instances.some(i => i.priority),
        has_technicians: instances.some(i => i.technician_responsible)
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Com base nos seguintes dados de um sistema de gestão de processos empresariais, sugira métricas-chave (KPIs) relevantes e valiosas para monitoramento:

${JSON.stringify(dataContext, null, 2)}

Sugira 5-6 métricas que sejam:
1. Relevantes para o contexto
2. Acionáveis (que levem a decisões)
3. Mensuráveis com os dados disponíveis
4. Diferentes umas das outras

Para cada métrica, explique por que é importante e como calculá-la.`,
        response_json_schema: {
          type: "object",
          properties: {
            metrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  importance: { type: "string" },
                  calculation_method: { type: "string" },
                  category: { type: "string", enum: ["efficiency", "quality", "performance", "risk"] }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.metrics);
      toast.success("Métricas sugeridas com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast.error("Erro ao gerar sugestões de métricas");
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    efficiency: 'bg-blue-100 text-blue-800',
    quality: 'bg-green-100 text-green-800',
    performance: 'bg-purple-100 text-purple-800',
    risk: 'bg-red-100 text-red-800'
  };

  const categoryLabels = {
    efficiency: 'Eficiência',
    quality: 'Qualidade',
    performance: 'Desempenho',
    risk: 'Risco'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Sugestões de Métricas pela IA
          </CardTitle>
          <Button 
            onClick={generateSuggestions} 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Sugerir Métricas
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {suggestions && (
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                      <Badge className={categoryColors[metric.category]}>
                        {categoryLabels[metric.category]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{metric.description}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Por que é importante:</p>
                  <p className="text-sm text-blue-800">{metric.importance}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-900 mb-1">Como calcular:</p>
                  <p className="text-sm text-gray-700">{metric.calculation_method}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}