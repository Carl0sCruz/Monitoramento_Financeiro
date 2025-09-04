import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Upload, Target, BarChart3 } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/transacoes">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </Link>
        <Button className="w-full justify-start bg-transparent" variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar Extrato
        </Button>
        <Link href="/orcamentos">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Gerenciar Orçamentos
          </Button>
        </Link>
        <Button className="w-full justify-start bg-transparent" variant="outline">
          <BarChart3 className="mr-2 h-4 w-4" />
          Ver Relatórios
        </Button>
      </CardContent>
    </Card>
  )
}
