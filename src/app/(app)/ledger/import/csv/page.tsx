'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function ImportCsvPage() {
  const [csvText, setCsvText] = useState('')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function runImport() {
    setResult('')
    setLoading(true)
    try {
      const res = await fetch('/api/ledger/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult(`Erro: ${data.error || 'Erro desconhecido'}`)
      } else {
        setResult(`✅ Importadas: ${data.imported} transações`)
        setCsvText('')
      }
    } catch (error: any) {
      setResult(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Importar CSV</h1>
          <p className="text-muted-foreground">
            CSV com cabeçalho: <code className="text-xs bg-muted px-2 py-1 rounded">date,description,amount,accountId</code>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo do CSV</label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full h-64 rounded-lg border p-3 text-sm font-mono"
              placeholder={`date,description,amount,accountId
2024-12-01,Meta Ads,-1200.50,acc_123
2024-12-02,Cliente X,3500.00,acc_123`}
            />
          </div>

          <Button onClick={runImport} disabled={loading || !csvText.trim()}>
            {loading ? 'Importando...' : 'Importar'}
          </Button>

          {result && (
            <div
              className={`text-sm p-3 rounded-md ${
                result.includes('Erro')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}
            >
              {result}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}





