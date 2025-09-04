import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { transactions } = await request.json()

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: "Dados de transações inválidos" }, { status: 400 })
    }

    // Get user's default account and categories
    const { data: accounts } = await supabase.from("accounts").select("id").eq("user_id", user.id).limit(1)

    const { data: categories } = await supabase.from("categories").select("id, name").eq("user_id", user.id)

    const defaultAccountId = accounts?.[0]?.id
    const categoryMap = new Map(categories?.map((c) => [c.name.toLowerCase(), c.id]) || [])

    // Prepare transactions for insertion
    const transactionsToInsert = transactions
      .map((t: any) => {
        let categoryId = null

        // Try to match category by name
        if (t.category) {
          categoryId = categoryMap.get(t.category.toLowerCase()) || null
        }

        return {
          user_id: user.id,
          account_id: defaultAccountId,
          category_id: categoryId,
          description: t.description,
          amount: t.amount,
          type: t.type,
          date: t.date,
          created_at: new Date().toISOString(),
        }
      })
      .filter((t) => t.account_id) // Only insert if we have an account

    if (transactionsToInsert.length === 0) {
      return NextResponse.json({ error: "Nenhuma conta encontrada para importar transações" }, { status: 400 })
    }

    const { data, error } = await supabase.from("transactions").insert(transactionsToInsert).select()

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
