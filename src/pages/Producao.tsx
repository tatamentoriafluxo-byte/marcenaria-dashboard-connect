import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Producao = {
  id: string;
  project_id: string;
  marceneiro_id: string | null;
  nome_movel: string | null;
  ambiente: string | null;
  data_inicio: string | null;
  data_fim_prevista: string | null;
  data_fim_real: string | null;
  tempo_estimado: number | null;
  tempo_real: number | null;
  status: string;
  valor_producao: number | null;
  consumo_madeira: number | null;
  consumo_ferragem: number | null;
  custo_mao_obra: number | null;
  data_liberacao: string | null;
  taxa_rejeicao: number | null;
  observacoes: string | null;
};

type Projeto = {
  id: string;
  cod_projeto: string;
  nome_cliente: string;
};

type Funcionario = {
  id: string;
  nome: string;
};

const STATUS_OPTIONS = ["PLANEJADO", "EM_ANDAMENTO", "CONCLUIDO", "PAUSADO", "REJEITADO"] as const;

export default function Producao() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [marceneiros, setMarceneiros] = useState<Funcionario[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project_id: "",
    marceneiro_id: "",
    nome_movel: "",
    ambiente: "",
    data_inicio: "",
    data_fim_prevista: "",
    data_fim_real: "",
    tempo_estimado: "",
    tempo_real: "",
    status: "PLANEJADO",
    valor_producao: "",
    consumo_madeira: "",
    consumo_ferragem: "",
    custo_mao_obra: "",
    data_liberacao: "",
    taxa_rejeicao: "",
    observacoes: "",
  });

  useEffect(() => {
    if (user) {
      fetchProducoes();
      fetchProjetos();
      fetchMarceneiros();
    }
  }, [user]);

  const fetchProducoes = async () => {
    const { data, error } = await supabase
      .from("producao")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar produções", variant: "destructive" });
    } else {
      setProducoes(data || []);
    }
  };

  const fetchProjetos = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, cod_projeto, nome_cliente")
      .eq("user_id", user!.id);
    setProjetos(data || []);
  };

  const fetchMarceneiros = async () => {
    const { data } = await supabase
      .from("funcionarios")
      .select("id, nome")
      .eq("user_id", user!.id)
      .eq("tipo", "Marceneiro")
      .eq("ativo", true);
    setMarceneiros(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      project_id: formData.project_id,
      marceneiro_id: formData.marceneiro_id || null,
      nome_movel: formData.nome_movel || null,
      ambiente: formData.ambiente || null,
      data_inicio: formData.data_inicio || null,
      data_fim_prevista: formData.data_fim_prevista || null,
      data_fim_real: formData.data_fim_real || null,
      tempo_estimado: formData.tempo_estimado ? Number(formData.tempo_estimado) : null,
      tempo_real: formData.tempo_real ? Number(formData.tempo_real) : null,
      status: formData.status as "PLANEJADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "PAUSADO" | "REJEITADO",
      valor_producao: formData.valor_producao ? Number(formData.valor_producao) : null,
      consumo_madeira: formData.consumo_madeira ? Number(formData.consumo_madeira) : null,
      consumo_ferragem: formData.consumo_ferragem ? Number(formData.consumo_ferragem) : null,
      custo_mao_obra: formData.custo_mao_obra ? Number(formData.custo_mao_obra) : null,
      data_liberacao: formData.data_liberacao || null,
      taxa_rejeicao: formData.taxa_rejeicao ? Number(formData.taxa_rejeicao) : null,
      observacoes: formData.observacoes || null,
      user_id: user!.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("producao")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Erro ao atualizar produção", variant: "destructive" });
      } else {
        toast({ title: "Produção atualizada com sucesso!" });
      }
    } else {
      const { error } = await supabase.from("producao").insert(payload);

      if (error) {
        toast({ title: "Erro ao criar produção", variant: "destructive" });
      } else {
        toast({ title: "Produção criada com sucesso!" });
      }
    }

    fetchProducoes();
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (producao: Producao) => {
    setEditingId(producao.id);
    setFormData({
      project_id: producao.project_id,
      marceneiro_id: producao.marceneiro_id || "",
      nome_movel: producao.nome_movel || "",
      ambiente: producao.ambiente || "",
      data_inicio: producao.data_inicio || "",
      data_fim_prevista: producao.data_fim_prevista || "",
      data_fim_real: producao.data_fim_real || "",
      tempo_estimado: producao.tempo_estimado?.toString() || "",
      tempo_real: producao.tempo_real?.toString() || "",
      status: producao.status,
      valor_producao: producao.valor_producao?.toString() || "",
      consumo_madeira: producao.consumo_madeira?.toString() || "",
      consumo_ferragem: producao.consumo_ferragem?.toString() || "",
      custo_mao_obra: producao.custo_mao_obra?.toString() || "",
      data_liberacao: producao.data_liberacao || "",
      taxa_rejeicao: producao.taxa_rejeicao?.toString() || "",
      observacoes: producao.observacoes || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir esta produção?")) {
      const { error } = await supabase.from("producao").delete().eq("id", id);

      if (error) {
        toast({ title: "Erro ao excluir produção", variant: "destructive" });
      } else {
        toast({ title: "Produção excluída com sucesso!" });
        fetchProducoes();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      project_id: "",
      marceneiro_id: "",
      nome_movel: "",
      ambiente: "",
      data_inicio: "",
      data_fim_prevista: "",
      data_fim_real: "",
      tempo_estimado: "",
      tempo_real: "",
      status: "PLANEJADO",
      valor_producao: "",
      consumo_madeira: "",
      consumo_ferragem: "",
      custo_mao_obra: "",
      data_liberacao: "",
      taxa_rejeicao: "",
      observacoes: "",
    });
  };

  const getProjetoNome = (projectId: string) => {
    const projeto = projetos.find(p => p.id === projectId);
    return projeto ? `${projeto.cod_projeto} - ${projeto.nome_cliente}` : projectId;
  };

  const getMarceneiroNome = (marceneiroId: string | null) => {
    if (!marceneiroId) return "-";
    const marceneiro = marceneiros.find(m => m.id === marceneiroId);
    return marceneiro?.nome || marceneiroId;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produção</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Nova Produção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Produção" : "Nova Produção"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_id">Projeto *</Label>
                  <Select
                    value={formData.project_id}
                    onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {projetos.map((projeto) => (
                        <SelectItem key={projeto.id} value={projeto.id}>
                          {projeto.cod_projeto} - {projeto.nome_cliente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="marceneiro_id">Marceneiro</Label>
                  <Select
                    value={formData.marceneiro_id}
                    onValueChange={(value) => setFormData({ ...formData, marceneiro_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {marceneiros.map((marceneiro) => (
                        <SelectItem key={marceneiro.id} value={marceneiro.id}>
                          {marceneiro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nome_movel">Nome do Móvel</Label>
                  <Input
                    id="nome_movel"
                    value={formData.nome_movel}
                    onChange={(e) => setFormData({ ...formData, nome_movel: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <Input
                    id="ambiente"
                    value={formData.ambiente}
                    onChange={(e) => setFormData({ ...formData, ambiente: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="data_fim_prevista">Data Fim Prevista</Label>
                  <Input
                    id="data_fim_prevista"
                    type="date"
                    value={formData.data_fim_prevista}
                    onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="data_fim_real">Data Fim Real</Label>
                  <Input
                    id="data_fim_real"
                    type="date"
                    value={formData.data_fim_real}
                    onChange={(e) => setFormData({ ...formData, data_fim_real: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tempo_estimado">Tempo Estimado (horas)</Label>
                  <Input
                    id="tempo_estimado"
                    type="number"
                    value={formData.tempo_estimado}
                    onChange={(e) => setFormData({ ...formData, tempo_estimado: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tempo_real">Tempo Real (horas)</Label>
                  <Input
                    id="tempo_real"
                    type="number"
                    value={formData.tempo_real}
                    onChange={(e) => setFormData({ ...formData, tempo_real: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="consumo_madeira">Consumo Madeira (m³)</Label>
                  <Input
                    id="consumo_madeira"
                    type="number"
                    step="0.01"
                    value={formData.consumo_madeira}
                    onChange={(e) => setFormData({ ...formData, consumo_madeira: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="consumo_ferragem">Consumo Ferragem (kg)</Label>
                  <Input
                    id="consumo_ferragem"
                    type="number"
                    step="0.01"
                    value={formData.consumo_ferragem}
                    onChange={(e) => setFormData({ ...formData, consumo_ferragem: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="custo_mao_obra">Custo Mão de Obra (R$)</Label>
                  <Input
                    id="custo_mao_obra"
                    type="number"
                    step="0.01"
                    value={formData.custo_mao_obra}
                    onChange={(e) => setFormData({ ...formData, custo_mao_obra: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="valor_producao">Valor Produção (R$)</Label>
                  <Input
                    id="valor_producao"
                    type="number"
                    step="0.01"
                    value={formData.valor_producao}
                    onChange={(e) => setFormData({ ...formData, valor_producao: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="data_liberacao">Data de Liberação</Label>
                  <Input
                    id="data_liberacao"
                    type="date"
                    value={formData.data_liberacao}
                    onChange={(e) => setFormData({ ...formData, data_liberacao: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="taxa_rejeicao">Taxa de Rejeição (%)</Label>
                  <Input
                    id="taxa_rejeicao"
                    type="number"
                    step="0.01"
                    value={formData.taxa_rejeicao}
                    onChange={(e) => setFormData({ ...formData, taxa_rejeicao: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produções</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Marceneiro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {producoes.map((producao) => (
                <TableRow key={producao.id}>
                  <TableCell>{getProjetoNome(producao.project_id)}</TableCell>
                  <TableCell>{getMarceneiroNome(producao.marceneiro_id)}</TableCell>
                  <TableCell>{producao.status.replace(/_/g, " ")}</TableCell>
                  <TableCell>{producao.data_inicio || "-"}</TableCell>
                  <TableCell>{producao.data_fim_prevista || "-"}</TableCell>
                  <TableCell>
                    {producao.valor_producao ? `R$ ${producao.valor_producao.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(producao)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(producao.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
