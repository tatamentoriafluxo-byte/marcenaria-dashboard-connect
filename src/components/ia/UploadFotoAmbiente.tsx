import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Camera, Image as ImageIcon } from "lucide-react";

interface UploadFotoAmbienteProps {
  imageUrl: string | null;
  referenciaUrl: string | null;
  uploading: boolean;
  uploadingReferencia: boolean;
  onUploadAmbiente: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadReferencia: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAmbiente: () => void;
  onRemoveReferencia: () => void;
}

export function UploadFotoAmbiente({
  imageUrl,
  referenciaUrl,
  uploading,
  uploadingReferencia,
  onUploadAmbiente,
  onUploadReferencia,
  onRemoveAmbiente,
  onRemoveReferencia,
}: UploadFotoAmbienteProps) {
  return (
    <div className="space-y-4">
      {/* Upload Principal - Foto do Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto do Ambiente
            <span className="text-xs text-muted-foreground font-normal">(obrigatório)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {imageUrl ? (
              <div className="space-y-3">
                <img
                  src={imageUrl}
                  alt="Foto do ambiente"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
                <Button variant="outline" size="sm" onClick={onRemoveAmbiente}>
                  Trocar Foto
                </Button>
              </div>
            ) : (
              <Label className="cursor-pointer block">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUploadAmbiente}
                  disabled={uploading}
                />
                <div className="space-y-2 py-4">
                  {uploading ? (
                    <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Carregando..." : "Clique para enviar a foto do ambiente"}
                  </p>
                </div>
              </Label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Secundário - Foto de Referência */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Foto de Referência
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Envie uma imagem de inspiração (Pinterest, revista, etc.) para ajudar a IA a sugerir o estilo desejado.
          </p>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {referenciaUrl ? (
              <div className="space-y-3">
                <img
                  src={referenciaUrl}
                  alt="Foto de referência"
                  className="max-h-32 mx-auto rounded-lg object-contain"
                />
                <Button variant="outline" size="sm" onClick={onRemoveReferencia}>
                  Remover Referência
                </Button>
              </div>
            ) : (
              <Label className="cursor-pointer block">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUploadReferencia}
                  disabled={uploadingReferencia}
                />
                <div className="space-y-1 py-2">
                  {uploadingReferencia ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {uploadingReferencia ? "Carregando..." : "Adicionar referência de estilo"}
                  </p>
                </div>
              </Label>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
