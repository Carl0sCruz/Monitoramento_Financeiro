"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Edit, Trash2, AlertTriangle, CheckCircle } from "lucide-react"

interface Budget {
  id: string
  categoria_id: string
  valor_limite: number
  periodo: "mensal" | "anual"
  mes?: number
  ano: number
  ativo: boolean
  gasto_atual: number
  percentual_usado: number
  categorias?: {
    nome: string
    cor: string
    icone?: string
  }
}

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-destructive"
    if (percentage >= 80) return "text-yellow-600"
    return "text-chart-1"
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-destructive" />
    if (percentage >= 80) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-chart-1" />
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-destructive"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-chart-1"
  }

  const remaining = budget.valor_limite - budget.gasto_atual

  return (
    <Card className={budget.ativo ? "" : "opacity-60"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {budget.categorias?.icone && <span className="text-lg">{budget.categorias.icone}</span>}
          <CardTitle className="text-base font-medium">{budget.categorias?.nome}</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(budget)} className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(budget.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(budget.percentual_usado)}
            <span className={`text-sm font-medium ${getStatusColor(budget.percentual_usado)}`}>
              {budget.percentual_usado.toFixed(1)}% usado
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {budget.periodo === "mensal" && budget.mes
              ? `${MONTHS[budget.mes - 1]} ${budget.ano}`
              : `Anual ${budget.ano}`}
          </Badge>
        </div>

        <div className="space-y-2">
          <Progress value={Math.min(budget.percentual_usado, 100)} className="h-2">
            <div className={`h-full rounded-full transition-all ${getProgressColor(budget.percentual_usado)}`} />
          </Progress>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gasto: {formatCurrency(budget.gasto_atual)}</span>
            <span className="text-muted-foreground">Limite: {formatCurrency(budget.valor_limite)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{remaining >= 0 ? "Disponível" : "Excedido"}</span>
            <span className={`font-medium ${remaining >= 0 ? "text-chart-1" : "text-destructive"}`}>
              {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
