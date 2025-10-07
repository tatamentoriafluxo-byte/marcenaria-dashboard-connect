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
  codigo_patrimonio?: string;
  marca?: string;
  modelo?: string;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  moeda?: string;
  tipo_customizado?: string;
  categoria_customizada?: string;
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
    moeda: string;
    tipo_customizado: string;
    categoria_customizada: string;
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
    moeda: "BRL",
    tipo_customizado: "",
    categoria_customizada: "",
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
      // Gerar código de patrimônio automático se não informado
      let codigoPatrimonio = formData.codigo_patrimonio;
      if (!codigoPatrimonio) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        codigoPatrimonio = `PAT-${timestamp}${random}`;
      }

      const dataToSave: any = {
        nome: formData.nome,
        tipo: formData.tipo,
        categoria: formData.categoria,
        status: formData.status,
        localizacao: formData.localizacao,
        codigo_patrimonio: codigoPatrimonio,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        data_aquisicao: formData.data_aquisicao || null,
        valor_aquisicao: formData.valor_aquisicao ? parseFloat(formData.valor_aquisicao) : null,
        moeda: formData.moeda,
        tipo_customizado: formData.tipo === 'OUTRO' ? formData.tipo_customizado : null,
        categoria_customizada: formData.categoria === 'OUTRO' ? formData.categoria_customizada : null,
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
      codigo_patrimonio: ferramenta.codigo_patrimonio || "",
      marca: ferramenta.marca || "",
      modelo: ferramenta.modelo || "",
      data_aquisicao: ferramenta.data_aquisicao || "",
      valor_aquisicao: ferramenta.valor_aquisicao?.toString() || "",
      moeda: ferramenta.moeda || "BRL",
      tipo_customizado: ferramenta.tipo_customizado || "",
      categoria_customizada: ferramenta.categoria_customizada || "",
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
      moeda: "BRL",
      tipo_customizado: "",
      categoria_customizada: "",
      observacoes: "",
    });
    setEditingId(null);
    setDialogOpen(false);
  };

  const filteredFerramentas = ferramentas.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.codigo_patrimonio && f.codigo_patrimonio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (valor: number, moeda: string) => {
    const currencyMap: { [key: string]: string } = {
      BRL: "pt-BR",
      USD: "en-US",
      EUR: "de-DE",
      GBP: "en-GB",
      JPY: "ja-JP",
      CHF: "de-CH",
      CAD: "en-CA",
      AUD: "en-AU",
    };
    
    const locale = currencyMap[moeda] || "pt-BR";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: moeda,
    }).format(valor);
  };

  // Calcular valor total do patrimônio
  const valorTotalPatrimonio = ferramentas.reduce((total, f) => {
    if (f.valor_aquisicao && f.moeda === 'BRL') {
      return total + f.valor_aquisicao;
    }
    return total;
  }, 0);

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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Valor Total do Patrimônio (BRL)</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(valorTotalPatrimonio, 'BRL')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ferramentas.length} {ferramentas.length === 1 ? 'item cadastrado' : 'itens cadastrados'}
            </p>
          </div>
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
                  <Label htmlFor="codigo_patrimonio">
                    Código Patrimônio <span className="text-muted-foreground text-xs">(opcional - gerado automaticamente)</span>
                  </Label>
                  <Input
                    id="codigo_patrimonio"
                    value={formData.codigo_patrimonio}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo_patrimonio: e.target.value })
                    }
                    placeholder="Ex: PAT-001 (deixe vazio para gerar automaticamente)"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
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
                      <SelectItem value="ESTACIONARIA">Estacionária (Máquina)</SelectItem>
                      <SelectItem value="OUTRO">Outro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.tipo === 'OUTRO' && (
                  <div>
                    <Label htmlFor="tipo_customizado">Especifique o Tipo *</Label>
                    <Input
                      id="tipo_customizado"
                      value={formData.tipo_customizado}
                      onChange={(e) =>
                        setFormData({ ...formData, tipo_customizado: e.target.value })
                      }
                      placeholder="Ex: Hidráulica, CNC, etc."
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
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
                      <SelectItem value="OUTRO">Outra (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.categoria === 'OUTRO' && (
                  <div>
                    <Label htmlFor="categoria_customizada">Especifique a Categoria *</Label>
                    <Input
                      id="categoria_customizada"
                      value={formData.categoria_customizada}
                      onChange={(e) =>
                        setFormData({ ...formData, categoria_customizada: e.target.value })
                      }
                      placeholder="Ex: Colagem, Pintura, etc."
                      required
                    />
                  </div>
                )}
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
                  <Label htmlFor="moeda">Moeda *</Label>
                  <Select
                    value={formData.moeda}
                    onValueChange={(value) =>
                      setFormData({ ...formData, moeda: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">🇧🇷 Real (BRL)</SelectItem>
                      <SelectItem value="USD">🇺🇸 Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">🇬🇧 Libra (GBP)</SelectItem>
                      <SelectItem value="JPY">🇯🇵 Iene (JPY)</SelectItem>
                      <SelectItem value="CHF">🇨🇭 Franco Suíço (CHF)</SelectItem>
                      <SelectItem value="CAD">🇨🇦 Dólar Canadense (CAD)</SelectItem>
                      <SelectItem value="AUD">🇦🇺 Dólar Australiano (AUD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor_aquisicao">Valor de Aquisição *</Label>
                  <Input
                    id="valor_aquisicao"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_aquisicao}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_aquisicao: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                  {formData.valor_aquisicao && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(parseFloat(formData.valor_aquisicao), formData.moeda)}
                    </p>
                  )}
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
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFerramentas.map((ferramenta) => (
              <TableRow key={ferramenta.id}>
                <TableCell className="font-medium">
                  {ferramenta.codigo_patrimonio || '-'}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{ferramenta.nome}</p>
                    {ferramenta.marca && (
                      <p className="text-xs text-muted-foreground">
                        {ferramenta.marca} {ferramenta.modelo}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {ferramenta.tipo === 'OUTRO' && ferramenta.tipo_customizado 
                    ? ferramenta.tipo_customizado 
                    : ferramenta.tipo}
                </TableCell>
                <TableCell>
                  {ferramenta.categoria === 'OUTRO' && ferramenta.categoria_customizada
                    ? ferramenta.categoria_customizada
                    : ferramenta.categoria}
                </TableCell>
                <TableCell>
                  {ferramenta.valor_aquisicao && ferramenta.moeda ? (
                    <span className="font-medium">
                      {formatCurrency(ferramenta.valor_aquisicao, ferramenta.moeda)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {statusLabels[ferramenta.status as keyof typeof statusLabels]}
                </TableCell>
                <TableCell>{ferramenta.localizacao}</TableCell>
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
