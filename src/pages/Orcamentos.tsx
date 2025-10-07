import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, FileText, Pencil, Download, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Orcamento = {
  id: string;
  numero_orcamento: string;
  nome_cliente: string;
  telefone_cliente: string;
  data_orcamento: string;
  data_validade: string;
  status: string;
  valor_total: number;
  project_id?: string;
};

const statusColors = {
  RASCUNHO: "bg-muted text-muted-foreground",
  ENVIADO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  APROVADO: "bg-accent text-accent-foreground",
  REJEITADO: "bg-destructive text-destructive-foreground",
  EXPIRADO: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  CONVERTIDO: "bg-primary text-primary-foreground",
};

export default function Orcamentos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);

  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ["orcamentos", user?.id, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("orcamentos")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `numero_orcamento.ilike.%${searchTerm}%,nome_cliente.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Orcamento[];
    },
    enabled: !!user,
  });

  const converterMutation = useMutation({
    mutationFn: async (orcamentoId: string) => {
      const orc = orcamentos.find(o => o.id === orcamentoId);
      if (!orc) throw new Error("Orçamento não encontrado");

      // Buscar itens do orçamento
      const { data: itens, error: itensError } = await supabase
        .from("orcamentos_itens")
        .select("*")
        .eq("orcamento_id", orcamentoId);

      if (itensError) throw itensError;

      // Criar projeto
      const { data: projeto, error: projetoError } = await supabase
        .from("projects")
        .insert({
          user_id: user!.id,
          cod_projeto: `PROJ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          nome_cliente: orc.nome_cliente,
          telefone: orc.telefone_cliente || "",
          ambiente: "Convertido de Orçamento",
          origem_lead: "ORCAMENTO" as any,
          vendedor_responsavel: "Sistema",
          data_contato: new Date().toISOString().split('T')[0],
          status: "ORCAMENTO" as any,
          valor_orcamento: orc.valor_total,
        })
        .select()
        .single();

      if (projetoError) throw projetoError;

      // Atualizar orçamento com project_id e status CONVERTIDO
      const { error: updateError } = await supabase
        .from("orcamentos")
        .update({ 
          project_id: projeto.id,
          status: "CONVERTIDO" as any
        })
        .eq("id", orcamentoId);

      if (updateError) throw updateError;

      return projeto;
    },
    onSuccess: (projeto) => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento convertido em projeto com sucesso!");
      navigate(`/projetos`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao converter orçamento");
    },
  });

  const handleConvert = (orc: Orcamento) => {
    setSelectedOrcamento(orc);
    setConvertDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus orçamentos</p>
        </div>
        <Button onClick={() => navigate("/orcamentos/novo")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : orcamentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum orçamento encontrado
            </p>
            <Button onClick={() => navigate("/orcamentos/novo")}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Orçamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orcamentos.map((orc) => (
            <Card key={orc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{orc.numero_orcamento}</CardTitle>
                    <CardDescription>{orc.nome_cliente}</CardDescription>
                  </div>
                  <Badge className={statusColors[orc.status as keyof typeof statusColors]}>
                    {orc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>
                      {format(new Date(orc.data_orcamento), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Validade:</span>
                    <span>
                      {format(new Date(orc.data_validade), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-base border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(orc.valor_total)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/orcamentos/${orc.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  {(orc.status === "APROVADO" || orc.status === "ENVIADO") && !orc.project_id && (
                    <Button 
                      size="sm" 
                      onClick={() => handleConvert(orc)}
                      disabled={converterMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Converter
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter Orçamento em Projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja converter o orçamento <strong>{selectedOrcamento?.numero_orcamento}</strong> em um projeto?
              <br /><br />
              Isso irá:
              <ul className="list-disc list-inside mt-2">
                <li>Criar um novo projeto vinculado</li>
                <li>Marcar o orçamento como CONVERTIDO</li>
                <li>Permitir acompanhamento completo do projeto</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedOrcamento) {
                  converterMutation.mutate(selectedOrcamento.id);
                  setConvertDialogOpen(false);
                }
              }}
            >
              Converter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
