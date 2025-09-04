import { type NextRequest, NextResponse } from "next/server"
import { getMockTransactions, addMockTransaction } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const categoria = searchParams.get("categoria")
    const conta = searchParams.get("conta")
    const tipo = searchParams.get("tipo")
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")

    let transactions = getMockTransactions()

    // Apply filters
    if (categoria) {
      transactions = transactions.filter((t) => t.categoria_id === categoria)
    }
    if (conta) {
      transactions = transactions.filter((t) => t.conta_id === conta)
    }
    if (tipo) {
      transactions = transactions.filter((t) => t.tipo === tipo)
    }
    if (dataInicio) {
      transactions = transactions.filter((t) => t.data_transacao >= dataInicio)
    }
    if (dataFim) {
      transactions = transactions.filter((t) => t.data_transacao <= dataFim)
    }

    // Apply pagination
    const paginatedTransactions = transactions.slice(offset, offset + limit)

    return NextResponse.json({ transactions: paginatedTransactions })
  } catch (error) {
    console.error("Error in GET /api/transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conta_id, categoria_id, descricao, valor, tipo, data_transacao, observacoes } = body

    // Validate required fields
    if (!conta_id || !descricao || !valor || !tipo || !data_transacao) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transaction = addMockTransaction({
      conta_id,
      categoria_id,
      descricao,
      valor: Number.parseFloat(valor),
      tipo,
      data_transacao,
      observacoes,
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("Error in POST /api/transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
