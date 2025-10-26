import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TwilioConfig } from "@/api/entities";
import { MessageCircle, Check, X, AlertCircle, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export default function TwilioSetupModal({ isOpen, onClose }) {
  const [config, setConfig] = useState({
    account_sid: '',
    auth_token: '',
    whatsapp_from: '',
    is_active: false,
    is_sandbox: true,
    sandbox_join_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [existingConfig, setExistingConfig] = useState(null);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do ProcessFlow. ✅');

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const configs = await TwilioConfig.list('-created_date');
      if (configs && configs.length > 0) {
        setExistingConfig(configs[0]);
        setConfig({
          account_sid: configs[0].account_sid || '',
          auth_token: '••••••••••••', // Não mostra o token real
          whatsapp_from: configs[0].whatsapp_from || '',
          is_active: configs[0].is_active || false,
          is_sandbox: configs[0].is_sandbox !== false,
          sandbox_join_code: configs[0].sandbox_join_code || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração Twilio:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validações
      if (!config.account_sid || !config.whatsapp_from) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (config.is_sandbox && !config.sandbox_join_code) {
        toast.error('Informe o código do Sandbox');
        return;
      }

      const configData = {
        ...config,
        // Só atualiza o token se foi modificado
        auth_token: config.auth_token === '••••••••••••' ? existingConfig?.auth_token : config.auth_token,
        last_reset_date: new Date().toISOString().split('T')[0],
        messages_sent_today: 0
      };

      if (existingConfig) {
        await TwilioConfig.update(existingConfig.id, configData);
        toast.success('Configuração atualizada!');
      } else {
        await TwilioConfig.create(configData);
        toast.success('Twilio configurado com sucesso!');
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async () => {
    if (!testNumber) {
      toast.error('Informe um número para teste');
      return;
    }

    toast.info('Em produção, seria enviada uma mensagem via Twilio', {
      description: `Para: ${testNumber}\nMensagem: ${testMessage}`
    });

    // Em produção real, aqui faria a chamada para o backend que usa a API do Twilio
    // const response = await fetch('/api/twilio/send-message', {
    //   method: 'POST',
    //   body: JSON.stringify({ to: testNumber, message: testMessage })
    // });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <MessageCircle className="w-6 h-6 text-green-600" />
            Configurar WhatsApp (Twilio)
          </DialogTitle>
          <DialogDescription>
            Configure a integração com Twilio para enviar notificações via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status da Integração */}
          <Card className={config.is_active ? 'border-green-500' : 'border-gray-200'}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Status da Integração</span>
                {config.is_active ? (
                  <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Ativa</Badge>
                ) : (
                  <Badge variant="secondary"><X className="w-3 h-3 mr-1" /> Inativa</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativar envio de notificações WhatsApp</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {config.is_active ? 'Os usuários receberão notificações no WhatsApp' : 'Configure e ative para começar'}
                  </p>
                </div>
                <Switch
                  checked={config.is_active}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Guia Rápido */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Como obter suas credenciais Twilio:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Acesse <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">console.twilio.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Copie seu <strong>Account SID</strong> e <strong>Auth Token</strong></li>
                <li>Para sandbox (testes), use <strong>WhatsApp Sandbox</strong> no menu</li>
                <li>Para produção, configure um número WhatsApp aprovado</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Modo Sandbox */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="text-sm font-medium">Modo Sandbox (Testes)</Label>
              <p className="text-xs text-gray-500 mt-1">Use o Twilio Sandbox para testes gratuitos</p>
            </div>
            <Switch
              checked={config.is_sandbox}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_sandbox: checked }))}
            />
          </div>

          {/* Credenciais */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="account_sid">Account SID *</Label>
              <Input
                id="account_sid"
                value={config.account_sid}
                onChange={(e) => setConfig(prev => ({ ...prev, account_sid: e.target.value }))}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="auth_token">Auth Token *</Label>
              <Input
                id="auth_token"
                type="password"
                value={config.auth_token}
                onChange={(e) => setConfig(prev => ({ ...prev, auth_token: e.target.value }))}
                placeholder="••••••••••••••••••••••••••••••••"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_from">Número WhatsApp *</Label>
              <Input
                id="whatsapp_from"
                value={config.whatsapp_from}
                onChange={(e) => setConfig(prev => ({ ...prev, whatsapp_from: e.target.value }))}
                placeholder={config.is_sandbox ? "whatsapp:+14155238886" : "whatsapp:+5511999999999"}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {config.is_sandbox ? 'Número do Twilio Sandbox (fornecido por eles)' : 'Seu número WhatsApp aprovado'}
              </p>
            </div>

            {config.is_sandbox && (
              <div>
                <Label htmlFor="sandbox_code">Código do Sandbox *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="sandbox_code"
                    value={config.sandbox_join_code}
                    onChange={(e) => setConfig(prev => ({ ...prev, sandbox_join_code: e.target.value }))}
                    placeholder="join amazing-cat"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(config.sandbox_join_code)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Os usuários devem enviar este código para o número do Sandbox no WhatsApp
                </p>
              </div>
            )}
          </div>

          {/* Teste de Mensagem */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Testar Envio de Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="test_number">Número para teste</Label>
                <Input
                  id="test_number"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="+5511999999999"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="test_message">Mensagem de teste</Label>
                <Input
                  id="test_message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestMessage}
                className="w-full"
                disabled={!config.account_sid || !testNumber}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Enviar Mensagem de Teste
              </Button>
            </CardContent>
          </Card>

          {/* Informações Importantes */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              <strong>Importante:</strong>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>No modo Sandbox, os usuários precisam primeiro entrar no sandbox enviando o código</li>
                <li>Para produção, você precisa ter templates aprovados pelo WhatsApp</li>
                <li>Mensagens promocionais requerem opt-in explícito do usuário</li>
                <li>Respeite sempre o limite diário de mensagens da sua conta</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}