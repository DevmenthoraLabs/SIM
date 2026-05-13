import type { ColumnDef } from '@tanstack/react-table'
import { Trash2, RotateCcw } from 'lucide-react'
import { sortableHeader } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/button'
import { messages } from '@/lib/messages'
import type { BatchResponse } from '@/types'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function isExpired(dateStr: string): boolean {
  return dateStr < new Date().toISOString().slice(0, 10)
}

interface Handlers {
  canDelete: boolean
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function getBatchColumns({
  canDelete,
  onDeactivate,
  onReactivate,
}: Handlers): ColumnDef<BatchResponse, any>[] {
  return [
    {
      accessorKey: 'lotNumber',
      header: sortableHeader(messages.fields.numeroLote),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-sm">{row.original.lotNumber}</span>
      ),
    },
    {
      accessorKey: 'supplierName',
      header: sortableHeader(messages.fields.fornecedor),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.supplierName}</span>
      ),
    },
    {
      accessorKey: 'manufacturingDate',
      header: sortableHeader(messages.fields.dataFabricacao),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.manufacturingDate)}
        </span>
      ),
    },
    {
      accessorKey: 'expiryDate',
      header: sortableHeader(messages.fields.dataValidade),
      cell: ({ row }) => {
        const expired = isExpired(row.original.expiryDate)
        return (
          <span className={expired ? 'text-destructive font-medium' : undefined}>
            {formatDate(row.original.expiryDate)}
            {expired && (
              <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide">
                ({messages.batches.expired})
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: 'quantity',
      header: sortableHeader(messages.fields.quantidade),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.quantity.toLocaleString('pt-BR')}</span>
      ),
    },
    {
      accessorKey: 'unitCost',
      header: sortableHeader(messages.fields.custoUnitario),
      cell: ({ row }) => {
        const cost = row.original.unitCost
        return (
          <span className="tabular-nums text-muted-foreground">
            {cost != null
              ? cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: sortableHeader(messages.fields.status),
      cell: ({ row }) => (
        <StatusBadge
          active={row.original.isActive}
          activeLabel={messages.status.ativo}
          inactiveLabel={messages.status.inativo}
        />
      ),
      size: 110,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const batch = row.original
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {batch.isActive && canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(batch.id)}
                title={messages.batches.deactivateButton}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {!batch.isActive && canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReactivate(batch.id)}
                title={messages.batches.reactivateButton}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
      size: 60,
    },
  ]
}
