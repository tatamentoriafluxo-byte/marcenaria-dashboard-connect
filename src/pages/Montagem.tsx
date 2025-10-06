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

type Montagem = {
  id: string;
  project_id: string;
  montador_id: string | null;
  nome_movel: string | null;
  ambiente: string | null;
  data_montagem: string | null;
  tempo_estimado: number | null;
  tempo_real: number | null;
  status: string;
  valor_montagem: number | null;
  desafios: string | null;
  feedback_cliente: string | null;
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

const STATUS_OPTIONS = ["AGENDADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"] as const;

export default function Montagem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [montagens, setMontagens] = useState<Montagem[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [montadores, setMontadores] = useState<Funcionario[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project_id: "",
    montador_id: "",
    nome_movel: "",
    ambiente: "",
    data_montagem: "",
    tempo_estimado: "",
    tempo_real: "",
    status: "AGENDADO",
    valor_montagem: "",
    desafios: "",
    feedback_cliente: "",
  });

  useEffect(() => {
    if (user) {
      fetchMontagens();
      fetchProjetos();
      fetchMontadores();
    }
  }, [user]);

  const fetchMontagens = async () => {
    const { data, error } = await supabase
      .from("montagem")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar montagens", variant: "destructive" });
    } else {
      setMontagens(data || []);
    }
  };

  const fetchProjetos = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, cod_projeto, nome_cliente")
      .eq("user_id", user!.id);
    setProjetos(data || []);
  };

  const fetchMontadores = async () => {
    const { data } = await supabase
      .from("funcionarios")
      .select("id, nome")
      .eq("user_id", user!.id)
      .eq("tipo", "Montador")
      .eq("ativo", true);
    setMontadores(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      project_id: formData.project_id,
      montador_id: formData.montador_id || null,
      nome_movel: formData.nome_movel || null,
      ambiente: formData.ambiente || null,
      data_montagem: formData.data_montagem || null,
      tempo_estimado: formData.tempo_estimado ? Number(formData.tempo_estimado) : null,
      tempo_real: formData.tempo_real ? Number(formData.tempo_real) : null,
      status: formData.status as "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO",
      valor_montagem: formData.valor_montagem ? Number(formData.valor_montagem) : null,
      desafios: formData.desafios || null,
      feedback_cliente: formData.feedback_cliente || null,
      user_id: user!.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("montagem")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Erro ao atualizar montagem", variant: "destructive" });
      } else {
        toast({ title: "Montagem atualizada com sucesso!" });
      }
    } else {
      const { error } = await supabase.from("montagem").insert(payload);

      if (error) {
        toast({ title: "Erro ao criar montagem", variant: "destructive" });
      } else {
        toast({ title: "Montagem criada com sucesso!" });
      }
    }

    fetchMontagens();
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (montagem: Montagem) => {
    setEditingId(montagem.id);
    setFormData({
      project_id: montagem.project_id,
      montador_id: montagem.montador_id || "",
      nome_movel: montagem.nome_movel || "",
      ambiente: montagem.ambiente || "",
      data_montagem: montagem.data_montagem || "",
      tempo_estimado: montagem.tempo_estimado?.toString() || "",
      tempo_real: montagem.tempo_real?.toString() || "",
      status: montagem.status,
      valor_montagem: montagem.valor_montagem?.toString() || "",
      desafios: montagem.desafios || "",
      feedback_cliente: montagem.feedback_cliente || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir esta montagem?")) {
      const { error } = await supabase.from("montagem").delete().eq("id", id);

      if (error) {
        toast({ title: "Erro ao excluir montagem", variant: "destructive" });
      } else {
        toast({ title: "Montagem excluída com sucesso!" });
        fetchMontagens();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      project_id: "",
      montador_id: "",
      nome_movel: "",
      ambiente: "",
      data_montagem: "",
      tempo_estimado: "",
      tempo_real: "",
      status: "AGENDADO",
      valor_montagem: "",
      desafios: "",
      feedback_cliente: "",
    });
  };

  const getProjetoNome = (projectId: string) => {
    const projeto = projetos.find(p => p.id === projectId);
    return projeto ? `${projeto.cod_projeto} - ${projeto.nome_cliente}` : projectId;
  };

  const getMontadorNome = (montadorId: string | null) => {
    if (!montadorId) return "-";
    const montador = montadores.find(m => m.id === montadorId);
    return montador?.nome || montadorId;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Montagem</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Nova Montagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Montagem" : "Nova Montagem"}
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
                  <Label htmlFor="montador_id">Montador</Label>
                  <Select
                    value={formData.montador_id}
                    onValueChange={(value) => setFormData({ ...formData, montador_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {montadores.map((montador) => (
                        <SelectItem key={montador.id} value={montador.id}>
                          {montador.nome}
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
                  <Label htmlFor="data_montagem">Data Montagem</Label>
                  <Input
                    id="data_montagem"
                    type="date"
                    value={formData.data_montagem}
                    onChange={(e) => setFormData({ ...formData, data_montagem: e.target.value })}
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

                <div className="col-span-2">
                  <Label htmlFor="valor_montagem">Valor Montagem (R$)</Label>
                  <Input
                    id="valor_montagem"
                    type="number"
                    step="0.01"
                    value={formData.valor_montagem}
                    onChange={(e) => setFormData({ ...formData, valor_montagem: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="desafios">Desafios/Observações</Label>
                <Textarea
                  id="desafios"
                  value={formData.desafios}
                  onChange={(e) => setFormData({ ...formData, desafios: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="feedback_cliente">Feedback do Cliente</Label>
                <Textarea
                  id="feedback_cliente"
                  value={formData.feedback_cliente}
                  onChange={(e) => setFormData({ ...formData, feedback_cliente: e.target.value })}
                  rows={2}
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
          <CardTitle>Lista de Montagens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Montador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tempo Est.</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {montagens.map((montagem) => (
                <TableRow key={montagem.id}>
                  <TableCell>{getProjetoNome(montagem.project_id)}</TableCell>
                  <TableCell>{getMontadorNome(montagem.montador_id)}</TableCell>
                  <TableCell>{montagem.status.replace(/_/g, " ")}</TableCell>
                  <TableCell>{montagem.data_montagem || "-"}</TableCell>
                  <TableCell>{montagem.tempo_estimado ? `${montagem.tempo_estimado}h` : "-"}</TableCell>
                  <TableCell>
                    {montagem.valor_montagem ? `R$ ${montagem.valor_montagem.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(montagem)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(montagem.id)}
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
