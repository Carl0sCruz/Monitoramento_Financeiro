import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"

// Mock data for demonstration - will be replaced with real data later
const mockOverviewData = {
  totalBalance: 15420.5,
  monthlyIncome: 8500.0,
  monthlyExpenses: 6200.3,
  monthlySavings: 2299.7,
}

const mockTransactions = [
  {
    id: "1",
    descricao: "Salário",
    valor: 8500.0,
    tipo: "receita" as const,
    categoria: "Salário",
    data_transacao: "2024-01-15",
    conta: "Conta Corrente",
  },
  {
    id: "2",
    descricao: "Supermercado",
    valor: 450.8,
    tipo: "despesa" as const,
    categoria: "Alimentação",
    data_transacao: "2024-01-14",
    conta: "Cartão de Crédito",
  },
  {
    id: "3",
    descricao: "Combustível",
    valor: 180.0,
    tipo: "despesa" as const,
    categoria: "Transporte",
    data_transacao: "2024-01-13",
    conta: "Conta Corrente",
  },
]

const mockExpenseData = [
  { categoria: "Alimentação", valor: 1200.5, cor: "#15803d" },
  { categoria: "Transporte", valor: 800.3, cor: "#84cc16" },
  { categoria: "Moradia", valor: 2500.0, cor: "#dc2626" },
  { categoria: "Lazer", valor: 600.2, cor: "#f59e0b" },
  { categoria: "Outros", valor: 1099.3, cor: "#475569" },
]

const mockMonthlyData = [
  { mes: "Set", receitas: 8200, despesas: 5800, saldo: 2400 },
  { mes: "Out", receitas: 8500, despesas: 6100, saldo: 2400 },
  { mes: "Nov", receitas: 8300, despesas: 5900, saldo: 2400 },
  { mes: "Dez", receitas: 9200, despesas: 6500, saldo: 2700 },
  { mes: "Jan", receitas: 8500, despesas: 6200, saldo: 2300 },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Bem-vindo de volta, {user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <OverviewCards {...mockOverviewData} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <RecentTransactions transactions={mockTransactions} />
          <QuickActions />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <ExpenseChart data={mockExpenseData} />
          <MonthlyTrendChart data={mockMonthlyData} />
        </div>
      </div>
    </div>
  )
}
