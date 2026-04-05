import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { messages } from '@/lib/messages'
import { useLoginForm } from './useLoginForm'

export default function LoginPage() {
  const { form, onSubmit, serverError, isSubmitting } = useLoginForm()

  return (
    <div className="relative min-h-screen flex bg-background">

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gray-950 p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <span className="text-4xl font-bold tracking-tight text-white">SIM</span>
          <p className="text-sm text-gray-400 tracking-wide uppercase">
            Sistema Integrado de Medicamentos
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">

          <div className="space-y-2 text-center">
            {/* Mobile-only brand mark */}
            <div className="lg:hidden flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {messages.auth.loginTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {messages.auth.loginDescription}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="voce@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
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
                    {isSubmitting ? messages.auth.loginSubmitting : messages.auth.loginSubmit}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            {messages.auth.loginSupport}
          </p>
        </div>
      </div>

    </div>
  )
}
