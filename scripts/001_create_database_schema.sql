-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create account types table
CREATE TABLE IF NOT EXISTS public.tipos_conta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo_conta_id UUID REFERENCES public.tipos_conta(id),
  saldo_inicial DECIMAL(15,2) DEFAULT 0,
  saldo_atual DECIMAL(15,2) DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor TEXT DEFAULT '#6366f1',
  icone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES public.contas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias(id),
  descricao TEXT NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa', 'transferencia')),
  data_transacao DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  valor_limite DECIMAL(15,2) NOT NULL,
  periodo TEXT NOT NULL CHECK (periodo IN ('mensal', 'anual')),
  mes INTEGER CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for contas
CREATE POLICY "contas_select_own" ON public.contas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contas_insert_own" ON public.contas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contas_update_own" ON public.contas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contas_delete_own" ON public.contas FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for categorias
CREATE POLICY "categorias_select_own" ON public.categorias FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categorias_insert_own" ON public.categorias FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categorias_update_own" ON public.categorias FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categorias_delete_own" ON public.categorias FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transacoes
CREATE POLICY "transacoes_select_own" ON public.transacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transacoes_insert_own" ON public.transacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transacoes_update_own" ON public.transacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transacoes_delete_own" ON public.transacoes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for orcamentos
CREATE POLICY "orcamentos_select_own" ON public.orcamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orcamentos_insert_own" ON public.orcamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orcamentos_update_own" ON public.orcamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "orcamentos_delete_own" ON public.orcamentos FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contas_user_id ON public.contas(user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_user_id ON public.categorias(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta_id ON public.transacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON public.transacoes(data_transacao);
CREATE INDEX IF NOT EXISTS idx_orcamentos_user_id ON public.orcamentos(user_id);
