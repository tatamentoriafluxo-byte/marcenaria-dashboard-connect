import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Materiais = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materiais, setMateriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    tipo: '',
    unidade: 'UNIDADE',
    preco_medio: '',
    descricao: ''
  });

  const tiposMaterial = [
    'MADEIRA',
    'FERRAGEM',
    'ACABAMENTO',
    'FERRAMENTA',
    'OUTROS'
  ];

  const unidadesMedida = [
    'UNIDADE',
    'METRO',
    'METRO_QUADRADO',
    'KILO',
    'LITRO',
    'PACOTE'
  ];

  useEffect(() => {
    loadMateriais();
  }, [user]);

  const loadMateriais = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;
      setMateriais(data || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os materiais',
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
      const materialData = {
        nome: formData.nome,
        codigo: formData.codigo || null,
        tipo: formData.tipo as 'MADEIRA' | 'FERRAGEM' | 'ACABAMENTO' | 'FERRAMENTA' | 'OUTROS',
        unidade: formData.unidade as 'UNIDADE' | 'METRO' | 'METRO_QUADRADO' | 'KILO' | 'LITRO' | 'PACOTE',
        preco_medio: formData.preco_medio ? parseFloat(formData.preco_medio) : null,
        descricao: formData.descricao || null
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('materiais')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) throw error;
        toast({ title: 'Material atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('materiais')
          .insert([{ ...materialData, user_id: user.id }]);

        if (error) throw error;
        toast({ title: 'Material cadastrado com sucesso!' });
      }

      setDialogOpen(false);
      resetForm();
      loadMateriais();
    } catch (error) {
      console.error('Erro ao salvar material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o material',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      nome: material.nome,
      codigo: material.codigo || '',
      tipo: material.tipo,
      unidade: material.unidade,
      preco_medio: material.preco_medio?.toString() || '',
      descricao: material.descricao || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;

    try {
      const { error } = await supabase
        .from('materiais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Material excluído com sucesso!' });
      loadMateriais();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o material',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      tipo: '',
      unidade: 'UNIDADE',
      preco_medio: '',
      descricao: ''
    });
    setEditingMaterial(null);
  };

  const formatTipo = (tipo: string) => {
    return tipo.replace(/_/g, ' ');
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Materiais</h1>
            <p className="text-muted-foreground mt-1">Gerencie o catálogo de materiais</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMaterial ? 'Editar Material' : 'Novo Material'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposMaterial.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {formatTipo(tipo)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade *</Label>
                    <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value })} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unidadesMedida.map((unidade) => (
                          <SelectItem key={unidade} value={unidade}>
                            {formatTipo(unidade)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="preco_medio">Preço Médio (R$)</Label>
                    <Input
                      id="preco_medio"
                      type="number"
                      step="0.01"
                      value={formData.preco_medio}
                      onChange={(e) => setFormData({ ...formData, preco_medio: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                    />
                  </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Lista de Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : materiais.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum material cadastrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Preço Médio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materiais.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>{material.codigo || '-'}</TableCell>
                      <TableCell className="font-medium">{material.nome}</TableCell>
                      <TableCell>{formatTipo(material.tipo)}</TableCell>
                      <TableCell>{formatTipo(material.unidade)}</TableCell>
                      <TableCell>{formatCurrency(material.preco_medio)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(material)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

export default Materiais;
