"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Edit, Trash2, Search } from "lucide-react"

interface Transaction {
  id: string
  descricao: string
  valor: number
  tipo: "receita" | "despesa" | "transferencia"
  data_transacao: string
  observacoes?: string
  categorias?: { nome: string; cor: string }
  contas?: { nome: string }
}

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export function TransactionList({ transactions, onEdit, onDelete, isLoading = false }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

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

  const getTypeBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "receita":
        return "default"
      case "despesa":
        return "destructive"
      case "transferencia":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.categorias?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.contas?.nome.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = filterType === "all" || transaction.tipo === filterType

      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime()
        case "date-asc":
          return new Date(a.data_transacao).getTime() - new Date(b.data_transacao).getTime()
        case "value-desc":
          return b.valor - a.valor
        case "value-asc":
          return a.valor - b.valor
        case "description":
          return a.descricao.localeCompare(b.descricao)
        default:
          return 0
      }
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações</CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
              <SelectItem value="transferencia">Transferências</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Data (mais recente)</SelectItem>
              <SelectItem value="date-asc">Data (mais antiga)</SelectItem>
              <SelectItem value="value-desc">Valor (maior)</SelectItem>
              <SelectItem value="value-asc">Valor (menor)</SelectItem>
              <SelectItem value="description">Descrição</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando transações...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all"
                ? "Nenhuma transação encontrada com os filtros aplicados"
                : "Nenhuma transação encontrada"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.tipo)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.descricao}</p>
                      <Badge variant={getTypeBadgeVariant(transaction.tipo)} className="text-xs">
                        {transaction.tipo}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(transaction.data_transacao)}</span>
                      {transaction.categorias && (
                        <>
                          <span>•</span>
                          <span>{transaction.categorias.nome}</span>
                        </>
                      )}
                      {transaction.contas && (
                        <>
                          <span>•</span>
                          <span>{transaction.contas.nome}</span>
                        </>
                      )}
                    </div>
                    {transaction.observacoes && (
                      <p className="text-xs text-muted-foreground mt-1">{transaction.observacoes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-medium ${getTransactionColor(transaction.tipo)}`}>
                      {transaction.tipo === "despesa" ? "-" : ""}
                      {formatCurrency(Math.abs(transaction.valor))}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(transaction.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
