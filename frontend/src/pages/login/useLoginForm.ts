import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email(messages.validation.emailInvalid),
  password: z.string().min(1, messages.validation.passwordRequired),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function useLoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues): Promise<void> {
    try {
      setServerError(null)
      await signIn(values.email, values.password)
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Email ou senha inválidos.'))
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    serverError,
    isSubmitting: form.formState.isSubmitting,
  }
}
