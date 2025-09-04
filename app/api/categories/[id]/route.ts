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
    const { nome, tipo, cor, icone } = body

    const { data: category, error } = await supabase
      .from("categorias")
      .update({
        nome,
        tipo,
        cor,
        icone,
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating category:", error)
      return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error in PUT /api/categories:", error)
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

    // Check if category has transactions
    const { data: transactions, error: transactionError } = await supabase
      .from("transacoes")
      .select("id")
      .eq("categoria_id", params.id)
      .limit(1)

    if (transactionError) {
      console.error("Error checking transactions:", transactionError)
      return NextResponse.json({ error: "Failed to check category transactions" }, { status: 500 })
    }

    if (transactions && transactions.length > 0) {
      return NextResponse.json({ error: "Cannot delete category with existing transactions" }, { status: 400 })
    }

    const { error } = await supabase.from("categorias").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting category:", error)
      return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
