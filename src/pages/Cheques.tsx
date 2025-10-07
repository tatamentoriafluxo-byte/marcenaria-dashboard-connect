import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Check } from "lucide-react";
import { format } from "date-fns";

interface Cheque {
  id: string;
  tipo: string;
  numero_cheque: string;
  banco: string;
  titular: string;
  valor: number;
  data_emissao: string;
  data_compensacao: string;
  status: string;
  repassado_para: string;
}

export default function Cheques() {
  const { user } = useAuth();
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: "RECEBIDO",
    numero_cheque: "",
    banco: "",
    agencia: "",
    conta: "",
    titular: "",
    valor: "",
    data_emissao: format(new Date(), 'yyyy-MM-dd'),
    data_compensacao: format(new Date(), 'yyyy-MM-dd'),
    observacoes: "",
  });

  useEffect(() => {
    if (user) {
      loadCheques();
    }
  }, [user]);

  const loadCheques = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cheques")
      .select("*")
      .eq("user_id", user!.id)
      .order("data_compensacao", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar cheques", variant: "destructive" });
    } else {
      setCheques(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("cheques")
      .insert({
        user_id: user!.id,
        tipo: formData.tipo as any,
        numero_cheque: formData.numero_cheque,
        banco: formData.banco,
        agencia: formData.agencia,
        conta: formData.conta,
        titular: formData.titular,
        valor: parseFloat(formData.valor),
        data_emissao: formData.data_emissao,
        data_compensacao: formData.data_compensacao,
        observacoes: formData.observacoes,
      } as any);

    if (error) {
      toast({ title: "Erro ao cadastrar cheque", variant: "destructive" });
      return;
    }

    toast({ title: "Cheque cadastrado com sucesso!" });
    setIsModalOpen(false);
    resetForm();
    loadCheques();
  };

  const handleMarcarCompensar = async (id: string) => {
    const { error } = await supabase
      .from("cheques")
      .update({ status: "COMPENSADO" } as any)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao marcar cheque", variant: "destructive" });
    } else {
      toast({ title: "Cheque marcado como compensado!" });
      loadCheques();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este cheque?")) return;

    const { error } = await supabase.from("cheques").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir cheque", variant: "destructive" });
    } else {
      toast({ title: "Cheque excluído com sucesso!" });
      loadCheques();
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: "RECEBIDO",
      numero_cheque: "",
      banco: "",
      agencia: "",
      conta: "",
      titular: "",
      valor: "",
      data_emissao: format(new Date(), 'yyyy-MM-dd'),
      data_compensacao: format(new Date(), 'yyyy-MM-dd'),
      observacoes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDENTE: "secondary",
      COMPENSADO: "default",
      DEVOLVIDO: "destructive",
      REPASSADO: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const filteredCheques = cheques.filter((cheque) => {
    const matchesSearch = 
      cheque.numero_cheque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.titular.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "TODOS" || cheque.tipo === tipoFilter;
    const matchesStatus = statusFilter === "TODOS" || cheque.status === statusFilter;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Controle de Cheques</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cheque
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Cheque</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECEBIDO">Recebido</SelectItem>
                      <SelectItem value="EMITIDO">Emitido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Número do Cheque *</Label>
                  <Input value={formData.numero_cheque} onChange={(e) => setFormData({...formData, numero_cheque: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Banco *</Label>
                  <Input value={formData.banco} onChange={(e) => setFormData({...formData, banco: e.target.value})} required />
                </div>

                <div className="space-y-2">
                  <Label>Agência</Label>
                  <Input value={formData.agencia} onChange={(e) => setFormData({...formData, agencia: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Conta</Label>
                  <Input value={formData.conta} onChange={(e) => setFormData({...formData, conta: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titular *</Label>
                  <Input value={formData.titular} onChange={(e) => setFormData({...formData, titular: e.target.value})} required />
                </div>

                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Emissão</Label>
                  <Input type="date" value={formData.data_emissao} onChange={(e) => setFormData({...formData, data_emissao: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Data Compensação *</Label>
                  <Input type="date" value={formData.data_compensacao} onChange={(e) => setFormData({...formData, data_compensacao: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou titular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="RECEBIDO">Recebido</SelectItem>
                <SelectItem value="EMITIDO">Emitido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="COMPENSADO">Compensado</SelectItem>
                <SelectItem value="DEVOLVIDO">Devolvido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center">Carregando...</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Compensação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheques.map((cheque) => (
                <TableRow key={cheque.id}>
                  <TableCell><Badge variant={cheque.tipo === 'RECEBIDO' ? 'default' : 'secondary'}>{cheque.tipo}</Badge></TableCell>
                  <TableCell>{cheque.numero_cheque}</TableCell>
                  <TableCell>{cheque.banco}</TableCell>
                  <TableCell>{cheque.titular}</TableCell>
                  <TableCell>{formatCurrency(cheque.valor)}</TableCell>
                  <TableCell>{format(new Date(cheque.data_compensacao), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(cheque.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {cheque.status === 'PENDENTE' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarcarCompensar(cheque.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(cheque.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
