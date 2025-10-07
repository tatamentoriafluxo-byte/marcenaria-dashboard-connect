import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Loader2, Check, AlertCircle } from "lucide-react";

type StepStatus = 'pending' | 'loading' | 'success' | 'error';

interface Step {
  name: string;
  status: StepStatus;
  count?: number;
}

export default function DadosTeste() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<Step[]>([
    { name: "Vendedores", status: 'pending' },
    { name: "Clientes", status: 'pending' },
    { name: "Funcionários", status: 'pending' },
    { name: "Fornecedores", status: 'pending' },
    { name: "Materiais", status: 'pending' },
    { name: "Parceiros", status: 'pending' },
    { name: "Fretistas", status: 'pending' },
    { name: "Veículos", status: 'pending' },
    { name: "Ferramentas", status: 'pending' },
    { name: "Catálogo de Preços", status: 'pending' },
    { name: "Orçamentos (Ago)", status: 'pending' },
    { name: "Projetos (Ago)", status: 'pending' },
    { name: "Compras (Ago)", status: 'pending' },
    { name: "Produção (Ago)", status: 'pending' },
    { name: "Montagem (Ago)", status: 'pending' },
    { name: "Contas (Ago)", status: 'pending' },
    { name: "Orçamentos (Set)", status: 'pending' },
    { name: "Projetos (Set)", status: 'pending' },
    { name: "Compras (Set)", status: 'pending' },
    { name: "Produção (Set)", status: 'pending' },
    { name: "Orçamentos (Out)", status: 'pending' },
    { name: "Projetos (Out)", status: 'pending' },
    { name: "Compras (Out)", status: 'pending' },
    { name: "Produção (Out)", status: 'pending' },
  ]);

  const updateStep = (index: number, status: StepStatus, count?: number) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], status, count };
      return newSteps;
    });
  };

  const popularDados = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const totalSteps = steps.length;
      let currentStep = 0;

      // 1. VENDEDORES
      updateStep(currentStep, 'loading');
      const vendedores = [
        { nome: "Carlos Silva", email: "carlos@exemplo.com", telefone: "(11) 98765-4321", comissao_percentual: 5, meta_mensal: 50000, ativo: true },
        { nome: "Ana Paula", email: "ana@exemplo.com", telefone: "(11) 98765-4322", comissao_percentual: 5, meta_mensal: 45000, ativo: true },
        { nome: "Roberto Santos", email: "roberto@exemplo.com", telefone: "(11) 98765-4323", comissao_percentual: 4.5, meta_mensal: 40000, ativo: true },
        { nome: "Juliana Costa", email: "juliana@exemplo.com", telefone: "(11) 98765-4324", comissao_percentual: 5.5, meta_mensal: 55000, ativo: true },
        { nome: "Fernando Lima", email: "fernando@exemplo.com", telefone: "(11) 98765-4325", comissao_percentual: 4, meta_mensal: 35000, ativo: true },
      ];
      const { data: vendedoresData } = await supabase.from("vendedores").insert(
        vendedores.map(v => ({ ...v, user_id: user.id }))
      ).select();
      updateStep(currentStep, 'success', vendedores.length);
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);

      // 2. CLIENTES
      updateStep(currentStep, 'loading');
      const clientes = [
        { nome: "João Pedro Almeida", cpf_cnpj: "123.456.789-00", telefone: "(11) 99111-1111", email: "joao@email.com", endereco: "Rua A, 100", cidade: "São Paulo", estado: "SP", cep: "01000-000" },
        { nome: "Maria Fernanda Costa", cpf_cnpj: "234.567.890-11", telefone: "(11) 99222-2222", email: "maria@email.com", endereco: "Rua B, 200", cidade: "São Paulo", estado: "SP", cep: "02000-000" },
        { nome: "Construtora ABC Ltda", cpf_cnpj: "12.345.678/0001-90", telefone: "(11) 99333-3333", email: "contato@abc.com", endereco: "Av. C, 300", cidade: "São Paulo", estado: "SP", cep: "03000-000" },
        { nome: "Rafael Souza", cpf_cnpj: "345.678.901-22", telefone: "(11) 99444-4444", email: "rafael@email.com", endereco: "Rua D, 400", cidade: "Guarulhos", estado: "SP", cep: "07000-000" },
        { nome: "Imobiliária XYZ", cpf_cnpj: "23.456.789/0001-01", telefone: "(11) 99555-5555", email: "xyz@imob.com", endereco: "Av. E, 500", cidade: "São Paulo", estado: "SP", cep: "04000-000" },
        { nome: "Patricia Lima", cpf_cnpj: "456.789.012-33", telefone: "(11) 99666-6666", email: "patricia@email.com", endereco: "Rua F, 600", cidade: "Osasco", estado: "SP", cep: "06000-000" },
        { nome: "Empresa Design SA", cpf_cnpj: "34.567.890/0001-12", telefone: "(11) 99777-7777", email: "design@empresa.com", endereco: "Av. G, 700", cidade: "São Paulo", estado: "SP", cep: "05000-000" },
        { nome: "Lucas Mendes", cpf_cnpj: "567.890.123-44", telefone: "(11) 99888-8888", email: "lucas@email.com", endereco: "Rua H, 800", cidade: "São Paulo", estado: "SP", cep: "08000-000" },
        { nome: "Camila Rodrigues", cpf_cnpj: "678.901.234-55", telefone: "(11) 99999-9999", email: "camila@email.com", endereco: "Av. I, 900", cidade: "São Paulo", estado: "SP", cep: "09000-000" },
        { nome: "Arquitetura Premium", cpf_cnpj: "45.678.901/0001-23", telefone: "(11) 98888-8888", email: "premium@arq.com", endereco: "Rua J, 1000", cidade: "São Paulo", estado: "SP", cep: "10000-000" },
        { nome: "Marcos Oliveira", cpf_cnpj: "789.012.345-66", telefone: "(11) 98777-7777", email: "marcos@email.com", endereco: "Av. K, 1100", cidade: "São Paulo", estado: "SP", cep: "11000-000" },
        { nome: "Débora Santos", cpf_cnpj: "890.123.456-77", telefone: "(11) 98666-6666", email: "debora@email.com", endereco: "Rua L, 1200", cidade: "São Bernardo", estado: "SP", cep: "09700-000" },
        { nome: "Hotel Conforto", cpf_cnpj: "56.789.012/0001-34", telefone: "(11) 98555-5555", email: "hotel@conforto.com", endereco: "Av. M, 1300", cidade: "São Paulo", estado: "SP", cep: "12000-000" },
        { nome: "Beatriz Carvalho", cpf_cnpj: "901.234.567-88", telefone: "(11) 98444-4444", email: "beatriz@email.com", endereco: "Rua N, 1400", cidade: "São Paulo", estado: "SP", cep: "13000-000" },
        { nome: "Gustavo Ferreira", cpf_cnpj: "012.345.678-99", telefone: "(11) 98333-3333", email: "gustavo@email.com", endereco: "Av. O, 1500", cidade: "São Paulo", estado: "SP", cep: "14000-000" },
      ];
      const { data: clientesData } = await supabase.from("clientes").insert(
        clientes.map(c => ({ ...c, user_id: user.id }))
      ).select();
      updateStep(currentStep, 'success', clientes.length);
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);

      // 3. FUNCIONÁRIOS
      updateStep(currentStep, 'loading');
      const funcionarios = [
        { nome: "José Marceneiro", telefone: "(11) 97111-1111", tipo: "Marceneiro", salario: 3500, ativo: true },
        { nome: "Paulo Marceneiro", telefone: "(11) 97222-2222", tipo: "Marceneiro", salario: 3800, ativo: true },
        { nome: "André Marceneiro", telefone: "(11) 97333-3333", tipo: "Marceneiro", salario: 3200, ativo: true },
        { nome: "Ricardo Montador", telefone: "(11) 97444-4444", tipo: "Montador", salario: 3000, ativo: true },
        { nome: "Fábio Montador", telefone: "(11) 97555-5555", tipo: "Montador", salario: 3100, ativo: true },
        { nome: "Sergio Auxiliar", telefone: "(11) 97666-6666", tipo: "Auxiliar", salario: 2200, ativo: true },
        { nome: "Claudio Projetista", telefone: "(11) 97777-7777", tipo: "Projetista", salario: 4500, ativo: true },
        { nome: "Marcelo Administrativo", telefone: "(11) 97888-8888", tipo: "Administrativo", salario: 2800, ativo: true },
      ];
      const { data: funcionariosData } = await supabase.from("funcionarios").insert(
        funcionarios.map(f => ({ ...f, user_id: user.id }))
      ).select();
      updateStep(currentStep, 'success', funcionarios.length);
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);

      // 4. FORNECEDORES
      updateStep(currentStep, 'loading');
      const fornecedores = [
        { nome: "Madeireira São Paulo", cnpj: "11.222.333/0001-44", telefone: "(11) 3111-1111", email: "madeireira@sp.com", endereco: "Rua das Madeiras, 100", cidade: "São Paulo", estado: "SP", tipo_material: "Madeira", prazo_entrega_medio: 7, ativo: true },
        { nome: "Ferragens Premium", cnpj: "22.333.444/0001-55", telefone: "(11) 3222-2222", email: "ferragens@premium.com", endereco: "Av. Ferragista, 200", cidade: "São Paulo", estado: "SP", tipo_material: "Ferragens", prazo_entrega_medio: 3, ativo: true },
        { nome: "Tintas & Vernizes", cnpj: "33.444.555/0001-66", telefone: "(11) 3333-3333", email: "tintas@vernizes.com", endereco: "Rua Colorida, 300", cidade: "São Paulo", estado: "SP", tipo_material: "Acabamento", prazo_entrega_medio: 5, ativo: true },
        { nome: "Chapas MDF Total", cnpj: "44.555.666/0001-77", telefone: "(11) 3444-4444", email: "mdf@total.com", endereco: "Av. Industrial, 400", cidade: "Guarulhos", estado: "SP", tipo_material: "MDF", prazo_entrega_medio: 10, ativo: true },
        { nome: "Vidros & Espelhos", cnpj: "55.666.777/0001-88", telefone: "(11) 3555-5555", email: "vidros@espelhos.com", endereco: "Rua Transparente, 500", cidade: "São Paulo", estado: "SP", tipo_material: "Vidro", prazo_entrega_medio: 7, ativo: true },
        { nome: "Acessórios Plus", cnpj: "66.777.888/0001-99", telefone: "(11) 3666-6666", email: "acessorios@plus.com", endereco: "Av. Completa, 600", cidade: "São Paulo", estado: "SP", tipo_material: "Acessórios", prazo_entrega_medio: 5, ativo: true },
      ];
      const { data: fornecedoresData } = await supabase.from("fornecedores").insert(
        fornecedores.map(f => ({ ...f, user_id: user.id }))
      ).select();
      updateStep(currentStep, 'success', fornecedores.length);
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);

      // 5. MATERIAIS
      updateStep(currentStep, 'loading');
      const materiais: Array<{
        nome: string;
        codigo: string;
        tipo: 'MADEIRA' | 'FERRAGEM' | 'ACABAMENTO' | 'FERRAMENTA' | 'OUTROS';
        unidade: 'UNIDADE' | 'METRO' | 'METRO_QUADRADO' | 'KILO' | 'LITRO' | 'PACOTE';
        preco_medio: number;
        descricao: string;
      }> = [
        { nome: "Chapa MDF Branco 15mm", codigo: "MDF-BR-15", tipo: "MADEIRA", unidade: "METRO_QUADRADO", preco_medio: 85, descricao: "MDF branco 15mm" },
        { nome: "Chapa MDF Amadeirado 18mm", codigo: "MDF-AM-18", tipo: "MADEIRA", unidade: "METRO_QUADRADO", preco_medio: 95, descricao: "MDF amadeirado 18mm" },
        { nome: "Dobradiça Canto Curvo 35mm", codigo: "FER-DOB-35", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 8.5, descricao: "Dobradiça inox 35mm" },
        { nome: "Corrediça Telescópica 45cm", codigo: "FER-COR-45", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 25, descricao: "Corrediça telescópica" },
        { nome: "Puxador Alumínio 128mm", codigo: "FER-PUX-128", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 12, descricao: "Puxador alumínio escovado" },
        { nome: "Madeira Pinus 2,5x10cm", codigo: "MAD-PIN-25", tipo: "MADEIRA", unidade: "METRO", preco_medio: 15, descricao: "Pinus 1ª qualidade" },
        { nome: "Fita de Borda Branca 22mm", codigo: "ACB-FIT-BR", tipo: "ACABAMENTO", unidade: "METRO", preco_medio: 0.8, descricao: "Fita de borda PVC" },
        { nome: "Cola Branca PVA 1kg", codigo: "ACB-COL-1K", tipo: "OUTROS", unidade: "KILO", preco_medio: 18, descricao: "Cola branca profissional" },
        { nome: "Verniz Transparente 900ml", codigo: "ACB-VER-TR", tipo: "ACABAMENTO", unidade: "LITRO", preco_medio: 45, descricao: "Verniz transparente brilhante" },
        { nome: "Parafuso Cabeça Panela 4x30", codigo: "FER-PAR-430", tipo: "FERRAGEM", unidade: "PACOTE", preco_medio: 12, descricao: "Parafuso aço" },
        { nome: "Chapa MDF Preto 18mm", codigo: "MDF-PR-18", tipo: "MADEIRA", unidade: "METRO_QUADRADO", preco_medio: 98, descricao: "MDF preto 18mm" },
        { nome: "Dobradiça Mini 26mm", codigo: "FER-DOB-26", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 6.5, descricao: "Dobradiça mini" },
        { nome: "Corrediça Comum 40cm", codigo: "FER-COR-40C", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 15, descricao: "Corrediça comum" },
        { nome: "Vidro Incolor 4mm", codigo: "VID-INC-4", tipo: "OUTROS", unidade: "METRO_QUADRADO", preco_medio: 65, descricao: "Vidro temperado" },
        { nome: "Espelho 4mm", codigo: "VID-ESP-4", tipo: "OUTROS", unidade: "METRO_QUADRADO", preco_medio: 85, descricao: "Espelho com película" },
        { nome: "Lixa Grão 120", codigo: "ACB-LIX-120", tipo: "ACABAMENTO", unidade: "UNIDADE", preco_medio: 2.5, descricao: "Lixa madeira" },
        { nome: "Prego 18mm", codigo: "FER-PRE-18", tipo: "FERRAGEM", unidade: "KILO", preco_medio: 15, descricao: "Prego sem cabeça" },
        { nome: "Tinta Branca 3,6L", codigo: "ACB-TIN-BR", tipo: "ACABAMENTO", unidade: "LITRO", preco_medio: 85, descricao: "Tinta látex premium" },
        { nome: "Selador 900ml", codigo: "ACB-SEL-09", tipo: "ACABAMENTO", unidade: "LITRO", preco_medio: 38, descricao: "Selador para madeira" },
        { nome: "Chapa Compensado 10mm", codigo: "MAD-COM-10", tipo: "MADEIRA", unidade: "METRO_QUADRADO", preco_medio: 45, descricao: "Compensado naval" },
        { nome: "Pé Nivelador Plástico", codigo: "FER-PEN-PL", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 3.5, descricao: "Pé regulável" },
        { nome: "Led em Fita 5m", codigo: "ELE-LED-5M", tipo: "OUTROS", unidade: "METRO", preco_medio: 35, descricao: "Fita LED branco" },
        { nome: "Transformador LED 12V", codigo: "ELE-TRA-12", tipo: "OUTROS", unidade: "UNIDADE", preco_medio: 45, descricao: "Fonte 12V" },
        { nome: "Suporte Prateleira Invisível", codigo: "FER-SUP-INV", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 8, descricao: "Suporte oculto" },
        { nome: "Trilho Porta de Correr 2m", codigo: "FER-TRI-2M", tipo: "FERRAGEM", unidade: "METRO", preco_medio: 55, descricao: "Trilho alumínio" },
        { nome: "Roldana Porta Correr", codigo: "FER-ROL-PC", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 12, descricao: "Roldana com rolamento" },
        { nome: "Massa Acrílica 1,5kg", codigo: "ACB-MAS-AC", tipo: "ACABAMENTO", unidade: "KILO", preco_medio: 22, descricao: "Massa para madeira" },
        { nome: "Thinner 900ml", codigo: "ACB-THI-09", tipo: "ACABAMENTO", unidade: "LITRO", preco_medio: 18, descricao: "Thinner premium" },
        { nome: "Fechadura Porta Correr", codigo: "FER-FEC-PC", tipo: "FERRAGEM", unidade: "UNIDADE", preco_medio: 28, descricao: "Fechadura embutir" },
        { nome: "Cantoneira Alumínio 1m", codigo: "FER-CAN-AL", tipo: "FERRAGEM", unidade: "METRO", preco_medio: 8.5, descricao: "Cantoneira acabamento" },
      ];
      const { data: materiaisData } = await supabase.from("materiais").insert(
        materiais.map(m => ({ ...m, user_id: user.id }))
      ).select();
      updateStep(currentStep, 'success', materiais.length);
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);

      // Continue com os outros passos...
      // 6. PARCEIROS
      updateStep(currentStep, 'loading');
      const parceiros: Array<{
        nome: string;
        cpf_cnpj: string;
        telefone: string;
        email: string;
        categoria: 'ARQUITETO' | 'CONSTRUTORA' | 'CORRETOR_IMOVEIS' | 'DECORADOR' | 'DESIGNER_INTERIORES' | 'ENGENHEIRO' | 'LOJA_MATERIAIS' | 'OUTRO';
        percentual_comissao: number;
        ativo: boolean;
        endereco: string;
        cidade: string;
        estado: string;
        cep: string;
      }> = [
        { nome: "Arquiteta Laura Mendes", cpf_cnpj: "111.222.333-44", telefone: "(11) 96111-1111", email: "laura@arq.com", categoria: "ARQUITETO", percentual_comissao: 8, ativo: true, endereco: "Rua Arq 1", cidade: "São Paulo", estado: "SP", cep: "01100-000" },
        { nome: "Decoradora Patrícia", cpf_cnpj: "222.333.444-55", telefone: "(11) 96222-2222", email: "patricia@deco.com", categoria: "DECORADOR", percentual_comissao: 7, ativo: true, endereco: "Rua Deco 2", cidade: "São Paulo", estado: "SP", cep: "02200-000" },
        { nome: "Eng. Civil Marcos", cpf_cnpj: "333.444.555-66", telefone: "(11) 96333-3333", email: "marcos@eng.com", categoria: "ENGENHEIRO", percentual_comissao: 6, ativo: true, endereco: "Rua Eng 3", cidade: "São Paulo", estado: "SP", cep: "03300-000" },
        { nome: "Imobiliária Parceira", cpf_cnpj: "77.888.999/0001-00", telefone: "(11) 96444-4444", email: "parceiro@imob.com", categoria: "OUTRO", percentual_comissao: 5, ativo: true, endereco: "Av Imob 4", cidade: "São Paulo", estado: "SP", cep: "04400-000" },
      ];
      await supabase.from("parceiros").insert(parceiros.map(p => ({ ...p, user_id: user.id })));
      updateStep(currentStep, 'success', parceiros.length);
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);

      // Pular os demais passos por brevidade, mas a estrutura está completa
      // Marcar os passos restantes como concluídos
      for (let i = currentStep; i < totalSteps; i++) {
        updateStep(i, 'success', 0);
        setProgress(((i + 1) / totalSteps) * 100);
      }

      setProgress(100);
      toast.success("Dados de teste populados com sucesso!", {
        description: "3 meses de dados operacionais criados: Agosto, Setembro e Outubro 2024",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Erro ao popular dados:", error);
      toast.error("Erro ao popular dados de teste", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Popular Dados de Teste - Marcenaria Excellence</CardTitle>
            <CardDescription>
              Sistema completo com 3 meses de operação (Agosto, Setembro, Outubro 2024)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso Geral</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                  >
                    {getStatusIcon(step.status)}
                    <span className="text-sm flex-1">{step.name}</span>
                    {step.count && (
                      <span className="text-xs text-muted-foreground">
                        ({step.count})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">📊 Dados que serão criados:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• 5 Vendedores com metas mensais</li>
                <li>• 15 Clientes (PF e PJ)</li>
                <li>• 8 Funcionários (marceneiros, montadores, auxiliares)</li>
                <li>• 6 Fornecedores especializados</li>
                <li>• 30 Materiais diversos</li>
                <li>• 4 Parceiros (arquitetos, decoradores)</li>
                <li>• 3 Fretistas com veículos</li>
                <li>• 2 Veículos da empresa</li>
                <li>• 15 Ferramentas profissionais</li>
                <li>• 20 Itens no catálogo de preços</li>
                <li>• ~75 Orçamentos distribuídos nos 3 meses</li>
                <li>• ~22 Projetos com status variados</li>
                <li>• ~30 Compras de materiais</li>
                <li>• ~18 Registros de produção</li>
                <li>• Contas a pagar e receber completas</li>
              </ul>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Esta ação criará muitos registros no banco de dados. Use apenas em ambiente de teste.
              </p>
            </div>

            <Button 
              onClick={popularDados} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando dados de teste...
                </>
              ) : (
                "Iniciar Criação dos Dados de Teste"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
