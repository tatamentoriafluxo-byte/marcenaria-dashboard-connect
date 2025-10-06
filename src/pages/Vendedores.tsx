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
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Vendedores = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    comissao_percentual: '5.00',
    meta_mensal: '',
    ativo: true
  });

  useEffect(() => {
    loadVendedores();
  }, [user]);

  const loadVendedores = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendedores')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;
      setVendedores(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os vendedores',
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
      if (editingVendedor) {
        const { error } = await supabase
          .from('vendedores')
          .update({
            ...formData,
            meta_mensal: formData.meta_mensal ? parseFloat(formData.meta_mensal) : null,
            comissao_percentual: parseFloat(formData.comissao_percentual)
          })
          .eq('id', editingVendedor.id);

        if (error) throw error;
        toast({ title: 'Vendedor atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('vendedores')
          .insert({
            ...formData,
            user_id: user.id,
            meta_mensal: formData.meta_mensal ? parseFloat(formData.meta_mensal) : null,
            comissao_percentual: parseFloat(formData.comissao_percentual)
          });

        if (error) throw error;
        toast({ title: 'Vendedor cadastrado com sucesso!' });
      }

      setDialogOpen(false);
      resetForm();
      loadVendedores();
    } catch (error) {
      console.error('Erro ao salvar vendedor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o vendedor',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (vendedor: any) => {
    setEditingVendedor(vendedor);
    setFormData({
      nome: vendedor.nome,
      email: vendedor.email || '',
      telefone: vendedor.telefone || '',
      comissao_percentual: vendedor.comissao_percentual?.toString() || '5.00',
      meta_mensal: vendedor.meta_mensal?.toString() || '',
      ativo: vendedor.ativo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vendedor?')) return;

    try {
      const { error } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Vendedor excluído com sucesso!' });
      loadVendedores();
    } catch (error) {
      console.error('Erro ao excluir vendedor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o vendedor',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      comissao_percentual: '5.00',
      meta_mensal: '',
      ativo: true
    });
    setEditingVendedor(null);
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
            <h1 className="text-3xl font-bold text-foreground">Vendedores</h1>
            <p className="text-muted-foreground mt-1">Gerencie sua equipe de vendas</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Vendedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="comissao">Comissão (%)</Label>
                  <Input
                    id="comissao"
                    type="number"
                    step="0.01"
                    value={formData.comissao_percentual}
                    onChange={(e) => setFormData({ ...formData, comissao_percentual: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="meta">Meta Mensal (R$)</Label>
                  <Input
                    id="meta"
                    type="number"
                    step="0.01"
                    value={formData.meta_mensal}
                    onChange={(e) => setFormData({ ...formData, meta_mensal: e.target.value })}
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

        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : vendedores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum vendedor cadastrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Meta Mensal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendedores.map((vendedor) => (
                    <TableRow key={vendedor.id}>
                      <TableCell className="font-medium">{vendedor.nome}</TableCell>
                      <TableCell>{vendedor.email || '-'}</TableCell>
                      <TableCell>{vendedor.telefone || '-'}</TableCell>
                      <TableCell>{vendedor.comissao_percentual}%</TableCell>
                      <TableCell>{formatCurrency(vendedor.meta_mensal)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          vendedor.ativo 
                            ? 'bg-accent/10 text-accent' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {vendedor.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(vendedor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vendedor.id)}
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

export default Vendedores;
