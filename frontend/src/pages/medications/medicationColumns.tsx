import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import { sortableHeader } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/button'
import { messages } from '@/lib/messages'
import type { MedicationResponse } from '@/types'

interface Handlers {
  canWrite: boolean
  canDelete: boolean
  onEdit: (row: MedicationResponse) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function getMedicationColumns({
  canWrite,
  canDelete,
  onEdit,
  onDeactivate,
  onReactivate,
}: Handlers): ColumnDef<MedicationResponse, any>[] {
  return [
    {
      accessorKey: 'name',
      header: sortableHeader(messages.fields.nome),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'genericName',
      accessorFn: (row) => row.details?.genericName ?? '',
      header: sortableHeader(messages.fields.nomeGenerico),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.details?.genericName ?? '—'}</span>
      ),
    },
    {
      id: 'activeIngredient',
      accessorFn: (row) => row.details?.activeIngredient ?? '',
      header: sortableHeader(messages.fields.principioAtivo),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.details?.activeIngredient ?? '—'}</span>
      ),
    },
    {
      id: 'categoryName',
      accessorFn: (row) => row.categoryName ?? '',
      header: sortableHeader(messages.fields.categoria),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.categoryName ?? '—'}</span>
      ),
    },
    {
      id: 'isControlled',
      accessorFn: (row) => row.details?.isControlled ?? false,
      header: sortableHeader(messages.fields.controlado),
      cell: ({ row }) => (
        <StatusBadge
          active={row.original.details?.isControlled ?? false}
          activeLabel={messages.medications.controlled}
          inactiveLabel={messages.medications.notControlled}
        />
      ),
      size: 140,
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
        const med = row.original
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {med.isActive && canWrite && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(med)} title={messages.medications.editButton}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {med.isActive && canDelete && (
              <Button
                variant="ghost" size="sm"
                onClick={() => onDeactivate(med.id)}
                title={messages.medications.deactivateButton}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {!med.isActive && canDelete && (
              <Button
                variant="ghost" size="sm"
                onClick={() => onReactivate(med.id)}
                title={messages.medications.reactivateButton}
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
