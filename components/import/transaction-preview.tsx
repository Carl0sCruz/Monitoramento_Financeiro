"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Transaction {
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category?: string
  account?: string
}

interface TransactionPreviewProps {
  transactions: Transaction[]
  onConfirm: (transactions: Transaction[]) => void
  onCancel: () => void
  isLoading: boolean
}

export function TransactionPreview({ transactions, onConfirm, onCancel, isLoading }: TransactionPreviewProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(
    new Set(transactions.map((_, index) => index)),
  )

  const toggleTransaction = (index: number) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTransactions(newSelected)
  }

  const toggleAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(transactions.map((_, index) => index)))
    }
  }

  const handleConfirm = () => {
    const selectedTransactionsList = transactions.filter((_, index) => selectedTransactions.has(index))
    onConfirm(selectedTransactionsList)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prévia das Transações</CardTitle>
        <CardDescription>
          {transactions.length} transações encontradas. Selecione quais deseja importar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={toggleAll} className="text-sm bg-transparent">
            {selectedTransactions.size === transactions.length ? "Desmarcar Todas" : "Selecionar Todas"}
          </Button>
          <div className="text-sm text-muted-foreground">
            {selectedTransactions.size} de {transactions.length} selecionadas
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Categoria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index} className={selectedTransactions.has(index) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleTransaction(index)} className="h-8 w-8 p-0">
                      {selectedTransactions.has(index) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                      {transaction.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category || "Sem categoria"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedTransactions.size === 0 && (
          <Alert className="mt-4">
            <AlertDescription>Selecione pelo menos uma transação para importar.</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={selectedTransactions.size === 0 || isLoading}>
            <Upload className="mr-2 h-4 w-4" />
            Importar {selectedTransactions.size} Transações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
