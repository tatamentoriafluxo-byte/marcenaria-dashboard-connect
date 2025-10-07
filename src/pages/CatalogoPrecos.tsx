import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import { Plus, Search, Filter, Download, Upload, Pencil, Trash2 } from "lucide-react";
import { CatalogoItemDialog } from "@/components/catalogo/CatalogoItemDialog";
import { ImportarCatalogoDialog } from "@/components/catalogo/ImportarCatalogoDialog";

type CatalogoItem = {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  preco_base: number;
  ativo: boolean;
};

export default function CatalogoPrecos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogoItem | null>(null);

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["catalogo-itens", user?.id, categoriaFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("catalogo_itens")
        .select("*")
        .eq("user_id", user!.id)
        .order("nome");

      if (categoriaFilter !== "all") {
        query = query.eq("categoria", categoriaFilter as any);
      }

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CatalogoItem[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("catalogo_itens")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo-itens"] });
      toast.success("Item excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir item");
    },
  });

  const handleEdit = (item: CatalogoItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catálogo de Preços</h1>
          <p className="text-muted-foreground">Gerencie seus itens e valores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="ARMARIO">Armário</SelectItem>
            <SelectItem value="BALCAO">Balcão</SelectItem>
            <SelectItem value="PORTA">Porta</SelectItem>
            <SelectItem value="GAVETA">Gaveta</SelectItem>
            <SelectItem value="ACESSORIO">Acessório</SelectItem>
            <SelectItem value="ACABAMENTO">Acabamento</SelectItem>
            <SelectItem value="FERRAGEM">Ferragem</SelectItem>
            <SelectItem value="VIDRO">Vidro</SelectItem>
            <SelectItem value="ILUMINACAO">Iluminação</SelectItem>
            <SelectItem value="OUTROS">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Preço Base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : itens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.preco_base)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.ativo
                          ? "bg-accent/20 text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CatalogoItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
      />
      <ImportarCatalogoDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}
