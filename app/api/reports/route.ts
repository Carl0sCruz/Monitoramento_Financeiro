import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000"

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const accountId = searchParams.get("accountId")
    const categoryId = searchParams.get("categoryId")
    const reportType = searchParams.get("type") || "summary"

    let query = supabase
      .from("transacoes")
      .select(`
        *,
        categorias(nome, cor),
        contas(nome)
      `)
      .eq("user_id", userId)

    if (startDate) {
      query = query.gte("data_transacao", startDate)
    }
    if (endDate) {
      query = query.lte("data_transacao", endDate)
    }
    if (accountId) {
      query = query.eq("conta_id", accountId)
    }
    if (categoryId) {
      query = query.eq("categoria_id", categoryId)
    }

    const { data: transactions, error } = await query.order("data_transacao", { ascending: false })

    if (error) {
      console.error("Erro ao buscar transações:", error)
      return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
    }

    // Generate different report types
    let reportData: any = {}

    if (reportType === "summary") {
      const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      const categoryBreakdown = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc: any, t) => {
          const categoryName = t.categorias?.nome || "Sem categoria"
          const categoryColor = t.categorias?.cor || "#6b7280"

          if (!acc[categoryName]) {
            acc[categoryName] = { amount: 0, color: categoryColor, count: 0 }
          }
          acc[categoryName].amount += t.amount
          acc[categoryName].count += 1
          return acc
        }, {})

      reportData = {
        summary: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          transactionCount: transactions.length,
        },
        categoryBreakdown: Object.entries(categoryBreakdown).map(([name, data]: [string, any]) => ({
          name,
          amount: data.amount,
          color: data.color,
          count: data.count,
          percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        })),
      }
    }

    if (reportType === "monthly") {
      const monthlyData = transactions.reduce((acc: any, t) => {
        const month = t.data_transacao.substring(0, 7) // YYYY-MM

        if (!acc[month]) {
          acc[month] = { income: 0, expenses: 0, balance: 0 }
        }

        if (t.type === "income") {
          acc[month].income += t.amount
        } else {
          acc[month].expenses += t.amount
        }

        acc[month].balance = acc[month].income - acc[month].expenses
        return acc
      }, {})

      reportData = {
        monthlyTrends: Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      }
    }

    if (reportType === "accounts") {
      const accountBreakdown = transactions.reduce((acc: any, t) => {
        const accountName = t.contas?.nome || "Conta desconhecida"

        if (!acc[accountName]) {
          acc[accountName] = { income: 0, expenses: 0, balance: 0, count: 0 }
        }

        if (t.type === "income") {
          acc[accountName].income += t.amount
        } else {
          acc[accountName].expenses += t.amount
        }

        acc[accountName].balance = acc[accountName].income - acc[accountName].expenses
        acc[accountName].count += 1
        return acc
      }, {})

      reportData = {
        accountBreakdown: Object.entries(accountBreakdown).map(([name, data]) => ({
          name,
          ...data,
        })),
      }
    }

    return NextResponse.json({
      ...reportData,
      transactions,
      filters: {
        startDate,
        endDate,
        accountId,
        categoryId,
        reportType,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
