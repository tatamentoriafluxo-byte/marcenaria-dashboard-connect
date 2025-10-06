import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const Funcionarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    telefone: '',
    salario: '',
    ativo: true
  });

  const tiposFuncionario = [
    'MARCENEIRO',
    'MONTADOR',
    'VENDEDOR',
    'PROJETISTA',
    'ADMINISTRATIVO',
    'ACABAMENTO',
    'OUTROS'
  ];

  useEffect(() => {
    loadFuncionarios();
  }, [user]);

  const loadFuncionarios = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os funcionários',
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
      const funcionarioData = {
        nome: formData.nome,
        tipo: formData.tipo,
        telefone: formData.telefone || null,
        salario: formData.salario ? parseFloat(formData.salario) : null,
        ativo: formData.ativo
      };

      if (editingFuncionario) {
        const { error } = await supabase
          .from('funcionarios')
          .update(funcionarioData)
          .eq('id', editingFuncionario.id);

        if (error) throw error;
        toast({ title: 'Funcionário atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('funcionarios')
          .insert([{ ...funcionarioData, user_id: user.id }]);

        if (error) throw error;
        toast({ title: 'Funcionário cadastrado com sucesso!' });
      }

      setDialogOpen(false);
      resetForm();
      loadFuncionarios();
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o funcionário',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (funcionario: any) => {
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome,
      tipo: funcionario.tipo,
      telefone: funcionario.telefone || '',
      salario: funcionario.salario?.toString() || '',
      ativo: funcionario.ativo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

    try {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Funcionário excluído com sucesso!' });
      loadFuncionarios();
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o funcionário',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: '',
      telefone: '',
      salario: '',
      ativo: true
    });
    setEditingFuncionario(null);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTipo = (tipo: string) => {
    return tipo.replace(/_/g, ' ');
  };

  const funcionariosPorTipo = tiposFuncionario.map(tipo => ({
    tipo: formatTipo(tipo),
    count: funcionarios.filter(f => f.tipo === tipo && f.ativo).length
  })).filter(item => item.count > 0);

  const totalAtivos = funcionarios.filter(f => f.ativo).length;
  const folhaPagamento = funcionarios
    .filter(f => f.ativo && f.salario)
    .reduce((acc, f) => acc + (f.salario || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground mt-1">Gerencie sua equipe</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
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
                  <Label htmlFor="tipo">Tipo *</Label>
                  <select
                    id="tipo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {tiposFuncionario.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {formatTipo(tipo)}
                      </option>
                    ))}
                  </select>
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
                  <Label htmlFor="salario">Salário (R$)</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Funcionário Ativo</Label>
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

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{funcionarios.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funcionários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-2xl font-bold text-accent">{totalAtivos}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Folha de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold">{formatCurrency(folhaPagamento)}</div>
              <p className="text-xs text-muted-foreground mt-1">salários ativos</p>
            </CardContent>
          </Card>
        </div>

        {funcionariosPorTipo.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {funcionariosPorTipo.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{item.tipo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">{item.count}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : funcionarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum funcionário cadastrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">{funcionario.nome}</TableCell>
                      <TableCell>{formatTipo(funcionario.tipo)}</TableCell>
                      <TableCell>{funcionario.telefone || '-'}</TableCell>
                      <TableCell>{formatCurrency(funcionario.salario)}</TableCell>
                      <TableCell>
                        <Badge variant={funcionario.ativo ? 'default' : 'secondary'} className={
                          funcionario.ativo 
                            ? 'bg-accent/10 text-accent' 
                            : 'bg-muted text-muted-foreground'
                        }>
                          {funcionario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(funcionario)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(funcionario.id)}
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

export default Funcionarios;
