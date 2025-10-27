

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
  Database,
  Calendar,
  ChevronDown,
  FolderOpen,
  Plus
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SettingsModal from "./components/settings/SettingsModal";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessesOpen, setIsProcessesOpen] = useState(
    currentPageName === "Processes" || currentPageName === "Instances"
  );

  const navigation = [
    {
      name: "Dashboard",
      href: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
      current: currentPageName === "Dashboard",
      tooltip: "Visão geral dos dados e métricas"
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
      name: "Admin Dados",
      href: createPageUrl("DataAdmin"),
      icon: Database,
      current: currentPageName === "DataAdmin",
      tooltip: "Administrar dados do sistema"
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
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) {
      async function refreshUser() {
        try {
          const user = await User.me();
          setCurrentUser(user);
        } catch (e) {
          console.error("Erro ao recarregar usuário:", e);
        }
      }
      refreshUser();
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    setIsProcessesOpen(currentPageName === "Processes" || currentPageName === "Instances");
  }, [currentPageName]);

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
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

            <SidebarContent className="px-3 py-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                  Menu Principal
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigation.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={item.current}
                              className={`transition-all duration-200 ${
                                item.current 
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <Link to={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                                <item.icon className={`w-5 h-5 ${item.current ? 'text-blue-600' : 'text-gray-500'}`} />
                                <span className="text-sm">{item.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    ))}

                    {/* Item de Processos com submenu expansível */}
                    <Collapsible
                      open={isProcessesOpen}
                      onOpenChange={setIsProcessesOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                className={`transition-all duration-200 ${
                                  (currentPageName === "Processes" || currentPageName === "Instances")
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <FileText className={`w-5 h-5 ${
                                  (currentPageName === "Processes" || currentPageName === "Instances")
                                    ? 'text-blue-600' 
                                    : 'text-gray-500'
                                }`} />
                                <span className="text-sm">Processos</span>
                                <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                  isProcessesOpen ? 'rotate-180' : ''
                                }`} />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Gerenciar processos e instâncias</p>
                          </TooltipContent>
                        </Tooltip>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={currentPageName === "Processes"}
                                  >
                                    <Link to={createPageUrl("Processes")} className="flex items-center gap-2">
                                      <Plus className="w-4 h-4" />
                                      <span>Catálogo de Processos</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>Ver catálogo e criar novos processos</p>
                                </TooltipContent>
                              </Tooltip>
                            </SidebarMenuSubItem>

                            <SidebarMenuSubItem>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={currentPageName === "Instances"}
                                  >
                                    <Link to={createPageUrl("Instances")} className="flex items-center gap-2">
                                      <FolderOpen className="w-4 h-4" />
                                      <span>Processos Criados</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>Ver todas as instâncias de processos</p>
                                </TooltipContent>
                              </Tooltip>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-100 p-4">
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="w-full p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name || 'Usuário')}&background=random`}
                          alt="User"
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{currentUser.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2 bg-white border-gray-200" side="top" align="start">
                    <DropdownMenuLabel className="text-gray-900">Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      onClick={handleOpenSettings} 
                      className="text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-red-600 focus:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
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
                      <p>Notificações e alertas</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </SidebarProvider>
    </TooltipProvider>
  );
}

