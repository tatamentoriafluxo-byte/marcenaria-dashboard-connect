import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type Feedback = {
  id: string;
  project_id: string;
  data_feedback: string | null;
  avaliacao_vendedor: string | null;
  avaliacao_equipe_projetos: string | null;
  avaliacao_fabricacao: string | null;
  avaliacao_montagem: string | null;
  avaliacao_atendimento_geral: string | null;
  recomendaria_servico: boolean | null;
  sugestoes_melhoria: string | null;
};

type Projeto = {
  id: string;
  cod_projeto: string;
  nome_cliente: string;
};

export default function Feedbacks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project_id: "",
    data_feedback: new Date().toISOString().split("T")[0],
    avaliacao_vendedor: "EXCELENTE" as const,
    avaliacao_equipe_projetos: "EXCELENTE" as const,
    avaliacao_fabricacao: "EXCELENTE" as const,
    avaliacao_montagem: "EXCELENTE" as const,
    avaliacao_atendimento_geral: "EXCELENTE" as const,
    recomendaria_servico: true,
    sugestoes_melhoria: "",
  });

  useEffect(() => {
    if (user) {
      fetchFeedbacks();
      fetchProjetos();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("user_id", user!.id)
      .order("data_feedback", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar feedbacks", variant: "destructive" });
    } else {
      setFeedbacks(data || []);
    }
  };

  const fetchProjetos = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, cod_projeto, nome_cliente")
      .eq("user_id", user!.id);
    setProjetos(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      project_id: formData.project_id,
      data_feedback: formData.data_feedback,
      avaliacao_vendedor: formData.avaliacao_vendedor as any,
      avaliacao_equipe_projetos: formData.avaliacao_equipe_projetos as any,
      avaliacao_fabricacao: formData.avaliacao_fabricacao as any,
      avaliacao_montagem: formData.avaliacao_montagem as any,
      avaliacao_atendimento_geral: formData.avaliacao_atendimento_geral as any,
      recomendaria_servico: formData.recomendaria_servico,
      sugestoes_melhoria: formData.sugestoes_melhoria || null,
      user_id: user!.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("feedbacks")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Erro ao atualizar feedback", variant: "destructive" });
      } else {
        toast({ title: "Feedback atualizado com sucesso!" });
      }
    } else {
      const { error } = await supabase.from("feedbacks").insert(payload);

      if (error) {
        toast({ title: "Erro ao criar feedback", variant: "destructive" });
      } else {
        toast({ title: "Feedback criado com sucesso!" });
      }
    }

    fetchFeedbacks();
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (feedback: Feedback) => {
    setEditingId(feedback.id);
    setFormData({
      project_id: feedback.project_id,
      data_feedback: feedback.data_feedback || new Date().toISOString().split("T")[0],
      avaliacao_vendedor: feedback.avaliacao_vendedor || "EXCELENTE",
      avaliacao_equipe_projetos: feedback.avaliacao_equipe_projetos || "EXCELENTE",
      avaliacao_fabricacao: feedback.avaliacao_fabricacao || "EXCELENTE",
      avaliacao_montagem: feedback.avaliacao_montagem || "EXCELENTE",
      avaliacao_atendimento_geral: feedback.avaliacao_atendimento_geral || "EXCELENTE",
      recomendaria_servico: feedback.recomendaria_servico ?? true,
      sugestoes_melhoria: feedback.sugestoes_melhoria || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir este feedback?")) {
      const { error } = await supabase.from("feedbacks").delete().eq("id", id);

      if (error) {
        toast({ title: "Erro ao excluir feedback", variant: "destructive" });
      } else {
        toast({ title: "Feedback excluído com sucesso!" });
        fetchFeedbacks();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      project_id: "",
      data_feedback: new Date().toISOString().split("T")[0],
      avaliacao_vendedor: "EXCELENTE",
      avaliacao_equipe_projetos: "EXCELENTE",
      avaliacao_fabricacao: "EXCELENTE",
      avaliacao_montagem: "EXCELENTE",
      avaliacao_atendimento_geral: "EXCELENTE",
      recomendaria_servico: true,
      sugestoes_melhoria: "",
    });
  };

  const getProjetoNome = (projectId: string) => {
    const projeto = projetos.find(p => p.id === projectId);
    return projeto ? `${projeto.cod_projeto} - ${projeto.nome_cliente}` : projectId;
  };

  const renderStars = (rating: string | null) => {
    if (!rating) return "-";
    const ratingMap: Record<string, number> = { "RUIM": 1, "REGULAR": 2, "BOM": 3, "MUITO_BOM": 4, "EXCELENTE": 5 };
    const stars = ratingMap[rating] || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Feedback de Clientes</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Novo Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Feedback" : "Novo Feedback"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
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
                  <Label htmlFor="avaliacao_vendedor">Avaliação Vendedor</Label>
                  <Select
                    value={formData.avaliacao_vendedor}
                    onValueChange={(value) => setFormData({ ...formData, avaliacao_vendedor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUIM">Ruim</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="BOM">Bom</SelectItem>
                      <SelectItem value="MUITO_BOM">Muito Bom</SelectItem>
                      <SelectItem value="EXCELENTE">Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="avaliacao_equipe_projetos">Avaliação Equipe Projetos</Label>
                  <Select
                    value={formData.avaliacao_equipe_projetos}
                    onValueChange={(value) => setFormData({ ...formData, avaliacao_equipe_projetos: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUIM">Ruim</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="BOM">Bom</SelectItem>
                      <SelectItem value="MUITO_BOM">Muito Bom</SelectItem>
                      <SelectItem value="EXCELENTE">Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="avaliacao_fabricacao">Avaliação Fabricação</Label>
                  <Select
                    value={formData.avaliacao_fabricacao}
                    onValueChange={(value) => setFormData({ ...formData, avaliacao_fabricacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUIM">Ruim</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="BOM">Bom</SelectItem>
                      <SelectItem value="MUITO_BOM">Muito Bom</SelectItem>
                      <SelectItem value="EXCELENTE">Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="avaliacao_montagem">Avaliação Montagem</Label>
                  <Select
                    value={formData.avaliacao_montagem}
                    onValueChange={(value) => setFormData({ ...formData, avaliacao_montagem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUIM">Ruim</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="BOM">Bom</SelectItem>
                      <SelectItem value="MUITO_BOM">Muito Bom</SelectItem>
                      <SelectItem value="EXCELENTE">Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="avaliacao_atendimento_geral">Avaliação Atendimento Geral</Label>
                  <Select
                    value={formData.avaliacao_atendimento_geral}
                    onValueChange={(value) => setFormData({ ...formData, avaliacao_atendimento_geral: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUIM">Ruim</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="BOM">Bom</SelectItem>
                      <SelectItem value="MUITO_BOM">Muito Bom</SelectItem>
                      <SelectItem value="EXCELENTE">Excelente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 flex items-center gap-4">
                  <Label htmlFor="recomendaria_servico">Recomendaria o Serviço?</Label>
                  <Switch
                    id="recomendaria_servico"
                    checked={formData.recomendaria_servico}
                    onCheckedChange={(checked) => setFormData({ ...formData, recomendaria_servico: checked })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sugestoes_melhoria">Sugestões de Melhoria</Label>
                <Textarea
                  id="sugestoes_melhoria"
                  value={formData.sugestoes_melhoria}
                  onChange={(e) => setFormData({ ...formData, sugestoes_melhoria: e.target.value })}
                  rows={4}
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
          <CardTitle>Feedbacks Recebidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Fabricação</TableHead>
                <TableHead>Montagem</TableHead>
                <TableHead>Recomenda</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{getProjetoNome(feedback.project_id)}</TableCell>
                  <TableCell>{feedback.data_feedback || "-"}</TableCell>
                  <TableCell>{renderStars(feedback.avaliacao_vendedor)}</TableCell>
                  <TableCell>{renderStars(feedback.avaliacao_fabricacao)}</TableCell>
                  <TableCell>{renderStars(feedback.avaliacao_montagem)}</TableCell>
                  <TableCell>
                    {feedback.recomendaria_servico ? "Sim" : "Não"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(feedback)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(feedback.id)}
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
