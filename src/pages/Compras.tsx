import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Compras = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [compras, setCompras] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [materiais, setMateriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<any>(null);
  const [itensCompra, setItensCompra] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fornecedor_id: '',
    data_compra: new Date(),
    data_entrega_prevista: null as Date | null,
    observacoes: '',
    status: 'PENDENTE',
    ordem_compra: ''
  });
  const [novoItem, setNovoItem] = useState({
    material_id: '',
    quantidade: '',
    preco_unitario: ''
  });

  const statusOptions = [
    { value: 'PENDENTE', label: 'Pendente', color: 'bg-muted text-muted-foreground' },
    { value: 'CONFIRMADO', label: 'Confirmado', color: 'bg-primary/10 text-primary' },
    { value: 'EM_TRANSITO', label: 'Em Trânsito', color: 'bg-gold/10 text-gold' },
    { value: 'ENTREGUE', label: 'Entregue', color: 'bg-accent/10 text-accent' },
    { value: 'CANCELADO', label: 'Cancelado', color: 'bg-destructive/10 text-destructive' }
  ];

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [comprasResult, fornecedoresResult, materiaisResult] = await Promise.all([
        supabase
          .from('compras')
          .select(`
            *,
            fornecedores (
              nome
            )
          `)
          .eq('user_id', user.id)
          .order('data_compra', { ascending: false }),
        supabase
          .from('fornecedores')
          .select('*')
          .eq('user_id', user.id)
          .eq('ativo', true)
          .order('nome'),
        supabase
          .from('materiais')
          .select('*')
          .eq('user_id', user.id)
          .order('nome')
      ]);

      if (comprasResult.error) throw comprasResult.error;
      if (fornecedoresResult.error) throw fornecedoresResult.error;
      if (materiaisResult.error) throw materiaisResult.error;
      
      setCompras(comprasResult.data || []);
      setFornecedores(fornecedoresResult.data || []);
      setMateriais(materiaisResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = () => {
    if (!novoItem.material_id || !novoItem.quantidade || !novoItem.preco_unitario) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos do item',
        variant: 'destructive'
      });
      return;
    }

    const material = materiais.find(m => m.id === novoItem.material_id);
    const subtotal = parseFloat(novoItem.quantidade) * parseFloat(novoItem.preco_unitario);

    setItensCompra([...itensCompra, {
      material_id: novoItem.material_id,
      material_nome: material?.nome,
      quantidade: parseFloat(novoItem.quantidade),
      preco_unitario: parseFloat(novoItem.preco_unitario),
      subtotal
    }]);

    setNovoItem({ material_id: '', quantidade: '', preco_unitario: '' });
  };

  const removerItem = (index: number) => {
    setItensCompra(itensCompra.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return itensCompra.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!formData.fornecedor_id) {
      toast({
        title: 'Atenção',
        description: 'Selecione um fornecedor',
        variant: 'destructive'
      });
      return;
    }

    if (itensCompra.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Adicione pelo menos um item à compra',
        variant: 'destructive'
      });
      return;
    }

    try {
      const compraData = {
        fornecedor_id: formData.fornecedor_id,
        user_id: user.id,
        data_compra: format(formData.data_compra, 'yyyy-MM-dd'),
        data_entrega_prevista: formData.data_entrega_prevista ? format(formData.data_entrega_prevista, 'yyyy-MM-dd') : null,
        observacoes: formData.observacoes || null,
        status: formData.status as 'PENDENTE' | 'CONFIRMADO' | 'EM_TRANSITO' | 'ENTREGUE' | 'CANCELADO',
        ordem_compra: formData.ordem_compra || null,
        valor_total: calcularTotal()
      };

      const { data: compra, error: compraError } = await supabase
        .from('compras')
        .insert([compraData])
        .select()
        .single();

      if (compraError) throw compraError;

      const itensData = itensCompra.map(item => ({
        compra_id: compra.id,
        material_id: item.material_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal
      }));

      const { error: itensError } = await supabase
        .from('itens_compra')
        .insert(itensData);

      if (itensError) throw itensError;

      toast({ title: 'Compra cadastrada com sucesso!' });
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar compra:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a compra',
        variant: 'destructive'
      });
    }
  };

  const handleViewCompra = async (compra: any) => {
    try {
      const { data, error } = await supabase
        .from('itens_compra')
        .select(`
          *,
          materiais (
            nome,
            unidade
          )
        `)
        .eq('compra_id', compra.id);

      if (error) throw error;

      setSelectedCompra(compra);
      setItensCompra(data || []);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens da compra',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (compraId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'ENTREGUE') {
        updateData.data_entrega_real = format(new Date(), 'yyyy-MM-dd');
      }

      const { error } = await supabase
        .from('compras')
        .update(updateData)
        .eq('id', compraId);

      if (error) throw error;

      toast({ 
        title: 'Status atualizado!',
        description: newStatus === 'ENTREGUE' ? 'O estoque foi atualizado automaticamente' : undefined
      });
      loadData();
      
      if (viewDialogOpen && selectedCompra?.id === compraId) {
        setViewDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta compra?')) return;

    try {
      const { error } = await supabase
        .from('compras')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Compra excluída com sucesso!' });
      loadData();
    } catch (error) {
      console.error('Erro ao excluir compra:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a compra',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      fornecedor_id: '',
      data_compra: new Date(),
      data_entrega_prevista: null,
      observacoes: '',
      status: 'PENDENTE',
      ordem_compra: ''
    });
    setItensCompra([]);
    setNovoItem({ material_id: '', quantidade: '', preco_unitario: '' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const comprasPorStatus = statusOptions.map(status => ({
    status: status.label,
    count: compras.filter(c => c.status === status.value).length
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Compras</h1>
            <p className="text-muted-foreground mt-1">Gerencie pedidos de materiais</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Compra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="fornecedor">Fornecedor *</Label>
                    <Select value={formData.fornecedor_id} onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data da Compra *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.data_compra && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.data_compra ? format(formData.data_compra, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.data_compra}
                          onSelect={(date) => date && setFormData({ ...formData, data_compra: date })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Data Entrega Prevista</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.data_entrega_prevista && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.data_entrega_prevista ? format(formData.data_entrega_prevista, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.data_entrega_prevista || undefined}
                          onSelect={(date) => setFormData({ ...formData, data_entrega_prevista: date || null })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="ordem_compra">Ordem de Compra</Label>
                    <Input
                      id="ordem_compra"
                      value={formData.ordem_compra}
                      onChange={(e) => setFormData({ ...formData, ordem_compra: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Itens da Compra</h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <Select value={novoItem.material_id} onValueChange={(value) => setNovoItem({ ...novoItem, material_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materiais.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Quantidade"
                      value={novoItem.quantidade}
                      onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Preço Unitário"
                      value={novoItem.preco_unitario}
                      onChange={(e) => setNovoItem({ ...novoItem, preco_unitario: e.target.value })}
                    />
                    <Button type="button" onClick={adicionarItem}>Adicionar</Button>
                  </div>

                  {itensCompra.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead>Preço Unit.</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensCompra.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.material_nome}</TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>{formatCurrency(item.preco_unitario)}</TableCell>
                            <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removerItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">Total:</TableCell>
                          <TableCell className="font-bold">{formatCurrency(calcularTotal())}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Compra</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-5 mb-6">
          {comprasPorStatus.filter(s => s.count > 0).map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.status}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold text-primary">{item.count}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : compras.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma compra cadastrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Entrega Prevista</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map((compra) => (
                    <TableRow key={compra.id}>
                      <TableCell>{formatDate(compra.data_compra)}</TableCell>
                      <TableCell className="font-medium">{compra.fornecedores?.nome}</TableCell>
                      <TableCell>{formatCurrency(compra.valor_total)}</TableCell>
                      <TableCell>{formatDate(compra.data_entrega_prevista)}</TableCell>
                      <TableCell>{getStatusBadge(compra.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCompra(compra)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {compra.status === 'PENDENTE' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(compra.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Compra</DialogTitle>
            </DialogHeader>
            {selectedCompra && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fornecedor</Label>
                    <p className="font-medium">{selectedCompra.fornecedores?.nome}</p>
                  </div>
                  <div>
                    <Label>Data da Compra</Label>
                    <p>{formatDate(selectedCompra.data_compra)}</p>
                  </div>
                  <div>
                    <Label>Entrega Prevista</Label>
                    <p>{formatDate(selectedCompra.data_entrega_prevista)}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Select value={selectedCompra.status} onValueChange={(value) => handleUpdateStatus(selectedCompra.id, value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedCompra.observacoes && (
                    <div className="col-span-2">
                      <Label>Observações</Label>
                      <p>{selectedCompra.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Itens</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensCompra.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.materiais?.nome}</TableCell>
                          <TableCell>{item.quantidade} {item.materiais?.unidade}</TableCell>
                          <TableCell>{formatCurrency(item.preco_unitario)}</TableCell>
                          <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Total:</TableCell>
                        <TableCell className="font-bold">{formatCurrency(selectedCompra.valor_total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Compras;
