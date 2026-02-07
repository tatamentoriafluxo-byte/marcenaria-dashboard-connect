-- Criar bucket para fotos de ambientes
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos-ambientes', 'fotos-ambientes', true);

-- Política para usuários autenticados fazerem upload
CREATE POLICY "Usuários podem fazer upload de fotos de ambientes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos-ambientes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para visualização pública
CREATE POLICY "Fotos de ambientes são públicas"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'fotos-ambientes');

-- Política para usuários deletarem suas fotos
CREATE POLICY "Usuários podem deletar suas fotos de ambientes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'fotos-ambientes' AND auth.uid()::text = (storage.foldername(name))[1]);
