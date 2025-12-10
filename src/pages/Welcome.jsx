
import { AuthService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Calendar,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Settings,
  DollarSign,
  Clock,
  Zap,
  Target,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

export default function WelcomePage() {
  const handleLogin = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        window.location.href = '/dashboard';
        toast.success('Sessão ativa, redirecionando...');
      } else {
        toast.error('Nenhuma sessão ativa. Use o link de convite para criar acesso.');
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      toast.error('Erro ao verificar sessão.');
    }
  };

  const handleCreateAccount = async () => {
    toast.info('Para criar uma conta, aceite um convite enviado ao seu e-mail.');
  };

  const features = [
    {
      icon: FileText,
      title: 'Gerenciamento Visual de Processos',
      description: 'Organize processos empresariais complexos com interface intuitiva e fluxos automatizados'
    },
    {
      icon: Calendar,
      title: 'Planejamento Inteligente de Agenda',
      description: 'Agende compromissos com notificações automáticas e integração com processos em andamento'
    },
    {
      icon: TrendingUp,
      title: 'Colaboração em Tempo Real',
      description: 'Trabalhe em equipe com atualizações instantâneas e controle total de permissões'
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro Completo',
      description: 'Gerencie receitas, despesas e fluxo de caixa com relatórios detalhados e análises avançadas'
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      text: 'Redução de 70% no tempo de processos administrativos'
    },
    {
      icon: CheckCircle,
      text: 'Controle total sobre prazos e entregas'
    },
    {
      icon: CheckCircle,
      text: 'Relatórios automáticos para tomada de decisão'
    },
    {
      icon: CheckCircle,
      text: 'Integração perfeita entre todos os departamentos'
    }
  ];

  const stats = [
    { icon: Users, number: '500+', label: 'Empresas Ativas' },
    { icon: Target, number: '99.9%', label: 'Uptime Garantido' },
    { icon: Clock, number: '24/7', label: 'Suporte Técnico' },
    { icon: Zap, number: '10x', label: 'Mais Produtividade' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">ProcessFlow</h1>
                <p className="text-xs text-gray-500">Sistema de Gestão Empresarial</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleLogin} className="text-gray-700 hover:text-blue-600">
                Entrar
              </Button>
              <Button onClick={handleCreateAccount} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                Criar Conta
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Otimize sua Gestão Empresarial
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Bem-vindo de volta!
                <span className="block text-blue-600">Continue sua jornada</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Entre na sua conta para continuar gerenciando seus processos empresariais de forma eficiente e intuitiva.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Fazer Login
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleCreateAccount}
                  className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                >
                  Criar Nova Conta
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <benefit.icon className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Continue sua jornada de produtividade</h3>
                
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-blue-100 text-sm italic text-center">
                    &ldquo;O TaskFlow Pro transformou nossa equipe gerencial em apenas algumas semanas de uso. A ferramenta é intuitiva.&rdquo;
                  </p>
                  <div className="flex items-center justify-center mt-4 gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Sofia Mendes</p>
                      <p className="text-blue-200 text-xs">Gerente de Produto da TechCorp</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200/50 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simplifique seus processos empresariais com ferramentas poderosas e intuitivas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FileText, title: 'Processos', desc: 'Gerencie fluxos complexos' },
              { icon: Calendar, title: 'Agenda', desc: 'Compromissos inteligentes' },
              { icon: DollarSign, title: 'Financeiro', desc: 'Controle total de receitas' },
              { icon: BarChart3, title: 'Relatórios', desc: 'Análises em tempo real' },
              { icon: Users, title: 'Equipe', desc: 'Colaboração eficiente' },
              { icon: Settings, title: 'Automação', desc: 'Fluxos automatizados' },
              { icon: Shield, title: 'Segurança', desc: 'Dados protegidos' },
              { icon: Target, title: 'Metas', desc: 'Acompanhe resultados' }
            ].map((item, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar sua gestão?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Junte-se a centenas de empresas que já otimizaram seus processos com o ProcessFlow
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              Acessar Minha Conta
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleCreateAccount}
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
            >
              Começar Gratuitamente
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">ProcessFlow</span>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>
          
          <p className="text-gray-500 text-xs">
            © 2024 ProcessFlow. Todos os direitos reservados. Sistema desenvolvido com tecnologia avançada para gestão empresarial.
          </p>
        </div>
      </footer>
    </div>
  );
}
