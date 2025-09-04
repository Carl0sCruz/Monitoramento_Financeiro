"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { TransactionList } from "@/components/transactions/transaction-list"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  conta_id: string
  categoria_id?: string
  descricao: string
  valor: number
  tipo: "receita" | "despesa" | "transferencia"
  data_transacao: string
  observacoes?: string
  categorias?: { nome: string; cor: string }
  contas?: { nome: string }
}

interface Account {
  id: string
  nome: string
}

interface Category {
  id: string
  nome: string
  tipo: string
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchCategories()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (transactionData: Omit<Transaction, "id">) => {
    setIsFormLoading(true)
    try {
      const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : "/api/transactions"
      const method = editingTransaction ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      if (response.ok) {
        await fetchTransactions()
        setShowForm(false)
        setEditingTransaction(null)
      } else {
        console.error("Error saving transaction")
      }
    } catch (error) {
      console.error("Error saving transaction:", error)
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchTransactions()
      } else {
        console.error("Error deleting transaction")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="space-y-4">
        {showForm && (
          <TransactionForm
            transaction={editingTransaction || undefined}
            accounts={accounts}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isFormLoading}
          />
        )}

        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
