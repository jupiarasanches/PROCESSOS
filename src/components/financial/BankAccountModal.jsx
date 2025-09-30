import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

export default function BankAccountModal({ isOpen, account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_type: 'corrente',
    account_number: '',
    agency: '',
    balance: 0,
    initial_balance: 0,
    is_active: true,
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        account_name: account.account_name || '',
        bank_name: account.bank_name || '',
        account_type: account.account_type || 'corrente',
        account_number: account.account_number || '',
        agency: account.agency || '',
        balance: account.balance || 0,
        initial_balance: account.initial_balance || 0,
        is_active: account.is_active !== false,
        description: account.description || ''
      });
    } else {
      setFormData({
        account_name: '',
        bank_name: '',
        account_type: 'corrente',
        account_number: '',
        agency: '',
        balance: 0,
        initial_balance: 0,
        is_active: true,
        description: ''
      });
    }
  }, [account, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="account_name">Nome da Conta *</Label>
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData({...formData, account_name: e.target.value})}
              placeholder="Ex: Conta Principal"
              required
            />
          </div>

          <div>
            <Label htmlFor="bank_name">Nome do Banco *</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
              placeholder="Ex: Banco do Brasil"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_type">Tipo da Conta *</Label>
              <Select 
                value={formData.account_type} 
                onValueChange={(value) => setFormData({...formData, account_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Poupança</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="agency">Agência</Label>
              <Input
                id="agency"
                value={formData.agency}
                onChange={(e) => setFormData({...formData, agency: e.target.value})}
                placeholder="0001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="account_number">Número da Conta</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => setFormData({...formData, account_number: e.target.value})}
              placeholder="12345-6"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="initial_balance">Saldo Inicial (R$)</Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                value={formData.initial_balance}
                onChange={(e) => setFormData({...formData, initial_balance: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div>
              <Label htmlFor="balance">Saldo Atual (R$)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label htmlFor="is_active">Conta Ativa</Label>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição opcional da conta..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}