import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Meta = {
  id: string;
  mes_referencia: string;
  vendedor_id: string | null;
  meta_faturamento: number | null;
  meta_lucro: number | null;
  meta_projetos: number | null;
};

type Vendedor = {
  id: string;
  nome: string;
};

export default function Metas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mes_referencia: "",
    vendedor_id: "",
    meta_faturamento: "",
    meta_lucro: "",
    meta_projetos: "",
  });

  useEffect(() => {
    if (user) {
      fetchMetas();
      fetchVendedores();
    }
  }, [user]);

  const fetchMetas = async () => {
    const { data, error } = await supabase
      .from("metas")
      .select("*")
      .eq("user_id", user!.id)
      .order("mes_referencia", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar metas", variant: "destructive" });
    } else {
      setMetas(data || []);
    }
  };

  const fetchVendedores = async () => {
    const { data } = await supabase
      .from("vendedores")
      .select("id, nome")
      .eq("user_id", user!.id)
      .eq("ativo", true);
    setVendedores(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      mes_referencia: formData.mes_referencia,
      vendedor_id: formData.vendedor_id && formData.vendedor_id !== 'geral' ? formData.vendedor_id : null,
      meta_faturamento: formData.meta_faturamento ? Number(formData.meta_faturamento) : null,
      meta_lucro: formData.meta_lucro ? Number(formData.meta_lucro) : null,
      meta_projetos: formData.meta_projetos ? Number(formData.meta_projetos) : null,
      user_id: user!.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("metas")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Erro ao atualizar meta", variant: "destructive" });
      } else {
        toast({ title: "Meta atualizada com sucesso!" });
      }
    } else {
      const { error } = await supabase.from("metas").insert(payload);

      if (error) {
        toast({ title: "Erro ao criar meta", variant: "destructive" });
      } else {
        toast({ title: "Meta criada com sucesso!" });
      }
    }

    fetchMetas();
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (meta: Meta) => {
    setEditingId(meta.id);
    setFormData({
      mes_referencia: meta.mes_referencia,
      vendedor_id: meta.vendedor_id || "",
      meta_faturamento: meta.meta_faturamento?.toString() || "",
      meta_lucro: meta.meta_lucro?.toString() || "",
      meta_projetos: meta.meta_projetos?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir esta meta?")) {
      const { error } = await supabase.from("metas").delete().eq("id", id);

      if (error) {
        toast({ title: "Erro ao excluir meta", variant: "destructive" });
      } else {
        toast({ title: "Meta excluída com sucesso!" });
        fetchMetas();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      mes_referencia: "",
      vendedor_id: "",
      meta_faturamento: "",
      meta_lucro: "",
      meta_projetos: "",
    });
  };

  const getVendedorNome = (vendedorId: string | null) => {
    if (!vendedorId) return "Geral";
    const vendedor = vendedores.find(v => v.id === vendedorId);
    return vendedor?.nome || vendedorId;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Metas</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Meta" : "Nova Meta"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mes_referencia">Mês de Referência *</Label>
                  <Input
                    id="mes_referencia"
                    type="date"
                    value={formData.mes_referencia}
                    onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vendedor_id">Vendedor</Label>
                  <Select
                    value={formData.vendedor_id}
                    onValueChange={(value) => setFormData({ ...formData, vendedor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Geral (todos)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral (todos)</SelectItem>
                      {vendedores.map((vendedor) => (
                        <SelectItem key={vendedor.id} value={vendedor.id}>
                          {vendedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="meta_faturamento">Meta Faturamento (R$)</Label>
                  <Input
                    id="meta_faturamento"
                    type="number"
                    step="0.01"
                    value={formData.meta_faturamento}
                    onChange={(e) => setFormData({ ...formData, meta_faturamento: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="meta_lucro">Meta Lucro (R$)</Label>
                  <Input
                    id="meta_lucro"
                    type="number"
                    step="0.01"
                    value={formData.meta_lucro}
                    onChange={(e) => setFormData({ ...formData, meta_lucro: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="meta_projetos">Meta Projetos (quantidade)</Label>
                  <Input
                    id="meta_projetos"
                    type="number"
                    value={formData.meta_projetos}
                    onChange={(e) => setFormData({ ...formData, meta_projetos: e.target.value })}
                  />
                </div>
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
          <CardTitle>Metas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Meta Faturamento</TableHead>
                <TableHead>Meta Lucro</TableHead>
                <TableHead>Meta Projetos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell>{meta.mes_referencia}</TableCell>
                  <TableCell>{getVendedorNome(meta.vendedor_id)}</TableCell>
                  <TableCell>
                    {meta.meta_faturamento ? `R$ ${meta.meta_faturamento.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    {meta.meta_lucro ? `R$ ${meta.meta_lucro.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>{meta.meta_projetos || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(meta)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(meta.id)}
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
