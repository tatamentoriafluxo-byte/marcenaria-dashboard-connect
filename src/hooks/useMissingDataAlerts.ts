import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type MissingDataAlert = {
  type: 'warning' | 'info';
  title: string;
  description: string;
  action: string;
  route: string;
};

export function useMissingDataAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<MissingDataAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkMissingData = async () => {
      const alertsList: MissingDataAlert[] = [];
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      // Check for missing metas for current month
      const { data: metas } = await supabase
        .from('metas')
        .select('id')
        .eq('user_id', user.id)
        .gte('mes_referencia', `${currentMonth}-01`)
        .lt('mes_referencia', `${currentMonth}-32`)
        .limit(1);

      if (!metas || metas.length === 0) {
        alertsList.push({
          type: 'warning',
          title: 'Meta mensal não cadastrada',
          description: `Você ainda não cadastrou a meta de faturamento/lucro para ${formatMonth(currentMonth)}. Os dashboards de Vendas e Lucro podem mostrar dados incompletos.`,
          action: 'Cadastrar Meta',
          route: '/metas',
        });
      }

      // Check for missing capacidade_producao for current month
      const { data: capacidade } = await supabase
        .from('capacidade_producao')
        .select('id')
        .eq('user_id', user.id)
        .gte('mes_referencia', `${currentMonth}-01`)
        .lt('mes_referencia', `${currentMonth}-32`)
        .limit(1);

      if (!capacidade || capacidade.length === 0) {
        alertsList.push({
          type: 'warning',
          title: 'Capacidade de produção não cadastrada',
          description: `Você ainda não cadastrou a capacidade de produção para ${formatMonth(currentMonth)}. O dashboard de Produção pode mostrar dados incompletos.`,
          action: 'Cadastrar Capacidade',
          route: '/capacidade-producao',
        });
      }

      // Check for vendedores (needed for projects)
      const { data: vendedores } = await supabase
        .from('vendedores')
        .select('id')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .limit(1);

      if (!vendedores || vendedores.length === 0) {
        alertsList.push({
          type: 'info',
          title: 'Nenhum vendedor cadastrado',
          description: 'Cadastre vendedores para poder vincular projetos e acompanhar o desempenho individual.',
          action: 'Cadastrar Vendedor',
          route: '/vendedores',
        });
      }

      setAlerts(alertsList);
      setLoading(false);
    };

    checkMissingData();
  }, [user]);

  return { alerts, loading };
}

function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[parseInt(month) - 1]}/${year}`;
}
