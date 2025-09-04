"use client"

import { useState } from "react"
import { FileUpload } from "@/components/import/file-upload"
import { TransactionPreview } from "@/components/import/transaction-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Info } from "lucide-react"

interface Transaction {
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category?: string
  account?: string
}

export default function ImportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)

  const handleFileProcessed = (processedTransactions: Transaction[]) => {
    setTransactions(processedTransactions)
    setImportResult(null)
  }

  const handleConfirmImport = async (selectedTransactions: Transaction[]) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/import/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactions: selectedTransactions }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao importar transações")
      }

      setImportResult(result.message)
      setTransactions([])
    } catch (error) {
      setImportResult(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setTransactions([])
    setImportResult(null)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Importar Transações</h1>
          <p className="text-muted-foreground mt-2">Importe suas transações de arquivos CSV ou OFX</p>
        </div>

        {importResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{importResult}</AlertDescription>
          </Alert>
        )}

        {transactions.length === 0 ? (
          <>
            <FileUpload onFileProcessed={handleFileProcessed} isLoading={isLoading} />

            <Card>
              <CardHeader>
                <CardTitle>Formatos Suportados</CardTitle>
                <CardDescription>Informações sobre os formatos de arquivo aceitos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">CSV (Comma Separated Values)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Arquivo de texto com valores separados por vírgula. Colunas aceitas:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>
                      <strong>Data:</strong> data, Data da Transação
                    </li>
                    <li>
                      <strong>Descrição:</strong> descrição, description, histórico
                    </li>
                    <li>
                      <strong>Valor:</strong> valor, amount, quantia
                    </li>
                    <li>
                      <strong>Categoria:</strong> categoria, category (opcional)
                    </li>
                    <li>
                      <strong>Conta:</strong> conta, account (opcional)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">OFX (Open Financial Exchange)</h4>
                  <p className="text-sm text-muted-foreground">
                    Formato padrão usado por bancos para exportar extratos bancários. Suporta transações com data, valor
                    e descrição.
                  </p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica:</strong> Valores positivos são interpretados como receitas e valores negativos como
                    despesas. Se não houver uma conta especificada, as transações serão importadas para sua conta
                    padrão.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </>
        ) : (
          <TransactionPreview
            transactions={transactions}
            onConfirm={handleConfirmImport}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
