

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  LayoutDashboard,
  Settings,
  FileText,
  Play,
  Users,
  Bell,
  Search,
  LogOut,
  DollarSign,
  Database,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SettingsModal from "./components/settings/SettingsModal";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Define navigation items inside the component to use currentPageName
  const navigation = [
    {
      name: "Dashboard",
      href: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
      current: currentPageName === "Dashboard",
      tooltip: "Visão geral dos dados e métricas"
    },
    {
      name: "Processos",
      href: createPageUrl("Processes"),
      icon: FileText,
      current: currentPageName === "Processes",
      tooltip: "Gerenciar processos e criar novas instâncias"
    },
    {
      name: "Agenda",
      href: createPageUrl("Agenda"),
      icon: Calendar,
      current: currentPageName === "Agenda",
      tooltip: "Agendar compromissos e visualizar calendário"
    },
    {
      name: "Técnicos",
      href: createPageUrl("Technicians"),
      icon: Users,
      current: currentPageName === "Technicians",
      tooltip: "Gerenciar equipe e técnicos responsáveis"
    },
    {
      name: "Instâncias",
      href: createPageUrl("Instances"),
      icon: Play,
      current: currentPageName === "Instances",
      tooltip: "Visualizar todas as instâncias de processos"
    },
    {
      name: "Financeiro",
      href: createPageUrl("Financial"),
      icon: DollarSign,
      current: currentPageName === "Financial",
      tooltip: "Controle financeiro completo da empresa"
    },
    {
      name: "Admin Dados",
      href: createPageUrl("DataAdmin"),
      icon: Database,
      current: currentPageName === "DataAdmin",
      tooltip: "Administrar dados do sistema"
    },
    {
      name: "Pesquisa",
      href: createPageUrl("Research"),
      icon: Search,
      current: currentPageName === "Research",
      tooltip: "Análise de mercado e funcionalidades avançadas"
    },
  ];

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
    }
    fetchUser();
  }, [isSettingsOpen]);

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50 text-gray-900">
          <Sidebar className="border-r border-gray-200 bg-white">
            <SidebarHeader className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>ProcessFlow - Sistema de Gestão</p>
                    </TooltipContent>
                  </Tooltip>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">ProcessFlow</h2>
                    <p className="text-xs text-gray-500">Sistema de Gestão de Processos</p>
                  </div>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Menu Principal
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {navigation.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg ${
                                item.current
                                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              <Link to={item.href} className="flex items-center gap-3 px-3 py-2.5">
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-8">
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Status Rápido
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">Processos Ativos</span>
                            <span className="font-bold text-green-800">12</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Processos atualmente em execução</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-amber-700">Pendentes</span>
                            <span className="font-bold text-amber-800">5</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Processos aguardando ação</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-lg border border-red-200 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-red-700">Atrasados</span>
                            <span className="font-bold text-red-800">2</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Processos que passaram do prazo</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-100 p-4">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start text-left h-auto p-2 hover:bg-gray-100">
                          <div className="flex items-center gap-3">
                            <img
                              src={currentUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name || 'Usuário')}&background=random`}
                              alt="User"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{currentUser.full_name}</p>
                              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                            </div>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Clique para ver opções da conta</p>
                      </TooltipContent>
                    </Tooltip>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2 bg-white border-gray-200" side="top" align="start">
                    <DropdownMenuLabel className="text-gray-900">Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              )}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-semibold text-gray-900">ProcessFlow</h1>
              </div>
            </header>

            <div className="hidden md:block bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {currentPageName || 'Dashboard'}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Gerencie seus processos empresariais de forma eficiente
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          placeholder="Buscar processos..."
                          className="pl-10 w-64 bg-gray-50 border-gray-200 text-gray-900"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Busque por processos, clientes ou técnicos</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-white border-gray-200 hover:bg-gray-50">
                        <Bell className="w-4 h-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notificações do sistema</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50">
              {children}
            </div>
          </main>
          {isSettingsOpen && (
            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

