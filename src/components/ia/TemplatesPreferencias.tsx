import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookmarkPlus, ChevronDown, Trash2, Loader2, Save, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Template = {
  id: string;
  nome: string;
  preferencias_texto: string;
  created_at: string;
};

interface TemplatesPreferenciasProps {
  value: string;
  onChange: (value: string) => void;
}

export function TemplatesPreferencias({ value, onChange }: TemplatesPreferenciasProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates-preferencias", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates_preferencias")
        .select("*")
        .eq("user_id", user!.id)
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as Template[];
    },
    enabled: !!user,
  });

  const salvarMutation = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from("templates_preferencias").insert({
        user_id: user!.id,
        nome,
        preferencias_texto: value,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates-preferencias"] });
      toast.success("Template salvo com sucesso!");
      setSaveDialogOpen(false);
      setNovoNome("");
    },
    onError: () => {
      toast.error("Erro ao salvar template");
    },
  });

  const deletarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("templates_preferencias")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates-preferencias"] });
      toast.success("Template removido");
    },
    onError: () => {
      toast.error("Erro ao remover template");
    },
  });

  const handleSelecionarTemplate = (template: Template) => {
    onChange(template.preferencias_texto);
    toast.success(`Template "${template.nome}" aplicado`);
  };

  const handleSalvar = () => {
    if (!novoNome.trim()) {
      toast.error("Digite um nome para o template");
      return;
    }
    if (!value.trim()) {
      toast.error("Digite as preferências antes de salvar");
      return;
    }
    salvarMutation.mutate(novoNome.trim());
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
            <Bookmark className="h-4 w-4" />
            Templates
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {templates.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhum template salvo
            </div>
          ) : (
            templates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                className="flex items-center justify-between group"
                onSelect={(e) => {
                  e.preventDefault();
                  handleSelecionarTemplate(template);
                }}
              >
                <span className="truncate">{template.nome}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletarMutation.mutate(template.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center gap-2 w-full">
                  <BookmarkPlus className="h-4 w-4" />
                  Salvar como novo template
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome-template">Nome do Template</Label>
                    <Input
                      id="nome-template"
                      placeholder="Ex: Moderno Clean, Rústico, Alto Padrão..."
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Preferências a salvar</Label>
                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded-md">
                      {value || "(vazio)"}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvar} disabled={salvarMutation.isPending}>
                    {salvarMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Template
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
