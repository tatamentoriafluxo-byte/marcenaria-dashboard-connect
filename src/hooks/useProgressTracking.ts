import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProgressTracking = () => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress-tracking"],
    queryFn: async () => {
      const [
        materiaisCount,
        fornecedoresCount,
        funcionariosCount,
        vendedoresCount,
        parceirosCount,
        clientesCount,
        projetosCount,
        comprasCount,
        estoqueCount,
      ] = await Promise.all([
        supabase.from("materiais").select("*", { count: "exact", head: true }),
        supabase.from("fornecedores").select("*", { count: "exact", head: true }),
        supabase.from("funcionarios").select("*", { count: "exact", head: true }),
        supabase.from("vendedores").select("*", { count: "exact", head: true }),
        supabase.from("parceiros").select("*", { count: "exact", head: true }),
        supabase.from("clientes").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("compras").select("*", { count: "exact", head: true }),
        supabase.from("estoque").select("*", { count: "exact", head: true }),
      ]);

      return {
        materiais: materiaisCount.count || 0,
        fornecedores: fornecedoresCount.count || 0,
        funcionarios: funcionariosCount.count || 0,
        vendedores: vendedoresCount.count || 0,
        parceiros: parceirosCount.count || 0,
        clientes: clientesCount.count || 0,
        projetos: projetosCount.count || 0,
        compras: comprasCount.count || 0,
        estoque: estoqueCount.count || 0,
      };
    },
  });

  const isEtapa1Complete = 
    (progress?.materiais || 0) > 0 &&
    (progress?.fornecedores || 0) > 0 &&
    (progress?.funcionarios || 0) > 0 &&
    (progress?.vendedores || 0) > 0;

  const isEtapa2Complete = 
    isEtapa1Complete &&
    (progress?.clientes || 0) > 0 &&
    (progress?.projetos || 0) > 0;

  const isEtapa3Complete = 
    isEtapa2Complete &&
    (progress?.compras || 0) > 0 &&
    (progress?.estoque || 0) > 0;

  const overallProgress = progress ? 
    Math.round(
      ((progress.materiais > 0 ? 1 : 0) +
       (progress.fornecedores > 0 ? 1 : 0) +
       (progress.funcionarios > 0 ? 1 : 0) +
       (progress.vendedores > 0 ? 1 : 0) +
       (progress.clientes > 0 ? 1 : 0) +
       (progress.projetos > 0 ? 1 : 0) +
       (progress.compras > 0 ? 1 : 0) +
       (progress.estoque > 0 ? 1 : 0)) / 8 * 100
    ) : 0;

  return {
    progress,
    isLoading,
    isEtapa1Complete,
    isEtapa2Complete,
    isEtapa3Complete,
    overallProgress,
  };
};
