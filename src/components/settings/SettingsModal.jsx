import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { LogOut, Info, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsModal({ isOpen, onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
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
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_picture_url: file_url });
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
      await User.logout();
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao fazer logout.");
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações da Conta</DialogTitle>
          <DialogDescription>
            Gerencie suas preferências e informações de perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}