import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

interface Ferramenta {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  status: string;
  localizacao: string;
  codigo_patrimonio: string;
  marca?: string;
  modelo?: string;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  observacoes?: string;
}

export default function Ferramentas() {
  const { user } = useAuth();
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<{
    nome: string;
    tipo: string;
    categoria: string;
    status: string;
    localizacao: string;
    codigo_patrimonio: string;
    marca: string;
    modelo: string;
    data_aquisicao: string;
    valor_aquisicao: string;
    observacoes: string;
  }>({
    nome: "",
    tipo: "MANUAL",
    categoria: "CORTE",
    status: "DISPONIVEL",
    localizacao: "MARCENARIA",
    codigo_patrimonio: "",
    marca: "",
    modelo: "",
    data_aquisicao: "",
    valor_aquisicao: "",
    observacoes: "",
  });

  const loadFerramentas = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("ferramentas")
        .select("*")
        .eq("user_id", user.id)
        .order("nome");

      if (error) throw error;
      setFerramentas(data || []);
    } catch (error) {
      console.error("Erro ao carregar ferramentas:", error);
      toast.error("Erro ao carregar ferramentas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFerramentas();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const dataToSave: any = {
        nome: formData.nome,
        tipo: formData.tipo,
        categoria: formData.categoria,
        status: formData.status,
        localizacao: formData.localizacao,
        codigo_patrimonio: formData.codigo_patrimonio,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        data_aquisicao: formData.data_aquisicao || null,
        valor_aquisicao: formData.valor_aquisicao ? parseFloat(formData.valor_aquisicao) : null,
        observacoes: formData.observacoes || null,
        user_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from("ferramentas")
          .update(dataToSave)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Ferramenta atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("ferramentas")
          .insert([dataToSave]);

        if (error) throw error;
        toast.success("Ferramenta cadastrada com sucesso!");
      }

      resetForm();
      loadFerramentas();
    } catch (error) {
      console.error("Erro ao salvar ferramenta:", error);
      toast.error("Erro ao salvar ferramenta");
    }
  };

  const handleEdit = (ferramenta: Ferramenta) => {
    setFormData({
      nome: ferramenta.nome,
      tipo: ferramenta.tipo,
      categoria: ferramenta.categoria,
      status: ferramenta.status,
      localizacao: ferramenta.localizacao,
      codigo_patrimonio: ferramenta.codigo_patrimonio,
      marca: ferramenta.marca || "",
      modelo: ferramenta.modelo || "",
      data_aquisicao: ferramenta.data_aquisicao || "",
      valor_aquisicao: ferramenta.valor_aquisicao?.toString() || "",
      observacoes: ferramenta.observacoes || "",
    });
    setEditingId(ferramenta.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta ferramenta?")) return;

    try {
      const { error } = await supabase
        .from("ferramentas")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Ferramenta excluída com sucesso!");
      loadFerramentas();
    } catch (error) {
      console.error("Erro ao excluir ferramenta:", error);
      toast.error("Erro ao excluir ferramenta");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "MANUAL",
      categoria: "CORTE",
      status: "DISPONIVEL",
      localizacao: "MARCENARIA",
      codigo_patrimonio: "",
      marca: "",
      modelo: "",
      data_aquisicao: "",
      valor_aquisicao: "",
      observacoes: "",
    });
    setEditingId(null);
    setDialogOpen(false);
  };

  const filteredFerramentas = ferramentas.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.codigo_patrimonio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusLabels = {
    DISPONIVEL: "Disponível",
    EM_USO: "Em Uso",
    MANUTENCAO: "Manutenção",
    INATIVO: "Inativo",
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Ferramentas e Máquinas
          </h1>
          <p className="text-muted-foreground">
            Gerencie o patrimônio de ferramentas
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ferramenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Ferramenta" : "Nova Ferramenta"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codigo_patrimonio">Código Patrimônio *</Label>
                  <Input
                    id="codigo_patrimonio"
                    value={formData.codigo_patrimonio}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo_patrimonio: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="ELETRICA">Elétrica</SelectItem>
                      <SelectItem value="PNEUMATICA">Pneumática</SelectItem>
                      <SelectItem value="ESTACIONARIA">Estacionária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORTE">Corte</SelectItem>
                      <SelectItem value="FURACAO">Furação</SelectItem>
                      <SelectItem value="LIXAMENTO">Lixamento</SelectItem>
                      <SelectItem value="MEDICAO">Medição</SelectItem>
                      <SelectItem value="FIXACAO">Fixação</SelectItem>
                      <SelectItem value="ACABAMENTO">Acabamento</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                      <SelectItem value="EM_USO">Em Uso</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="QUEBRADA">Quebrada</SelectItem>
                      <SelectItem value="VENDIDA">Vendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Select
                    value={formData.localizacao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, localizacao: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARCENARIA">Marcenaria</SelectItem>
                      <SelectItem value="OBRA">Obra</SelectItem>
                      <SelectItem value="MANUTENCAO_EXTERNA">Manutenção Externa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) =>
                      setFormData({ ...formData, marca: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) =>
                      setFormData({ ...formData, modelo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="data_aquisicao">Data Aquisição</Label>
                  <Input
                    id="data_aquisicao"
                    type="date"
                    value={formData.data_aquisicao}
                    onChange={(e) =>
                      setFormData({ ...formData, data_aquisicao: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valor_aquisicao">Valor Aquisição</Label>
                  <Input
                    id="valor_aquisicao"
                    type="number"
                    step="0.01"
                    value={formData.valor_aquisicao}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_aquisicao: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Salvar</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar por nome ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Marca/Modelo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFerramentas.map((ferramenta) => (
              <TableRow key={ferramenta.id}>
                <TableCell className="font-medium">
                  {ferramenta.codigo_patrimonio}
                </TableCell>
                <TableCell>{ferramenta.nome}</TableCell>
                <TableCell>{ferramenta.tipo}</TableCell>
                <TableCell>{ferramenta.categoria}</TableCell>
                <TableCell>
                  {statusLabels[ferramenta.status as keyof typeof statusLabels]}
                </TableCell>
                <TableCell>{ferramenta.localizacao}</TableCell>
                <TableCell>
                  {ferramenta.marca} {ferramenta.modelo}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(ferramenta)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ferramenta.id)}
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
    </div>
  );
}
