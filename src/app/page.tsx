import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao CFO IA - Gestão Financeira
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Placeholder cards for future metrics */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Receitas</h3>
            <p className="text-2xl font-bold">R$ 0,00</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Despesas</h3>
            <p className="text-2xl font-bold">R$ 0,00</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">Saldo</h3>
            <p className="text-2xl font-bold">R$ 0,00</p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold">MRR</h3>
            <p className="text-2xl font-bold">R$ 0,00</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Acesso rápido</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/ledger/transactions">Ver transações</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/ledger/transactions/new">Nova transação</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/ledger/accounts">Gerenciar contas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/ledger/reports/spend-by-category">Relatórios</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

