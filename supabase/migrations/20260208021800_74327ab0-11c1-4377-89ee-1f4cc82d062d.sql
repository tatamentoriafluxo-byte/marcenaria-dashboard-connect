-- Bug #5: permitir embed de fornecedor em compras via FK
-- Isso habilita queries do tipo: .select(`*, fornecedores(nome)`)

ALTER TABLE public.compras
ADD CONSTRAINT compras_fornecedor_id_fkey
FOREIGN KEY (fornecedor_id)
REFERENCES public.fornecedores(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;