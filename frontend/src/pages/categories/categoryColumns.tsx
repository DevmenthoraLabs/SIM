import type { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, RotateCcw } from 'lucide-react'
import { sortableHeader } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/button'
import { messages } from '@/lib/messages'
import type { CategoryResponse } from '@/types'

interface Handlers {
  allCategories: CategoryResponse[]
  canWrite: boolean
  canDelete: boolean
  onEdit: (row: CategoryResponse) => void
  onDeactivate: (id: string) => void
  onReactivate: (id: string) => void
}

export function getCategoryColumns({
  allCategories,
  canWrite,
  canDelete,
  onEdit,
  onDeactivate,
  onReactivate,
}: Handlers): ColumnDef<CategoryResponse, any>[] {
  return [
    {
      accessorKey: 'name',
      header: sortableHeader(messages.fields.nome),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'parentName',
      accessorFn: (row) => {
        if (!row.parentId) return ''
        return allCategories.find((c) => c.id === row.parentId)?.name ?? ''
      },
      header: sortableHeader(messages.fields.categoriaPai),
      cell: ({ row }) => {
        const name = row.parentId
          ? (allCategories.find((c) => c.id === row.original.parentId)?.name ?? '—')
          : '—'
        return <span className="text-muted-foreground">{name}</span>
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
        const cat = row.original
        return (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {cat.isActive && canWrite && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(cat)} title={messages.categories.editButton}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {cat.isActive && canDelete && (
              <Button
                variant="ghost" size="sm"
                onClick={() => onDeactivate(cat.id)}
                title={messages.categories.deactivateButton}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {!cat.isActive && canDelete && (
              <Button
                variant="ghost" size="sm"
                onClick={() => onReactivate(cat.id)}
                title={messages.categories.reactivateButton}
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
