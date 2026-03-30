import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthCallback } from './useAuthCallback'

const TITLES: Record<string, string> = {
  invite: 'Bem-vindo ao SIM',
  recovery: 'Redefinir senha',
}

const SUBTITLES: Record<string, string> = {
  invite: 'Defina uma senha para ativar a sua conta.',
  recovery: 'Defina a sua nova senha abaixo.',
}

export default function AuthCallbackPage() {
  const { form, onSubmit, serverError, isValidToken, type, isSubmitting } = useAuthCallback()

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-foreground font-medium">Link inválido ou expirado.</p>
          <p className="text-sm text-muted-foreground">
            Solicite um novo convite ou recuperação de senha.
          </p>
        </div>
      </div>
    )
  }

  const title = TITLES[type!] ?? 'Definir senha'
  const subtitle = SUBTITLES[type!] ?? 'Defina a sua nova senha abaixo.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Definir senha'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
