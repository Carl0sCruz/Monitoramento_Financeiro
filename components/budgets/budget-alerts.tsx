import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"
import { AlertTriangle, TrendingUp } from "lucide-react"

interface Budget {
  id: string
  valor_limite: number
  gasto_atual: number
  percentual_usado: number
  categorias?: {
    nome: string
    cor: string
    icone?: string
  }
}

interface BudgetAlertsProps {
  budgets: Budget[]
}

export function BudgetAlerts({ budgets }: BudgetAlertsProps) {
  const exceededBudgets = budgets.filter((budget) => budget.percentual_usado >= 100)
  const warningBudgets = budgets.filter((budget) => budget.percentual_usado >= 80 && budget.percentual_usado < 100)

  if (exceededBudgets.length === 0 && warningBudgets.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Alertas de Orçamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exceededBudgets.map((budget) => (
          <Alert key={budget.id} variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {budget.categorias?.icone && <span>{budget.categorias.icone}</span>}
                  <span className="font-medium">{budget.categorias?.nome}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Excedido em {formatCurrency(budget.gasto_atual - budget.valor_limite)}
                  </div>
                  <div className="text-sm">{budget.percentual_usado.toFixed(1)}% do limite</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}

        {warningBudgets.map((budget) => (
          <Alert key={budget.id}>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {budget.categorias?.icone && <span>{budget.categorias.icone}</span>}
                  <span className="font-medium">{budget.categorias?.nome}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">Restam {formatCurrency(budget.valor_limite - budget.gasto_atual)}</div>
                  <div className="text-sm">{budget.percentual_usado.toFixed(1)}% usado</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}
