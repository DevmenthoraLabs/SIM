import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { extractErrorMessage } from '@/lib/api'
import { messages } from '@/lib/messages'
import { authService } from '@/services/authService'
import { tokenStorage } from '@/lib/tokenStorage'
import {
  extractRoleFromToken,
  extractEmailFromToken,
  extractOrganizationIdFromToken,
} from '@/lib/jwtDecode'
import { useAuthStore } from '@/store/authStore'

const schema = z
  .object({
    password: z.string().min(8, messages.validation.passwordTooShort),
    confirmPassword: z.string().min(1, messages.validation.passwordConfirmRequired),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.validation.passwordMismatch,
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

function parseFragment(): {
  accessToken: string
  refreshToken: string
  expiresIn: number
  type: string
} | null {
  const hash = window.location.hash.slice(1)
  if (!hash) return null

  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const expiresIn = Number(params.get('expires_in') ?? '0')
  const type = params.get('type') ?? ''

  if (!accessToken || !refreshToken || !type) return null
  return { accessToken, refreshToken, expiresIn, type }
}

export function useAuthCallback() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [session] = useState(() => parseFragment())

  useEffect(() => {
    if (!session) return

    // Store the session from the invite/recovery fragment immediately.
    // This authenticates the user so the set-password request can use their Bearer token.
    const email = extractEmailFromToken(session.accessToken)
    const role = extractRoleFromToken(session.accessToken)
    const organizationId = extractOrganizationIdFromToken(session.accessToken)
    tokenStorage.save(
      session.accessToken,
      session.refreshToken,
      session.expiresIn,
      email,
      role,
      organizationId
    )
    setUser({ email, role, organizationId })

    // Clean the fragment from the URL without triggering a navigation.
    window.history.replaceState(null, '', window.location.pathname)
  }, [session, setUser])

  const isValidSession =
    session !== null && (session.type === 'invite' || session.type === 'recovery')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      setServerError(null)
      // User is now authenticated — the api instance sends the Bearer token automatically.
      await authService.setPassword(values.password)
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(
        extractErrorMessage(error, messages.auth.setPasswordError)
      )
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    serverError,
    isValidSession,
    type: session?.type,
    isSubmitting: form.formState.isSubmitting,
  }
}
