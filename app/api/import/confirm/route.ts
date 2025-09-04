import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000"

    const { transactions } = await request.json()

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Dados de transações inválidos" }, { status: 400 })
    }

    // Get user's default account and categories
    const { data: accounts } = await supabase.from("contas").select("id").eq("user_id", userId).limit(1)

    const { data: categories } = await supabase.from("categorias").select("id, nome").eq("user_id", userId)

    const defaultAccountId = accounts?.[0]?.id
    const categoryMap = new Map(categories?.map((c) => [c.nome.toLowerCase(), c.id]) || [])

    // Prepare transactions for insertion
    const transactionsToInsert = transactions
      .map((t: any) => {
        let categoryId = null

        // Try to match category by name
        if (t.category) {
          categoryId = categoryMap.get(t.category.toLowerCase()) || null
        }

        return {
          user_id: userId,
          conta_id: defaultAccountId,
          categoria_id: categoryId,
          descricao: t.description,
          valor: t.amount,
          tipo: t.type === "income" ? "receita" : "despesa",
          data_transacao: t.date,
          created_at: new Date().toISOString(),
        }
      })
      .filter((t) => t.conta_id) // Only insert if we have an account

    if (transactionsToInsert.length === 0) {
      return NextResponse.json({ error: "Nenhuma conta encontrada para importar transações" }, { status: 400 })
    }

    const { data, error } = await supabase.from("transacoes").insert(transactionsToInsert).select()

    if (error) {
      console.error("Erro ao inserir transações:", error)
      return NextResponse.json({ error: "Erro ao salvar transações" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      message: `${data?.length || 0} transações importadas com sucesso`,
    })
  } catch (error) {
    console.error("Erro ao confirmar importação:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
