"use client"

import { useState, useEffect } from "react"
import { ReportFilters } from "@/components/reports/report-filters"
import { SummaryReport } from "@/components/reports/summary-report"
import { MonthlyReport } from "@/components/reports/monthly-report"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, FileText, Loader2 } from "lucide-react"

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<any>(null)

  // Load accounts and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsRes, categoriesRes] = await Promise.all([fetch("/api/accounts"), fetch("/api/categories")])

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json()
          setAccounts(accountsData)
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    loadData()
  }, [])

  const handleFiltersChange = async (filters: any) => {
    setIsLoading(true)
    setError(null)
    setCurrentFilters(filters)

    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      const response = await fetch(`/api/reports?${params}`)

      if (!response.ok) {
        throw new Error("Erro ao gerar relatório")
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = () => {
    // This would integrate with a PDF generation library
    alert("Funcionalidade de exportação em PDF será implementada em breve!")
  }

  const exportToCSV = () => {
    if (!reportData?.transactions) return

    const csvContent = [
      ["Data", "Descrição", "Tipo", "Valor", "Categoria", "Conta"],
      ...reportData.transactions.map((t: any) => [
        new Date(t.date).toLocaleDateString("pt-BR"),
        t.description,
        t.type === "income" ? "Receita" : "Despesa",
        t.amount,
        t.categories?.name || "Sem categoria",
        t.accounts?.name || "Conta desconhecida",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `relatorio_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderReport = () => {
    if (!reportData) return null

    switch (currentFilters?.reportType) {
      case "summary":
        return <SummaryReport data={reportData} />
      case "monthly":
        return <MonthlyReport data={reportData} />
      case "accounts":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Relatório por Conta</CardTitle>
              <CardDescription>Resumo das movimentações por conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.accountBreakdown?.map((account: any) => (
                  <div key={account.name} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{account.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Receitas:</span>
                        <div className="font-medium text-green-600">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            account.income,
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Despesas:</span>
                        <div className="font-medium text-red-600">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            account.expenses,
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Saldo:</span>
                        <div className={`font-medium ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            account.balance,
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transações:</span>
                        <div className="font-medium">{account.count}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground mt-2">Analise suas finanças com relatórios detalhados</p>
          </div>

          {reportData && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          )}
        </div>

        <ReportFilters
          onFiltersChange={handleFiltersChange}
          accounts={accounts}
          categories={categories}
          isLoading={isLoading}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando relatório...
            </CardContent>
          </Card>
        )}

        {renderReport()}
      </div>
    </div>
  )
}
