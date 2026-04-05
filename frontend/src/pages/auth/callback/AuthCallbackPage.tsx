import { LinkIcon } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { messages } from '@/lib/messages'
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
  const { form, onSubmit, serverError, isValidSession, type, isSubmitting } = useAuthCallback()

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="rounded-full bg-muted p-4 mb-4">
          <LinkIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-semibold">{messages.auth.callbackInvalidTitle}</p>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
          {messages.auth.callbackInvalidDescription}
        </p>
      </div>
    )
  }

  const title = TITLES[type!] ?? messages.auth.setPasswordSubmit
  const subtitle = SUBTITLES[type!] ?? 'Defina a sua nova senha abaixo.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
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
                  {isSubmitting ? messages.auth.setPasswordSubmitting : messages.auth.setPasswordSubmit}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
