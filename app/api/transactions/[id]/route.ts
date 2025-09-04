import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000"

    const body = await request.json()
    const { conta_id, categoria_id, descricao, valor, tipo, data_transacao, observacoes } = body

    // Get original transaction for balance adjustment
    const { data: originalTransaction, error: fetchError } = await supabase
      .from("transacoes")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single()

    if (fetchError || !originalTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction
    const { data: transaction, error: updateError } = await supabase
      .from("transacoes")
      .update({
        conta_id,
        categoria_id,
        descricao,
        valor: Number.parseFloat(valor),
        tipo,
        data_transacao,
        observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating transaction:", updateError)
      return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
    }

    // Adjust account balances if needed
    if (
      originalTransaction.conta_id !== conta_id ||
      originalTransaction.valor !== Number.parseFloat(valor) ||
      originalTransaction.tipo !== tipo
    ) {
      // Reverse original transaction effect
      const originalAdjustment =
        originalTransaction.tipo === "despesa"
          ? Math.abs(originalTransaction.valor)
          : -Math.abs(originalTransaction.valor)

      await supabase.rpc("update_account_balance", {
        account_id: originalTransaction.conta_id,
        amount: originalAdjustment,
      })

      // Apply new transaction effect
      const newAdjustment =
        tipo === "despesa" ? -Math.abs(Number.parseFloat(valor)) : Math.abs(Number.parseFloat(valor))

      await supabase.rpc("update_account_balance", {
        account_id: conta_id,
        amount: newAdjustment,
      })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Error in PUT /api/transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const userId = "00000000-0000-0000-0000-000000000000"

    // Get transaction for balance adjustment
    const { data: transaction, error: fetchError } = await supabase
      .from("transacoes")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", userId)
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Delete transaction
    const { error: deleteError } = await supabase.from("transacoes").delete().eq("id", params.id).eq("user_id", userId)

    if (deleteError) {
      console.error("Error deleting transaction:", deleteError)
      return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
    }

    // Reverse transaction effect on account balance
    const adjustment = transaction.tipo === "despesa" ? Math.abs(transaction.valor) : -Math.abs(transaction.valor)

    await supabase.rpc("update_account_balance", {
      account_id: transaction.conta_id,
      amount: adjustment,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
