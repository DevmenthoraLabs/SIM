import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Página não encontrada.</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        Voltar ao início
      </Button>
    </div>
  )
}
