import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import { sortableHeader } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/button'
import { messages } from '@/lib/messages'
import type { SupplierResponse } from '@/types'

function formatCnpj(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

interface Handlers {
  canWrite: boolean
  canDelete: boolean
  onEdit: (row: SupplierResponse) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function getSupplierColumns({
  canWrite,
  canDelete,
  onEdit,
  onDeactivate,
  onReactivate,
}: Handlers): ColumnDef<SupplierResponse, any>[] {
  return [
    {
      accessorKey: 'name',
      header: sortableHeader(messages.fields.nome),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'cnpj',
      header: sortableHeader(messages.fields.cnpj),
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {formatCnpj(row.original.cnpj)}
        </span>
      ),
    },
    {
      accessorKey: 'contactName',
      header: sortableHeader(messages.fields.contato),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.contactName ?? '—'}</span>
      ),
    },
    {
      id: 'location',
      accessorFn: (row) => [row.city, row.state].filter(Boolean).join(', '),
      header: sortableHeader(messages.fields.cidade),
      cell: ({ row }) => {
        const location = [row.original.city, row.original.state].filter(Boolean).join(', ')
        return <span className="text-muted-foreground">{location || '—'}</span>
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
        const supplier = row.original
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {supplier.isActive && canWrite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(supplier)}
                title={messages.suppliers.editButton}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {supplier.isActive && canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(supplier.id)}
                title={messages.suppliers.deactivateButton}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {!supplier.isActive && canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReactivate(supplier.id)}
                title={messages.suppliers.reactivateButton}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
      size: 80,
    },
  ]
}
