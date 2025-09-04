"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"

interface Category {
  id: string
  nome: string
  tipo: string
  cor: string
  icone?: string
}

interface Budget {
  id?: string
  categoria_id: string
  valor_limite: number
  periodo: "mensal" | "anual"
  mes?: number
  ano: number
  ativo: boolean
}

interface BudgetFormProps {
  budget?: Budget
  categories: Category[]
  onSubmit: (budget: Omit<Budget, "id">) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
]

export function BudgetForm({ budget, categories, onSubmit, onCancel, isLoading = false }: BudgetFormProps) {
  const [formData, setFormData] = useState<Omit<Budget, "id">>({
    categoria_id: "",
    valor_limite: 0,
    periodo: "mensal",
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    ativo: true,
  })

  useEffect(() => {
    if (budget) {
      setFormData({
        categoria_id: budget.categoria_id,
        valor_limite: budget.valor_limite,
        periodo: budget.periodo,
        mes: budget.mes || new Date().getMonth() + 1,
        ano: budget.ano,
        ativo: budget.ativo,
      })
    }
  }, [budget])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleValueChange = (value: string) => {
    const cleanValue = value.replace(/[^\d,.-]/g, "")
    const numericValue = cleanValue.replace(",", ".")
    const parsedValue = Number.parseFloat(numericValue) || 0
    setFormData({ ...formData, valor_limite: parsedValue })
  }

  // Filter only expense categories
  const expenseCategories = categories.filter((cat) => cat.tipo === "despesa")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{budget ? "Editar Orçamento" : "Novo Orçamento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.categoria_id}
              onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icone && <span>{category.icone}</span>}
                      <span>{category.nome}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Limite (R$)</Label>
              <Input
                id="valor"
                type="text"
                value={formData.valor_limite.toString()}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder="0,00"
                required
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(formData.valor_limite)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select
                value={formData.periodo}
                onValueChange={(value: "mensal" | "anual") => setFormData({ ...formData, periodo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.periodo === "mensal" && (
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select
                  value={formData.mes?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, mes: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: Number.parseInt(e.target.value) })}
                min={2020}
                max={2030}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Orçamento ativo</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : budget ? "Atualizar" : "Criar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
