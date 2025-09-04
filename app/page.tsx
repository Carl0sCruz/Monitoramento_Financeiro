import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart"
import { Button } from "@/components/ui/button"
import { PlusIcon, FileTextIcon, CreditCardIcon, TagIcon, TargetIcon, UploadIcon } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MF</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Monitor Financeiro</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-emerald-600 font-medium">
                Dashboard
              </Link>
              <Link href="/transacoes" className="text-gray-600 hover:text-emerald-600">
                Transações
              </Link>
              <Link href="/contas" className="text-gray-600 hover:text-emerald-600">
                Contas
              </Link>
              <Link href="/categorias" className="text-gray-600 hover:text-emerald-600">
                Categorias
              </Link>
              <Link href="/orcamentos" className="text-gray-600 hover:text-emerald-600">
                Orçamentos
              </Link>
              <Link href="/relatorios" className="text-gray-600 hover:text-emerald-600">
                Relatórios
              </Link>
              <Link href="/importar" className="text-gray-600 hover:text-emerald-600">
                Importar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao seu Monitor Financeiro</h2>
          <p className="text-gray-600">Acompanhe suas finanças e tome decisões inteligentes</p>
        </div>

        <div className="space-y-8">
          {/* Overview Cards */}
          <OverviewCards />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link href="/transacoes">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <PlusIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Nova Transação</span>
                </Button>
              </Link>
              <Link href="/contas">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <CreditCardIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Contas</span>
                </Button>
              </Link>
              <Link href="/categorias">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <TagIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Categorias</span>
                </Button>
              </Link>
              <Link href="/orcamentos">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <TargetIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Orçamentos</span>
                </Button>
              </Link>
              <Link href="/relatorios">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <FileTextIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Relatórios</span>
                </Button>
              </Link>
              <Link href="/importar">
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                >
                  <UploadIcon className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Importar</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Charts and Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExpenseChart />
            <MonthlyTrendChart />
          </div>

          <RecentTransactions />
        </div>
      </main>
    </div>
  )
}
