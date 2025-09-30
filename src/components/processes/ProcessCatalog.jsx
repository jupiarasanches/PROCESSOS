import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ProcessCard from "./ProcessCard";
import AISearch from "./AISearch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProcessCatalog({ 
  processes, 
  instances,
  onSelectProcess,
  onSearchResultSelect 
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProcesses = Array.isArray(processes) ? processes.filter(p =>
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Input
                placeholder="Buscar por nome, categoria ou descrição..."
                className="pl-10 h-11 text-base bg-white shadow-sm text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Digite para filtrar processos por nome, categoria ou descrição</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <AISearch
          processes={processes}
          instances={instances}
          onResultSelect={onSearchResultSelect}
        />
      </div>

      <AnimatePresence>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProcesses.map(process => (
            <motion.div key={process.id} variants={itemVariants}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ProcessCard
                      process={process}
                      onSelect={onSelectProcess}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para iniciar uma nova instância deste processo</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProcesses.length === 0 && processes.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Nenhum processo disponível</h3>
          <p className="text-gray-500 mt-2">
            Não há processos cadastrados no sistema ainda.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            Entre em contato com o administrador para cadastrar novos processos.
          </p>
        </div>
      )}

      {filteredProcesses.length === 0 && processes.length > 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-800">Nenhum processo encontrado</h3>
          <p className="text-gray-500 mt-2">Tente ajustar seus termos de busca.</p>
          <p className="text-gray-400 text-sm mt-2">
            Existem {processes.length} processos disponíveis no total.
          </p>
        </div>
      )}
    </div>
  );
}