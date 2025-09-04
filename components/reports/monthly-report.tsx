"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface MonthlyReportProps {
  data: {
    monthlyTrends: Array<{
      month: string
      income: number
      expenses: number
      balance: number
    }>
  }
}

export function MonthlyReport({ data }: MonthlyReportProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
  }

  const chartData = data.monthlyTrends.map((item) => ({
    ...item,
    monthFormatted: formatMonth(item.month),
  }))

  return (
    <div className="space-y-6">
      {/* Monthly Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências Mensais</CardTitle>
          <CardDescription>Evolução das receitas, despesas e saldo ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthFormatted" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Receitas" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Despesas" />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Mensal</CardTitle>
          <CardDescription>Receitas vs Despesas por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthFormatted" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Receitas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Mensal</CardTitle>
          <CardDescription>Detalhamento dos valores por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Mês</th>
                  <th className="text-right py-2">Receitas</th>
                  <th className="text-right py-2">Despesas</th>
                  <th className="text-right py-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => (
                  <tr key={item.month} className="border-b">
                    <td className="py-2">{item.monthFormatted}</td>
                    <td className="text-right py-2 text-green-600">{formatCurrency(item.income)}</td>
                    <td className="text-right py-2 text-red-600">{formatCurrency(item.expenses)}</td>
                    <td className={`text-right py-2 ${item.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
