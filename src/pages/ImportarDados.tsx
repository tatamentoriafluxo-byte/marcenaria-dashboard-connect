import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  Upload,
  Users,
  Truck,
  Building2,
  Package,
  FileText,
  Briefcase,
  UserCog,
  FolderOpen,
  Car,
  Wrench,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ImportType = {
  id: string;
  nome: string;
  descricao: string;
  icon: any;
  tabela: string;
  campos: string[];
  camposObrigatorios: string[];
  exemplo: Record<string, string>;
};

const TIPOS_IMPORTACAO: ImportType[] = [
  {
    id: "clientes",
    nome: "Clientes",
    descricao: "Importar cadastro de clientes",
    icon: Users,
    tabela: "clientes",
    campos: ["nome", "telefone", "email", "cpf_cnpj", "endereco", "cidade", "estado", "cep", "observacoes"],
    camposObrigatorios: ["nome", "telefone"],
    exemplo: {
      nome: "João Silva",
      telefone: "(11) 98765-4321",
      email: "joao@email.com",
      cpf_cnpj: "123.456.789-00",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
      observacoes: "Cliente preferencial",
    },
  },
  {
    id: "fornecedores",
    nome: "Fornecedores",
    descricao: "Importar cadastro de fornecedores",
    icon: Building2,
    tabela: "fornecedores",
    campos: ["nome", "cnpj", "telefone", "email", "endereco", "cidade", "estado", "tipo_material", "prazo_entrega_medio"],
    camposObrigatorios: ["nome"],
    exemplo: {
      nome: "Madeiras ABC",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 3456-7890",
      email: "contato@madeiraabc.com",
      tipo_material: "MDF, Compensado",
      prazo_entrega_medio: "7",
    },
  },
  {
    id: "vendedores",
    nome: "Vendedores",
    descricao: "Importar cadastro de vendedores",
    icon: Briefcase,
    tabela: "vendedores",
    campos: ["nome", "telefone", "email", "comissao_percentual", "meta_mensal"],
    camposObrigatorios: ["nome"],
    exemplo: {
      nome: "Maria Santos",
      telefone: "(11) 99999-8888",
      email: "maria@vendas.com",
      comissao_percentual: "5",
      meta_mensal: "50000",
    },
  },
  {
    id: "parceiros",
    nome: "Parceiros",
    descricao: "Importar cadastro de parceiros",
    icon: UserCog,
    tabela: "parceiros",
    campos: ["nome", "categoria", "cpf_cnpj", "telefone", "email", "endereco", "cidade", "estado", "cep", "percentual_comissao", "tipo_remuneracao", "observacoes"],
    camposObrigatorios: ["nome", "categoria"],
    exemplo: {
      nome: "Carlos Indicador",
      categoria: "INDICADOR",
      telefone: "(11) 97777-6666",
      percentual_comissao: "3",
      tipo_remuneracao: "PERCENTUAL",
    },
  },
  {
    id: "materiais",
    nome: "Materiais",
    descricao: "Importar cadastro de materiais",
    icon: Package,
    tabela: "materiais",
    campos: ["nome", "codigo", "tipo", "unidade", "descricao", "preco_medio"],
    camposObrigatorios: ["nome", "tipo", "unidade"],
    exemplo: {
      nome: "MDF 15mm Branco",
      codigo: "MDF-15-BR",
      tipo: "MDF",
      unidade: "M2",
      preco_medio: "85.50",
      descricao: "Chapa MDF 15mm acabamento branco",
    },
  },
  {
    id: "catalogo",
    nome: "Catálogo de Preços",
    descricao: "Importar itens do catálogo",
    icon: DollarSign,
    tabela: "catalogo_itens",
    campos: ["nome", "codigo", "categoria", "unidade_medida", "preco_base", "custo_estimado", "margem_lucro", "descricao"],
    camposObrigatorios: ["nome", "categoria", "unidade_medida", "preco_base"],
    exemplo: {
      nome: "Armário de Cozinha 2 Portas",
      codigo: "ARM-COZ-2P",
      categoria: "ARMARIOS",
      unidade_medida: "UNIDADE",
      preco_base: "850.00",
      custo_estimado: "550.00",
      margem_lucro: "35",
    },
  },
  {
    id: "funcionarios",
    nome: "Funcionários",
    descricao: "Importar cadastro de funcionários",
    icon: Users,
    tabela: "funcionarios",
    campos: ["nome", "telefone", "tipo", "salario"],
    camposObrigatorios: ["nome", "tipo"],
    exemplo: {
      nome: "Pedro Marceneiro",
      telefone: "(11) 96666-5555",
      tipo: "Marceneiro",
      salario: "3500.00",
    },
  },
  {
    id: "veiculos",
    nome: "Veículos",
    descricao: "Importar cadastro de veículos",
    icon: Car,
    tabela: "veiculos",
    campos: ["placa", "modelo", "marca", "ano", "tipo", "cor", "km_atual", "valor_aquisicao", "data_aquisicao"],
    camposObrigatorios: ["placa", "modelo", "tipo"],
    exemplo: {
      placa: "ABC-1234",
      modelo: "Fiorino",
      marca: "Fiat",
      ano: "2020",
      tipo: "UTILITARIO",
      km_atual: "45000",
    },
  },
  {
    id: "ferramentas",
    nome: "Ferramentas",
    descricao: "Importar cadastro de ferramentas",
    icon: Wrench,
    tabela: "ferramentas",
    campos: ["nome", "codigo_patrimonio", "categoria", "tipo", "marca", "modelo", "numero_serie", "localizacao", "valor_aquisicao", "data_aquisicao"],
    camposObrigatorios: ["nome", "categoria", "tipo", "localizacao"],
    exemplo: {
      nome: "Serra Circular",
      categoria: "CORTE",
      tipo: "SERRA_CIRCULAR",
      marca: "Makita",
      localizacao: "MARCENARIA",
      valor_aquisicao: "450.00",
    },
  },
  {
    id: "fretistas",
    nome: "Fretistas",
    descricao: "Importar cadastro de fretistas",
    icon: Truck,
    tabela: "fretistas",
    campos: ["nome", "cpf_cnpj", "telefone", "email", "tipo_veiculo", "placa_veiculo", "capacidade_carga", "valor_km", "valor_frete_fixo"],
    camposObrigatorios: ["nome"],
    exemplo: {
      nome: "José Frete",
      telefone: "(11) 95555-4444",
      tipo_veiculo: "VAN",
      placa_veiculo: "XYZ-9876",
      valor_km: "2.50",
    },
  },
];

export default function ImportarDados() {
  const { user } = useAuth();
  const [tipoSelecionado, setTipoSelecionado] = useState<ImportType | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dadosParsed, setDadosParsed] = useState<any[]>([]);
  const [validacao, setValidacao] = useState<{
    validos: number;
    avisos: number;
    erros: number;
    detalhes: Array<{ linha: number; tipo: 'sucesso' | 'aviso' | 'erro'; mensagem: string }>;
  } | null>(null);
  const [importando, setImportando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState<{
    sucesso: number;
    avisos: number;
    erros: number;
  } | null>(null);

  const gerarCSVTemplate = (tipo: ImportType) => {
    const headers = tipo.campos.join(",");
    const exemplo = tipo.campos.map(campo => tipo.exemplo[campo] || "").join(",");
    const exemplo2 = tipo.campos.map(campo => "").join(",");
    
    const csv = `${headers}\n${exemplo}\n${exemplo2}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `template_${tipo.id}.csv`;
    link.click();
    
    toast.success(`Template de ${tipo.nome} baixado!`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivo(file);
    setDadosParsed([]);
    setValidacao(null);
    setResultado(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("Arquivo CSV vazio ou inválido");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim());
      const dados = lines.slice(1).map((line, index) => {
        const values = line.split(",").map(v => v.trim());
        const obj: any = { _linha: index + 2 };
        headers.forEach((header, i) => {
          obj[header] = values[i] || "";
        });
        return obj;
      });

      setDadosParsed(dados);
      validarDados(dados);
    } catch (error) {
      toast.error("Erro ao ler arquivo CSV");
      console.error(error);
    }
  };

  const validarDados = (dados: any[]) => {
    if (!tipoSelecionado) return;

    let validos = 0;
    let avisos = 0;
    let erros = 0;
    const detalhes: Array<{ linha: number; tipo: 'sucesso' | 'aviso' | 'erro'; mensagem: string }> = [];

    dados.forEach((registro) => {
      let temErro = false;
      let temAviso = false;

      // Validar campos obrigatórios
      tipoSelecionado.camposObrigatorios.forEach((campo) => {
        if (!registro[campo] || registro[campo].trim() === "") {
          temErro = true;
          detalhes.push({
            linha: registro._linha,
            tipo: 'erro',
            mensagem: `Campo obrigatório "${campo}" vazio`,
          });
        }
      });

      // Validações específicas
      if (tipoSelecionado.id === "clientes" || tipoSelecionado.id === "fornecedores") {
        if (registro.email && !registro.email.includes("@")) {
          temAviso = true;
          detalhes.push({
            linha: registro._linha,
            tipo: 'aviso',
            mensagem: "Email pode estar inválido",
          });
        }
      }

      if (temErro) {
        erros++;
      } else if (temAviso) {
        avisos++;
      } else {
        validos++;
      }
    });

    setValidacao({ validos, avisos, erros, detalhes });
  };

  const importarDados = async () => {
    if (!tipoSelecionado || !user || dadosParsed.length === 0) return;

    setImportando(true);
    setProgresso(0);

    let sucessos = 0;
    let avisosCount = 0;
    let errosCount = 0;

    for (let i = 0; i < dadosParsed.length; i++) {
      const registro = dadosParsed[i];
      
      // Pular registros com erros
      const temErro = tipoSelecionado.camposObrigatorios.some(
        campo => !registro[campo] || registro[campo].trim() === ""
      );

      if (temErro) {
        errosCount++;
        setProgresso(((i + 1) / dadosParsed.length) * 100);
        continue;
      }

      try {
        const dadosInsert: any = { user_id: user.id };
        
        tipoSelecionado.campos.forEach((campo) => {
          if (registro[campo]) {
            dadosInsert[campo] = registro[campo];
          }
        });

        // Conversões específicas
        if (tipoSelecionado.id === "materiais" && dadosInsert.preco_medio) {
          dadosInsert.preco_medio = parseFloat(dadosInsert.preco_medio.replace(",", "."));
        }
        if (tipoSelecionado.id === "catalogo" && dadosInsert.preco_base) {
          dadosInsert.preco_base = parseFloat(dadosInsert.preco_base.replace(",", "."));
        }
        if (tipoSelecionado.id === "vendedores" && dadosInsert.meta_mensal) {
          dadosInsert.meta_mensal = parseFloat(dadosInsert.meta_mensal.replace(",", "."));
        }

        const { error } = await supabase
          .from(tipoSelecionado.tabela as any)
          .insert([dadosInsert]);

        if (error) {
          console.error(`Erro na linha ${registro._linha}:`, error);
          errosCount++;
        } else {
          sucessos++;
        }
      } catch (error) {
        console.error(`Erro ao processar linha ${registro._linha}:`, error);
        errosCount++;
      }

      setProgresso(((i + 1) / dadosParsed.length) * 100);
    }

    setImportando(false);
    setResultado({ sucesso: sucessos, avisos: avisosCount, erros: errosCount });
    
    if (sucessos > 0) {
      toast.success(`${sucessos} registro(s) importado(s) com sucesso!`);
    }
    if (errosCount > 0) {
      toast.error(`${errosCount} registro(s) com erro`);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Importar Dados</h1>
        <p className="text-muted-foreground mt-2">
          Importe dados existentes em massa para o sistema usando arquivos CSV
        </p>
      </div>

      {!tipoSelecionado ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPOS_IMPORTACAO.map((tipo) => {
            const Icon = tipo.icon;
            return (
              <Card
                key={tipo.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setTipoSelecionado(tipo)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tipo.nome}</CardTitle>
                      <CardDescription className="text-sm">{tipo.descricao}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {(() => {
                      const Icon = tipoSelecionado.icon;
                      return <Icon className="h-6 w-6 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle>Importar {tipoSelecionado.nome}</CardTitle>
                    <CardDescription>{tipoSelecionado.descricao}</CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => {
                  setTipoSelecionado(null);
                  setArquivo(null);
                  setDadosParsed([]);
                  setValidacao(null);
                  setResultado(null);
                }}>
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Passo 1: Baixar Modelo CSV</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Baixe o modelo CSV com os campos corretos e exemplos
                </p>
                <Button onClick={() => gerarCSVTemplate(tipoSelecionado)} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Modelo CSV
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Passo 2: Upload do Arquivo</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Preencha o modelo baixado e faça upload do arquivo
                </p>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">
                      {arquivo ? arquivo.name : "Clique para selecionar arquivo CSV"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ou arraste e solte aqui
                    </p>
                  </label>
                </div>
              </div>

              {validacao && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Passo 3: Validação</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">{validacao.validos}</p>
                          <p className="text-xs text-green-600">Válidos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">{validacao.avisos}</p>
                          <p className="text-xs text-yellow-600">Avisos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold text-red-600">{validacao.erros}</p>
                          <p className="text-xs text-red-600">Erros</p>
                        </div>
                      </div>
                    </div>

                    {validacao.detalhes.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {validacao.detalhes.slice(0, 10).map((detalhe, idx) => (
                          <Alert
                            key={idx}
                            variant={detalhe.tipo === 'erro' ? 'destructive' : 'default'}
                          >
                            <AlertDescription>
                              <span className="font-semibold">Linha {detalhe.linha}:</span>{' '}
                              {detalhe.mensagem}
                            </AlertDescription>
                          </Alert>
                        ))}
                        {validacao.detalhes.length > 10 && (
                          <p className="text-sm text-muted-foreground text-center">
                            ... e mais {validacao.detalhes.length - 10} avisos/erros
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Passo 4: Importar</h3>
                    {importando ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-sm">Importando dados...</p>
                        </div>
                        <Progress value={progresso} />
                      </div>
                    ) : resultado ? (
                      <div className="space-y-3">
                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Importação concluída!</strong>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li>✅ {resultado.sucesso} registros importados</li>
                              {resultado.erros > 0 && <li>❌ {resultado.erros} com erros</li>}
                            </ul>
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={() => {
                            setArquivo(null);
                            setDadosParsed([]);
                            setValidacao(null);
                            setResultado(null);
                          }}
                        >
                          Nova Importação
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={importarDados}
                        disabled={validacao.validos === 0}
                        size="lg"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Importar {validacao.validos} registro(s)
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
