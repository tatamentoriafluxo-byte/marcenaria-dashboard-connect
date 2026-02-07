import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInDays, parseISO, isAfter } from 'date-fns';

export type TipoAlerta = 'VERDE' | 'AMARELO' | 'VERMELHO';

export interface ProjetoComAlerta {
  id: string;
  cod_projeto: string;
  nome_cliente: string;
  ambiente: string;
  status: string;
  data_contato: string;
  data_entrega?: string;
  prazo_entrega?: number;
  data_venda?: string;
  valor_venda?: number;
  tipoAlerta: TipoAlerta;
  motivosAlerta: string[];
  // Dados de produção
  producao?: {
    status: string;
    taxa_rejeicao: number;
    data_fim_prevista?: string;
  };
  // Dados de montagem
  montagem?: {
    status: string;
    desafios?: string;
    data_montagem?: string;
  };
  // Dados de feedback
  feedback?: {
    recomendaria_servico: boolean;
    avaliacao_montagem?: string;
    avaliacao_fabricacao?: string;
  };
}

interface UseAlertasProjetosResult {
  projetos: ProjetoComAlerta[];
  projetosVerdes: ProjetoComAlerta[];
  projetosAmarelos: ProjetoComAlerta[];
  projetosVermelhos: ProjetoComAlerta[];
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useAlertasProjetos(): UseAlertasProjetosResult {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<ProjetoComAlerta[]>([]);
  const [loading, setLoading] = useState(true);

  const calcularAlerta = (
    projeto: any,
    producao: any | null,
    montagem: any | null,
    feedback: any | null
  ): { tipo: TipoAlerta; motivos: string[] } => {
    const motivos: string[] = [];
    let tipo: TipoAlerta = 'VERDE';

    const hoje = new Date();

    // ===== CRITÉRIOS VERMELHOS (CRÍTICO) =====

    // 1. Prazo estourado
    if (projeto.data_entrega) {
      const dataEntrega = parseISO(projeto.data_entrega);
      if (isAfter(hoje, dataEntrega) && projeto.status !== 'ENTREGUE' && projeto.status !== 'CANCELADO') {
        tipo = 'VERMELHO';
        motivos.push('Prazo de entrega estourado');
      }
    }

    // 2. Produção pausada ou com problema
    if (producao?.status === 'PAUSADO') {
      tipo = 'VERMELHO';
      motivos.push('Produção pausada');
    }

    // 3. Taxa de rejeição muito alta (>15%)
    if (producao?.taxa_rejeicao && producao.taxa_rejeicao > 15) {
      tipo = 'VERMELHO';
      motivos.push(`Taxa de rejeição crítica: ${producao.taxa_rejeicao}%`);
    }

    // 4. Feedback negativo do cliente
    if (feedback?.recomendaria_servico === false) {
      tipo = 'VERMELHO';
      motivos.push('Cliente não recomendaria o serviço');
    }

    // 5. Montagem com desafios críticos
    if (montagem?.desafios && montagem.desafios.toLowerCase().includes('critico')) {
      tipo = 'VERMELHO';
      motivos.push('Montagem com desafios críticos');
    }

    // ===== CRITÉRIOS AMARELOS (ATENÇÃO) - só se não for vermelho =====
    if (tipo !== 'VERMELHO') {
      // 1. 70% do prazo já passou
      if (projeto.data_venda && projeto.data_entrega) {
        const dataVenda = parseISO(projeto.data_venda);
        const dataEntrega = parseISO(projeto.data_entrega);
        const prazoTotal = differenceInDays(dataEntrega, dataVenda);
        const diasPassados = differenceInDays(hoje, dataVenda);
        const percentualPassado = prazoTotal > 0 ? (diasPassados / prazoTotal) * 100 : 0;

        if (percentualPassado >= 70 && percentualPassado < 100 && projeto.status !== 'ENTREGUE') {
          tipo = 'AMARELO';
          motivos.push(`${Math.round(percentualPassado)}% do prazo já passou`);
        }
      }

      // 2. Sem retorno do cliente há mais de 3 dias (para orçamentos)
      if (projeto.status === 'ORCAMENTO') {
        const dataContato = parseISO(projeto.data_contato);
        const diasSemRetorno = differenceInDays(hoje, dataContato);
        if (diasSemRetorno > 3) {
          tipo = 'AMARELO';
          motivos.push(`${diasSemRetorno} dias sem retorno do cliente`);
        }
      }

      // 3. Taxa de rejeição moderada (>5% e <=15%)
      if (producao?.taxa_rejeicao && producao.taxa_rejeicao > 5 && producao.taxa_rejeicao <= 15) {
        tipo = 'AMARELO';
        motivos.push(`Taxa de rejeição elevada: ${producao.taxa_rejeicao}%`);
      }

      // 4. Produção atrasada (data fim prevista já passou mas não concluída)
      if (producao?.data_fim_prevista && producao.status !== 'CONCLUIDO') {
        const dataFimPrevista = parseISO(producao.data_fim_prevista);
        if (isAfter(hoje, dataFimPrevista)) {
          tipo = 'AMARELO';
          motivos.push('Produção com atraso');
        }
      }

      // 5. Avaliações medianas no feedback
      if (feedback?.avaliacao_montagem === 'REGULAR' || feedback?.avaliacao_fabricacao === 'REGULAR') {
        tipo = 'AMARELO';
        motivos.push('Avaliação regular do cliente');
      }
    }

    // Se não tem motivos, está tudo bem
    if (motivos.length === 0) {
      motivos.push('Tudo dentro do esperado');
    }

    return { tipo, motivos };
  };

  const fetchProjetos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar projetos ativos (não cancelados e não entregues há mais de 30 dias)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .not('status', 'eq', 'CANCELADO')
        .order('data_contato', { ascending: false });

      if (projectsError) throw projectsError;

      // Buscar produções relacionadas
      const { data: producaoData } = await supabase
        .from('producao')
        .select('*')
        .eq('user_id', user.id);

      // Buscar montagens relacionadas
      const { data: montagemData } = await supabase
        .from('montagem')
        .select('*')
        .eq('user_id', user.id);

      // Buscar feedbacks relacionados
      const { data: feedbackData } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('user_id', user.id);

      // Mapear produções, montagens e feedbacks por project_id
      const producaoMap = new Map(producaoData?.map(p => [p.project_id, p]) || []);
      const montagemMap = new Map(montagemData?.map(m => [m.project_id, m]) || []);
      const feedbackMap = new Map(feedbackData?.map(f => [f.project_id, f]) || []);

      // Calcular alertas para cada projeto
      const projetosComAlerta: ProjetoComAlerta[] = (projectsData || []).map(projeto => {
        const producao = producaoMap.get(projeto.id);
        const montagem = montagemMap.get(projeto.id);
        const feedback = feedbackMap.get(projeto.id);

        const { tipo, motivos } = calcularAlerta(projeto, producao, montagem, feedback);

        return {
          id: projeto.id,
          cod_projeto: projeto.cod_projeto,
          nome_cliente: projeto.nome_cliente,
          ambiente: projeto.ambiente,
          status: projeto.status,
          data_contato: projeto.data_contato,
          data_entrega: projeto.data_entrega,
          prazo_entrega: projeto.prazo_entrega,
          data_venda: projeto.data_venda,
          valor_venda: projeto.valor_venda,
          tipoAlerta: tipo,
          motivosAlerta: motivos,
          producao: producao ? {
            status: producao.status,
            taxa_rejeicao: producao.taxa_rejeicao || 0,
            data_fim_prevista: producao.data_fim_prevista,
          } : undefined,
          montagem: montagem ? {
            status: montagem.status,
            desafios: montagem.desafios,
            data_montagem: montagem.data_montagem,
          } : undefined,
          feedback: feedback ? {
            recomendaria_servico: feedback.recomendaria_servico,
            avaliacao_montagem: feedback.avaliacao_montagem,
            avaliacao_fabricacao: feedback.avaliacao_fabricacao,
          } : undefined,
        };
      });

      setProjetos(projetosComAlerta);
    } catch (error) {
      console.error('Erro ao carregar alertas de projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, [user]);

  const projetosVerdes = projetos.filter(p => p.tipoAlerta === 'VERDE');
  const projetosAmarelos = projetos.filter(p => p.tipoAlerta === 'AMARELO');
  const projetosVermelhos = projetos.filter(p => p.tipoAlerta === 'VERMELHO');

  return {
    projetos,
    projetosVerdes,
    projetosAmarelos,
    projetosVermelhos,
    loading,
    refetch: fetchProjetos,
  };
}
