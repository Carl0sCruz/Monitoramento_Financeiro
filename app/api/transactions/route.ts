import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000" // ID fixo para uso sem autenticação

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const categoria = searchParams.get("categoria")
    const conta = searchParams.get("conta")
    const tipo = searchParams.get("tipo")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")

    let query = supabase
      .from("transacoes")
      .select(`
        *,
        categorias(nome, cor),
        contas(nome)
      `)
      .eq("user_id", userId)
      .order("data_transacao", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (categoria) {
      query = query.eq("categoria_id", categoria)
    }
    if (conta) {
      query = query.eq("conta_id", conta)
    }
    if (tipo) {
      query = query.eq("tipo", tipo)
    }
    if (dataInicio) {
      query = query.gte("data_transacao", dataInicio)
    }
    if (dataFim) {
      query = query.lte("data_transacao", dataFim)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error in GET /api/transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000" // ID fixo para uso sem autenticação

    const body = await request.json()
    const { conta_id, categoria_id, descricao, valor, tipo, data_transacao, observacoes } = body

    // Validate required fields
    if (!conta_id || !descricao || !valor || !tipo || !data_transacao) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transacoes")
      .insert({
        user_id: userId,
        conta_id,
        categoria_id,
        descricao,
        valor: Number.parseFloat(valor),
        tipo,
        data_transacao,
        observacoes,
      })
      .select()
      .single()

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    // Update account balance
    const valorAjustado = tipo === "despesa" ? -Math.abs(Number.parseFloat(valor)) : Math.abs(Number.parseFloat(valor))

    const { error: balanceError } = await supabase.rpc("update_account_balance", {
      account_id: conta_id,
      amount: valorAjustado,
    })

    if (balanceError) {
      console.error("Error updating account balance:", balanceError)
      // Note: In a production app, you'd want to rollback the transaction here
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Error in POST /api/transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
