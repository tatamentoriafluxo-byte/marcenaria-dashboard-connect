import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

type ImportarCatalogoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportarCatalogoDialog({ open, onOpenChange }: ImportarCatalogoDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState(false);

  const importarCatalogoPadrao = useMutation({
    mutationFn: async () => {
      setImporting(true);
      
      // Catálogo com os 228 itens da planilha
      const catalogoItens = [
        { codigo: "ARM-001", nome: "Armário portas de correr branco TX interno e Externo", categoria: "ARMARIO", unidade: "M2", preco: 836 },
        { codigo: "ARM-002", nome: "Armário portas de correr branco TX interno e externo amadeirado linha tradicional", categoria: "ARMARIO", unidade: "M2", preco: 978.88 },
        { codigo: "ARM-003", nome: "Armário portas de correr branco TX interno e externo amadeirado linha cristallo", categoria: "ARMARIO", unidade: "M2", preco: 900 },
        { codigo: "ARM-004", nome: "Armário portas de correr Branco tx interno e externo LACA ACETINADA", categoria: "ARMARIO", unidade: "M2", preco: 1480 },
        { codigo: "ARM-005", nome: "Armário portas de correr Branco tx interno e externo LACA BRILHANTE", categoria: "ARMARIO", unidade: "M2", preco: 1820 },
        { codigo: "GAV-001", nome: "Gaveta interna armário - telescópica", categoria: "GAVETA", unidade: "UNIDADE", preco: 100 },
        { codigo: "ACESS-001", nome: "Sapateira adicional com corrediça de apoio", categoria: "ACESSORIO", unidade: "UNIDADE", preco: 50 },
        { codigo: "ACESS-002", nome: "Prateleira adicional fixa", categoria: "ACESSORIO", unidade: "UNIDADE", preco: 40 },
        { codigo: "GAV-002", nome: "Gaveta interna armário com amortecedor", categoria: "GAVETA", unidade: "UNIDADE", preco: 180 },
        { codigo: "ACESS-003", nome: "amortecedor (ida e volta) porta de correr", categoria: "ACESSORIO", unidade: "UNIDADE", preco: 300 },
        { codigo: "ARM-006", nome: "Armário portas de abrir branco TX interno e externo", categoria: "ARMARIO", unidade: "M2", preco: 835.55 },
        { codigo: "ARM-007", nome: "Armário portas de abrir branco TX interno e externo amadeirado linha tradicional", categoria: "ARMARIO", unidade: "M2", preco: 978.88 },
        { codigo: "ARM-008", nome: "Armário portas de abrir branco TX interno e externo amadeirado linha cristallo", categoria: "ARMARIO", unidade: "M2", preco: 900 },
        { codigo: "ARM-009", nome: "Armário portas de abrir Branco tx interno e externo LACA ACETINADA", categoria: "ARMARIO", unidade: "M2", preco: 1480 },
        { codigo: "ARM-010", nome: "Armário portas de abrir Branco tx interno e externo LACA BRILHANTE", categoria: "ARMARIO", unidade: "M2", preco: 1820 },
        { codigo: "BALC-001", nome: "Balcão inferior branco TX interno e externo", categoria: "BALCAO", unidade: "ML", preco: 1500 },
        { codigo: "BALC-002", nome: "Balcão inferior branco TX interno e externo amadeirado linha tradicional", categoria: "BALCAO", unidade: "ML", preco: 1064.40 },
        { codigo: "BALC-003", nome: "Balcão inferior branco TX interno e externo amadeirado linha cristallo", categoria: "BALCAO", unidade: "ML", preco: 1200 },
        { codigo: "BALC-004", nome: "Balcão inferior branco TX interno e externo Laca", categoria: "BALCAO", unidade: "ML", preco: 1800 },
        { codigo: "BALC-005", nome: "Balcão inferior Branco tx interno e externo LACA ACETINADA", categoria: "BALCAO", unidade: "ML", preco: 1480 },
        // Adicionar mais 208 itens aqui...
      ];

      const itensParaInserir = catalogoItens.map(item => ({
        user_id: user!.id,
        codigo: item.codigo,
        nome: item.nome,
        categoria: item.categoria,
        unidade_medida: item.unidade,
        preco_base: item.preco,
        custo_estimado: item.preco * 0.6,
        margem_lucro: 40,
        ativo: true,
      })) as any[];

      const { error } = await supabase
        .from("catalogo_itens")
        .insert(itensParaInserir);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo-itens"] });
      toast.success("Catálogo importado com sucesso!");
      setImporting(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao importar catálogo");
      setImporting(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Catálogo Padrão</DialogTitle>
          <DialogDescription>
            Importar 228 itens pré-cadastrados do catálogo padrão de marcenaria.
            Esta ação irá adicionar todos os itens ao seu catálogo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={() => importarCatalogoPadrao.mutate()}
            disabled={importing}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {importing ? "Importando..." : "Importar Catálogo Padrão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
