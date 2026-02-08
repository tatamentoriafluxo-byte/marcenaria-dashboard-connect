import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FolderKanban, Eye, TrendingUp } from "lucide-react";
import { DashboardKPICard, DashboardFilter, type DashboardFilters } from "./ui";

type DashboardProjetosProps = {
  userId: string;
};

export default function DashboardProjetos({ userId }: DashboardProjetosProps) {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [tabelaOrigemLead, setTabelaOrigemLead] = useState<any[]>([]);
  const [tabelaProjetos, setTabelaProjetos] = useState<any[]>([]);
  const [tabelAmbiente, setTabelAmbiente] = useState<any[]>([]);
  const [tempoVendaContato, setTempoVendaContato] = useState<any[]>([]);
  const [tempoVendaEntrega, setTempoVendaEntrega] = useState<any[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: null,
    ambiente: null,
    origemLead: null,
  });
  const [stats, setStats] = useState({
    totalProjetos: 0,
    totalVisualizacao: 0,
    valorOrcamento: 0,
    totalConversao: 0,
    custoMaoDeObra: 0,
  });

  useEffect(() => {
    if (!userId) return;
    fetchProjetosData();
  }, [userId, filters]);

  const fetchProjetosData = async () => {
    if (!userId) return;

    // Buscar projetos
    let query = supabase
      .from("resumo_projetos")
      .select("*")
      .eq("user_id", userId);

    // Aplicar filtros
    if (filters.periodo) {
      query = query
        .gte("data_contato", filters.periodo.from.toISOString().split('T')[0])
        .lte("data_contato", filters.periodo.to.toISOString().split('T')[0]);
    }
    if (filters.ambiente) {
      query = query.eq("ambiente", filters.ambiente);
    }
    if (filters.origemLead) {
      query = query.eq("origem_lead", filters.origemLead as any);
    }

    const { data } = await query;

    if (data) {
      setProjetos(data);

      // Tabela: Origem lead / Status / Qtd Proj
      const origemLead: any = {};
      data.forEach((proj: any) => {
        const origem = proj.origem_lead || "Não informado";
        const status = proj.status || "Sem status";
        const key = `${origem}|${status}`;

        if (!origemLead[key]) {
          origemLead[key] = { origem, status, quantidade: 0 };
        }
        origemLead[key].quantidade++;
      });
      setTabelaOrigemLead(Object.values(origemLead));

      // Tabela: Cod Projeto / Status / Visualizado
      const projetosTable = data.map((proj: any) => ({
        cod: proj.cod_projeto || "N/A",
        status: proj.status || "Sem status",
        visualizado: proj.visualizado_cliente ? "Sim" : "Não",
      }));
      setTabelaProjetos(projetosTable);

      // Tabela: Ambiente / Origem lead / Conversão
      const ambiente: any = {};
      data.forEach((proj: any) => {
        const amb = proj.ambiente || "Não informado";
        const origem = proj.origem_lead || "Não informado";
        const isConvertido = proj.status === "ENTREGUE" ? 1 : 0;

        const key = `${amb}|${origem}`;
        if (!ambiente[key]) {
          ambiente[key] = { ambiente: amb, origem, conversao: 0, total: 0 };
        }
        ambiente[key].conversao += isConvertido;
        ambiente[key].total++;
      });
      setTabelAmbiente(Object.values(ambiente).map((item: any) => ({
        ...item,
        taxaConversao: ((item.conversao / item.total) * 100).toFixed(1),
      })));

      // Tempo entre Venda e Contato
      const tempoVC: any = {};
      data.forEach((proj: any) => {
        if (proj.data_contato && proj.data_venda) {
          const contato = new Date(proj.data_contato);
          const venda = new Date(proj.data_venda);
          const dias = Math.floor((venda.getTime() - contato.getTime()) / (1000 * 60 * 60 * 24));

          const mes = contato.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
          if (!tempoVC[mes]) tempoVC[mes] = { mes, diasMedio: 0, count: 0 };
          tempoVC[mes].diasMedio += dias;
          tempoVC[mes].count++;
        }
      });
      setTempoVendaContato(Object.values(tempoVC).map((item: any) => ({
        mes: item.mes,
        diasMedio: Math.round(item.diasMedio / item.count),
      })));

      // Tempo entre Venda e Entrega
      const tempoVE: any = {};
      data.forEach((proj: any) => {
        if (proj.data_venda && proj.created_at) {
          const venda = new Date(proj.data_venda);
          const entrega = new Date(proj.created_at);
          const dias = Math.floor((entrega.getTime() - venda.getTime()) / (1000 * 60 * 60 * 24));

          const mes = venda.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
          if (!tempoVE[mes]) tempoVE[mes] = { mes, diasMedio: 0, count: 0 };
          tempoVE[mes].diasMedio += dias;
          tempoVE[mes].count++;
        }
      });
      setTempoVendaEntrega(Object.values(tempoVE).map((item: any) => ({
        mes: item.mes,
        diasMedio: Math.round(item.diasMedio / item.count),
      })));

      // Calcular stats
      const totalVisualizacao = data.filter((p: any) => p.visualizado_cliente).length;
      const totalConvertido = data.filter((p: any) => p.status === "ENTREGUE" || p.status === "CONVERTIDO").length;
      const totalOrcamento = data.reduce((sum: number, p: any) => sum + (p.valor_orcamento || 0), 0);
      const totalMaoDeObra = data.reduce((sum: number, p: any) => sum + (p.custo_mao_obra || 0), 0);

      setStats({
        totalProjetos: data.length,
        totalVisualizacao,
        valorOrcamento: totalOrcamento,
        totalConversao: totalConvertido,
        custoMaoDeObra: totalMaoDeObra,
      });
    }
  };

  const getProjetoPorMes = () => {
    const porMes: any = {};
    projetos.forEach((proj: any) => {
      if (proj.data_contato) {
        const mes = new Date(proj.data_contato).toLocaleDateString('pt-BR', { 
          month: '2-digit', 
          year: 'numeric' 
        });
        porMes[mes] = (porMes[mes] || 0) + 1;
      }
    });
    return Object.entries(porMes).map(([mes, valor]) => ({ mes, projetos: valor }));
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dashboard-navy">RESUMO PROJETOS</h2>
        <DashboardFilter 
          filters={filters} 
          onFilterChange={setFilters}
          showPeriodo
          showAmbiente
          showOrigemLead
        />
      </div>

      {/* 3 KPIs Grandes */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-dashboard-orange">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Total Projetos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-dashboard-navy">{stats.totalProjetos}</div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={getProjetoPorMes()}>
                <Bar dataKey="projetos" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-dashboard-success">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Visualização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-dashboard-navy">{stats.totalVisualizacao}</div>
            <div className="text-sm text-muted-foreground">
              Visualizado pelo cliente
            </div>
            <div className="text-sm font-medium text-dashboard-orange">
              Valor Orçamento: R$ {(stats.valorOrcamento / 1000).toFixed(0)}k
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-dashboard-warning">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Conversão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-dashboard-navy">{stats.totalConversao}</div>
            <div className="text-sm text-dashboard-success font-medium">
              Taxa: {stats.totalProjetos > 0 ? ((stats.totalConversao / stats.totalProjetos) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm font-medium text-dashboard-orange">
              Custo MO: R$ {(stats.custoMaoDeObra / 1000).toFixed(0)}k
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela: Origem Lead / Status / Qtd */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Origem Lead / Status / Qtd Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-dashboard-navy text-white">
                <TableHead className="text-white">Origem Lead</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-right">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabelaOrigemLead.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.origem}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'ENTREGUE' 
                        ? 'bg-dashboard-success/20 text-dashboard-success'
                        : 'bg-dashboard-danger/20 text-dashboard-danger'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{item.quantidade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela: Cod Projeto / Status / Visualizado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cod Projeto / Status / Visualizado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-dashboard-navy text-white">
                <TableHead className="text-white">Cod Projeto</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Visualizado?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabelaProjetos.slice(0, 8).map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.cod}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="text-dashboard-success font-medium">{item.visualizado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabela: Ambiente / Origem Lead / Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ambiente / Origem Lead / Taxa Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-dashboard-navy text-white">
                <TableHead className="text-white">Ambiente</TableHead>
                <TableHead className="text-white">Origem Lead</TableHead>
                <TableHead className="text-white text-right">Taxa Conversão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabelAmbiente.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.ambiente}</TableCell>
                  <TableCell>{item.origem}</TableCell>
                  <TableCell className="text-right font-medium text-dashboard-success">
                    {item.taxaConversao}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gráficos: Tempo Venda-Contato e Venda-Entrega */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tempo Venda - Contato (dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tempoVendaContato}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} angle={-45} height={60} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="diasMedio" stroke="#1e3a5f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tempo Venda - Entrega (dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={tempoVendaEntrega}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} angle={-45} height={60} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="diasMedio" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}