"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryForm } from "@/components/categories/category-form"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  nome: string
  tipo: "receita" | "despesa"
  cor: string
  icone?: string
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("despesa")
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (categoryData: Omit<Category, "id">) => {
    setIsFormLoading(true)
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        await fetchCategories()
        setShowForm(false)
        setEditingCategory(null)
      } else {
        console.error("Error saving category")
      }
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCategories()
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao excluir categoria")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const expenseCategories = categories.filter((cat) => cat.tipo === "despesa")
  const incomeCategories = categories.filter((cat) => cat.tipo === "receita")

  const CategoryGrid = ({ categories: cats }: { categories: Category[] }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cats.map((category) => (
        <Card key={category.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              {category.icone && <span className="text-lg">{category.icone}</span>}
              <CardTitle className="text-base font-medium">{category.nome}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(category)} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(category.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs" style={{ borderColor: category.cor, color: category.cor }}>
                {category.tipo === "receita" ? "Receita" : "Despesa"}
              </Badge>
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: category.cor }}
                title={category.cor}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="space-y-4">
        {showForm && (
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isFormLoading}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="despesa">Despesas ({expenseCategories.length})</TabsTrigger>
            <TabsTrigger value="receita">Receitas ({incomeCategories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="despesa" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Carregando categorias...</p>
              </div>
            ) : expenseCategories.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Nenhuma categoria de despesa encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <CategoryGrid categories={expenseCategories} />
            )}
          </TabsContent>

          <TabsContent value="receita" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Carregando categorias...</p>
              </div>
            ) : incomeCategories.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Nenhuma categoria de receita encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <CategoryGrid categories={incomeCategories} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
