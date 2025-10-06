import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Box, Truck, Users, UserCheck, 
  User, FolderKanban, ShoppingCart, Package,
  Factory, Wrench, Wallet, MessageSquare,
  Target, TrendingUp, ArrowRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { useProgressTracking } from "@/hooks/useProgressTracking";

export default function Home() {
  const navigate = useNavigate();
  const { progress, isLoading, isEtapa1Complete, isEtapa2Complete, isEtapa3Complete, overallProgress } = useProgressTracking();

  const getItemCount = (itemNome: string): number => {
    if (!progress) return 0;
    const mapping: Record<string, keyof typeof progress> = {
      "Materiais": "materiais",
      "Fornecedores": "fornecedores",
      "Funcionários": "funcionarios",
      "Vendedores": "vendedores",
      "Parceiros": "parceiros",
      "Clientes": "clientes",
      "Projetos": "projetos",
      "Compras": "compras",
      "Estoque": "estoque",
    };
    return progress[mapping[itemNome]] || 0;
  };

  const etapas = [
    {
      titulo: "1. Configuração Inicial",
      descricao: "Cadastre primeiro a base do seu negócio",
      cor: "bg-blue-500",
      icone: CheckCircle2,
      completa: isEtapa1Complete,
      bloqueada: false,
      itens: [
        { nome: "Materiais", rota: "/materiais", icone: Box, descricao: "O que você trabalha (madeira, ferragem, etc.)" },
        { nome: "Fornecedores", rota: "/fornecedores", icone: Truck, descricao: "De onde vem seus materiais" },
        { nome: "Funcionários", rota: "/funcionarios", icone: Users, descricao: "Sua equipe (marceneiros, montadores)" },
        { nome: "Vendedores", rota: "/vendedores", icone: UserCheck, descricao: "Quem vende seus projetos" },
        { nome: "Parceiros", rota: "/parceiros", icone: Users, descricao: "Arquitetos, designers e outros parceiros" },
      ]
    },
    {
      titulo: "2. Operação Comercial",
      descricao: "Agora você pode começar a vender",
      cor: "bg-green-500",
      icone: TrendingUp,
      completa: isEtapa2Complete,
      bloqueada: !isEtapa1Complete,
      itens: [
        { nome: "Clientes", rota: "/clientes", icone: User, descricao: "Para quem você vende" },
        { nome: "Projetos", rota: "/projetos", icone: FolderKanban, descricao: "Orçamentos e vendas" },
      ]
    },
    {
      titulo: "3. Gestão de Recursos",
      descricao: "Para executar os projetos",
      cor: "bg-purple-500",
      icone: Package,
      completa: isEtapa3Complete,
      bloqueada: !isEtapa2Complete,
      itens: [
        { nome: "Compras", rota: "/compras", icone: ShoppingCart, descricao: "Comprar materiais dos fornecedores" },
        { nome: "Estoque", rota: "/estoque", icone: Package, descricao: "Controlar o que tem disponível" },
      ]
    },
    {
      titulo: "4. Execução",
      descricao: "Fazer acontecer",
      cor: "bg-orange-500",
      icone: Factory,
      completa: false,
      bloqueada: !isEtapa3Complete,
      itens: [
        { nome: "Produção", rota: "/producao", icone: Factory, descricao: "Fabricar os móveis" },
        { nome: "Montagem", rota: "/montagem", icone: Wrench, descricao: "Instalar no cliente" },
      ]
    },
    {
      titulo: "5. Controle e Crescimento",
      descricao: "Acompanhar e melhorar",
      cor: "bg-pink-500",
      icone: Target,
      completa: false,
      bloqueada: false,
      itens: [
        { nome: "Fluxo de Caixa", rota: "/fluxo-caixa", icone: Wallet, descricao: "Dinheiro entrando e saindo" },
        { nome: "Feedbacks", rota: "/feedbacks", icone: MessageSquare, descricao: "O que clientes acharam" },
        { nome: "Metas", rota: "/metas", icone: Target, descricao: "Objetivos de crescimento" },
        { nome: "Capacidade de Produção", rota: "/capacidade-producao", icone: TrendingUp, descricao: "Quanto consegue produzir" },
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center">Carregando progresso...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Bem-vindo ao Sistema de Gestão!</h1>
        <p className="text-xl text-muted-foreground">Siga este guia passo a passo para configurar seu sistema</p>
        
        <div className="mt-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Dica Importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Para o sistema funcionar corretamente, <strong>siga a ordem abaixo</strong>. 
            Cada etapa prepara o terreno para a próxima. Se pular etapas, pode encontrar dificuldades depois!
          </p>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {etapas.map((etapa, index) => (
          <Card key={index} className={`border-2 ${etapa.bloqueada ? 'opacity-60' : ''}`}>
            <CardHeader className={`${etapa.cor} text-white rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <etapa.icone className="h-6 w-6" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {etapa.titulo}
                      {etapa.completa && <CheckCircle2 className="h-5 w-5" />}
                      {etapa.bloqueada && <AlertCircle className="h-5 w-5" />}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-base mt-1">
                      {etapa.descricao}
                    </CardDescription>
                  </div>
                </div>
                {etapa.bloqueada && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Complete a etapa anterior
                  </Badge>
                )}
                {etapa.completa && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Completa
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {etapa.itens.map((item, idx) => {
                  const count = getItemCount(item.nome);
                  const hasItems = count > 0;
                  
                  return (
                    <Card 
                      key={idx} 
                      className={`hover:shadow-lg transition-shadow cursor-pointer ${hasItems ? 'border-green-200 dark:border-green-800' : ''}`}
                      onClick={() => navigate(item.rota)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`${etapa.cor} p-2 rounded-lg text-white relative`}>
                            <item.icone className="h-5 w-5" />
                            {hasItems && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {count}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{item.nome}</h3>
                              {hasItems && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.descricao}</p>
                            {!hasItems && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Nenhum cadastro
                              </Badge>
                            )}
                            {hasItems && (
                              <Badge variant="outline" className="mt-2 text-xs border-green-600 text-green-600">
                                {count} cadastrado{count > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-2">
        <CardHeader>
          <CardTitle>Pronto para começar?</CardTitle>
          <CardDescription className="text-base">
            Depois de completar os cadastros, acesse o Dashboard para visualizar seus dados!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            size="lg" 
            className="w-full md:w-auto"
            onClick={() => navigate("/dashboard")}
          >
            Ir para o Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}