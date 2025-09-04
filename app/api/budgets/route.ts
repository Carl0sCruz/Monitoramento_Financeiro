import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ano = searchParams.get("ano") || new Date().getFullYear().toString()
    const mes = searchParams.get("mes")

    let query = supabase
      .from("orcamentos")
      .select(`
        *,
        categorias(nome, cor, icone)
      `)
      .eq("user_id", user.id)
      .eq("ano", Number.parseInt(ano))
      .eq("ativo", true)
      .order("created_at", { ascending: false })

    if (mes) {
      query = query.eq("mes", Number.parseInt(mes))
    }

    const { data: budgets, error } = await query

    if (error) {
      console.error("Error fetching budgets:", error)
      return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
    }

    // Get spending data for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        let spendingQuery = supabase
          .from("transacoes")
          .select("valor")
          .eq("user_id", user.id)
          .eq("categoria_id", budget.categoria_id)
          .eq("tipo", "despesa")
          .gte("data_transacao", `${budget.ano}-01-01`)
          .lte("data_transacao", `${budget.ano}-12-31`)

        if (budget.periodo === "mensal" && budget.mes) {
          const startDate = `${budget.ano}-${budget.mes.toString().padStart(2, "0")}-01`
          const endDate = new Date(budget.ano, budget.mes, 0).toISOString().split("T")[0]
          spendingQuery = spendingQuery.gte("data_transacao", startDate).lte("data_transacao", endDate)
        }

        const { data: transactions } = await spendingQuery

        const totalSpent = transactions?.reduce((sum, t) => sum + t.valor, 0) || 0

        return {
          ...budget,
          gasto_atual: totalSpent,
          percentual_usado: budget.valor_limite > 0 ? (totalSpent / budget.valor_limite) * 100 : 0,
        }
      }),
    )

    return NextResponse.json({ budgets: budgetsWithSpending })
  } catch (error) {
    console.error("Error in GET /api/budgets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { categoria_id, valor_limite, periodo, mes, ano, ativo = true } = body

    if (!categoria_id || !valor_limite || !periodo || !ano) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (periodo === "mensal" && !mes) {
      return NextResponse.json({ error: "Month is required for monthly budgets" }, { status: 400 })
    }

    // Check if budget already exists for this category/period
    let existingQuery = supabase
      .from("orcamentos")
      .select("id")
      .eq("user_id", user.id)
      .eq("categoria_id", categoria_id)
      .eq("periodo", periodo)
      .eq("ano", ano)

    if (periodo === "mensal") {
      existingQuery = existingQuery.eq("mes", mes)
    }

    const { data: existing } = await existingQuery

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Budget already exists for this category and period" }, { status: 400 })
    }

    const { data: budget, error } = await supabase
      .from("orcamentos")
      .insert({
        user_id: user.id,
        categoria_id,
        valor_limite: Number.parseFloat(valor_limite),
        periodo,
        mes: periodo === "mensal" ? mes : null,
        ano,
        ativo,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating budget:", error)
      return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
    }

    return NextResponse.json({ budget })
  } catch (error) {
    console.error("Error in POST /api/budgets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
