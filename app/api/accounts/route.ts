import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000"

    const { data: accounts, error } = await supabase
      .from("contas")
      .select(`
        *,
        tipos_conta(nome, descricao)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching accounts:", error)
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error in GET /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000"

    const body = await request.json()
    const { nome, tipo_conta_id, saldo_inicial, ativa = true } = body

    if (!nome || !tipo_conta_id || saldo_inicial === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: account, error } = await supabase
      .from("contas")
      .insert({
        user_id: userId,
        nome,
        tipo_conta_id,
        saldo_inicial: Number.parseFloat(saldo_inicial),
        saldo_atual: Number.parseFloat(saldo_inicial),
        ativa,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating account:", error)
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Error in POST /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
