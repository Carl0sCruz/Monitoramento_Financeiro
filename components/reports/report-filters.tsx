"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter } from "lucide-react"

interface ReportFiltersProps {
  onFiltersChange: (filters: any) => void
  accounts: any[]
  categories: any[]
  isLoading: boolean
}

export function ReportFilters({ onFiltersChange, accounts, categories, isLoading }: ReportFiltersProps) {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    accountId: "",
    categoryId: "",
    reportType: "summary",
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const setPresetPeriod = (period: string) => {
    const today = new Date()
    let startDate = new Date()

    switch (period) {
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "lastMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        today.setDate(0) // Last day of previous month
        break
      case "last3Months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
        break
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      case "lastYear":
        startDate = new Date(today.getFullYear() - 1, 0, 1)
        today.setFullYear(today.getFullYear() - 1, 11, 31)
        break
    }

    const newFilters = {
      ...filters,
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros do Relatório
        </CardTitle>
        <CardDescription>Configure os parâmetros para gerar seu relatório personalizado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Tipo de Relatório</Label>
            <Select value={filters.reportType} onValueChange={(value) => handleFilterChange("reportType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumo Geral</SelectItem>
                <SelectItem value="monthly">Tendências Mensais</SelectItem>
                <SelectItem value="accounts">Por Conta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Conta</Label>
            <Select value={filters.accountId} onValueChange={(value) => handleFilterChange("accountId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as contas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange("categoryId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setPresetPeriod("thisMonth")}>
            Este Mês
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPresetPeriod("lastMonth")}>
            Mês Passado
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPresetPeriod("last3Months")}>
            Últimos 3 Meses
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPresetPeriod("thisYear")}>
            Este Ano
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPresetPeriod("lastYear")}>
            Ano Passado
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
