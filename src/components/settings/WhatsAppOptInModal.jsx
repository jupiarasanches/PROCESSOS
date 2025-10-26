import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WhatsAppNumber, TwilioConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { MessageCircle, Check, Send, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppOptInModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'verify', 'complete'
  const [loading, setLoading] = useState(false);
  const [userNumber, setUserNumber] = useState(null);
  const [twilioConfig, setTwilioConfig] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUserNumber();
      loadTwilioConfig();
    }
  }, [isOpen]);

  const loadUserNumber = async () => {
    try {
      const user = await User.me();
      const numbers = await WhatsAppNumber.filter({ user_email: user.email });
      if (numbers && numbers.length > 0) {
        setUserNumber(numbers[0]);
        setPhoneNumber(numbers[0].phone_number);
        if (numbers[0].is_verified) {
          setStep('complete');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar número:', error);
    }
  };

  const loadTwilioConfig = async () => {
    try {
      const configs = await TwilioConfig.list('-created_date');
      if (configs && configs.length > 0) {
        setTwilioConfig(configs[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar config Twilio:', error);
    }
  };

  const handleSendVerification = async () => {
    if (!phoneNumber) {
      toast.error('Informe seu número de WhatsApp');
      return;
    }

    setLoading(true);
    try {
      const user = await User.me();
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Salva ou atualiza o número
      if (userNumber) {
        await WhatsAppNumber.update(userNumber.id, {
          phone_number: phoneNumber,
          verification_code: code,
          verification_sent_at: new Date().toISOString(),
          is_verified: false
        });
      } else {
        await WhatsAppNumber.create({
          user_email: user.email,
          phone_number: phoneNumber,
          verification_code: code,
          verification_sent_at: new Date().toISOString(),
          is_verified: false
        });
      }

      // Em produção, enviaria via Twilio
      toast.success('Código de verificação enviado!', {
        description: `Código: ${code} (Em produção, seria enviado via WhatsApp)`
      });

      setStep('verify');
    } catch (error) {
      console.error('Erro ao enviar verificação:', error);
      toast.error('Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error('Informe o código de verificação');
      return;
    }

    setLoading(true);
    try {
      const user = await User.me();
      const numbers = await WhatsAppNumber.filter({ user_email: user.email });
      
      if (numbers && numbers.length > 0) {
        const number = numbers[0];
        
        if (number.verification_code === verificationCode) {
          await WhatsAppNumber.update(number.id, {
            is_verified: true,
            opted_in: true,
            opted_in_at: new Date().toISOString()
          });

          toast.success('WhatsApp verificado com sucesso!');
          setStep('complete');
        } else {
          toast.error('Código inválido');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      toast.error('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      if (userNumber) {
        await WhatsAppNumber.update(userNumber.id, {
          notifications_enabled: false
        });
        toast.success('Notificações WhatsApp desativadas');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao desativar:', error);
      toast.error('Erro ao desativar notificações');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Configurar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Configure seu WhatsApp para receber notificações do sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {twilioConfig?.is_sandbox && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Modo Sandbox Ativo</strong>
                <p className="mt-1">Antes de tudo, envie uma mensagem para o número do Twilio Sandbox:</p>
                <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <code className="text-xs">{twilioConfig.sandbox_join_code}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(twilioConfig.sandbox_join_code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs mt-1">Envie para: {twilioConfig.whatsapp_from}</p>
              </AlertDescription>
            </Alert>
          )}

          {step === 'phone' && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="phone">Número do WhatsApp</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Inclua código do país (ex: +55 para Brasil)
                  </p>
                </div>
                <Button
                  onClick={handleSendVerification}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Enviando...' : 'Enviar Código de Verificação'}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'verify' && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Alert>
                  <AlertDescription className="text-sm">
                    Enviamos um código de 6 dígitos para <strong>{phoneNumber}</strong>
                  </AlertDescription>
                </Alert>
                <div>
                  <Label htmlFor="code">Código de Verificação</Label>
                  <Input
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="mt-1 text-center text-2xl tracking-widest"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('phone')}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Verificando...' : 'Verificar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'complete' && (
            <Card className="border-green-500">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">WhatsApp Configurado!</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Você receberá notificações no número
                  </p>
                  <p className="font-mono text-sm mt-1">{phoneNumber}</p>
                  <Badge className="mt-3 bg-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setStep('phone')}
                    className="w-full"
                  >
                    Alterar Número
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDisable}
                    className="w-full text-red-600 hover:bg-red-50"
                  >
                    Desativar Notificações
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}