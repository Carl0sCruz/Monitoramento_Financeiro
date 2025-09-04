"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AccountForm } from "@/components/accounts/account-form"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

interface Account {
  id: string
  nome: string
  tipo_conta_id: string
  saldo_inicial: number
  saldo_atual: number
  ativa: boolean
  tipos_conta?: { nome: string; descricao: string }
}

interface AccountType {
  id: string
  nome: string
  descricao: string
}

export default function ContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAccounts()
    fetchAccountTypes()
  }, [])

  const fetchAccounts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("Error fetching accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAccountTypes = async () => {
    try {
      const response = await fetch("/api/account-types")
      if (response.ok) {
        const data = await response.json()
        setAccountTypes(data.accountTypes || [])
      }
    } catch (error) {
      console.error("Error fetching account types:", error)
    }
  }

  const handleSubmit = async (accountData: Omit<Account, "id">) => {
    setIsFormLoading(true)
    try {
      const url = editingAccount ? `/api/accounts/${editingAccount.id}` : "/api/accounts"
      const method = editingAccount ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      })

      if (response.ok) {
        await fetchAccounts()
        setShowForm(false)
        setEditingAccount(null)
      } else {
        console.error("Error saving account")
      }
    } catch (error) {
      console.error("Error saving account:", error)
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAccounts()
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao excluir conta")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  const totalBalance = accounts.reduce((sum, account) => sum + (account.ativa ? account.saldo_atual : 0), 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
          <p className="text-muted-foreground">Saldo total: {formatCurrency(totalBalance)}</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <div className="space-y-4">
        {showForm && (
          <AccountForm
            account={editingAccount || undefined}
            accountTypes={accountTypes}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isFormLoading}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Carregando contas...</p>
          </div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhuma conta encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id} className={account.ativa ? "" : "opacity-60"}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{account.nome}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(account)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Saldo Atual</span>
                      <span className="text-lg font-bold">{formatCurrency(account.saldo_atual)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tipo</span>
                      <span className="text-sm">{account.tipos_conta?.nome}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={account.ativa ? "default" : "secondary"} className="text-xs">
                        {account.ativa ? (
                          <>
                            <Eye className="mr-1 h-3 w-3" />
                            Ativa
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" />
                            Inativa
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
