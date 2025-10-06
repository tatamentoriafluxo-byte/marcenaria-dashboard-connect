import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Projetos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('data_contato', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Projeto excluído',
        description: 'O projeto foi excluído com sucesso.',
      });

      loadProjects();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ORCAMENTO: 'outline',
      CONVERTIDO: 'default',
      EM_PRODUCAO: 'secondary',
      ENTREGUE: 'default',
      CANCELADO: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const filteredProjects = projects.filter(p =>
    p.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cod_projeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
            <p className="text-muted-foreground mt-1">Gerencie todos os seus projetos</p>
          </div>
          <Button onClick={() => navigate('/novo-projeto')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, código ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="rounded-lg border bg-card shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor Venda</TableHead>
                    <TableHead>Data Contato</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.cod_projeto}</TableCell>
                      <TableCell>{project.nome_cliente}</TableCell>
                      <TableCell>{project.ambiente}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>{formatCurrency(project.valor_venda || 0)}</TableCell>
                      <TableCell>{formatDate(project.data_contato)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/editar-projeto/${project.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto cadastrado ainda'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/novo-projeto')}>
                Cadastrar primeiro projeto
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projetos;
