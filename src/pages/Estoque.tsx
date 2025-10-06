import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface EstoqueItem {
  id: string;
  material_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima: number | null;
  ultima_atualizacao: string;
  materiais?: {
    nome: string;
    codigo: string;
    unidade: string;
  };
}

const Estoque = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [materiais, setMateriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEstoque, setEditingEstoque] = useState<any>(null);
  const [formData, setFormData] = useState({
    material_id: '',
    quantidade_atual: '',
    quantidade_minima: '',
    quantidade_maxima: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [estoqueResult, materiaisResult] = await Promise.all([
        supabase
          .from('estoque')
          .select(`
            *,
            materiais (
              nome,
              codigo,
              unidade
            )
          `)
          .eq('user_id', user.id)
          .order('ultima_atualizacao', { ascending: false }),
        supabase
          .from('materiais')
          .select('*')
          .eq('user_id', user.id)
          .order('nome')
      ]);

      if (estoqueResult.error) throw estoqueResult.error;
      if (materiaisResult.error) throw materiaisResult.error;
      
      setEstoque(estoqueResult.data || []);
      setMateriais(materiaisResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o estoque',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const estoqueData = {
        material_id: formData.material_id,
        quantidade_atual: parseFloat(formData.quantidade_atual),
        quantidade_minima: parseFloat(formData.quantidade_minima),
        quantidade_maxima: formData.quantidade_maxima ? parseFloat(formData.quantidade_maxima) : null
      };

      if (editingEstoque) {
        const { error } = await supabase
          .from('estoque')
          .update(estoqueData)
          .eq('id', editingEstoque.id);

        if (error) throw error;
        toast({ title: 'Estoque atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('estoque')
          .insert([{ ...estoqueData, user_id: user.id }]);

        if (error) throw error;
        toast({ title: 'Item adicionado ao estoque!' });
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar estoque:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o item no estoque',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (item: EstoqueItem) => {
    setEditingEstoque(item);
    setFormData({
      material_id: item.material_id,
      quantidade_atual: item.quantidade_atual.toString(),
      quantidade_minima: item.quantidade_minima.toString(),
      quantidade_maxima: item.quantidade_maxima?.toString() || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      material_id: '',
      quantidade_atual: '',
      quantidade_minima: '',
      quantidade_maxima: ''
    });
    setEditingEstoque(null);
  };

  const getStatusBadge = (item: EstoqueItem) => {
    if (item.quantidade_atual <= 0) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Esgotado</Badge>;
    }
    if (item.quantidade_atual <= item.quantidade_minima) {
      return <Badge className="bg-gold text-gold-foreground gap-1"><AlertTriangle className="h-3 w-3" />Baixo</Badge>;
    }
    if (item.quantidade_maxima && item.quantidade_atual >= item.quantidade_maxima) {
      return <Badge className="bg-accent text-accent-foreground">Cheio</Badge>;
    }
    return <Badge variant="secondary">OK</Badge>;
  };

  const formatUnidade = (unidade: string) => {
    return unidade.replace(/_/g, ' ');
  };

  const materiaisDisponiveis = materiais.filter(m => 
    !estoque.find(e => e.material_id === m.id) || editingEstoque?.material_id === m.id
  );

  const itensAlerta = estoque.filter(item => 
    item.quantidade_atual <= item.quantidade_minima
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Estoque</h1>
            <p className="text-muted-foreground mt-1">Controle de materiais em estoque</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar ao Estoque
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEstoque ? 'Editar Estoque' : 'Adicionar ao Estoque'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="material">Material *</Label>
                  <Select 
                    value={formData.material_id} 
                    onValueChange={(value) => setFormData({ ...formData, material_id: value })}
                    disabled={!!editingEstoque}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materiaisDisponiveis.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.codigo ? `${material.codigo} - ` : ''}{material.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantidade_atual">Quantidade Atual *</Label>
                  <Input
                    id="quantidade_atual"
                    type="number"
                    step="0.01"
                    value={formData.quantidade_atual}
                    onChange={(e) => setFormData({ ...formData, quantidade_atual: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade_minima">Quantidade Mínima *</Label>
                  <Input
                    id="quantidade_minima"
                    type="number"
                    step="0.01"
                    value={formData.quantidade_minima}
                    onChange={(e) => setFormData({ ...formData, quantidade_minima: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade_maxima">Quantidade Máxima</Label>
                  <Input
                    id="quantidade_maxima"
                    type="number"
                    step="0.01"
                    value={formData.quantidade_maxima}
                    onChange={(e) => setFormData({ ...formData, quantidade_maxima: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {itensAlerta.length > 0 && (
          <Card className="mb-6 border-gold bg-gold/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gold">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {itensAlerta.length} {itensAlerta.length === 1 ? 'item está' : 'itens estão'} com estoque baixo ou esgotado
              </p>
              <div className="space-y-1">
                {itensAlerta.map((item) => (
                  <div key={item.id} className="text-sm">
                    <span className="font-medium">{item.materiais?.nome}</span>: {item.quantidade_atual} {formatUnidade(item.materiais?.unidade || '')}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Itens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{estoque.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gold" />
                <span className="text-2xl font-bold text-gold">
                  {estoque.filter(item => item.quantidade_atual <= item.quantidade_minima && item.quantidade_atual > 0).length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Esgotados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-2xl font-bold text-destructive">
                  {estoque.filter(item => item.quantidade_atual <= 0).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Itens em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : estoque.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum item no estoque
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Qtd. Atual</TableHead>
                    <TableHead>Qtd. Mínima</TableHead>
                    <TableHead>Qtd. Máxima</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estoque.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.materiais?.codigo || '-'}</TableCell>
                      <TableCell className="font-medium">{item.materiais?.nome}</TableCell>
                      <TableCell>
                        {item.quantidade_atual} {formatUnidade(item.materiais?.unidade || '')}
                      </TableCell>
                      <TableCell>
                        {item.quantidade_minima} {formatUnidade(item.materiais?.unidade || '')}
                      </TableCell>
                      <TableCell>
                        {item.quantidade_maxima ? `${item.quantidade_maxima} ${formatUnidade(item.materiais?.unidade || '')}` : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Estoque;
