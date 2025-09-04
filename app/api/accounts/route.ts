import { type NextRequest, NextResponse } from "next/server"
import { getMockAccounts, addMockAccount, getAccountTypes } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const accounts = getMockAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error in GET /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, tipo_conta_id, saldo_inicial, ativa = true } = body

    if (!nome || !tipo_conta_id || saldo_inicial === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const accountTypes = getAccountTypes()
    const tipoInfo = accountTypes.find((t) => t.id === tipo_conta_id)

    const account = addMockAccount({
      nome,
      tipo_conta_id,
      saldo_inicial: Number.parseFloat(saldo_inicial),
      saldo_atual: Number.parseFloat(saldo_inicial),
      ativa,
      tipos_conta: tipoInfo,
    })

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Error in POST /api/accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
