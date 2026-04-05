import { Link } from 'react-router'
import { Check } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import PageContainer from '@/components/layout/PageContainer'
import PageHeader from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UnitCheckList } from '@/components/ui/UnitCheckList'
import { ROLES, ROLE_LABELS } from '@/lib/constants'
import { messages } from '@/lib/messages'
import { useInviteUser } from './useInviteUser'

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
    <PageContainer narrow>
      <PageHeader title={messages.pages.inviteUserTitle} />

      <Card>
        <CardContent className="pt-6">
          {success ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="rounded-full bg-green-50 dark:bg-green-500/10 p-3 mb-3">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium">{messages.users.inviteSuccess}</p>
              <p className="text-sm text-muted-foreground mt-1">{messages.users.inviteSuccessHint}</p>
              <Button variant="outline" asChild className="mt-4">
                <Link to="/suporte/organizations">{messages.pages.organizationsTitle}</Link>
              </Button>
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
                          {(Object.keys(ROLES) as Array<keyof typeof ROLES>).map((key) => (
                            <SelectItem key={key} value={ROLES[key]}>{ROLE_LABELS[ROLES[key]]}</SelectItem>
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
                              ? messages.users.noUnitsForOrg
                              : messages.users.selectOrgFirst}
                          </p>
                        ) : (
                          <UnitCheckList
                            units={units.filter((u) => u.isActive)}
                            selected={selectedUnitIds}
                            onToggle={toggleUnit}
                          />
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
                  {isSubmitting ? messages.users.inviteSubmitting : messages.users.inviteSubmit}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
