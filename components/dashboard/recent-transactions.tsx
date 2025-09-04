import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatRelativeDate } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react"

interface Transaction {
  id: string
  descricao: string
  valor: number
  tipo: "receita" | "despesa" | "transferencia"
  categoria: string
  data_transacao: string
  conta: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case "receita":
        return <ArrowUpRight className="h-4 w-4 text-chart-1" />
      case "despesa":
        return <ArrowDownRight className="h-4 w-4 text-chart-3" />
      case "transferencia":
        return <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getTransactionColor = (tipo: string) => {
    switch (tipo) {
      case "receita":
        return "text-chart-1"
      case "despesa":
        return "text-chart-3"
      case "transferencia":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    }
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.tipo)}
                  <div>
                    <p className="text-sm font-medium leading-none">{transaction.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.categoria} • {transaction.conta}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getTransactionColor(transaction.tipo)}`}>
                    {transaction.tipo === "despesa" ? "-" : ""}
                    {formatCurrency(Math.abs(transaction.valor))}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRelativeDate(transaction.data_transacao)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
