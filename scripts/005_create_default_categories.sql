-- Create function to add default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Default expense categories
  INSERT INTO public.categorias (user_id, nome, tipo, cor, icone) VALUES
  (user_id, 'Alimentação', 'despesa', '#f59e0b', '🍽️'),
  (user_id, 'Transporte', 'despesa', '#3b82f6', '🚗'),
  (user_id, 'Moradia', 'despesa', '#8b5cf6', '🏠'),
  (user_id, 'Saúde', 'despesa', '#ef4444', '🏥'),
  (user_id, 'Educação', 'despesa', '#06b6d4', '📚'),
  (user_id, 'Lazer', 'despesa', '#f97316', '🎮'),
  (user_id, 'Roupas', 'despesa', '#ec4899', '👕'),
  (user_id, 'Serviços', 'despesa', '#6b7280', '🔧'),
  (user_id, 'Outros', 'despesa', '#9ca3af', '📦');

  -- Default income categories
  INSERT INTO public.categorias (user_id, nome, tipo, cor, icone) VALUES
  (user_id, 'Salário', 'receita', '#10b981', '💰'),
  (user_id, 'Freelance', 'receita', '#059669', '💻'),
  (user_id, 'Investimentos', 'receita', '#0d9488', '📈'),
  (user_id, 'Vendas', 'receita', '#0891b2', '🛒'),
  (user_id, 'Outros', 'receita', '#06b6d4', '💵');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the profile creation trigger to include default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, nome_completo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome_completo', null)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default categories
  PERFORM create_default_categories(new.id);

  RETURN new;
END;
$$;
