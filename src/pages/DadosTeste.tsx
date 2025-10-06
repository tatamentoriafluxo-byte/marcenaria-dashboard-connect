import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2 } from 'lucide-react';

const DadosTeste = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const popularDados = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Vendedores
      const vendedores = [
        { nome: 'João Silva', email: 'joao.silva@email.com', telefone: '(11) 98765-4321', comissao_percentual: 5.00, meta_mensal: 50000.00 },
        { nome: 'Maria Santos', email: 'maria.santos@email.com', telefone: '(11) 97654-3210', comissao_percentual: 7.00, meta_mensal: 60000.00 },
        { nome: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', telefone: '(11) 96543-2109', comissao_percentual: 5.00, meta_mensal: 45000.00 }
      ];

      for (const v of vendedores) {
        await supabase.from('vendedores').insert([{ ...v, user_id: user.id, ativo: true }]);
      }

      // Clientes
      const clientes = [
        { nome: 'Ana Costa', telefone: '(11) 91234-5678', email: 'ana.costa@email.com', cpf_cnpj: '123.456.789-00', endereco: 'Rua das Flores, 123', cidade: 'São Paulo', estado: 'SP', cep: '01234-567' },
        { nome: 'Carlos Mendes', telefone: '(11) 92345-6789', email: 'carlos.mendes@email.com', cpf_cnpj: '987.654.321-00', endereco: 'Av. Paulista, 1000', cidade: 'São Paulo', estado: 'SP', cep: '01310-100' },
        { nome: 'Fernanda Lima', telefone: '(11) 93456-7890', email: 'fernanda.lima@email.com', cpf_cnpj: '456.789.123-00', endereco: 'Rua Augusta, 500', cidade: 'São Paulo', estado: 'SP', cep: '01305-000' },
        { nome: 'Roberto Alves', telefone: '(11) 94567-8901', email: 'roberto.alves@email.com', cpf_cnpj: '12.345.678/0001-90', endereco: 'Rua Consolação, 200', cidade: 'São Paulo', estado: 'SP', cep: '01301-000' }
      ];

      for (const c of clientes) {
        await supabase.from('clientes').insert([{ ...c, user_id: user.id }]);
      }

      // Funcionários
      const funcionarios = [
        { nome: 'Antonio Marceneiro', tipo: 'MARCENEIRO', telefone: '(11) 98111-2222', salario: 3500.00 },
        { nome: 'José Montador', tipo: 'MONTADOR', telefone: '(11) 98222-3333', salario: 2800.00 },
        { nome: 'Paula Projetista', tipo: 'PROJETISTA', telefone: '(11) 98333-4444', salario: 4200.00 },
        { nome: 'Lucas Marceneiro', tipo: 'MARCENEIRO', telefone: '(11) 98444-5555', salario: 3200.00 }
      ];

      for (const f of funcionarios) {
        await supabase.from('funcionarios').insert([{ ...f, user_id: user.id, ativo: true }]);
      }

      // Materiais
      const materiais: Array<{
        nome: string;
        codigo: string;
        tipo: 'MADEIRA' | 'FERRAGEM' | 'ACABAMENTO' | 'FERRAMENTA' | 'OUTROS';
        unidade: 'UNIDADE' | 'METRO' | 'METRO_QUADRADO' | 'KILO' | 'LITRO' | 'PACOTE';
        preco_medio: number;
      }> = [
        { nome: 'MDF 15mm Branco', codigo: 'MDF-15-BR', tipo: 'MADEIRA', unidade: 'METRO_QUADRADO', preco_medio: 85.00 },
        { nome: 'MDP 18mm Branco', codigo: 'MDP-18-BR', tipo: 'MADEIRA', unidade: 'METRO_QUADRADO', preco_medio: 95.00 },
        { nome: 'Dobradiça Caneco 35mm', codigo: 'DBC-35', tipo: 'FERRAGEM', unidade: 'UNIDADE', preco_medio: 8.50 },
        { nome: 'Corrediça Telescópica 45cm', codigo: 'CRT-45', tipo: 'FERRAGEM', unidade: 'UNIDADE', preco_medio: 35.00 },
        { nome: 'Puxador Alça 128mm', codigo: 'PXA-128', tipo: 'ACABAMENTO', unidade: 'UNIDADE', preco_medio: 12.00 },
        { nome: 'Pé Nivelador Plástico', codigo: 'PNP-01', tipo: 'FERRAGEM', unidade: 'UNIDADE', preco_medio: 4.50 }
      ];

      const { data: materiaisInseridos } = await supabase
        .from('materiais')
        .insert(materiais.map(m => ({ ...m, user_id: user.id })))
        .select();

      // Fornecedores
      const fornecedores = [
        { nome: 'MadeiraMais Ltda', cnpj: '12.345.678/0001-90', telefone: '(11) 3000-1000', email: 'contato@madeiramais.com.br', tipo_material: 'Chapas MDF/MDP', cidade: 'São Paulo', estado: 'SP', prazo_entrega_medio: 7 },
        { nome: 'Ferragens Brasil', cnpj: '98.765.432/0001-10', telefone: '(11) 3000-2000', email: 'vendas@ferragensbrasil.com.br', tipo_material: 'Ferragens', cidade: 'São Paulo', estado: 'SP', prazo_entrega_medio: 5 }
      ];

      for (const f of fornecedores) {
        await supabase.from('fornecedores').insert([{ ...f, user_id: user.id, ativo: true }]);
      }

      // Estoque
      if (materiaisInseridos) {
        const estoqueData = materiaisInseridos.map(m => ({
          user_id: user.id,
          material_id: m.id,
          quantidade_atual: m.codigo?.includes('MDF') || m.codigo?.includes('MDP') ? 50 : 150,
          quantidade_minima: 20,
          quantidade_maxima: m.codigo?.includes('MDF') || m.codigo?.includes('MDP') ? 100 : 300
        }));

        await supabase.from('estoque').insert(estoqueData);
      }

      // Projetos de exemplo
      const { data: vendedoresData } = await supabase.from('vendedores').select('id, nome').eq('user_id', user.id).limit(1).single();
      const { data: clientesData } = await supabase.from('clientes').select('id, nome').eq('user_id', user.id);

      if (vendedoresData && clientesData && clientesData.length > 0) {
        const projetos: Array<{
          user_id: string;
          cod_projeto: string;
          nome_cliente: string;
          cliente_id?: string;
          telefone: string;
          ambiente: string;
          origem_lead: 'INDICACAO' | 'INSTAGRAM' | 'WHATSAPP' | 'FACEBOOK' | 'GOOGLE' | 'LOJA' | 'OUTROS';
          status: 'ORCAMENTO' | 'CONVERTIDO' | 'EM_PRODUCAO' | 'ENTREGUE' | 'CANCELADO';
          vendedor_responsavel: string;
          vendedor_id?: string;
          data_contato: string;
          data_venda?: string;
          valor_orcamento: number;
          valor_venda?: number;
          custo_materiais: number;
          custo_mao_obra: number;
          outros_custos?: number;
        }> = [
          {
            user_id: user.id,
            cod_projeto: 'PROJ-001',
            nome_cliente: clientesData[0].nome,
            cliente_id: clientesData[0].id,
            telefone: '(11) 91234-5678',
            ambiente: 'Cozinha',
            origem_lead: 'INDICACAO',
            status: 'CONVERTIDO',
            vendedor_responsavel: vendedoresData.nome,
            vendedor_id: vendedoresData.id,
            data_contato: '2025-09-15',
            data_venda: '2025-09-20',
            valor_orcamento: 15000.00,
            valor_venda: 14500.00,
            custo_materiais: 8000.00,
            custo_mao_obra: 3000.00,
            outros_custos: 500.00
          },
          {
            user_id: user.id,
            cod_projeto: 'PROJ-002',
            nome_cliente: clientesData[1]?.nome || 'Cliente Teste',
            cliente_id: clientesData[1]?.id,
            telefone: '(11) 92345-6789',
            ambiente: 'Closet',
            origem_lead: 'INSTAGRAM',
            status: 'ORCAMENTO',
            vendedor_responsavel: vendedoresData.nome,
            vendedor_id: vendedoresData.id,
            data_contato: '2025-10-01',
            valor_orcamento: 8500.00,
            custo_materiais: 4500.00,
            custo_mao_obra: 2000.00
          },
          {
            user_id: user.id,
            cod_projeto: 'PROJ-003',
            nome_cliente: clientesData[2]?.nome || 'Cliente Teste 2',
            cliente_id: clientesData[2]?.id,
            telefone: '(11) 93456-7890',
            ambiente: 'Banheiro',
            origem_lead: 'WHATSAPP',
            status: 'CONVERTIDO',
            vendedor_responsavel: vendedoresData.nome,
            vendedor_id: vendedoresData.id,
            data_contato: '2025-09-25',
            data_venda: '2025-09-30',
            valor_orcamento: 12000.00,
            valor_venda: 11800.00,
            custo_materiais: 6000.00,
            custo_mao_obra: 2500.00,
            outros_custos: 300.00
          }
        ];

        await supabase.from('projects').insert(projetos);
      }

      toast({
        title: 'Sucesso!',
        description: 'Dados de teste inseridos com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao popular dados:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível inserir os dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Popular Dados de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta função irá inserir dados de exemplo no sistema para facilitar os testes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>3 Vendedores</li>
              <li>4 Clientes</li>
              <li>4 Funcionários</li>
              <li>6 Materiais com estoque</li>
              <li>2 Fornecedores</li>
              <li>3 Projetos de exemplo</li>
            </ul>
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm font-medium text-muted-foreground">
                ⚠️ Atenção: Esta ação não pode ser desfeita automaticamente. 
                Você precisará excluir os dados manualmente se necessário.
              </p>
            </div>
            <Button 
              onClick={popularDados} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Inserindo dados...' : 'Popular Dados de Teste'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DadosTeste;
