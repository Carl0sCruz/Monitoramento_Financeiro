import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface ParsedTransaction {
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category?: string
  account?: string
}

function parseCSV(content: string): ParsedTransaction[] {
  const lines = content.split("\n").filter((line) => line.trim())
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
      const transaction: any = {}

      headers.forEach((header, index) => {
        transaction[header] = values[index]
      })

      // Map common CSV formats
      const date = transaction.data || transaction.date || transaction["data da transação"]
      const description = transaction.descrição || transaction.description || transaction.histórico
      const amount = Number.parseFloat(transaction.valor || transaction.amount || transaction.quantia || "0")
      const type = amount >= 0 ? "income" : "expense"

      return {
        date: new Date(date).toISOString().split("T")[0],
        description: description || "Transação importada",
        amount: Math.abs(amount),
        type,
        category: transaction.categoria || transaction.category,
        account: transaction.conta || transaction.account,
      }
    })
    .filter((t) => t.date && !isNaN(new Date(t.date).getTime()))
}

function parseOFX(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []

  // Simple OFX parsing - look for STMTTRN blocks
  const stmtTrnRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs
  const matches = content.match(stmtTrnRegex)

  if (matches) {
    matches.forEach((match) => {
      const dtPosted = match.match(/<DTPOSTED>(\d{8})/)?.[1]
      const trnAmt = match.match(/<TRNAMT>([-\d.]+)/)?.[1]
      const memo = match.match(/<MEMO>(.*?)</)?.[1]

      if (dtPosted && trnAmt) {
        const date = `${dtPosted.slice(0, 4)}-${dtPosted.slice(4, 6)}-${dtPosted.slice(6, 8)}`
        const amount = Number.parseFloat(trnAmt)

        transactions.push({
          date,
          description: memo || "Transação OFX",
          amount: Math.abs(amount),
          type: amount >= 0 ? "income" : "expense",
        })
      }
    })
  }

  return transactions
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const content = await file.text()
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    let transactions: ParsedTransaction[] = []

    if (fileExtension === "csv") {
      transactions = parseCSV(content)
    } else if (fileExtension === "ofx") {
      transactions = parseOFX(content)
    } else {
      return NextResponse.json({ error: "Formato de arquivo não suportado" }, { status: 400 })
    }

    return NextResponse.json({
      transactions,
      count: transactions.length,
      message: `${transactions.length} transações encontradas`,
    })
  } catch (error) {
    console.error("Erro ao processar arquivo:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
