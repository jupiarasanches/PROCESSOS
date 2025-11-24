import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AICustomDashboard({ instances, processes, technicians, onDashboardGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateDashboard = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, descreva o dashboard que você deseja criar");
      return;
    }

    setGenerating(true);
    try {
      const dataContext = {
        total_instances: instances.length,
        total_processes: processes.length,
        total_technicians: technicians.length,
        categories: [...new Set(processes.map(p => p.category))],
        status_types: [...new Set(instances.map(i => i.status))],
        priority_types: [...new Set(instances.map(i => i.priority))],
        sample_instance: instances[0]
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em visualização de dados e business intelligence.

CONTEXTO DO SISTEMA:
${JSON.stringify(dataContext, null, 2)}

SOLICITAÇÃO DO USUÁRIO:
"${prompt}"

Com base na solicitação do usuário e nos dados disponíveis, crie uma configuração de dashboard personalizado.
Sugira até 6 widgets/gráficos relevantes que respondam à solicitação do usuário.

Para cada widget, especifique:
- Tipo de visualização mais adequado (bar, line, pie, metric, table)
- Dados a serem exibidos
- Filtros necessários
- Título descritivo`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            widgets: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string", enum: ["bar", "line", "pie", "metric", "table"] },
                  data_source: { type: "string" },
                  filters: { type: "array", items: { type: "string" } },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      onDashboardGenerated(response);
      toast.success("Dashboard personalizado gerado com sucesso!");
      setPrompt('');
    } catch (error) {
      console.error('Erro ao gerar dashboard:', error);
      toast.error("Erro ao gerar dashboard personalizado");
    } finally {
      setGenerating(false);
    }
  };

  const examplePrompts = [
    "Mostre o desempenho dos técnicos nos últimos 30 dias",
    "Quero ver processos atrasados por categoria",
    "Dashboard de eficiência operacional com tempo médio de conclusão",
    "Análise de carga de trabalho por técnico e prioridade"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          Criar Dashboard Personalizado com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
            Descreva o dashboard que você deseja criar
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Quero ver a produtividade dos técnicos, focando em tempo médio de conclusão e processos atrasados por categoria..."
            className="h-32 resize-none"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Exemplos de prompts:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(example)}
                className="text-xs"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={generateDashboard}
          disabled={generating || !prompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando Dashboard...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Gerar Dashboard Personalizado
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}