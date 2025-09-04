"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"

interface Account {
  id: string
  nome: string
}

interface Category {
  id: string
  nome: string
  tipo: string
}

interface Transaction {
  id?: string
  conta_id: string
  categoria_id?: string
  descricao: string
  valor: number
  tipo: "receita" | "despesa" | "transferencia"
  data_transacao: string
  observacoes?: string
}

interface TransactionFormProps {
  transaction?: Transaction
  accounts: Account[]
  categories: Category[]
  onSubmit: (transaction: Omit<Transaction, "id">) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TransactionForm({
  transaction,
  accounts,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<Omit<Transaction, "id">>({
    conta_id: "",
    categoria_id: "",
    descricao: "",
    valor: 0,
    tipo: "despesa",
    data_transacao: new Date().toISOString().split("T")[0],
    observacoes: "",
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        conta_id: transaction.conta_id,
        categoria_id: transaction.categoria_id || "",
        descricao: transaction.descricao,
        valor: transaction.valor,
        tipo: transaction.tipo,
        data_transacao: transaction.data_transacao,
        observacoes: transaction.observacoes || "",
      })
    }
  }, [transaction])

  const filteredCategories = categories.filter((cat) => cat.tipo === formData.tipo)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleValueChange = (value: string) => {
    // Remove non-numeric characters except comma and dot
    const cleanValue = value.replace(/[^\d,.-]/g, "")
    // Convert comma to dot for decimal
    const numericValue = cleanValue.replace(",", ".")
    const parsedValue = Number.parseFloat(numericValue) || 0
    setFormData({ ...formData, valor: parsedValue })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transaction ? "Editar Transação" : "Nova Transação"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "receita" | "despesa" | "transferencia") =>
                  setFormData({ ...formData, tipo: value, categoria_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta">Conta</Label>
              <Select
                value={formData.conta_id}
                onValueChange={(value) => setFormData({ ...formData, conta_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="text"
                value={formData.valor.toString()}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder="0,00"
                required
              />
              <p className="text-xs text-muted-foreground">{formatCurrency(formData.valor)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data_transacao}
                onChange={(e) => setFormData({ ...formData, data_transacao: e.target.value })}
                required
              />
            </div>
          </div>

          {formData.tipo !== "transferencia" && (
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
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : transaction ? "Atualizar" : "Criar"}
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
