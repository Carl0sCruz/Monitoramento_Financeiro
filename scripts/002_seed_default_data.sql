-- Insert default account types
INSERT INTO public.tipos_conta (nome, descricao) VALUES
('Conta Corrente', 'Conta bancária para movimentação diária'),
('Poupança', 'Conta de poupança para reservas'),
('Cartão de Crédito', 'Cartão de crédito'),
('Dinheiro', 'Dinheiro em espécie'),
('Investimentos', 'Conta de investimentos')
ON CONFLICT (nome) DO NOTHING;
