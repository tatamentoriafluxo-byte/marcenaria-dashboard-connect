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
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Fretista {
  id: string;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  email?: string;
  tipo_veiculo?: string;
  placa_veiculo?: string;
  capacidade_carga?: number;
  valor_km?: number;
  valor_frete_fixo?: number;
  ativo: boolean;
  total_fretes: number;
  avaliacao_media: number;
  total_pago: number;
}

export default function Fretistas() {
  const { user } = useAuth();
  const [fretistas, setFretistas] = useState<Fretista[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    cpf_cnpj: "",
    telefone: "",
    email: "",
    tipo_veiculo: "VAN",
    placa_veiculo: "",
    capacidade_carga: "",
    valor_km: "",
    valor_frete_fixo: "",
    observacoes: "",
  });

  const loadFretistas = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("fretistas")
        .select("*")
        .eq("user_id", user.id)
        .order("nome");

      if (error) throw error;
      setFretistas(data || []);
    } catch (error) {
      console.error("Erro ao carregar fretistas:", error);
      toast.error("Erro ao carregar fretistas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFretistas();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const dataToSave: any = {
        nome: formData.nome,
        cpf_cnpj: formData.cpf_cnpj || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        tipo_veiculo: formData.tipo_veiculo || null,
        placa_veiculo: formData.placa_veiculo || null,
        capacidade_carga: formData.capacidade_carga ? parseFloat(formData.capacidade_carga) : null,
        valor_km: formData.valor_km ? parseFloat(formData.valor_km) : null,
        valor_frete_fixo: formData.valor_frete_fixo ? parseFloat(formData.valor_frete_fixo) : null,
        observacoes: formData.observacoes || null,
        user_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from("fretistas")
          .update(dataToSave)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Fretista atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("fretistas")
          .insert([dataToSave]);

        if (error) throw error;
        toast.success("Fretista cadastrado com sucesso!");
      }

      resetForm();
      loadFretistas();
    } catch (error) {
      console.error("Erro ao salvar fretista:", error);
      toast.error("Erro ao salvar fretista");
    }
  };

  const handleEdit = (fretista: Fretista) => {
    setFormData({
      nome: fretista.nome,
      cpf_cnpj: fretista.cpf_cnpj || "",
      telefone: fretista.telefone || "",
      email: fretista.email || "",
      tipo_veiculo: fretista.tipo_veiculo || "VAN",
      placa_veiculo: fretista.placa_veiculo || "",
      capacidade_carga: fretista.capacidade_carga?.toString() || "",
      valor_km: fretista.valor_km?.toString() || "",
      valor_frete_fixo: fretista.valor_frete_fixo?.toString() || "",
      observacoes: "",
    });
    setEditingId(fretista.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fretista?")) return;

    try {
      const { error } = await supabase
        .from("fretistas")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Fretista excluído com sucesso!");
      loadFretistas();
    } catch (error) {
      console.error("Erro ao excluir fretista:", error);
      toast.error("Erro ao excluir fretista");
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf_cnpj: "",
      telefone: "",
      email: "",
      tipo_veiculo: "VAN",
      placa_veiculo: "",
      capacidade_carga: "",
      valor_km: "",
      valor_frete_fixo: "",
      observacoes: "",
    });
    setEditingId(null);
    setDialogOpen(false);
  };

  const filteredFretistas = fretistas.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.telefone && f.telefone.includes(searchTerm))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Fretistas e Transportadores
          </h1>
          <p className="text-muted-foreground">
            Gerencie transportadores e fretes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fretista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Fretista" : "Novo Fretista"}
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
                  <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf_cnpj: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_veiculo">Tipo de Veículo</Label>
                  <Select
                    value={formData.tipo_veiculo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipo_veiculo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CARRO">Carro</SelectItem>
                      <SelectItem value="VAN">Van</SelectItem>
                      <SelectItem value="CAMINHAO">Caminhão</SelectItem>
                      <SelectItem value="BAU">Baú</SelectItem>
                      <SelectItem value="UTILITARIO">Utilitário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="placa_veiculo">Placa do Veículo</Label>
                  <Input
                    id="placa_veiculo"
                    value={formData.placa_veiculo}
                    onChange={(e) =>
                      setFormData({ ...formData, placa_veiculo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="capacidade_carga">Capacidade (kg)</Label>
                  <Input
                    id="capacidade_carga"
                    type="number"
                    step="0.01"
                    value={formData.capacidade_carga}
                    onChange={(e) =>
                      setFormData({ ...formData, capacidade_carga: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valor_km">Valor por KM (R$)</Label>
                  <Input
                    id="valor_km"
                    type="number"
                    step="0.01"
                    value={formData.valor_km}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_km: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valor_frete_fixo">Frete Fixo (R$)</Label>
                  <Input
                    id="valor_frete_fixo"
                    type="number"
                    step="0.01"
                    value={formData.valor_frete_fixo}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_frete_fixo: e.target.value })
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
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Tipo Veículo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Valor/KM</TableHead>
              <TableHead>Frete Fixo</TableHead>
              <TableHead>Fretes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFretistas.map((fretista) => (
              <TableRow key={fretista.id}>
                <TableCell className="font-medium">{fretista.nome}</TableCell>
                <TableCell>{fretista.telefone}</TableCell>
                <TableCell>{fretista.tipo_veiculo}</TableCell>
                <TableCell>{fretista.placa_veiculo}</TableCell>
                <TableCell>
                  {fretista.valor_km ? formatCurrency(fretista.valor_km) : "-"}
                </TableCell>
                <TableCell>
                  {fretista.valor_frete_fixo ? formatCurrency(fretista.valor_frete_fixo) : "-"}
                </TableCell>
                <TableCell>{fretista.total_fretes}</TableCell>
                <TableCell>
                  <Badge variant={fretista.ativo ? "default" : "secondary"}>
                    {fretista.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(fretista)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(fretista.id)}
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
