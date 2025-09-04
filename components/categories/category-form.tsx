"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id?: string
  nome: string
  tipo: "receita" | "despesa"
  cor: string
  icone?: string
}

interface CategoryFormProps {
  category?: Category
  onSubmit: (category: Omit<Category, "id">) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
]

const PRESET_ICONS = [
  "💰",
  "🏠",
  "🍽️",
  "🚗",
  "🏥",
  "📚",
  "🎮",
  "👕",
  "✈️",
  "📱",
  "💻",
  "🛒",
  "⚡",
  "💡",
  "🔧",
  "🎵",
  "🏋️",
  "🎬",
  "📦",
  "💵",
]

export function CategoryForm({ category, onSubmit, onCancel, isLoading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState<Omit<Category, "id">>({
    nome: "",
    tipo: "despesa",
    cor: "#6366f1",
    icone: "",
  })

  useEffect(() => {
    if (category) {
      setFormData({
        nome: category.nome,
        tipo: category.tipo,
        cor: category.cor,
        icone: category.icone || "",
      })
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Alimentação"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "receita" | "despesa") => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.cor === color ? "border-foreground" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, cor: color })}
                />
              ))}
            </div>
            <Input
              type="color"
              value={formData.cor}
              onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
              className="w-20 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone (opcional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`w-10 h-10 rounded border text-lg ${
                    formData.icone === icon ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setFormData({ ...formData, icone: icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
            <Input
              value={formData.icone}
              onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
              placeholder="Ou digite um emoji"
              maxLength={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Salvando..." : category ? "Atualizar" : "Criar"}
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
