"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onFileProcessed: (transactions: any[]) => void
  isLoading: boolean
}

export function FileUpload({ onFileProcessed, isLoading }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setError(null)

      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("/api/import", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Erro ao processar arquivo")
        }

        onFileProcessed(result.transactions)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      }
    },
    [onFileProcessed],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/x-ofx": [".ofx"],
    },
    maxFiles: 1,
    disabled: isLoading,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Transações</CardTitle>
        <CardDescription>Faça upload de arquivos CSV ou OFX para importar suas transações</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-lg">Solte o arquivo aqui...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Arraste um arquivo aqui ou clique para selecionar</p>
              <p className="text-sm text-muted-foreground mb-4">Formatos suportados: CSV, OFX</p>
              <Button variant="outline" disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" />
                Selecionar Arquivo
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
