"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BudgetForm } from "@/components/budgets/budget-form"
import { BudgetCard } from "@/components/budgets/budget-card"
import { BudgetAlerts } from "@/components/budgets/budget-alerts"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

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

interface Category {
  id: string
  nome: string
  tipo: string
  cor: string
  icone?: string
}

export default function OrcamentosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [selectedYear, selectedMonth])

  const fetchBudgets = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ ano: selectedYear })
      if (selectedMonth !== "all") {
        params.append("mes", selectedMonth)
      }

      const response = await fetch(`/api/budgets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets || [])
      }
    } catch (error) {
      console.error("Error fetching budgets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?tipo=despesa")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (budgetData: Omit<Budget, "id">) => {
    setIsFormLoading(true)
    try {
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : "/api/budgets"
      const method = editingBudget ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(budgetData),
      })

      if (response.ok) {
        await fetchBudgets()
        setShowForm(false)
        setEditingBudget(null)
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao salvar orçamento")
      }
    } catch (error) {
      console.error("Error saving budget:", error)
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchBudgets()
      } else {
        console.error("Error deleting budget")
      }
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const months = [
    { value: "all", label: "Todos os meses" },
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {budgets.length > 0 && <BudgetAlerts budgets={budgets} />}

        {showForm && (
          <BudgetForm
            budget={editingBudget || undefined}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isFormLoading}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando orçamentos...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Nenhum orçamento encontrado para o período selecionado</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
