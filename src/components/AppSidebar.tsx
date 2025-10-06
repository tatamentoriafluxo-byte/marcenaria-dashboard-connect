import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  UserCircle, 
  Users as TeamIcon,
  Package, 
  Warehouse, 
  ShoppingCart, 
  Building2,
  ChevronRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  {
    title: 'Visão Geral',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard },
      { title: 'Projetos', url: '/projetos', icon: FolderKanban },
    ]
  },
  {
    title: 'Cadastros',
    items: [
      { title: 'Vendedores', url: '/vendedores', icon: Users },
      { title: 'Clientes', url: '/clientes', icon: UserCircle },
      { title: 'Funcionários', url: '/funcionarios', icon: TeamIcon },
    ]
  },
  {
    title: 'Estoque & Compras',
    items: [
      { title: 'Materiais', url: '/materiais', icon: Package },
      { title: 'Estoque', url: '/estoque', icon: Warehouse },
      { title: 'Compras', url: '/compras', icon: ShoppingCart },
      { title: 'Fornecedores', url: '/fornecedores', icon: Building2 },
    ]
  }
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">M</span>
          </div>
          {open && (
            <span className="font-bold text-foreground">
              Painel Marcenaria
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((section) => (
          <Collapsible key={section.title} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent">
                  {section.title}
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.url}
                            end={item.url === '/'}
                            className={({ isActive }) =>
                              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                            }
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
        
        <Separator className="my-2" />
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dados-teste">
                    <Package className="h-4 w-4" />
                    <span className="text-xs">Dados de Teste</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
