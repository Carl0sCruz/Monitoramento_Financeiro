// Mock data for the financial monitoring app
export interface Account {
  id: string
  nome: string
  tipo_conta_id: string
  saldo_inicial: number
  saldo_atual: number
  ativa: boolean
  created_at: string
  tipos_conta?: {
    nome: string
    descricao: string
  }
}

export interface Category {
  id: string
  nome: string
  tipo: "receita" | "despesa"
  cor: string
  icone?: string
  created_at: string
}

export interface Transaction {
  id: string
  conta_id: string
  categoria_id?: string
  descricao: string
  valor: number
  tipo: "receita" | "despesa" | "transferencia"
  data_transacao: string
  observacoes?: string
  created_at: string
  categorias?: {
    nome: string
    cor: string
  }
  contas?: {
    nome: string
  }
}

export interface Budget {
  id: string
  categoria_id: string
  valor_limite: number
  periodo: "mensal" | "anual"
  mes?: number
  ano: number
  ativo: boolean
  created_at: string
  gasto_atual?: number
  percentual_usado?: number
  categorias?: {
    nome: string
    cor: string
    icone?: string
  }
}

// Mock data storage
const mockAccounts: Account[] = [
  {
    id: "1",
    nome: "Conta Corrente",
    tipo_conta_id: "1",
    saldo_inicial: 5000,
    saldo_atual: 4250,
    ativa: true,
    created_at: new Date().toISOString(),
    tipos_conta: { nome: "Conta Corrente", descricao: "Conta para movimentação diária" },
  },
  {
    id: "2",
    nome: "Poupança",
    tipo_conta_id: "2",
    saldo_inicial: 10000,
    saldo_atual: 12500,
    ativa: true,
    created_at: new Date().toISOString(),
    tipos_conta: { nome: "Poupança", descricao: "Conta para reservas" },
  },
]

const mockCategories: Category[] = [
  {
    id: "1",
    nome: "Alimentação",
    tipo: "despesa",
    cor: "#ef4444",
    icone: "utensils",
    created_at: new Date().toISOString(),
  },
  { id: "2", nome: "Transporte", tipo: "despesa", cor: "#f97316", icone: "car", created_at: new Date().toISOString() },
  { id: "3", nome: "Moradia", tipo: "despesa", cor: "#8b5cf6", icone: "home", created_at: new Date().toISOString() },
  {
    id: "4",
    nome: "Salário",
    tipo: "receita",
    cor: "#22c55e",
    icone: "dollar-sign",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    nome: "Freelance",
    tipo: "receita",
    cor: "#06b6d4",
    icone: "briefcase",
    created_at: new Date().toISOString(),
  },
]

const mockTransactions: Transaction[] = [
  {
    id: "1",
    conta_id: "1",
    categoria_id: "4",
    descricao: "Salário Janeiro",
    valor: 5000,
    tipo: "receita",
    data_transacao: "2024-01-01",
    created_at: new Date().toISOString(),
    categorias: { nome: "Salário", cor: "#22c55e" },
    contas: { nome: "Conta Corrente" },
  },
  {
    id: "2",
    conta_id: "1",
    categoria_id: "1",
    descricao: "Supermercado",
    valor: 350,
    tipo: "despesa",
    data_transacao: "2024-01-02",
    created_at: new Date().toISOString(),
    categorias: { nome: "Alimentação", cor: "#ef4444" },
    contas: { nome: "Conta Corrente" },
  },
  {
    id: "3",
    conta_id: "1",
    categoria_id: "2",
    descricao: "Combustível",
    valor: 200,
    tipo: "despesa",
    data_transacao: "2024-01-03",
    created_at: new Date().toISOString(),
    categorias: { nome: "Transporte", cor: "#f97316" },
    contas: { nome: "Conta Corrente" },
  },
]

const mockBudgets: Budget[] = [
  {
    id: "1",
    categoria_id: "1",
    valor_limite: 800,
    periodo: "mensal",
    mes: 1,
    ano: 2024,
    ativo: true,
    created_at: new Date().toISOString(),
    gasto_atual: 350,
    percentual_usado: 43.75,
    categorias: { nome: "Alimentação", cor: "#ef4444", icone: "utensils" },
  },
]

// Helper functions
export const getMockAccounts = () => mockAccounts
export const getMockCategories = () => mockCategories
export const getMockTransactions = () => mockTransactions
export const getMockBudgets = () => mockBudgets

export const addMockTransaction = (transaction: Omit<Transaction, "id" | "created_at">) => {
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }

  // Add category and account info
  const category = mockCategories.find((c) => c.id === transaction.categoria_id)
  const account = mockAccounts.find((a) => a.id === transaction.conta_id)

  if (category) {
    newTransaction.categorias = { nome: category.nome, cor: category.cor }
  }
  if (account) {
    newTransaction.contas = { nome: account.nome }
  }

  mockTransactions.unshift(newTransaction)

  // Update account balance
  const accountIndex = mockAccounts.findIndex((a) => a.id === transaction.conta_id)
  if (accountIndex !== -1) {
    const valorAjustado = transaction.tipo === "despesa" ? -Math.abs(transaction.valor) : Math.abs(transaction.valor)
    mockAccounts[accountIndex].saldo_atual += valorAjustado
  }

  return newTransaction
}

export const addMockAccount = (account: Omit<Account, "id" | "created_at">) => {
  const newAccount: Account = {
    ...account,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }
  mockAccounts.push(newAccount)
  return newAccount
}

export const addMockCategory = (category: Omit<Category, "id" | "created_at">) => {
  const newCategory: Category = {
    ...category,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }
  mockCategories.push(newCategory)
  return newCategory
}

export const addMockBudget = (budget: Omit<Budget, "id" | "created_at">) => {
  const newBudget: Budget = {
    ...budget,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }
  mockBudgets.push(newBudget)
  return newBudget
}

export const getAccountTypes = () => [
  { id: "1", nome: "Conta Corrente", descricao: "Conta para movimentação diária" },
  { id: "2", nome: "Poupança", descricao: "Conta para reservas" },
  { id: "3", nome: "Investimentos", descricao: "Conta para aplicações" },
  { id: "4", nome: "Cartão de Crédito", descricao: "Limite do cartão" },
]
