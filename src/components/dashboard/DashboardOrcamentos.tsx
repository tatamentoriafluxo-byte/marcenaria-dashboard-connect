import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

type DashboardOrcamentosProps = {
  userId: string;
};

export default function DashboardOrcamentos({ userId }: DashboardOrcamentosProps) {
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    valorTotal: 0,
    taxaConversao: 0,
    ticketMedio: 0,
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const { data: orcamentos } = await supabase
      .from("orcamentos")
      .select("*")
      .eq("user_id", userId);

    if (orcamentos) {
      const aprovados = orcamentos.filter((o) => o.status === "APROVADO").length;
      const enviados = orcamentos.filter((o) => o.status === "ENVIADO").length;
      const valorTotal = orcamentos.reduce((sum, o) => sum + (o.valor_total || 0), 0);

      setStats({
        totalOrcamentos: orcamentos.length,
        valorTotal,
        taxaConversao: enviados > 0 ? (aprovados / enviados) * 100 : 0,
        ticketMedio: orcamentos.length > 0 ? valorTotal / orcamentos.length : 0,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrcamentos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.valorTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaConversao.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.ticketMedio)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
