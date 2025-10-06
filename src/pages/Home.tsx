import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Box, Truck, Users, UserCheck, 
  User, FolderKanban, ShoppingCart, Package,
  Factory, Wrench, Wallet, MessageSquare,
  Target, TrendingUp, ArrowRight, CheckCircle2
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const etapas = [
    {
      titulo: "1. Configuração Inicial",
      descricao: "Cadastre primeiro a base do seu negócio",
      cor: "bg-blue-500",
      icone: CheckCircle2,
      itens: [
        { nome: "Materiais", rota: "/materiais", icone: Box, descricao: "O que você trabalha (madeira, ferragem, etc.)" },
        { nome: "Fornecedores", rota: "/fornecedores", icone: Truck, descricao: "De onde vem seus materiais" },
        { nome: "Funcionários", rota: "/funcionarios", icone: Users, descricao: "Sua equipe (marceneiros, montadores)" },
        { nome: "Vendedores", rota: "/vendedores", icone: UserCheck, descricao: "Quem vende seus projetos" },
      ]
    },
    {
      titulo: "2. Operação Comercial",
      descricao: "Agora você pode começar a vender",
      cor: "bg-green-500",
      icone: TrendingUp,
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
      itens: [
        { nome: "Fluxo de Caixa", rota: "/fluxo-caixa", icone: Wallet, descricao: "Dinheiro entrando e saindo" },
        { nome: "Feedbacks", rota: "/feedbacks", icone: MessageSquare, descricao: "O que clientes acharam" },
        { nome: "Metas", rota: "/metas", icone: Target, descricao: "Objetivos de crescimento" },
        { nome: "Capacidade de Produção", rota: "/capacidade-producao", icone: TrendingUp, descricao: "Quanto consegue produzir" },
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Bem-vindo ao Sistema de Gestão!</h1>
        <p className="text-xl text-muted-foreground">Siga este guia passo a passo para configurar seu sistema</p>
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
          <Card key={index} className="border-2">
            <CardHeader className={`${etapa.cor} text-white rounded-t-lg`}>
              <CardTitle className="flex items-center gap-3">
                <etapa.icone className="h-6 w-6" />
                {etapa.titulo}
              </CardTitle>
              <CardDescription className="text-white/90 text-base">
                {etapa.descricao}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {etapa.itens.map((item, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(item.rota)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`${etapa.cor} p-2 rounded-lg text-white`}>
                          <item.icone className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.nome}</h3>
                          <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
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