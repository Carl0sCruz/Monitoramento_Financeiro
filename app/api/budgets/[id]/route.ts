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
    const { categoria_id, valor_limite, periodo, mes, ano, ativo } = body

    const { data: budget, error } = await supabase
      .from("orcamentos")
      .update({
        categoria_id,
        valor_limite: Number.parseFloat(valor_limite),
        periodo,
        mes: periodo === "mensal" ? mes : null,
        ano,
        ativo,
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating budget:", error)
      return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
    }

    return NextResponse.json({ budget })
  } catch (error) {
    console.error("Error in PUT /api/budgets:", error)
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

    const { error } = await supabase.from("orcamentos").delete().eq("id", params.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting budget:", error)
      return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/budgets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
