import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SelecionarItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: any) => void;
};

export function SelecionarItemDialog({ open, onOpenChange, onSelect }: SelecionarItemDialogProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["catalogo-itens-select", user?.id, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("catalogo_itens")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ativo", true)
        .order("nome");

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user && open,
  });

  const handleSelect = (item: any) => {
    onSelect(item);
    onOpenChange(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Item do Catálogo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="border rounded-lg overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.codigo}</TableCell>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>{item.unidade_medida}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.preco_base)}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleSelect(item)}>
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
