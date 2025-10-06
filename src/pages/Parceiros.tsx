import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, TrendingUp } from 'lucide-react';

interface Parceiro {
  id: string;
  nome: string;
  categoria: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  percentual_comissao: number;
  tipo_remuneracao: string;
  total_indicacoes: number;
  total_vendas_geradas: number;
  total_comissoes_pagas: number;
  ativo: boolean;
}

const categorias = [
  { value: 'ARQUITETO', label: 'Arquiteto' },
  { value: 'DESIGNER_INTERIORES', label: 'Designer de Interiores' },
  { value: 'CONSTRUTORA', label: 'Construtora' },
  { value: 'CORRETOR_IMOVEIS', label: 'Corretor de Imóveis' },
  { value: 'LOJA_MATERIAIS', label: 'Loja de Materiais' },
  { value: 'DECORADOR', label: 'Decorador' },
  { value: 'ENGENHEIRO', label: 'Engenheiro' },
  { value: 'OUTRO', label: 'Outro' },
];

const Parceiros = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('TODOS');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'ARQUITETO',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    percentual_comissao: '5.00',
    tipo_remuneracao: 'PERCENTUAL',
    ativo: true,
  });

  useEffect(() => {
    loadParceiros();
  }, [user]);

  const loadParceiros = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .eq('user_id', user.id)
      .order('nome');

    if (error) {
      toast({
        title: 'Erro ao carregar parceiros',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setParceiros(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parceiroData = {
      ...formData,
      user_id: user.id,
      percentual_comissao: parseFloat(formData.percentual_comissao),
      categoria: formData.categoria as any,
      tipo_remuneracao: formData.tipo_remuneracao as any,
    };

    if (editingId) {
      const { error } = await supabase
        .from('parceiros')
        .update(parceiroData)
        .eq('id', editingId);

      if (error) {
        toast({
          title: 'Erro ao atualizar parceiro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Parceiro atualizado com sucesso!' });
        resetForm();
        loadParceiros();
      }
    } else {
      const { error } = await supabase
        .from('parceiros')
        .insert([parceiroData]);

      if (error) {
        toast({
          title: 'Erro ao criar parceiro',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Parceiro criado com sucesso!' });
        resetForm();
        loadParceiros();
      }
    }
  };

  const handleEdit = (parceiro: Parceiro) => {
    setFormData({
      nome: parceiro.nome,
      categoria: parceiro.categoria,
      cpf_cnpj: parceiro.cpf_cnpj || '',
      telefone: parceiro.telefone || '',
      email: parceiro.email || '',
      percentual_comissao: parceiro.percentual_comissao.toString(),
      tipo_remuneracao: parceiro.tipo_remuneracao,
      ativo: parceiro.ativo,
    });
    setEditingId(parceiro.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;

    const { error } = await supabase
      .from('parceiros')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro ao excluir parceiro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Parceiro excluído com sucesso!' });
      loadParceiros();
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: 'ARQUITETO',
      cpf_cnpj: '',
      telefone: '',
      email: '',
      percentual_comissao: '5.00',
      tipo_remuneracao: 'PERCENTUAL',
      ativo: true,
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const filteredParceiros = parceiros.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'TODOS' || p.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Parceiros</h1>
            <p className="text-muted-foreground">Gerencie seus parceiros comerciais</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Parceiro' : 'Novo Parceiro'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpf_cnpj"
                      value={formData.cpf_cnpj}
                      onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="percentual_comissao">Comissão (%)</Label>
                    <Input
                      id="percentual_comissao"
                      type="number"
                      step="0.01"
                      value={formData.percentual_comissao}
                      onChange={(e) => setFormData({ ...formData, percentual_comissao: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Atualizar' : 'Salvar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar parceiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas Categorias</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : filteredParceiros.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum parceiro encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Indicações</TableHead>
                      <TableHead>Total Vendas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParceiros.map((parceiro) => (
                      <TableRow key={parceiro.id}>
                        <TableCell className="font-medium">{parceiro.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {categorias.find(c => c.value === parceiro.categoria)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {parceiro.telefone && <div>{parceiro.telefone}</div>}
                            {parceiro.email && <div className="text-muted-foreground">{parceiro.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{parceiro.percentual_comissao}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {parceiro.total_indicacoes}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(parceiro.total_vendas_geradas)}</TableCell>
                        <TableCell>
                          <Badge variant={parceiro.ativo ? 'default' : 'secondary'}>
                            {parceiro.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(parceiro)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(parceiro.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Parceiros;
