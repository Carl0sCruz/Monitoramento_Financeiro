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

interface AccountType {
  id: string
  nome: string
  descricao: string
}

interface Account {
  id?: string
  nome: string
  tipo_conta_id: string
  saldo_inicial: number
  ativa: boolean
}

interface AccountFormProps {
  account?: Account
  accountTypes: AccountType[]
  onSubmit: (account: Omit<Account, "id">) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function AccountForm({ account, accountTypes, onSubmit, onCancel, isLoading = false }: AccountFormProps) {
  const [formData, setFormData] = useState<Omit<Account, "id">>({
    nome: "",
    tipo_conta_id: "",
    saldo_inicial: 0,
    ativa: true,
  })

  useEffect(() => {
    if (account) {
      setFormData({
        nome: account.nome,
        tipo_conta_id: account.tipo_conta_id,
        saldo_inicial: account.saldo_inicial,
        ativa: account.ativa,
      })
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleValueChange = (value: string) => {
    const cleanValue = value.replace(/[^\d,.-]/g, "")
    const numericValue = cleanValue.replace(",", ".")
    const parsedValue = Number.parseFloat(numericValue) || 0
    setFormData({ ...formData, saldo_inicial: parsedValue })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account ? "Editar Conta" : "Nova Conta"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Conta</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Conta Corrente Banco do Brasil"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Conta</Label>
            <Select
              value={formData.tipo_conta_id}
              onValueChange={(value) => setFormData({ ...formData, tipo_conta_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div>
                      <p className="font-medium">{type.nome}</p>
                      <p className="text-xs text-muted-foreground">{type.descricao}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="saldo">Saldo Inicial (R$)</Label>
            <Input
              id="saldo"
              type="text"
              value={formData.saldo_inicial.toString()}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="0,00"
              required
            />
            <p className="text-xs text-muted-foreground">{formatCurrency(formData.saldo_inicial)}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativa"
              checked={formData.ativa}
              onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
            />
            <Label htmlFor="ativa">Conta ativa</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : account ? "Atualizar" : "Criar"}
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
