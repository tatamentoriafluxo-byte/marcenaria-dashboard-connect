import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

type MovelSugerido = {
  nome: string;
  tipo: string;
  preco_estimado?: number;
  material_sugerido?: string;
  dimensoes_sugeridas?: {
    largura: number;
    altura: number;
    profundidade: number;
  };
};

type AnaliseResultado = {
  analise_ambiente?: {
    tipo_ambiente: string;
    dimensoes_estimadas?: {
      largura_metros: number;
      profundidade_metros: number;
      pe_direito_metros: number;
    };
    caracteristicas: string[];
    pontos_atencao: string[];
  };
  sugestoes_moveis?: MovelSugerido[];
  valor_total_estimado?: number;
  observacoes?: string;
  nivel_complexidade?: string;
};

interface ExportarPDFProps {
  resultado: AnaliseResultado;
  fotoAmbienteUrl?: string;
  imagemSimuladaUrl?: string | null;
  nomeMarcenaria?: string;
}

export function ExportarPDF({
  resultado,
  fotoAmbienteUrl,
  imagemSimuladaUrl,
  nomeMarcenaria = "Marcenaria",
}: ExportarPDFProps) {
  const [gerando, setGerando] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const handleGerarPDF = async () => {
    try {
      setGerando(true);
      toast.info("Gerando PDF...");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(nomeMarcenaria.toUpperCase(), pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Proposta de Projeto", pageWidth / 2, yPos, { align: "center" });
      yPos += 8;

      // Data
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, yPos, { align: "center" });
      doc.setTextColor(0);
      yPos += 15;

      // Linha separadora
      doc.setDrawColor(200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Tipo de ambiente
      if (resultado.analise_ambiente?.tipo_ambiente) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("AMBIENTE", 20, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.text(resultado.analise_ambiente.tipo_ambiente.charAt(0).toUpperCase() + resultado.analise_ambiente.tipo_ambiente.slice(1), 20, yPos);
        yPos += 15;
      }

      // Imagens
      const imageWidth = 80;
      const imageHeight = 60;

      if (fotoAmbienteUrl || imagemSimuladaUrl) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("VISUALIZAÇÃO", 20, yPos);
        yPos += 8;

        let xPos = 20;

        if (fotoAmbienteUrl) {
          const img1 = await loadImageAsBase64(fotoAmbienteUrl);
          if (img1) {
            doc.addImage(img1, "JPEG", xPos, yPos, imageWidth, imageHeight);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("Foto Original", xPos + imageWidth / 2, yPos + imageHeight + 4, { align: "center" });
            xPos += imageWidth + 10;
          }
        }

        if (imagemSimuladaUrl) {
          const img2 = await loadImageAsBase64(imagemSimuladaUrl);
          if (img2) {
            doc.addImage(img2, "JPEG", xPos, yPos, imageWidth, imageHeight);
            doc.setFontSize(8);
            doc.text("Simulação", xPos + imageWidth / 2, yPos + imageHeight + 4, { align: "center" });
          }
        }

        yPos += imageHeight + 15;
      }

      // Móveis Sugeridos
      if (resultado.sugestoes_moveis && resultado.sugestoes_moveis.length > 0) {
        // Check if we need a new page
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("MÓVEIS SUGERIDOS", 20, yPos);
        yPos += 8;

        doc.setDrawColor(200);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 6;

        resultado.sugestoes_moveis.forEach((movel) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`• ${movel.nome}`, 25, yPos);

          if (movel.preco_estimado) {
            const precoText = formatCurrency(movel.preco_estimado);
            doc.setFont("helvetica", "normal");
            doc.text(precoText, pageWidth - 20, yPos, { align: "right" });
          }
          yPos += 5;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100);
          const detalhes = [
            movel.tipo,
            movel.material_sugerido,
            movel.dimensoes_sugeridas && `${movel.dimensoes_sugeridas.largura}m x ${movel.dimensoes_sugeridas.altura}m`,
          ].filter(Boolean).join(" | ");
          if (detalhes) {
            doc.text(detalhes, 30, yPos);
            yPos += 6;
          }
          doc.setTextColor(0);
        });

        yPos += 5;
      }

      // Linha separadora
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setDrawColor(200);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Valor Total
      if (resultado.valor_total_estimado) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 5, pageWidth - 40, 20, "F");

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("VALOR TOTAL ESTIMADO", 25, yPos + 5);
        doc.setFontSize(14);
        doc.text(formatCurrency(resultado.valor_total_estimado), pageWidth - 25, yPos + 5, { align: "right" });
        yPos += 25;
      }

      // Observações
      if (resultado.observacoes) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        const splitObs = doc.splitTextToSize(resultado.observacoes, pageWidth - 40);
        doc.text(splitObs, 20, yPos);
        yPos += splitObs.length * 5;
        doc.setTextColor(0);
      }

      // Nota de rodapé
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "*Valores estimados. O orçamento final pode variar conforme especificações técnicas.",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 15,
        { align: "center" }
      );

      // Download
      const date = new Date().toISOString().split("T")[0];
      doc.save(`proposta_${resultado.analise_ambiente?.tipo_ambiente || "ambiente"}_${date}.pdf`);

      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleGerarPDF}
      disabled={gerando}
    >
      {gerando ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
