import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLoginForm } from './useLoginForm'
import imagebackLight from "@/assets/image_background.png"
import imagebackDark from "@/assets/image_background_dark.png"
import imageLoginLight from "@/assets/image_login.png"
import imageLoginDark from "@/assets/image_logindark.png"
import { useTheme } from '@/hooks/useTheme'
import { messages } from '@/lib/messages'

export default function LoginPage() {
  const { form, onSubmit, serverError, isSubmitting } = useLoginForm()
  const { resolvedTheme } = useTheme()

  const isDark = resolvedTheme?.includes('dark')

  const imageback = isDark ? imagebackDark : imagebackLight
  const imageLogin = isDark ? imageLoginDark : imageLoginLight
  const imageClass = isDark ? 'w-48' : 'w-40'

  return (
    <div className="relative min-h-screen flex bg-background">

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 relative overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(
              to left,
              ${
                isDark
                  ? 'rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 70%, transparent 100%'
                  : 'rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.2) 70%, transparent 100%'
              }
            ),
            url(${imageback})
          `,
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm space-y-6">

          {/* LOGO */}
          <div className="flex justify-center items-center">
            <img
              src={imageLogin}
              alt={messages.nav.sim}
              className={`${imageClass} h-auto object-contain`}
            />
          </div>

          <h1 className="text-2xl font-semibold text-center">
            {messages.auth.loginTitle}
          </h1>

          <p className="text-sm text-center text-muted-foreground">
            {messages.auth.loginDescription}
          </p>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {messages.fields.email}
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="email"
                        placeholder={messages.fields.placeholderEmail}
                        {...field}
                      />
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
                    <FormLabel>
                      {messages.fields.senha}
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="password"
                        placeholder={messages.auth.passwordPlaceholder}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <p className="text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? messages.auth.loginSubmitting
                  : messages.auth.loginSubmit}
              </Button>

            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            {messages.auth.loginSupport}
          </p>

        </div>
      </div>

    </div>
  )
}