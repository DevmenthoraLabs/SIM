import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    serverError,
    success,
    form,
    onSubmit,
    isSubmitting,
    goBack,
  } = useInviteUser()

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
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Selecione uma organização...</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                        </select>
                      </FormControl>
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
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
