import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Charts } from '@/components/dashboard/Charts';
import { VendasCharts } from '@/components/dashboard/VendasCharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [dashboardVendas, setDashboardVendas] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [projectsResult, vendasResult] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('dashboard_vendas').select('*').eq('user_id', user.id)
      ]);

      if (projectsResult.error) throw projectsResult.error;
      if (vendasResult.error) throw vendasResult.error;
      
      setProjects(projectsResult.data || []);
      setDashboardVendas(vendasResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Calcular estatísticas a partir da view dashboard_vendas
    const faturamentoTotal = dashboardVendas.reduce((acc, v) => acc + (parseFloat(v.faturamento_total || 0)), 0);
    const totalVendas = dashboardVendas.reduce((acc, v) => acc + (parseInt(v.total_vendas || 0)), 0);
    const lucroTotal = dashboardVendas.reduce((acc, v) => acc + (parseFloat(v.lucro_total || 0)), 0);
    const ticketMedio = dashboardVendas.reduce((acc, v) => acc + (parseFloat(v.ticket_medio || 0)), 0) / (dashboardVendas.length || 1);
    
    const totalProjetos = projects.length;
    const projetosConvertidos = projects.filter(p => p.status === 'CONVERTIDO' || p.status === 'APROVADO').length;
    const taxaConversao = totalProjetos > 0 ? (projetosConvertidos / totalProjetos) * 100 : 0;

    return { totalProjetos, taxaConversao, faturamentoTotal, ticketMedio };
  };

  const getProjetosPorStatus = () => {
    const statusCount: Record<string, number> = {};
    projects.forEach(p => {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }));
  };

  const getProjetosPorOrigem = () => {
    const origemCount: Record<string, number> = {};
    projects.forEach(p => {
      origemCount[p.origem_lead] = (origemCount[p.origem_lead] || 0) + 1;
    });
    
    return Object.entries(origemCount).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
    }));
  };

  const getProjetosPorAmbiente = () => {
    const ambienteCount: Record<string, number> = {};
    projects.forEach(p => {
      ambienteCount[p.ambiente] = (ambienteCount[p.ambiente] || 0) + 1;
    });
    
    return Object.entries(ambienteCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral dos seus projetos</p>
          </div>
          <Button onClick={() => navigate('/novo-projeto')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        <div className="space-y-6">
          <StatsCards {...stats} />
          
          {projects.length > 0 ? (
            <Tabs defaultValue="vendas" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="vendas">Vendas</TabsTrigger>
                <TabsTrigger value="projetos">Projetos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vendas">
                <VendasCharts dashboardVendas={dashboardVendas} />
              </TabsContent>
              
              <TabsContent value="projetos">
                <Charts
                  projetosPorStatus={getProjetosPorStatus()}
                  projetosPorOrigem={getProjetosPorOrigem()}
                  projetosPorAmbiente={getProjetosPorAmbiente()}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="rounded-lg border-2 border-dashed p-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Nenhum projeto cadastrado ainda
              </p>
              <Button onClick={() => navigate('/novo-projeto')}>
                Cadastrar primeiro projeto
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
