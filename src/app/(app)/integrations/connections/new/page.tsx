'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function NewConnectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<string>('')
  const [provider, setProvider] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/integrations/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          provider,
          authJson: {}, // MVP: vazio por enquanto
          settingsJson: {},
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create connection')
      }

      router.push('/integrations/connections')
    } catch (error: any) {
      alert(`Erro: ${error.message}`)
      setLoading(false)
    }
  }

  const providersByType: Record<string, string[]> = {
    BANK: ['mock', 'belvo', 'plaid', 'nordigen'],
    NF: ['nfe', 'nfse'],
    CRM: ['kommo', 'ghl'],
    ACCOUNTING: ['conta-azul', 'omie', 'quickbooks'],
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Nova Conexão</h1>
        <p className="text-sm text-muted-foreground">
          Configure uma nova integração
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK">Banco / Extrato</SelectItem>
              <SelectItem value="NF">Nota Fiscal</SelectItem>
              <SelectItem value="CRM">CRM</SelectItem>
              <SelectItem value="ACCOUNTING">Contabilidade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type && (
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o provider" />
              </SelectTrigger>
              <SelectContent>
                {providersByType[type]?.map(p => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {provider === 'mock' && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <strong>Mock Provider:</strong> Usado para desenvolvimento/testes.
            Não requer credenciais reais.
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading || !type || !provider}>
            {loading ? 'Criando...' : 'Criar Conexão'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}





