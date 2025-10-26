import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Briefcase, TrendingUp, Lightbulb } from "lucide-react";
import FinancialSystemAnalysis from "../components/research/FinancialSystemAnalysis";
import AdvancedSystemFeatures from "../components/research/AdvancedSystemFeatures";
import SedepAnalysis from "../components/research/SedepAnalysis";

export default function ResearchPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Search className="w-8 h-8 text-blue-600" />
          Centro de Pesquisa e Inovação
        </h1>
        <p className="text-gray-500 mt-1">
          Análise de mercado, benchmarking e implementação de funcionalidades avançadas
        </p>
      </div>

      <Tabs defaultValue="sedep" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border">
          <TabsTrigger value="sedep" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Análise SEDEP FAZ
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Sistemas Financeiros
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Features Avançadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sedep" className="mt-6">
          <SedepAnalysis />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <FinancialSystemAnalysis />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <AdvancedSystemFeatures />
        </TabsContent>
      </Tabs>
    </div>
  );
}