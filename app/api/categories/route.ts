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
    const tipo = searchParams.get("tipo")

    let query = supabase.from("categorias").select("*").eq("user_id", user.id).order("nome", { ascending: true })

    if (tipo) {
      query = query.eq("tipo", tipo)
    }

    const { data: categories, error } = await query

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error in GET /api/categories:", error)
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
    const { nome, tipo, cor = "#6366f1", icone } = body

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: category, error } = await supabase
      .from("categorias")
      .insert({
        user_id: user.id,
        nome,
        tipo,
        cor,
        icone,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error in POST /api/categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
