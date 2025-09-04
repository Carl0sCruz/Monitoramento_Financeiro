import { type NextRequest, NextResponse } from "next/server"
import { getMockCategories, addMockCategory } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")

    let categories = getMockCategories()

    if (tipo) {
      categories = categories.filter((c) => c.tipo === tipo)
    }

    categories.sort((a, b) => a.nome.localeCompare(b.nome))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error in GET /api/categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, tipo, cor = "#6366f1", icone } = body

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const category = addMockCategory({
      nome,
      tipo,
      cor,
      icone,
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error in POST /api/categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
