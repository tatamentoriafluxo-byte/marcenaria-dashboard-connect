import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const NovoProjeto = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [parceiros, setParceiros] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cod_projeto: '',
    data_contato: new Date().toISOString().split('T')[0],
    vendedor_responsavel: '',
    nome_cliente: '',
    telefone: '',
    origem_lead: 'LOJA',
    ambiente: '',
    valor_orcamento: '',
    custo_materiais: '',
    custo_mao_obra: '',
    outros_custos: '',
    status: 'ORCAMENTO',
    data_venda: '',
    valor_venda: '',
    prazo_entrega: '',
    data_entrega: '',
    visualizado_cliente: false,
    preencheu_formulario: false,
    parceiro_id: '',
    comissao_parceiro: '',
  });

  useEffect(() => {
    if (user) {
      loadParceiros();
      loadVendedores();
    }
  }, [user]);

  const loadParceiros = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('parceiros')
      .select('*')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .order('nome');
    setParceiros(data || []);
  };

  const loadVendedores = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vendedores')
      .select('*')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .order('nome');
    setVendedores(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const valorVenda = formData.valor_venda ? parseFloat(formData.valor_venda) : null;
      const comissaoParceiro = formData.parceiro_id && valorVenda
        ? (valorVenda * (parseFloat(formData.comissao_parceiro) || 0)) / 100
        : 0;

      const { error } = await supabase.from('projects').insert([
        {
          user_id: user.id,
          cod_projeto: formData.cod_projeto,
          data_contato: formData.data_contato,
          vendedor_responsavel: formData.vendedor_responsavel,
          nome_cliente: formData.nome_cliente,
          telefone: formData.telefone,
          origem_lead: formData.origem_lead as any,
          ambiente: formData.ambiente,
          valor_orcamento: parseFloat(formData.valor_orcamento) || 0,
          custo_materiais: parseFloat(formData.custo_materiais) || 0,
          custo_mao_obra: parseFloat(formData.custo_mao_obra) || 0,
          outros_custos: parseFloat(formData.outros_custos) || 0,
          status: formData.status as any,
          valor_venda: valorVenda,
          prazo_entrega: formData.prazo_entrega ? parseInt(formData.prazo_entrega) : null,
          data_venda: formData.data_venda || null,
          data_entrega: formData.data_entrega || null,
          visualizado_cliente: formData.visualizado_cliente,
          preencheu_formulario: formData.preencheu_formulario,
          parceiro_id: formData.parceiro_id && formData.parceiro_id !== 'none' ? formData.parceiro_id : null,
          comissao_parceiro: comissaoParceiro,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Projeto criado!',
        description: 'O projeto foi cadastrado com sucesso.',
      });

      navigate('/projetos');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar projeto',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/projetos')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Novo Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cod_projeto">Código do Projeto *</Label>
                  <Input
                    id="cod_projeto"
                    value={formData.cod_projeto}
                    onChange={(e) => handleChange('cod_projeto', e.target.value)}
                    required
                    placeholder="Ex: G2401"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_contato">Data do Contato *</Label>
                  <Input
                    id="data_contato"
                    type="date"
                    value={formData.data_contato}
                    onChange={(e) => handleChange('data_contato', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendedor_responsavel">Vendedor Responsável *</Label>
                  <Select
                    value={formData.vendedor_responsavel}
                    onValueChange={(value) => handleChange('vendedor_responsavel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.length === 0 ? (
                        <SelectItem value="sem_vendedores" disabled>
                          Nenhum vendedor cadastrado
                        </SelectItem>
                      ) : (
                        vendedores.map((v) => (
                          <SelectItem key={v.id} value={v.nome}>
                            {v.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {vendedores.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Cadastre vendedores em Configurações → Vendedores
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_cliente">Nome do Cliente *</Label>
                  <Input
                    id="nome_cliente"
                    value={formData.nome_cliente}
                    onChange={(e) => handleChange('nome_cliente', e.target.value)}
                    required
                    placeholder="Nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origem_lead">Origem do Lead *</Label>
                  <Select
                    value={formData.origem_lead}
                    onValueChange={(value) => handleChange('origem_lead', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOJA">Loja</SelectItem>
                      <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                      <SelectItem value="FACEBOOK">Facebook</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="INDICACAO">Indicação</SelectItem>
                      <SelectItem value="GOOGLE">Google</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ambiente">Ambiente *</Label>
                  <Input
                    id="ambiente"
                    value={formData.ambiente}
                    onChange={(e) => handleChange('ambiente', e.target.value)}
                    required
                    placeholder="Ex: Cozinha, Quarto, Apartamento Completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_orcamento">Valor do Orçamento (R$) *</Label>
                  <Input
                    id="valor_orcamento"
                    type="number"
                    step="0.01"
                    value={formData.valor_orcamento}
                    onChange={(e) => handleChange('valor_orcamento', e.target.value)}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custo_materiais">Custo dos Materiais (R$)</Label>
                  <Input
                    id="custo_materiais"
                    type="number"
                    step="0.01"
                    value={formData.custo_materiais}
                    onChange={(e) => handleChange('custo_materiais', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custo_mao_obra">Custo da Mão de Obra (R$)</Label>
                  <Input
                    id="custo_mao_obra"
                    type="number"
                    step="0.01"
                    value={formData.custo_mao_obra}
                    onChange={(e) => handleChange('custo_mao_obra', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outros_custos">Outros Custos (R$)</Label>
                  <Input
                    id="outros_custos"
                    type="number"
                    step="0.01"
                    value={formData.outros_custos}
                    onChange={(e) => handleChange('outros_custos', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status do Projeto *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORCAMENTO">Orçamento</SelectItem>
                      <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                      <SelectItem value="EM_PRODUCAO">Em Produção</SelectItem>
                      <SelectItem value="ENTREGUE">Entregue</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_venda">Data da Venda</Label>
                  <Input
                    id="data_venda"
                    type="date"
                    value={formData.data_venda}
                    onChange={(e) => handleChange('data_venda', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_venda">Valor da Venda (R$)</Label>
                  <Input
                    id="valor_venda"
                    type="number"
                    step="0.01"
                    value={formData.valor_venda}
                    onChange={(e) => handleChange('valor_venda', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prazo_entrega">Prazo de Entrega (dias)</Label>
                  <Input
                    id="prazo_entrega"
                    type="number"
                    value={formData.prazo_entrega}
                    onChange={(e) => handleChange('prazo_entrega', e.target.value)}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_entrega">Data da Entrega</Label>
                  <Input
                    id="data_entrega"
                    type="date"
                    value={formData.data_entrega}
                    onChange={(e) => handleChange('data_entrega', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parceiro_id">Parceiro</Label>
                  <Select
                    value={formData.parceiro_id}
                    onValueChange={(value) => {
                      const parceiro = parceiros.find(p => p.id === value);
                      handleChange('parceiro_id', value);
                      handleChange('comissao_parceiro', parceiro?.percentual_comissao || '0');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um parceiro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem parceiro</SelectItem>
                      {parceiros.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} ({p.percentual_comissao}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comissao_parceiro">% Comissão</Label>
                  <Input
                    id="comissao_parceiro"
                    type="number"
                    step="0.01"
                    value={formData.comissao_parceiro}
                    onChange={(e) => handleChange('comissao_parceiro', e.target.value)}
                    disabled={!formData.parceiro_id}
                    placeholder="0.00"
                  />
                </div>

                {/* Seção destacada para acompanhamento do cliente */}
                <div className="md:col-span-2 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-4">
                  <p className="text-sm font-medium text-primary">
                    📊 Campos importantes para métricas do Dashboard
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-3 p-3 bg-background rounded-md border">
                      <Switch
                        id="visualizado_cliente"
                        checked={formData.visualizado_cliente}
                        onCheckedChange={(checked) => handleChange('visualizado_cliente', checked)}
                      />
                      <div>
                        <Label htmlFor="visualizado_cliente" className="font-medium">
                          Visualizado pelo cliente
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Marque quando o cliente visualizar o orçamento
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-background rounded-md border">
                      <Switch
                        id="preencheu_formulario"
                        checked={formData.preencheu_formulario}
                        onCheckedChange={(checked) => handleChange('preencheu_formulario', checked)}
                      />
                      <div>
                        <Label htmlFor="preencheu_formulario" className="font-medium">
                          Preencheu formulário
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Marque quando o cliente preencher o formulário
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : 'Salvar Projeto'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/projetos')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NovoProjeto;
