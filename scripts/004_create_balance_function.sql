-- Create function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance(account_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.contas 
  SET saldo_atual = saldo_atual + amount,
      updated_at = NOW()
  WHERE id = account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
