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

type Transacao = {
  id: string;
  tipo: string;
  categoria: string;
  valor: number;
  data_transacao: string;
  descricao: string | null;
  forma_pagamento: string | null;
  status_pagamento: string | null;
  numero_nf: string | null;
  project_id: string | null;
  compra_id: string | null;
};

const TIPO_OPTIONS = ["RECEITA", "DESPESA"] as const;
const CATEGORIA_OPTIONS = [
  "VENDA",
  "COMPRA_MATERIAL",
  "SALARIO",
  "ALUGUEL",
  "ENERGIA",
  "OUTROS",
] as const;
const FORMA_PAGAMENTO_OPTIONS = [
  "DINHEIRO",
  "PIX",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "BOLETO",
  "TRANSFERENCIA",
] as const;

export default function FluxoCaixa() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: "RECEITA",
    categoria: "VENDA",
    valor: "",
    data_transacao: new Date().toISOString().split("T")[0],
    descricao: "",
    forma_pagamento: "PIX",
    status_pagamento: "PAGO",
    numero_nf: "",
  });

  useEffect(() => {
    if (user) {
      fetchTransacoes();
    }
  }, [user]);

  const fetchTransacoes = async () => {
    const { data, error } = await supabase
      .from("transacoes_financeiras")
      .select("*")
      .eq("user_id", user!.id)
      .order("data_transacao", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar transações", variant: "destructive" });
    } else {
      setTransacoes(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      tipo: formData.tipo as "RECEITA" | "DESPESA",
      categoria: formData.categoria as any,
      valor: Number(formData.valor),
      data_transacao: formData.data_transacao,
      descricao: formData.descricao || null,
      forma_pagamento: formData.forma_pagamento as any,
      status_pagamento: formData.status_pagamento,
      numero_nf: formData.numero_nf || null,
      user_id: user!.id,
    };

    if (editingId) {
      const { error } = await supabase
        .from("transacoes_financeiras")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Erro ao atualizar transação", variant: "destructive" });
      } else {
        toast({ title: "Transação atualizada com sucesso!" });
      }
    } else {
      const { error } = await supabase.from("transacoes_financeiras").insert(payload);

      if (error) {
        toast({ title: "Erro ao criar transação", variant: "destructive" });
      } else {
        toast({ title: "Transação criada com sucesso!" });
      }
    }

    fetchTransacoes();
    setIsOpen(false);
    resetForm();
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingId(transacao.id);
    setFormData({
      tipo: transacao.tipo,
      categoria: transacao.categoria,
      valor: transacao.valor.toString(),
      data_transacao: transacao.data_transacao,
      descricao: transacao.descricao || "",
      forma_pagamento: transacao.forma_pagamento || "PIX",
      status_pagamento: transacao.status_pagamento || "PAGO",
      numero_nf: transacao.numero_nf || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir esta transação?")) {
      const { error } = await supabase.from("transacoes_financeiras").delete().eq("id", id);

      if (error) {
        toast({ title: "Erro ao excluir transação", variant: "destructive" });
      } else {
        toast({ title: "Transação excluída com sucesso!" });
        fetchTransacoes();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      tipo: "RECEITA",
      categoria: "VENDA",
      valor: "",
      data_transacao: new Date().toISOString().split("T")[0],
      descricao: "",
      forma_pagamento: "PIX",
      status_pagamento: "PAGO",
      numero_nf: "",
    });
  };

  const calcularSaldo = () => {
    return transacoes.reduce((acc, t) => {
      return t.tipo === "RECEITA" ? acc + t.valor : acc - t.valor;
    }, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-2">
            Saldo: <span className={calcularSaldo() >= 0 ? "text-green-600" : "text-red-600"}>
              R$ {calcularSaldo().toFixed(2)}
            </span>
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Transação" : "Nova Transação"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_OPTIONS.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIA_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="data_transacao">Data *</Label>
                  <Input
                    id="data_transacao"
                    type="date"
                    value={formData.data_transacao}
                    onChange={(e) => setFormData({ ...formData, data_transacao: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                  <Select
                    value={formData.forma_pagamento}
                    onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMA_PAGAMENTO_OPTIONS.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status_pagamento">Status</Label>
                  <Select
                    value={formData.status_pagamento}
                    onValueChange={(value) => setFormData({ ...formData, status_pagamento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAGO">PAGO</SelectItem>
                      <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                      <SelectItem value="ATRASADO">ATRASADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="numero_nf">Número NF</Label>
                  <Input
                    id="numero_nf"
                    value={formData.numero_nf}
                    onChange={(e) => setFormData({ ...formData, numero_nf: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
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
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Forma Pgto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoes.map((transacao) => (
                <TableRow key={transacao.id}>
                  <TableCell>{transacao.data_transacao}</TableCell>
                  <TableCell>
                    <span className={transacao.tipo === "RECEITA" ? "text-green-600" : "text-red-600"}>
                      {transacao.tipo}
                    </span>
                  </TableCell>
                  <TableCell>{transacao.categoria.replace(/_/g, " ")}</TableCell>
                  <TableCell>{transacao.descricao || "-"}</TableCell>
                  <TableCell>
                    {transacao.forma_pagamento?.replace(/_/g, " ") || "-"}
                  </TableCell>
                  <TableCell className={transacao.tipo === "RECEITA" ? "text-green-600" : "text-red-600"}>
                    {transacao.tipo === "RECEITA" ? "+" : "-"}R$ {transacao.valor.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(transacao)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(transacao.id)}
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
