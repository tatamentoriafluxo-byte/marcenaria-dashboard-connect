import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Charts } from '@/components/dashboard/Charts';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalProjetos = projects.length;
    const projetosConvertidos = projects.filter(p => p.status === 'CONVERTIDO').length;
    const taxaConversao = totalProjetos > 0 ? (projetosConvertidos / totalProjetos) * 100 : 0;
    
    const faturamentoTotal = projects
      .filter(p => p.valor_venda)
      .reduce((acc, p) => acc + parseFloat(p.valor_venda || 0), 0);
    
    const ticketMedio = projetosConvertidos > 0 ? faturamentoTotal / projetosConvertidos : 0;

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
            <Charts
              projetosPorStatus={getProjetosPorStatus()}
              projetosPorOrigem={getProjetosPorOrigem()}
              projetosPorAmbiente={getProjetosPorAmbiente()}
            />
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
