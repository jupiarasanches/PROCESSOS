import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services";
import { FileService } from "@/services/fileService";
import { LogOut, Info, Loader2, Edit2, MessageCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TwilioSetupModal from "./TwilioSetupModal";
import WhatsAppOptInModal from "./WhatsAppOptInModal";

export default function SettingsModal({ isOpen, onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTwilioModalOpen, setIsTwilioModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      loadUser();
    }
  }, [isOpen, loadUser]);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    try {
      const [result] = await FileService.uploadFiles([file]);
      if (!result?.success) throw new Error(result?.errors?.[0] || 'Falha no upload');
      const file_url = result.document.file_url || result.document.url;
      await AuthService.updateMyUserData({ profile_picture_url: file_url });
      setCurrentUser(prev => ({ ...prev, profile_picture_url: file_url }));
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      toast.error("Erro ao fazer upload da imagem.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao fazer logout.");
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações da Conta</DialogTitle>
            <DialogDescription>
              Gerencie suas preferências e informações de perfil.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 py-4">
              {/* Foto de Perfil */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={currentUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name)}&background=random`} 
                    alt="Foto de perfil"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <label htmlFor="profile-picture-upload" className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full cursor-pointer border shadow-sm hover:bg-gray-100">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-lg">{currentUser.full_name}</p>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>
              </div>

              {/* Senha */}
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800">Alteração de Senha</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Sua senha é gerenciada pelo seu provedor de login (ex: Google). Para alterá-la, utilize as opções de recuperação de conta do provedor.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 py-4">
              {/* WhatsApp Pessoal */}
              <div 
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" 
                onClick={() => setIsWhatsAppModalOpen(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">WhatsApp Pessoal</h3>
                      <p className="text-sm text-gray-600">Configure seu número para receber notificações</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsWhatsAppModalOpen(true);
                    }}
                  >
                    Configurar
                  </Button>
                </div>
              </div>

              {/* Twilio Admin (só para admins) */}
              {currentUser.role === 'admin' && (
                <div 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" 
                  onClick={() => setIsTwilioModalOpen(true)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Settings className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Twilio (Admin)</h3>
                        <p className="text-sm text-gray-600">Configure a integração WhatsApp para o sistema</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTwilioModalOpen(true);
                      }}
                    >
                      Gerenciar
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p><strong>Notificações WhatsApp</strong></p>
                    <p className="mt-1">Configure seu WhatsApp para receber notificações sobre processos, agendamentos e lembretes importantes do sistema.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modais de Integração */}
      <TwilioSetupModal
        isOpen={isTwilioModalOpen}
        onClose={() => setIsTwilioModalOpen(false)}
      />

      <WhatsAppOptInModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </>
  );
}

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
