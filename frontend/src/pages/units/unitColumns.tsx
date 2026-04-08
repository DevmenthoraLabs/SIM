import type { ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router'
import { Pencil, Trash2, Users } from 'lucide-react'
import { sortableHeader } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/button'
import { messages } from '@/lib/messages'
import type { UnitResponse } from '@/types'

interface Handlers {
  onEdit: (row: UnitResponse) => void
  onDeactivate: (id: string) => void
}

export function getUnitColumns({ onEdit, onDeactivate }: Handlers): ColumnDef<UnitResponse, any>[] {
  return [
    {
      accessorKey: 'name',
      header: sortableHeader(messages.fields.nome),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'code',
      header: sortableHeader(messages.fields.codigo),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span>
      ),
      size: 120,
    },
    {
      accessorKey: 'phone',
      header: sortableHeader(messages.fields.telefone),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.phone ?? '—'}</span>
      ),
      size: 160,
    },
    {
      accessorKey: 'isActive',
      header: sortableHeader(messages.fields.status),
      cell: ({ row }) => (
        <StatusBadge
          active={row.original.isActive}
          activeLabel={messages.status.ativa}
          inactiveLabel={messages.status.inativa}
        />
      ),
      size: 110,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const unit = row.original
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" asChild title={messages.units.viewUsersButton}>
              <Link to={`/units/${unit.id}/users`}>
                <Users className="h-4 w-4" />
              </Link>
            </Button>
            {unit.isActive && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(unit)} title={messages.units.editButton}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {unit.isActive && (
              <Button
                variant="ghost" size="sm"
                onClick={() => onDeactivate(unit.id)}
                title={messages.units.deactivateButton}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
      size: 100,
    },
  ]
}
