import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type CatalogoItemForm = {
  codigo: string;
  nome: string;
  descricao?: string;
  categoria: string;
  unidade_medida: string;
  preco_base: number;
  custo_estimado?: number;
  margem_lucro?: number;
  ativo: boolean;
};

type CatalogoItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any | null;
};

export function CatalogoItemDialog({ open, onOpenChange, item }: CatalogoItemDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<CatalogoItemForm>({
    defaultValues: {
      ativo: true,
      margem_lucro: 30,
    },
  });

  useEffect(() => {
    if (item) {
      reset(item);
    } else {
      reset({
        codigo: "",
        nome: "",
        descricao: "",
        categoria: "OUTROS",
        unidade_medida: "UNIDADE",
        preco_base: 0,
        custo_estimado: 0,
        margem_lucro: 30,
        ativo: true,
      });
    }
  }, [item, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: CatalogoItemForm) => {
      const payload = {
        ...data,
        user_id: user!.id,
      } as any;

      if (item) {
        const { error } = await supabase
          .from("catalogo_itens")
          .update(payload)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("catalogo_itens").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo-itens"] });
      toast.success(item ? "Item atualizado!" : "Item criado!");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar item");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Item" : "Novo Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código</Label>
              <Input {...register("codigo")} placeholder="Ex: ARM-001" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={watch("categoria")}
                onValueChange={(value) => setValue("categoria", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
          </div>

          <div>
            <Label>Nome</Label>
            <Input {...register("nome", { required: true })} placeholder="Nome do item" />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input {...register("descricao")} placeholder="Descrição opcional" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Unidade</Label>
              <Select
                value={watch("unidade_medida")}
                onValueChange={(value) => setValue("unidade_medida", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M2">m²</SelectItem>
                  <SelectItem value="ML">ml</SelectItem>
                  <SelectItem value="UNIDADE">Unidade</SelectItem>
                  <SelectItem value="M3">m³</SelectItem>
                  <SelectItem value="KG">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preço Base</Label>
              <Input
                type="number"
                step="0.01"
                {...register("preco_base", { valueAsNumber: true, required: true })}
              />
            </div>
            <div>
              <Label>Custo Estimado</Label>
              <Input
                type="number"
                step="0.01"
                {...register("custo_estimado", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={watch("ativo")}
                onCheckedChange={(checked) => setValue("ativo", checked)}
              />
              <Label>Item Ativo</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
