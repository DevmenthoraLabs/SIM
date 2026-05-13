import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLoginForm } from './useLoginForm'
import imageback from "../../assets/image_background.png";
import imageLogin from "../../assets/image_Login.png";

export default function LoginPage() {
  const { form, onSubmit, serverError, isSubmitting } = useLoginForm()

  return (
    <div className="relative min-h-screen flex bg-background">

      {/* Theme toggle — top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* Left panel — branding, hidden on small screens */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 relative overflow-hidden"
        style={{
          backgroundImage: `
      linear-gradient(
        to left,
        white 0%,
        rgba(255, 255, 255, 0.34) 12%,
        transparent 30%
      ),
      url(${imageback})
    `,
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
      >
      </div>
      {/* Right panel — login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center items-center">
              <img
                src={imageLogin}
                alt="Logo SIM"
                className="w-40 h-auto object-contain"
              />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Bem-vindo ao SIM
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o sistema.
            </p>
          </div>

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
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            Problemas para acessar? Entre em contato com o suporte SIM.
          </p>
        </div>
      </div>

    </div>
  )
}
