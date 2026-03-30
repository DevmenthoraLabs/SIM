import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { tokenStorage } from '@/lib/tokenStorage'
import { extractRoleFromToken, extractEmailFromToken, extractOrganizationIdFromToken } from '@/lib/jwtDecode'
import { useAuthStore } from '@/store/authStore'

const schema = z
  .object({
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function useAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const isValidToken = !!tokenHash && (type === 'invite' || type === 'recovery')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      setServerError(null)
      const { data } = await api.post('/api/auth/set-password', {
        tokenHash,
        type,
        password: values.password,
      })

      const email = extractEmailFromToken(data.accessToken)
      const role = extractRoleFromToken(data.accessToken)
      const organizationId = extractOrganizationIdFromToken(data.accessToken)
      tokenStorage.save(data.accessToken, data.refreshToken, data.expiresIn, email, role, organizationId)
      setUser({ email, role, organizationId })
      navigate('/', { replace: true })
    } catch {
      setServerError('Token inválido ou expirado. Solicite um novo convite.')
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    serverError,
    isValidToken,
    type,
    isSubmitting: form.formState.isSubmitting,
  }
}
