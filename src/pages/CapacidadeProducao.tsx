import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type CapacidadeProducao = {
  id: string;
  mes_referencia: string;
  capacidade_mensal_projetos: number;
  capacidade_mensal_horas: number;
  projetos_realizados: number;
  horas_utilizadas: number;
  taxa_ocupacao: number;
  observacoes: string | null;
};

export default function CapacidadeProducao() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [capacidades, setCapacidades] = useState<CapacidadeProducao[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mes_referencia: new Date().toISOString().split("T")[0].substring(0, 7),
    capacidade_mensal_projetos: "",
    capacidade_mensal_horas: "",
    projetos_realizados: "",
    horas_utilizadas: "",
    observacoes: "",
  });

  useEffect(() => {
    if (user) {
      fetchCapacidades();
    }
  }, [user]);

  const fetchCapacidades = async () => {
    const { data, error } = await supabase
      .from("capacidade_producao")
      .select("*")
      .eq("user_id", user!.id)
      .order("mes_referencia", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar capacidades", variant: "destructive" });
    } else {
      setCapacidades(data || []);
    }
  };

  const calcularTaxaOcupacao = () => {
    const projetos = Number(formData.projetos_realizados) || 0;
    const capacidadeProjetos = Number(formData.capacidade_mensal_projetos) || 1;
    const horas = Number(formData.horas_utilizadas) || 0;
    const capacidadeHoras = Number(formData.capacidade_mensal_horas) || 1;
    
    const taxaProjetos = (projetos / capacidadeProjetos) * 100;
    const taxaHoras = (horas / capacidadeHoras) * 100;
    
    return ((taxaProjetos + taxaHoras) / 2).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      mes_referencia: formData.mes_referencia + "-01",
      capacidade_mensal_projetos: Number(formData.capacidade_mensal_projetos) || 0,
      capacidade_mensal_horas: Number(formData.capacidade_mensal_horas) || 0,
      projetos_realizados: Number(formData.projetos_realizados) || 0,
      horas_utilizadas: Number(formData.horas_utilizadas) || 0,
      taxa_ocupacao: Number(calcularTaxaOcupacao()),
      observacoes: formData.observacoes || null,
      user_id: user!.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("capacidade_producao")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Erro ao atualizar capacidade", variant: "destructive" });
      } else {
        toast({ title: "Capacidade atualizada com sucesso!" });
      }
    } else {
      const { error } = await supabase.from("capacidade_producao").insert(payload);

      if (error) {
        toast({ title: "Erro ao criar capacidade", variant: "destructive" });
      } else {
        toast({ title: "Capacidade criada com sucesso!" });
      }
    }

    fetchCapacidades();
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (capacidade: CapacidadeProducao) => {
    setEditingId(capacidade.id);
    setFormData({
      mes_referencia: capacidade.mes_referencia.substring(0, 7),
      capacidade_mensal_projetos: capacidade.capacidade_mensal_projetos.toString(),
      capacidade_mensal_horas: capacidade.capacidade_mensal_horas.toString(),
      projetos_realizados: capacidade.projetos_realizados.toString(),
      horas_utilizadas: capacidade.horas_utilizadas.toString(),
      observacoes: capacidade.observacoes || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir este registro?")) {
      const { error } = await supabase.from("capacidade_producao").delete().eq("id", id);

      if (error) {
        toast({ title: "Erro ao excluir capacidade", variant: "destructive" });
      } else {
        toast({ title: "Capacidade excluída com sucesso!" });
        fetchCapacidades();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      mes_referencia: new Date().toISOString().split("T")[0].substring(0, 7),
      capacidade_mensal_projetos: "",
      capacidade_mensal_horas: "",
      projetos_realizados: "",
      horas_utilizadas: "",
      observacoes: "",
    });
  };

  const formatMes = (mes: string) => {
    const [ano, mesNum] = mes.split("-");
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${meses[parseInt(mesNum) - 1]}/${ano}`;
  };

  const getTaxaBadge = (taxa: number) => {
    if (taxa >= 90) return <Badge className="bg-accent text-accent-foreground">Ótimo</Badge>;
    if (taxa >= 70) return <Badge className="bg-primary text-primary-foreground">Bom</Badge>;
    if (taxa >= 50) return <Badge className="bg-gold text-gold-foreground">Regular</Badge>;
    return <Badge variant="destructive">Baixo</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Capacidade de Produção</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Nova Capacidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Capacidade" : "Nova Capacidade"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="mes_referencia">Mês de Referência *</Label>
                  <Input
                    id="mes_referencia"
                    type="month"
                    value={formData.mes_referencia}
                    onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="capacidade_mensal_projetos">Capacidade Mensal (Projetos) *</Label>
                  <Input
                    id="capacidade_mensal_projetos"
                    type="number"
                    value={formData.capacidade_mensal_projetos}
                    onChange={(e) => setFormData({ ...formData, capacidade_mensal_projetos: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="capacidade_mensal_horas">Capacidade Mensal (Horas) *</Label>
                  <Input
                    id="capacidade_mensal_horas"
                    type="number"
                    step="0.01"
                    value={formData.capacidade_mensal_horas}
                    onChange={(e) => setFormData({ ...formData, capacidade_mensal_horas: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="projetos_realizados">Projetos Realizados</Label>
                  <Input
                    id="projetos_realizados"
                    type="number"
                    value={formData.projetos_realizados}
                    onChange={(e) => setFormData({ ...formData, projetos_realizados: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="horas_utilizadas">Horas Utilizadas</Label>
                  <Input
                    id="horas_utilizadas"
                    type="number"
                    step="0.01"
                    value={formData.horas_utilizadas}
                    onChange={(e) => setFormData({ ...formData, horas_utilizadas: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Taxa de Ocupação Estimada</Label>
                  <p className="text-2xl font-bold text-primary">{calcularTaxaOcupacao()}%</p>
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
          <CardTitle>Histórico de Capacidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Cap. Projetos</TableHead>
                <TableHead>Cap. Horas</TableHead>
                <TableHead>Proj. Realizados</TableHead>
                <TableHead>Horas Utilizadas</TableHead>
                <TableHead>Taxa Ocupação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capacidades.map((capacidade) => (
                <TableRow key={capacidade.id}>
                  <TableCell className="font-medium">{formatMes(capacidade.mes_referencia)}</TableCell>
                  <TableCell>{capacidade.capacidade_mensal_projetos}</TableCell>
                  <TableCell>{capacidade.capacidade_mensal_horas}h</TableCell>
                  <TableCell>{capacidade.projetos_realizados}</TableCell>
                  <TableCell>{capacidade.horas_utilizadas}h</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {capacidade.taxa_ocupacao.toFixed(1)}%
                      {getTaxaBadge(capacidade.taxa_ocupacao)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(capacidade)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(capacidade.id)}
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
