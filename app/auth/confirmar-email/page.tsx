import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function ConfirmarEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Confirme seu email</CardTitle>
            <CardDescription>Enviamos um link de confirmação para seu email</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta. Após confirmar, você
              poderá fazer login normalmente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
