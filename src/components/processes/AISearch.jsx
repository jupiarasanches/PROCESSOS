import { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Loader2, FileText } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AISearch({ processes, instances, onResultSelect }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleAISearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Preparar contexto dos processos e instâncias
      const processesContext = processes.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        steps: p.steps?.map(s => s.name).join(', ') || ''
      }));

      const instancesContext = instances.map(i => ({
        id: i.id,
        title: i.title,
        client_company: i.client_company,
        municipality: i.municipality,
        description: i.description || '',
        status: i.status,
        process_name: processes.find(p => p.id === i.process_id)?.name || ''
      }));

      const prompt = `
        Você é um assistente de busca inteligente para um sistema de gestão de processos ambientais e do agronegócio.
        
        Contexto dos processos disponíveis:
        ${JSON.stringify(processesContext, null, 2)}
        
        Contexto das instâncias de processos criadas:
        ${JSON.stringify(instancesContext, null, 2)}
        
        Consulta do usuário: "${query}"
        
        Analise a consulta e retorne os resultados mais relevantes, considerando:
        - Palavras-chave relacionadas
        - Sinônimos e termos técnicos
        - Contexto ambiental e do agronegócio
        - Descrições e conteúdos dos processos
        
        Retorne um máximo de 8 resultados ordenados por relevância.
        Para cada resultado, inclua uma explicação de por que ele é relevante.
      `;

      const aiResponse = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["process", "instance"] },
                  id: { type: "string" },
                  relevance_score: { type: "number" },
                  explanation: { type: "string" },
                  matched_keywords: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            total_found: { type: "number" },
            search_interpretation: { type: "string" }
          }
        }
      });

      if (aiResponse.results) {
        // Enriquecer os resultados com dados completos
        const enrichedResults = aiResponse.results.map(result => {
          if (result.type === 'process') {
            const process = processes.find(p => p.id === result.id);
            return { ...result, data: process };
          } else {
            const instance = instances.find(i => i.id === result.id);
            const processName = processes.find(p => p.id === instance?.process_id)?.name;
            return { ...result, data: { ...instance, process_name: processName } };
          }
        }).filter(r => r.data);

        setResults(enrichedResults);
        setShowResults(true);
        
        if (enrichedResults.length === 0) {
          toast.info("Nenhum resultado encontrado", {
            description: "Tente usar termos diferentes ou mais específicos."
          });
        }
      }
      
    } catch (error) {
      console.error('Erro na busca com IA:', error);
      toast.error("Erro na busca inteligente", {
        description: "Tente novamente ou use a busca tradicional."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAISearch();
    }
  };

  const clearResults = () => {
    setResults([]);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Busque por conteúdo, palavras-chave ou contexto... Ex: 'licença para desmatamento', 'cadastro rural', etc." 
            className="pl-10 h-11 text-base bg-white shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button 
          onClick={handleAISearch}
          disabled={isSearching || !query.trim()}
          className="h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="ml-2">{isSearching ? 'Buscando...' : 'Buscar com IA'}</span>
        </Button>
        {showResults && (
          <Button variant="outline" onClick={clearResults} className="h-11">
            Limpar
          </Button>
        )}
      </div>

      {showResults && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              Resultados da Busca Inteligente ({results.length})
            </h3>
          </div>
          
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <Card 
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onResultSelect?.(result)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-slate-900">
                        {result.type === 'process' ? result.data.name : result.data.title}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {result.type === 'process' ? 'Processo' : 'Instância'}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {Math.round(result.relevance_score * 100)}% relevante
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">
                    {result.explanation}
                  </p>
                  
                  {result.matched_keywords && result.matched_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {result.matched_keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

AISearch.propTypes = {
  processes: PropTypes.array.isRequired,
  instances: PropTypes.array.isRequired,
  onResultSelect: PropTypes.func,
}
