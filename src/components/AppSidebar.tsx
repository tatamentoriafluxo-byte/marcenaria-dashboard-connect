import { NavLink } from "react-router-dom";
import {
  Home, BarChart3, Box, Truck, Users, UserCheck,
  User, FolderKanban, ShoppingCart, Package,
  Factory, Wrench, Wallet, MessageSquare,
  Target, TrendingUp, Handshake, Settings,
  CreditCard, DollarSign, FileText, Calculator,
  Upload, Camera
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  const { open } = useSidebar();

  const menuSections = [
    {
      label: "Principal",
      items: [
        { title: "Início", url: "/", icon: Home },
        { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
      ]
    },
    {
      label: "1. Configuração Inicial",
      items: [
        { title: "Importar Dados", url: "/importar-dados", icon: Upload },
        { title: "Materiais", url: "/materiais", icon: Box },
        { title: "Fornecedores", url: "/fornecedores", icon: Truck },
        { title: "Funcionários", url: "/funcionarios", icon: Users },
        { title: "Vendedores", url: "/vendedores", icon: UserCheck },
        { title: "Parceiros", url: "/parceiros", icon: Handshake },
      ]
    },
    {
      label: "2. Operação Comercial",
      items: [
        { title: "Clientes", url: "/clientes", icon: User },
        { title: "Orçamentos", url: "/orcamentos", icon: Calculator },
        { title: "Catálogo de Preços", url: "/catalogo-precos", icon: FileText },
        { title: "Análise Foto IA", url: "/analise-foto", icon: Camera },
        { title: "Projetos", url: "/projetos", icon: FolderKanban },
      ]
    },
    {
      label: "3. Gestão de Recursos",
      items: [
        { title: "Compras", url: "/compras", icon: ShoppingCart },
        { title: "Estoque", url: "/estoque", icon: Package },
        { title: "Ferramentas", url: "/ferramentas", icon: Settings },
        { title: "Fretistas", url: "/fretistas", icon: Truck },
      ]
    },
    {
      label: "4. Execução",
      items: [
        { title: "Produção", url: "/producao", icon: Factory },
        { title: "Montagem", url: "/montagem", icon: Wrench },
      ]
    },
    {
      label: "💰 Financeiro",
      items: [
        { title: "Contas a Pagar", url: "/contas-pagar", icon: CreditCard },
        { title: "Contas a Receber", url: "/contas-receber", icon: DollarSign },
        { title: "Cheques", url: "/cheques", icon: FileText },
        { title: "Fluxo de Caixa", url: "/fluxo-caixa", icon: Wallet },
      ]
    },
    {
      label: "5. Controle e Crescimento",
      items: [
        { title: "Feedbacks", url: "/feedbacks", icon: MessageSquare },
        { title: "Metas", url: "/metas", icon: Target },
        { title: "Capacidade de Produção", url: "/capacidade-producao", icon: TrendingUp },
      ]
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">M</span>
          </div>
          {open && (
            <span className="font-bold text-foreground">
              Sistema Marcenaria
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section, sectionIdx) => (
          <SidebarGroup key={sectionIdx}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        }
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}