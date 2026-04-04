import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInviteUser } from './useInviteUser'

const ROLE_LABELS: Record<string, string> = {
  SuperAdmin: 'Super Admin',
  Admin: 'Admin',
  Pharmacist: 'Farmacêutico',
  StockManager: 'Gestor de Estoque',
  ReceivingOperator: 'Operador de Recebimento',
}

export default function InviteUserPage() {
  const {
    organizations,
    units,
    isOperationalRole,
    serverError,
    success,
    form,
    onSubmit,
    isSubmitting,
    goBack,
  } = useInviteUser()

  const selectedUnitIds: string[] = form.watch('unitIds') ?? []

  function toggleUnit(unitId: string) {
    const current = form.getValues('unitIds') ?? []
    form.setValue(
      'unitIds',
      current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId],
      { shouldValidate: true }
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={goBack}>← Voltar</Button>
        <h1 className="text-xl font-semibold">Convidar usuário</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do convite</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <p className="text-sm text-green-600 font-medium">
                Convite enviado com sucesso! O usuário receberá um email para definir sua senha.
              </p>
              <Button variant="outline" onClick={goBack}>Voltar para organizações</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="usuario@farmacia.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organização</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma organização..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um perfil..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isOperationalRole && (
                  <FormField
                    control={form.control}
                    name="unitIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Unidades</FormLabel>
                        {units.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            {form.watch('organizationId')
                              ? 'Nenhuma unidade ativa encontrada para esta organização.'
                              : 'Selecione uma organização para ver as unidades disponíveis.'}
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {units.filter((u) => u.isActive).map((unit) => (
                              <label
                                key={unit.id}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedUnitIds.includes(unit.id)}
                                  onChange={() => toggleUnit(unit.id)}
                                  className="accent-primary"
                                />
                                <span>{unit.name}</span>
                                <span className="text-muted-foreground text-xs">({unit.code})</span>
                              </label>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {serverError && (
                  <p className="text-sm text-destructive">{serverError}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando convite...' : 'Enviar convite'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
