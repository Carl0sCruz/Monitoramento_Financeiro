import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { nome, tipo_conta_id, ativa } = body

    const { data: account, error } = await supabase
      .from("contas")
      .update({
        nome,
        tipo_conta_id,
        ativa,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating account:", error)
      return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Error in PUT /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if account has transactions
    const { data: transactions, error: transactionError } = await supabase
      .from("transacoes")
      .select("id")
      .eq("conta_id", params.id)
      .limit(1)

    if (transactionError) {
      console.error("Error checking transactions:", transactionError)
      return NextResponse.json({ error: "Failed to check account transactions" }, { status: 500 })
    }

    if (transactions && transactions.length > 0) {
      return NextResponse.json({ error: "Cannot delete account with existing transactions" }, { status: 400 })
    }

    const { error } = await supabase.from("contas").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting account:", error)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
