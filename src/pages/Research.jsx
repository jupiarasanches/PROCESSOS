import React from "react";
import AdvancedSystemFeatures from "../components/research/AdvancedSystemFeatures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Lightbulb, Target } from "lucide-react";

export default function ResearchPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          Pesquisa e Inovação
        </h1>
        <p className="text-gray-500 mt-1">Análise de mercado e funcionalidades avançadas para evolução do sistema.</p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6" />
              Funcionalidades Avançadas para Implementação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AdvancedSystemFeatures />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Análise das funcionalidades mais impactantes</li>
                <li>• Priorização baseada em ROI</li>
                <li>• Roadmap de implementação</li>
                <li>• Validação com stakeholders</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Critérios de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• <strong>ROI:</strong> Retorno sobre investimento</li>
                <li>• <strong>Complexidade:</strong> Esforço técnico</li>
                <li>• <strong>Impacto:</strong> Benefício para usuários</li>
                <li>• <strong>Viabilidade:</strong> Recursos disponíveis</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Áreas de Foco</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Automação inteligente com IA</li>
                <li>• Analytics e Business Intelligence</li>
                <li>• Integrações estratégicas</li>
                <li>• Mobile e colaboração</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}