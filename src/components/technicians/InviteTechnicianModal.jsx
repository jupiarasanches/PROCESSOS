import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UsersService } from '@/services';
import { toast } from 'sonner';
import { validateEmail, validateRequired } from '@/utils/validators';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";

const SPECIALTIES = [
  "Licenciamento Ambiental",
  "CC-SEMA",
  "Plano de Exploração Florestal (PEF)",
  "Laudos Técnicos",
  "Perícia Ambiental",
  "Georreferenciamento de Imóveis Rurais",
  "Manejo Florestal",
  "SIMCAR",
  "DLA",
  "ACAI"
];

export default function InviteTechnicianModal({ isOpen, onClose, onInvited }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('Analista');
  const [role, setRole] = useState('technician');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail('');
    setFullName('');
    setProfession('Analista');
    setSelectedSpecialties([]);
  };

  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty);
      }
      return [...prev, specialty];
    });
  };

  const handleInvite = async () => {
    if (!validateEmail(email)) {
      toast.error('Informe um e-mail válido');
      return;
    }
    if (!validateRequired(fullName)) {
      toast.error('Informe o nome completo');
      return;
    }
    setLoading(true);
    try {
      const user = await UsersService.inviteTechnician({
        email,
        full_name: fullName,
        department: profession, 
        position: profession,   
        role,
        specialties: selectedSpecialties // Pass specialties to service
      });
      toast.success('Usuário cadastrado com sucesso');
      onInvited?.(user);
      reset();
      onClose();
    } catch (error) {
      toast.error('Falha ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar novo técnico</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            <p className="text-xs text-gray-500">Aceitamos domínios pessoais: @gmail, @hotmail, @outlook</p>
          </div>
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome e sobrenome" />
          </div>
        <div className="space-y-2">
          <Label>Profissão</Label>
          <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ex: Engenheiro, Analista, Advogado..." />
        </div>
        
        <div className="space-y-2">
          <Label>Especialidades</Label>
          <div className="grid grid-cols-1 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto bg-gray-50">
            {SPECIALTIES.map((specialty) => (
              <div key={specialty} className="flex items-center space-x-2">
                <Checkbox 
                  id={`spec-${specialty}`} 
                  checked={selectedSpecialties.includes(specialty)}
                  onCheckedChange={() => handleSpecialtyChange(specialty)}
                />
                <label 
                  htmlFor={`spec-${specialty}`} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {specialty}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Perfil</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technician">Técnico</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button onClick={handleInvite} disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

InviteTechnicianModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onInvited: PropTypes.func,
};
