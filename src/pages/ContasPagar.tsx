import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Fornecedor {
  id: string;
  nome: string;
}

interface Conta {
  id: string;
  tipo: string;
  numero_documento: string;
  tipo_documento: string;
  descricao: string;
  fornecedor_id: string;
  fornecedores: { nome: string } | null;
  valor_total: number;
  valor_pago: number;
  saldo_devedor: number;
  status: string;
  data_emissao: string;
  data_vencimento: string;
  observacoes: string;
}

interface Parcela {
  id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  valor_pago: number;
  status: string;
}

interface Pagamento {
  id: string;
  data_pagamento: string;
  valor: number;
  forma_pagamento: string;
  observacoes: string;
}

export default function ContasPagar() {
  const { user } = useAuth();
  const [contas, setContas] = useState<Conta[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  
  const [formData, setFormData] = useState({
    fornecedor_id: "",
    descricao: "",
    numero_documento: "",
    tipo_documento: "OUTRO",
    valor_total: "",
    data_emissao: format(new Date(), 'yyyy-MM-dd'),
    data_vencimento: format(new Date(), 'yyyy-MM-dd'),
    observacoes: "",
    num_parcelas: "1",
    intervalo_dias: "30",
  });

  const [pagamentoData, setFormaPagamentoData] = useState({
    parcela_id: "",
    data_pagamento: format(new Date(), 'yyyy-MM-dd'),
    valor: "",
    forma_pagamento: "DINHEIRO",
    observacoes: "",
  });

  useEffect(() => {
    if (user) {
      loadFornecedores();
      loadContas();
    }
  }, [user]);

  const loadFornecedores = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from("fornecedores")
      .select("id, nome")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .order("nome");

    if (error) {
      toast({ title: "Erro ao carregar fornecedores", variant: "destructive" });
    } else {
      setFornecedores(data || []);
    }
  };

  const loadContas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contas")
      .select(`
        *,
        fornecedores!contas_fornecedor_fkey(nome)
      `)
      .eq("user_id", user!.id)
      .eq("tipo", "PAGAR")
      .order("data_vencimento", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar contas", variant: "destructive" });
    } else {
      setContas(data || []);
    }
    setLoading(false);
  };

  const loadParcelas = async (contaId: string) => {
    const { data, error } = await supabase
      .from("parcelas")
      .select("*")
      .eq("conta_id", contaId)
      .order("numero_parcela");

    if (!error && data) {
      setParcelas(data);
    }
  };

  const loadPagamentos = async (contaId: string) => {
    const { data, error } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("conta_id", contaId)
      .order("data_pagamento", { ascending: false });

    if (!error && data) {
      setPagamentos(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fornecedor_id) {
      toast({ title: "Selecione um fornecedor", variant: "destructive" });
      return;
    }
    
    const { error: contaError, data: contaData } = await supabase
      .from("contas")
      .insert({
        user_id: user!.id,
        tipo: "PAGAR",
        fornecedor_id: formData.fornecedor_id,
        descricao: formData.descricao,
        numero_documento: formData.numero_documento,
        tipo_documento: formData.tipo_documento as any,
        valor_total: parseFloat(formData.valor_total),
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        observacoes: formData.observacoes,
      } as any)
      .select()
      .single();

    if (contaError) {
      toast({ title: "Erro ao criar conta", variant: "destructive" });
      return;
    }

    // Gerar parcelas
    const numParcelas = parseInt(formData.num_parcelas);
    const valorParcela = parseFloat(formData.valor_total) / numParcelas;
    const intervalo = parseInt(formData.intervalo_dias);
    const parcelas = [];

    for (let i = 0; i < numParcelas; i++) {
      const dataVenc = new Date(formData.data_vencimento);
      dataVenc.setDate(dataVenc.getDate() + (i * intervalo));
      
      parcelas.push({
        conta_id: contaData.id,
        numero_parcela: i + 1,
        valor_parcela: valorParcela,
        data_vencimento: format(dataVenc, 'yyyy-MM-dd'),
      });
    }

    const { error: parcelasError } = await supabase
      .from("parcelas")
      .insert(parcelas);

    if (parcelasError) {
      toast({ title: "Erro ao gerar parcelas", variant: "destructive" });
      return;
    }

    toast({ title: "Conta a pagar criada com sucesso!" });
    setIsModalOpen(false);
    resetForm();
    loadContas();
  };

  const handleRegistrarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("pagamentos")
      .insert({
        user_id: user!.id,
        conta_id: selectedConta!.id,
        parcela_id: pagamentoData.parcela_id || null,
        data_pagamento: pagamentoData.data_pagamento,
        valor: parseFloat(pagamentoData.valor),
        forma_pagamento: pagamentoData.forma_pagamento as any,
        observacoes: pagamentoData.observacoes,
      } as any);

    if (error) {
      toast({ title: "Erro ao registrar pagamento", variant: "destructive" });
      return;
    }

    toast({ title: "Pagamento registrado com sucesso!" });
    setIsPagamentoModalOpen(false);
    setFormaPagamentoData({
      parcela_id: "",
      data_pagamento: format(new Date(), 'yyyy-MM-dd'),
      valor: "",
      forma_pagamento: "DINHEIRO",
      observacoes: "",
    });
    loadContas();
    if (selectedConta) {
      loadParcelas(selectedConta.id);
      loadPagamentos(selectedConta.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta conta?")) return;

    const { error } = await supabase.from("contas").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir conta", variant: "destructive" });
    } else {
      toast({ title: "Conta excluída com sucesso!" });
      loadContas();
    }
  };

  const resetForm = () => {
    setFormData({
      fornecedor_id: "",
      descricao: "",
      numero_documento: "",
      tipo_documento: "OUTRO",
      valor_total: "",
      data_emissao: format(new Date(), 'yyyy-MM-dd'),
      data_vencimento: format(new Date(), 'yyyy-MM-dd'),
      observacoes: "",
      num_parcelas: "1",
      intervalo_dias: "30",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ABERTA: "secondary",
      PAGA_PARCIAL: "outline",
      PAGA_TOTAL: "default",
      VENCIDA: "destructive",
      CANCELADA: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const filteredContas = contas.filter((conta) => {
    const matchesSearch = 
      conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "TODAS" || conta.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contas a Pagar</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Conta a Pagar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="geral">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                  <TabsTrigger value="parcelas">Parcelas</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fornecedor *</Label>
                      <Select value={formData.fornecedor_id} onValueChange={(v) => setFormData({...formData, fornecedor_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {fornecedores.map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo Documento</Label>
                      <Select value={formData.tipo_documento} onValueChange={(v) => setFormData({...formData, tipo_documento: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                          <SelectItem value="BOLETO">Boleto</SelectItem>
                          <SelectItem value="CONTRATO">Contrato</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="RECIBO">Recibo</SelectItem>
                          <SelectItem value="OUTRO">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número Documento</Label>
                      <Input value={formData.numero_documento} onChange={(e) => setFormData({...formData, numero_documento: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Total *</Label>
                      <Input type="number" step="0.01" value={formData.valor_total} onChange={(e) => setFormData({...formData, valor_total: e.target.value})} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Emissão</Label>
                      <Input type="date" value={formData.data_emissao} onChange={(e) => setFormData({...formData, data_emissao: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <Label>Data Vencimento *</Label>
                      <Input type="date" value={formData.data_vencimento} onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} />
                  </div>
                </TabsContent>

                <TabsContent value="parcelas" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número de Parcelas</Label>
                      <Input type="number" min="1" value={formData.num_parcelas} onChange={(e) => setFormData({...formData, num_parcelas: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <Label>Intervalo (dias)</Label>
                      <Input type="number" min="1" value={formData.intervalo_dias} onChange={(e) => setFormData({...formData, intervalo_dias: e.target.value})} />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Valor por parcela:</strong> {formData.valor_total ? formatCurrency(parseFloat(formData.valor_total) / parseInt(formData.num_parcelas)) : "R$ 0,00"}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou número do documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="ABERTA">Aberta</SelectItem>
                <SelectItem value="PAGA_PARCIAL">Paga Parcial</SelectItem>
                <SelectItem value="PAGA_TOTAL">Paga Total</SelectItem>
                <SelectItem value="VENCIDA">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center">Carregando...</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell>{conta.fornecedores?.nome || "-"}</TableCell>
                  <TableCell>{conta.descricao}</TableCell>
                  <TableCell>{formatCurrency(conta.valor_total)}</TableCell>
                  <TableCell>{formatCurrency(conta.valor_pago)}</TableCell>
                  <TableCell>{formatCurrency(conta.saldo_devedor)}</TableCell>
                  <TableCell>{getStatusBadge(conta.status)}</TableCell>
                  <TableCell>{format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedConta(conta);
                          loadParcelas(conta.id);
                          loadPagamentos(conta.id);
                          setIsPagamentoModalOpen(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(conta.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={isPagamentoModalOpen} onOpenChange={setIsPagamentoModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          
          {selectedConta && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p><strong>Conta:</strong> {selectedConta.descricao}</p>
                <p><strong>Saldo Devedor:</strong> {formatCurrency(selectedConta.saldo_devedor)}</p>
              </div>

              <form onSubmit={handleRegistrarPagamento} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parcela (opcional)</Label>
                    <Select value={pagamentoData.parcela_id} onValueChange={(v) => setFormaPagamentoData({...pagamentoData, parcela_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a parcela" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma (pagamento geral)</SelectItem>
                        {parcelas.filter(p => p.status !== 'PAGA').map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            Parcela {p.numero_parcela} - {formatCurrency(p.valor_parcela)} - Venc: {format(new Date(p.data_vencimento), 'dd/MM/yyyy')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Pagamento *</Label>
                    <Input type="date" value={pagamentoData.data_pagamento} onChange={(e) => setFormaPagamentoData({...pagamentoData, data_pagamento: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor *</Label>
                    <Input type="number" step="0.01" value={pagamentoData.valor} onChange={(e) => setFormaPagamentoData({...pagamentoData, valor: e.target.value})} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Forma de Pagamento *</Label>
                    <Select value={pagamentoData.forma_pagamento} onValueChange={(v) => setFormaPagamentoData({...pagamentoData, forma_pagamento: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                        <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                        <SelectItem value="BOLETO">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={pagamentoData.observacoes} onChange={(e) => setFormaPagamentoData({...pagamentoData, observacoes: e.target.value})} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsPagamentoModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar Pagamento</Button>
                </div>
              </form>

              {pagamentos.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Histórico de Pagamentos</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Forma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagamentos.map((pag) => (
                        <TableRow key={pag.id}>
                          <TableCell>{format(new Date(pag.data_pagamento), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{formatCurrency(pag.valor)}</TableCell>
                          <TableCell>{pag.forma_pagamento}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
