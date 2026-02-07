import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react";
import { SelecionarItemDialog } from "@/components/orcamentos/SelecionarItemDialog";

type OrcamentoItem = {
  id?: string;
  catalogo_item_id?: string;
  nome_item: string;
  descricao?: string;
  quantidade: number;
  unidade_medida: string;
  preco_unitario: number;
  subtotal: number;
  ordem: number;
  tipo_calculo: 'UNITARIO' | 'METRO_QUADRADO';
  quantidade_pecas?: number;
  largura_metros?: number;
  altura_metros?: number;
  area_m2?: number;
};

export default function NovoOrcamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [projetista, setProjetista] = useState("");
  const [vendedorId, setVendedorId] = useState<string | null>(null);
  const [descontoPercentual, setDescontoPercentual] = useState(0);
  const [descontoValor, setDescontoValor] = useState(0);
  const [itens, setItens] = useState<OrcamentoItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prazoEntregaDias, setPrazoEntregaDias] = useState(15);
  const [formaPagamento, setFormaPagamento] = useState("50% entrada + saldo em 1x");
  const [entradaPercentual, setEntradaPercentual] = useState(50);
  const [numParcelas, setNumParcelas] = useState(1);

  // Buscar clientes para autocomplete
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user!.id)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Buscar vendedores
  const { data: vendedores = [] } = useQuery({
    queryKey: ["vendedores", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendedores")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Carregar orçamento existente se estiver editando
  useQuery({
    queryKey: ["orcamento", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: orcamento, error: orcError } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("id", id)
        .single();

      if (orcError) throw orcError;

      const { data: orcItens, error: itensError } = await supabase
        .from("orcamentos_itens")
        .select("*")
        .eq("orcamento_id", id)
        .order("ordem");

      if (itensError) throw itensError;

      // Mapear itens com tipos corretos
      const itensFormatados = orcItens.map((item: any) => ({
        ...item,
        tipo_calculo: item.tipo_calculo as 'UNITARIO' | 'METRO_QUADRADO',
      }));

      setNomeCliente(orcamento.nome_cliente);
      setTelefoneCliente(orcamento.telefone_cliente || "");
      setEmailCliente(orcamento.email_cliente || "");
      setClienteId(orcamento.cliente_id);
      setObservacoes(orcamento.observacoes || "");
      setProjetista(orcamento.projetista || "");
      setVendedorId(orcamento.vendedor_id);
      setDescontoPercentual(orcamento.desconto_percentual);
      setDescontoValor(orcamento.desconto_valor);
      setPrazoEntregaDias(orcamento.prazo_entrega_dias || 15);
      setFormaPagamento(orcamento.forma_pagamento || "50% entrada + saldo em 1x");
      setEntradaPercentual(orcamento.entrada_percentual || 50);
      setNumParcelas(orcamento.num_parcelas || 1);
      setItens(itensFormatados);

      return orcamento;
    },
    enabled: !!id,
  });

  const valorSubtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const valorDesconto = descontoValor + (valorSubtotal * descontoPercentual / 100);
  const valorTotal = Math.max(valorSubtotal - valorDesconto, 0);

  const saveMutation = useMutation({
    mutationFn: async (status: string) => {
      // Se selecionou cliente existente mas não criou, validar
      if (clienteId) {
        // Usar cliente existente
      } else if (nomeCliente && telefoneCliente) {
        // Criar novo cliente
        const { data: novoCliente, error: clienteError } = await supabase
          .from("clientes")
          .insert({
            user_id: user!.id,
            nome: nomeCliente,
            telefone: telefoneCliente,
            email: emailCliente || null,
          })
          .select()
          .single();
        
        if (clienteError) throw clienteError;
        setClienteId(novoCliente.id);
      }

      // Calcular os totais antes de salvar
      const subtotalCalculado = itens.reduce((sum, item) => {
        if (item.tipo_calculo === 'METRO_QUADRADO') {
          const qtdPecas = item.quantidade_pecas || 1;
          const largura = item.largura_metros || 0;
          const altura = item.altura_metros || 0;
          return sum + (qtdPecas * largura * altura * item.preco_unitario);
        }
        return sum + (item.quantidade * item.preco_unitario);
      }, 0);
      const descontoCalculado = descontoValor + (subtotalCalculado * descontoPercentual / 100);
      const totalCalculado = Math.max(subtotalCalculado - descontoCalculado, 0);

      const orcamentoData = {
        user_id: user!.id,
        nome_cliente: nomeCliente,
        telefone_cliente: telefoneCliente,
        email_cliente: emailCliente,
        cliente_id: clienteId,
        vendedor_id: vendedorId,
        projetista,
        observacoes,
        desconto_percentual: descontoPercentual,
        desconto_valor: descontoValor,
        prazo_entrega_dias: prazoEntregaDias,
        forma_pagamento: formaPagamento,
        entrada_percentual: entradaPercentual,
        num_parcelas: numParcelas,
        valor_subtotal: subtotalCalculado,
        valor_total: totalCalculado,
        status,
      } as any;

      let orcamentoId = id;

      if (id) {
        // Atualizar orçamento existente
        const { error } = await supabase
          .from("orcamentos")
          .update(orcamentoData as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        // Criar novo orçamento
        const { data, error } = await supabase
          .from("orcamentos")
          .insert([orcamentoData])
          .select()
          .single();
        if (error) throw error;
        orcamentoId = data.id;
      }

      // Deletar itens antigos
      await supabase.from("orcamentos_itens").delete().eq("orcamento_id", orcamentoId);

      // Inserir novos itens
      const itensParaInserir = itens.map((item, index) => ({
        orcamento_id: orcamentoId,
        catalogo_item_id: item.catalogo_item_id,
        nome_item: item.nome_item,
        descricao: item.descricao,
        quantidade: item.quantidade,
        unidade_medida: item.unidade_medida,
        preco_unitario: item.preco_unitario,
        tipo_calculo: item.tipo_calculo || 'UNITARIO',
        quantidade_pecas: item.quantidade_pecas || 1,
        largura_metros: item.largura_metros,
        altura_metros: item.altura_metros,
        ordem: index,
      }));

      const { error: itensError } = await supabase
        .from("orcamentos_itens")
        .insert(itensParaInserir as any[]);
      
      if (itensError) throw itensError;

      return orcamentoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success(id ? "Orçamento atualizado!" : "Orçamento criado!");
      navigate("/orcamentos");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar orçamento");
    },
  });

  const adicionarItem = (item: any) => {
    const novoItem: OrcamentoItem = {
      catalogo_item_id: item.id,
      nome_item: item.nome,
      descricao: item.descricao,
      quantidade: 1,
      unidade_medida: item.unidade_medida,
      preco_unitario: item.preco_base,
      subtotal: item.preco_base,
      ordem: itens.length,
      tipo_calculo: 'METRO_QUADRADO',
      quantidade_pecas: 1,
      largura_metros: undefined,
      altura_metros: undefined,
    };
    setItens([...itens, novoItem]);
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    
    const item = novosItens[index];
    
    // Recalcular subtotal baseado no tipo de cálculo
    if (item.tipo_calculo === 'METRO_QUADRADO') {
      const qtdPecas = item.quantidade_pecas || 1;
      const largura = item.largura_metros || 0;
      const altura = item.altura_metros || 0;
      const area = qtdPecas * largura * altura;
      novosItens[index].area_m2 = area;
      novosItens[index].subtotal = area * item.preco_unitario;
    } else {
      novosItens[index].subtotal = item.quantidade * item.preco_unitario;
    }
    
    setItens(novosItens);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orcamentos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {id ? "Editar Orçamento" : "Novo Orçamento"}
          </h1>
          <p className="text-muted-foreground">Preencha os dados do orçamento</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cliente Existente (opcional)</Label>
              <Select value={clienteId || "novo"} onValueChange={(val) => {
                if (val === "novo") {
                  setClienteId(null);
                  setNomeCliente("");
                  setTelefoneCliente("");
                  setEmailCliente("");
                } else {
                  setClienteId(val);
                  const cliente = clientes.find(c => c.id === val);
                  if (cliente) {
                    setNomeCliente(cliente.nome);
                    setTelefoneCliente(cliente.telefone || "");
                    setEmailCliente(cliente.email || "");
                  }
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente ou deixe vazio para criar novo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo cliente</SelectItem>
                  {clientes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>Telefone *</Label>
                <Input
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={emailCliente}
                  onChange={(e) => setEmailCliente(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label>Projetista</Label>
                <Input
                  value={projetista}
                  onChange={(e) => setProjetista(e.target.value)}
                  placeholder="Nome do projetista"
                />
              </div>
              <div>
                <Label>Vendedor</Label>
                <Select value={vendedorId || ""} onValueChange={setVendedorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedores.map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Validade (dias)</Label>
                <Input
                  type="number"
                  value={prazoEntregaDias}
                  onChange={(e) => setPrazoEntregaDias(parseInt(e.target.value) || 15)}
                  placeholder="15"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Itens do Orçamento</span>
              <Button onClick={() => setDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {itens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item adicionado
              </div>
            ) : (
              <div className="space-y-4">
                {itens.map((item, index) => (
                  <div key={index} className="border-b pb-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Label>Item</Label>
                        <div className="font-medium">{item.nome_item}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Label className="text-xs">Tipo de Cálculo:</Label>
                      <Select 
                        value={item.tipo_calculo} 
                        onValueChange={(val: 'UNITARIO' | 'METRO_QUADRADO') => atualizarItem(index, "tipo_calculo", val)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNITARIO">Unitário</SelectItem>
                          <SelectItem value="METRO_QUADRADO">Metro Quadrado (M²)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {item.tipo_calculo === 'METRO_QUADRADO' ? (
                      <div className="grid grid-cols-6 gap-2">
                        <div>
                          <Label className="text-xs">Qtd. Peças</Label>
                          <Input
                            type="number"
                            step="1"
                            value={item.quantidade_pecas || 1}
                            onChange={(e) => atualizarItem(index, "quantidade_pecas", parseFloat(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Largura (m)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.largura_metros || ""}
                            onChange={(e) => atualizarItem(index, "largura_metros", parseFloat(e.target.value) || 0)}
                            placeholder="2.40"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Altura (m)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.altura_metros || ""}
                            onChange={(e) => atualizarItem(index, "altura_metros", parseFloat(e.target.value) || 0)}
                            placeholder="0.60"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Área (M²)</Label>
                          <div className="h-10 flex items-center font-medium text-sm bg-muted px-3 rounded-md">
                            {(item.area_m2 || 0).toFixed(2)} m²
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Preço/M²</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.preco_unitario}
                            onChange={(e) => atualizarItem(index, "preco_unitario", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Subtotal</Label>
                          <div className="h-10 flex items-center font-medium text-sm">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.subtotal)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(index, "quantidade", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Preço Unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.preco_unitario}
                            onChange={(e) => atualizarItem(index, "preco_unitario", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Subtotal</Label>
                          <div className="h-10 flex items-center font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.subtotal)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totais e Descontos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={descontoPercentual}
                  onChange={(e) => setDescontoPercentual(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={descontoValor}
                  onChange={(e) => setDescontoValor(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(valorSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto:</span>
                <span className="text-destructive">
                  -{new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(valorDesconto)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(valorTotal)}
                </span>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações do orçamento..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/orcamentos")}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate("RASCUNHO")}
            disabled={!nomeCliente || itens.length === 0 || saveMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
          </Button>
          <Button
            onClick={() => saveMutation.mutate("ENVIADO")}
            disabled={!nomeCliente || itens.length === 0 || saveMutation.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Salvando..." : "Finalizar Orçamento"}
          </Button>
        </div>
      </div>

      <SelecionarItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={adicionarItem}
      />
    </div>
  );
}
